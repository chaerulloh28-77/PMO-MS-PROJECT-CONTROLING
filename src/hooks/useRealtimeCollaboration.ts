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
const LOCAL_ACTIVITIES_CACHE = 'monitoring_activities_cache_v1';
const BROADCAST_CHANNEL_NAME = 'pmo_realtime_collaboration_v1';

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
  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_ACTIVITIES_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [onlineUsers, setOnlineUsers] = useState<AuditUser[]>([currentUser]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<ActivityLog | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const updateProjectDebounceRef = useRef<Map<string, any>>(new Map());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const apiAvailableRef = useRef<boolean>(true);

  // Debounced sync of projects to localStorage cache so main thread is never blocked
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_PROJECTS_CACHE, JSON.stringify(projects));
      } catch (_) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [projects]);

  // Debounced sync of activities to localStorage cache
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_ACTIVITIES_CACHE, JSON.stringify(activities.slice(0, 100)));
      } catch (_) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [activities]);

  // Clean in-memory projects updater
  const updateProjectsState = useCallback((updater: Project[] | ((prev: Project[]) => Project[])) => {
    setProjects(updater);
  }, []);

  // Multi-Tab Real-time Synchronization via BroadcastChannel (Works 100% on Vercel & serverless)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channelRef.current = channel;

        channel.onmessage = (event) => {
          const data = event.data;
          if (!data || !data.type) return;

          switch (data.type) {
            case 'project:create':
              if (data.project) {
                updateProjectsState((prev) => {
                  if (prev.some((p) => p.id === data.project.id)) return prev;
                  return [data.project, ...prev];
                });
              }
              break;

            case 'project:update':
              if (data.project) {
                updateProjectsState((prev) => {
                  const idx = prev.findIndex((p) => p.id === data.project.id);
                  if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = data.project;
                    return updated;
                  }
                  return [data.project, ...prev];
                });
              }
              break;

            case 'project:delete':
              if (data.projectId) {
                updateProjectsState((prev) => prev.filter((p) => p.id !== data.projectId));
              }
              break;

            case 'project:clear_all':
              updateProjectsState([]);
              break;

            case 'activity:new':
              if (data.activity) {
                setActivities((prev) => [data.activity, ...prev.filter((a) => a.id !== data.activity.id)].slice(0, 100));
                setLastActivity(data.activity);
              }
              break;

            case 'activities:clear':
              setActivities([]);
              break;

            case 'presence:announce':
              if (data.user) {
                setOnlineUsers((prev) => {
                  const exists = prev.some((u) => u.id === data.user.id);
                  if (exists) return prev.map((u) => (u.id === data.user.id ? data.user : u));
                  return [...prev, data.user];
                });
                try {
                  channel.postMessage({ type: 'presence:reply', user: currentUser });
                } catch (_) {}
              }
              break;

            case 'presence:reply':
              if (data.user) {
                setOnlineUsers((prev) => {
                  const exists = prev.some((u) => u.id === data.user.id);
                  if (exists) return prev.map((u) => (u.id === data.user.id ? data.user : u));
                  return [...prev, data.user];
                });
              }
              break;

            case 'presence:leave':
              if (data.userId) {
                setOnlineUsers((prev) => prev.filter((u) => u.id !== data.userId));
              }
              break;

            default:
              break;
          }
        };

        // Announce presence to other tabs
        try {
          channel.postMessage({ type: 'presence:announce', user: currentUser });
        } catch (_) {}

        return () => {
          try {
            channel.postMessage({ type: 'presence:leave', userId: currentUser.id });
            channel.close();
          } catch (_) {}
          channelRef.current = null;
        };
      } catch (_) {}
    }
  }, [currentUser, updateProjectsState]);

  // Record Local Activity with Multi-Tab Broadcast and Server Sync
  const recordLocalActivity = useCallback(
    (act: ActivityLog) => {
      setActivities((prev) => [act, ...prev.filter((a) => a.id !== act.id)].slice(0, 100));
      setLastActivity(act);

      // Broadcast to other open tabs
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'activity:new', activity: act });
        } catch (_) {}
      }

      // Send to WebSocket if open
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({ type: 'activity:new', activity: act }));
        } catch (_) {}
      } else if (apiAvailableRef.current) {
        // Send to REST API fallback
        fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activity: act }),
        }).catch(() => {
          apiAvailableRef.current = false;
        });
      }
    },
    []
  );

  // Record Traffic / Open Link Activity on Startup
  useEffect(() => {
    const now = Date.now();
    const lastTrafficKey = `pmo_traffic_logged_${currentUser.id}`;
    let shouldRecord = true;
    try {
      const last = sessionStorage.getItem(lastTrafficKey);
      if (last && now - parseInt(last, 10) < 60000) {
        shouldRecord = false;
      }
    } catch (_) {}

    if (shouldRecord) {
      try {
        sessionStorage.setItem(lastTrafficKey, now.toString());
      } catch (_) {}

      const openAct: ActivityLog = {
        id: 'act-' + now + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        user: currentUser,
        type: 'open_link',
        title: 'Akses Aplikasi PMO',
        description: `${currentUser.name} (${currentUser.role}) membuka & memantau dashboard`,
      };
      recordLocalActivity(openAct);
    }
  }, [currentUser, recordLocalActivity]);

  const saveCurrentUser = useCallback(
    (updated: AuditUser) => {
      setCurrentUser(updated);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save user:', err);
      }

      // Broadcast updated profile across tabs
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'presence:announce', user: updated });
        } catch (_) {}
      }

      // Inform server of updated user info via WS or HTTP
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: 'user:join',
              user: updated,
            })
          );
        } catch (_) {}
      } else if (apiAvailableRef.current) {
        fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: updated }),
        }).catch(() => {
          apiAvailableRef.current = false;
        });
      }
    },
    []
  );

  // Initial HTTP Fetch for reliability
  const fetchInitialData = useCallback(async () => {
    if (!apiAvailableRef.current) return;
    try {
      const [projRes, actRes, presRes] = await Promise.allSettled([
        fetch('/api/projects').then((r) => {
          if (!r.ok) {
            apiAvailableRef.current = false;
            return [];
          }
          return r.json();
        }),
        fetch('/api/activities').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/presence').then((r) => (r.ok ? r.json() : [])),
      ]);

      if (projRes.status === 'fulfilled' && Array.isArray(projRes.value) && projRes.value.length > 0) {
        updateProjectsState(projRes.value);
      }
      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value) && actRes.value.length > 0) {
        setActivities((prev) => {
          const merged = [...actRes.value, ...prev];
          const seen = new Set();
          return merged.filter((a) => {
            if (!a || !a.id || seen.has(a.id)) return false;
            seen.add(a.id);
            return true;
          }).slice(0, 100);
        });
      }
      if (presRes.status === 'fulfilled' && Array.isArray(presRes.value) && presRes.value.length > 0) {
        setOnlineUsers(presRes.value);
      }
    } catch (_) {
      apiAvailableRef.current = false;
    }
  }, [updateProjectsState]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Connect WebSocket with graceful error handling & Vercel / serverless awareness
  useEffect(() => {
    let isUnmounted = false;

    // Vercel serverless environments do not support persistent WebSockets (/ws)
    const isVercel =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('vercel.app') ||
        window.location.hostname.includes('netlify.app') ||
        window.location.hostname.includes('github.io'));

    if (isVercel) {
      // On Vercel, local storage + BroadcastChannel are already 100% active and running
      setIsConnected(true);
      setIsWsConnected(false);
      return;
    }

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
          setIsWsConnected(true);
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
                if (Array.isArray(data.activities) && data.activities.length > 0) {
                  setActivities(data.activities);
                }
                if (Array.isArray(data.onlineUsers) && data.onlineUsers.length > 0) {
                  setOnlineUsers(data.onlineUsers);
                }
                break;
              }

              case 'presence:update': {
                if (Array.isArray(data.onlineUsers)) {
                  setOnlineUsers(data.onlineUsers);
                }
                break;
              }

              case 'activity:new': {
                const act: ActivityLog = data.activity;
                setActivities((prev) => [act, ...prev.filter((a) => a.id !== act.id)].slice(0, 100));
                setLastActivity(act);
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

              case 'activities:cleared': {
                setActivities([]);
                break;
              }

              default:
                break;
            }
          } catch (_) {}
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setIsWsConnected(false);
          // Keep isConnected true because local offline/multi-tab persistence is active
          setIsConnected(true);
          reconnectAttemptsRef.current += 1;

          // Cap retries to 3 times to avoid hammering
          if (reconnectAttemptsRef.current <= 3) {
            const delay = reconnectAttemptsRef.current === 1 ? 2000 : 8000;
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch (_) {}
        };
      } catch (_) {
        setIsWsConnected(false);
        setIsConnected(true);
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

  // Periodic polling fallback when server REST API is confirmed available
  useEffect(() => {
    if (!apiAvailableRef.current) return;
    const interval = setInterval(() => {
      if (!isWsConnected && apiAvailableRef.current) {
        fetchInitialData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isWsConnected, fetchInitialData]);

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

      // 1. Optimistic update
      updateProjectsState((prev) => [enrichedProject, ...prev]);

      // 2. Broadcast across tabs
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'project:create', project: enrichedProject });
        } catch (_) {}
      }

      // 3. Record Audit & Traffic Activity
      const act: ActivityLog = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        user: currentUser,
        type: 'create_project',
        title: 'Project Baru Ditambahkan',
        description: `${currentUser.name} (${currentUser.role}) menambahkan project "${enrichedProject.name || enrichedProject.id}"`,
        projectId: enrichedProject.id,
        projectName: enrichedProject.name,
      };
      recordLocalActivity(act);

      // 4. WebSocket action
      let sentViaWs = false;
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: 'project:create',
              project: enrichedProject,
              user: currentUser,
            })
          );
          sentViaWs = true;
        } catch (_) {}
      }

      // REST persistence fallback only if WS not connected
      if (!sentViaWs && apiAvailableRef.current) {
        fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: enrichedProject, user: currentUser }),
        }).catch(() => {
          apiAvailableRef.current = false;
        });
      }
    },
    [currentUser, updateProjectsState, recordLocalActivity]
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

      // 1. Immediate optimistic update (0ms lag, instant 60fps response)
      updateProjectsState((prev) =>
        prev.map((p) => (p.id === enrichedProject.id ? enrichedProject : p))
      );

      // 2. Broadcast across tabs
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'project:update', project: enrichedProject });
        } catch (_) {}
      }

      // 3. Debounce remote sync and audit log recording to prevent network congestion
      const existingTimer = updateProjectDebounceRef.current.get(project.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        updateProjectDebounceRef.current.delete(project.id);

        // Record Audit & Traffic Activity
        const act: ActivityLog = {
          id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          timestamp: new Date().toISOString(),
          user: currentUser,
          type: 'update_project',
          title: 'Perubahan Data Project',
          description: `${currentUser.name} (${currentUser.role}) memperbarui ${fieldChanged} pada "${enrichedProject.name || enrichedProject.id}"`,
          projectId: enrichedProject.id,
          projectName: enrichedProject.name,
        };
        recordLocalActivity(act);

        let sentViaWs = false;
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
            sentViaWs = true;
          } catch (_) {}
        }

        // REST persistence fallback only if WS not connected
        if (!sentViaWs && apiAvailableRef.current) {
          fetch(`/api/projects/${enrichedProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: enrichedProject, user: currentUser, fieldChanged }),
          }).catch(() => {
            apiAvailableRef.current = false;
          });
        }
      }, 150);

      updateProjectDebounceRef.current.set(project.id, timer);
    },
    [currentUser, updateProjectsState, recordLocalActivity]
  );

  const deleteProject = useCallback(
    (projectId: string, projectName?: string) => {
      // Clear pending debounce for this project
      const pending = updateProjectDebounceRef.current.get(projectId);
      if (pending) {
        clearTimeout(pending);
        updateProjectDebounceRef.current.delete(projectId);
      }

      // 1. Optimistic update
      updateProjectsState((prev) => prev.filter((p) => p.id !== projectId));

      // 2. Broadcast across tabs
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'project:delete', projectId });
        } catch (_) {}
      }

      // 3. Record Audit & Traffic Activity
      const act: ActivityLog = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        user: currentUser,
        type: 'delete_project',
        title: 'Project Dihapus',
        description: `${currentUser.name} (${currentUser.role}) menghapus data project "${projectName || projectId}"`,
        projectId,
        projectName,
      };
      recordLocalActivity(act);

      let sentViaWs = false;
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
          sentViaWs = true;
        } catch (_) {}
      }

      // REST persistence fallback only if WS is not open
      if (!sentViaWs && apiAvailableRef.current) {
        fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: currentUser, projectName }),
        }).catch(() => {
          apiAvailableRef.current = false;
        });
      }
    },
    [currentUser, updateProjectsState, recordLocalActivity]
  );

  const clearAllProjects = useCallback(() => {
    updateProjectDebounceRef.current.forEach((t: any) => clearTimeout(t));
    updateProjectDebounceRef.current.clear();

    // 1. Optimistic update
    updateProjectsState([]);

    // 2. Broadcast across tabs
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: 'project:clear_all' });
      } catch (_) {}
    }

    // 3. Record Audit & Traffic Activity
    const act: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      user: currentUser,
      type: 'clear_all',
      title: 'Database Dikosongkan',
      description: `${currentUser.name} (${currentUser.role}) mengosongkan seluruh data project`,
    };
    recordLocalActivity(act);

    let sentViaWs = false;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(
          JSON.stringify({
            type: 'project:clear_all',
            user: currentUser,
          })
        );
        sentViaWs = true;
      } catch (_) {}
    }

    // REST persistence fallback only if WS is not open
    if (!sentViaWs && apiAvailableRef.current) {
      fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      }).catch(() => {
        apiAvailableRef.current = false;
      });
    }
  }, [currentUser, updateProjectsState, recordLocalActivity]);

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

  const clearActivities = useCallback(() => {
    setActivities([]);
    try {
      localStorage.removeItem(LOCAL_ACTIVITIES_CACHE);
    } catch (_) {}

    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: 'activities:clear' });
      } catch (_) {}
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(
          JSON.stringify({
            type: 'activities:clear',
            user: currentUser,
          })
        );
      } catch (_) {}
    }

    if (apiAvailableRef.current) {
      fetch('/api/activities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      }).catch(() => {
        apiAvailableRef.current = false;
      });
    }
  }, [currentUser]);

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
    clearActivities,
    onlineUsers,
    isConnected,
    isWsConnected,
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
