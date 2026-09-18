import { useState, useEffect, useRef, useCallback } from 'react';
import { Project, ActivityLog, AuditUser } from '../types';

const USER_STORAGE_KEY = 'monitoring_collaborator_user_v1';

const DEFAULT_ROLES = [
  'Project Manager',
  'Section Head',
  'Admin',
];

const AVATAR_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
];

function getInitialUser(): AuditUser {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // If previous auto-generated name exists (e.g. User-819), replace with 'PIC Input'
      if (parsed && (!parsed.name || /^User-\d+$/i.test(parsed.name))) {
        parsed.name = 'PIC Input';
      }
      if (!parsed.role || !['Project Manager', 'Section Head', 'Admin'].includes(parsed.role)) {
        parsed.role = 'Project Manager';
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load user from localStorage:', err);
  }

  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const newUser: AuditUser = {
    id: 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    name: 'PIC Input',
    role: 'Project Manager',
    color: randomColor,
  };

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  } catch (err) {
    console.error('Failed to save initial user to localStorage:', err);
  }

  return newUser;
}

const LOCAL_PROJECTS_CACHE = 'monitoring_projects_cache_v1';

export function useRealtimeCollaboration(
  onNotification?: (msg: string, type?: 'info' | 'success' | 'alert') => void
) {
  const [currentUser, setCurrentUser] = useState<AuditUser>(getInitialUser);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_PROJECTS_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<AuditUser[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<ActivityLog | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  // Sync projects to localStorage cache
  const updateProjectsState = useCallback((updater: Project[] | ((prev: Project[]) => Project[])) => {
    setProjects((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(LOCAL_PROJECTS_CACHE, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  const saveCurrentUser = useCallback((updated: AuditUser) => {
    setCurrentUser(updated);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save user:', err);
    }

    // Inform server of updated user info via WS or HTTP
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'user:join',
          user: updated,
        })
      );
    } else {
      fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: updated }),
      }).catch(() => {});
    }
  }, []);

  // Initial HTTP Fetch for reliability
  const fetchInitialData = useCallback(async () => {
    try {
      const [projRes, actRes, presRes] = await Promise.allSettled([
        fetch('/api/projects').then((r) => r.ok ? r.json() : []),
        fetch('/api/activities').then((r) => r.ok ? r.json() : []),
        fetch('/api/presence').then((r) => r.ok ? r.json() : []),
      ]);

      if (projRes.status === 'fulfilled' && Array.isArray(projRes.value) && projRes.value.length > 0) {
        updateProjectsState(projRes.value);
      }
      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value)) {
        setActivities(actRes.value.slice(0, 100));
      }
      if (presRes.status === 'fulfilled' && Array.isArray(presRes.value)) {
        setOnlineUsers(presRes.value);
      }
    } catch (_) {}
  }, [updateProjectsState]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Connect WebSocket with graceful error handling & HTTP polling fallback
  useEffect(() => {
    let isUnmounted = false;

    function connect() {
      if (isUnmounted) return;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
          try {
            ws.send(
              JSON.stringify({
                type: 'user:join',
                user: currentUser,
              })
            );
          } catch (_) {}
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case 'init': {
                if (Array.isArray(data.projects)) {
                  updateProjectsState(data.projects);
                }
                setActivities(data.activities || []);
                setOnlineUsers(data.onlineUsers || []);
                break;
              }

              case 'presence:update': {
                setOnlineUsers(data.onlineUsers || []);
                break;
              }

              case 'activity:new': {
                const act: ActivityLog = data.activity;
                setActivities((prev) => [act, ...prev.filter((a) => a.id !== act.id)].slice(0, 100));
                setLastActivity(act);

                if (act.user && act.user.id !== currentUser.id && onNotification) {
                  if (act.type === 'open_link') {
                    onNotification(`${act.user.name} membuka link dashboard`, 'info');
                  } else if (act.type === 'create_project') {
                    onNotification(`${act.user.name} membuat project baru`, 'success');
                  } else if (act.type === 'update_project') {
                    onNotification(`${act.user.name} memperbarui data project`, 'info');
                  } else if (act.type === 'delete_project') {
                    onNotification(`${act.user.name} menghapus project`, 'alert');
                  }
                }
                break;
              }

              case 'project:created': {
                updateProjectsState((prev) => {
                  if (prev.some((p) => p.id === data.project.id)) return prev;
                  return [data.project, ...prev];
                });
                break;
              }

              case 'project:updated': {
                updateProjectsState((prev) => {
                  const idx = prev.findIndex((p) => p.id === data.project.id);
                  if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = data.project;
                    return updated;
                  }
                  return [data.project, ...prev];
                });
                break;
              }

              case 'project:deleted': {
                updateProjectsState((prev) => prev.filter((p) => p.id !== data.projectId));
                break;
              }

              case 'project:cleared': {
                updateProjectsState([]);
                break;
              }

              case 'project:viewed': {
                updateProjectsState((prev) =>
                  prev.map((p) =>
                    p.id === data.projectId
                      ? {
                          ...p,
                          viewCount: data.viewCount,
                          lastViewedBy: data.lastViewedBy,
                        }
                      : p
                  )
                );
                break;
              }

              default:
                break;
            }
          } catch (_) {}
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setIsConnected(false);
          reconnectAttemptsRef.current += 1;

          // Reconnect with backoff: quick at first, slower afterwards to avoid hammering
          const delay = reconnectAttemptsRef.current < 3 ? 3000 : 15000;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        };

        ws.onerror = () => {
          // Graceful handling without logging raw event object to console
          try {
            ws.close();
          } catch (_) {}
        };
      } catch (_) {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (_) {}
      }
    };
  }, [currentUser.id, updateProjectsState]);

  // Periodic polling fallback when WebSocket is not connected
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchInitialData();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isConnected, fetchInitialData]);

  // Actions
  const createProject = useCallback(
    (project: Project) => {
      const enrichedProject: Project = {
        ...project,
        createdBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          color: currentUser.color,
          at: new Date().toISOString(),
        },
        lastModifiedBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          color: currentUser.color,
          at: new Date().toISOString(),
          fieldChanged: 'Pembuatan project baru',
        },
      };

      // Optimistic update
      updateProjectsState((prev) => [enrichedProject, ...prev]);

      // WebSocket action
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: 'project:create',
              project: enrichedProject,
              user: currentUser,
            })
          );
        } catch (_) {}
      }

      // REST persistence fallback
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: enrichedProject, user: currentUser }),
      }).catch(() => {});
    },
    [currentUser, updateProjectsState]
  );

  const updateProject = useCallback(
    (project: Project, fieldChanged = 'Detail project') => {
      const enrichedProject: Project = {
        ...project,
        lastModifiedBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          color: currentUser.color,
          at: new Date().toISOString(),
          fieldChanged,
        },
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      // Optimistic update
      updateProjectsState((prev) =>
        prev.map((p) => (p.id === enrichedProject.id ? enrichedProject : p))
      );

      // WebSocket action
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: 'project:update',
              project: enrichedProject,
              fieldChanged,
              user: currentUser,
            })
          );
        } catch (_) {}
      }

      // REST persistence fallback
      fetch(`/api/projects/${enrichedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: enrichedProject, user: currentUser, fieldChanged }),
      }).catch(() => {});
    },
    [currentUser, updateProjectsState]
  );

  const deleteProject = useCallback(
    (projectId: string, projectName?: string) => {
      updateProjectsState((prev) => prev.filter((p) => p.id !== projectId));

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: 'project:delete',
              projectId,
              projectName,
              user: currentUser,
            })
          );
        } catch (_) {}
      }

      // REST persistence fallback
      fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, projectName }),
      }).catch(() => {});
    },
    [currentUser, updateProjectsState]
  );

  const clearAllProjects = useCallback(() => {
    updateProjectsState([]);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(
          JSON.stringify({
            type: 'project:clear_all',
            user: currentUser,
          })
        );
      } catch (_) {}
    }

    // REST persistence fallback
    fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser }),
    }).catch(() => {});
  }, [currentUser, updateProjectsState]);

  const viewProject = useCallback(
    (projectId: string) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: 'project:view',
              projectId,
              user: currentUser,
            })
          );
        } catch (_) {}
      }
    },
    [currentUser]
  );

  const setPicName = useCallback(
    (newName: string) => {
      const updated: AuditUser = {
        ...currentUser,
        name: newName.trim() || 'PIC Input',
      };
      saveCurrentUser(updated);
    },
    [currentUser, saveCurrentUser]
  );

  return {
    currentUser,
    saveCurrentUser,
    setPicName,
    projects,
    activities,
    onlineUsers,
    isConnected,
    lastActivity,
    createProject,
    updateProject,
    deleteProject,
    clearAllProjects,
    viewProject,
    defaultRoles: DEFAULT_ROLES,
    avatarColors: AVATAR_COLORS,
  };
}
