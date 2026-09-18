import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json());

// Persistent storage setup
const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadProjects(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading projects.json:', err);
  }
  return [];
}

let saveProjectsTimer: NodeJS.Timeout | null = null;
function saveProjects(projectsToSave: any[]) {
  ensureDataDir();
  if (saveProjectsTimer) clearTimeout(saveProjectsTimer);
  saveProjectsTimer = setTimeout(() => {
    try {
      fs.writeFile(PROJECTS_FILE, JSON.stringify(projectsToSave, null, 2), 'utf-8', (err) => {
        if (err) console.error('Error saving projects.json:', err);
      });
    } catch (err) {
      console.error('Error in saveProjects timer:', err);
    }
  }, 100);
}

function cleanUserName(name?: string): string {
  if (!name || /^User-\d+$/i.test(name.trim())) {
    return 'PIC Input';
  }
  return name.trim();
}

function loadActivities(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(ACTIVITIES_FILE)) {
      const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((act) => ({
          ...act,
          user: {
            ...act.user,
            name: cleanUserName(act.user?.name),
          },
          description: (act.description || '').replace(/User-\d+/g, 'PIC Input'),
        }));
      }
    }
  } catch (err) {
    console.error('Error reading activities.json:', err);
  }
  return [];
}

let saveActivitiesTimer: NodeJS.Timeout | null = null;
function saveActivities(activitiesToSave: any[]) {
  ensureDataDir();
  if (saveActivitiesTimer) clearTimeout(saveActivitiesTimer);
  saveActivitiesTimer = setTimeout(() => {
    try {
      fs.writeFile(ACTIVITIES_FILE, JSON.stringify(activitiesToSave.slice(0, 100), null, 2), 'utf-8', (err) => {
        if (err) console.error('Error saving activities.json:', err);
      });
    } catch (err) {
      console.error('Error in saveActivities timer:', err);
    }
  }, 100);
}

// In-memory state
let projects: any[] = loadProjects();
let activities: any[] = loadActivities();

interface ConnectedClient {
  ws: WebSocket;
  user?: {
    id: string;
    name: string;
    role: string;
    color: string;
    joinedAt: string;
  };
}

const clients: ConnectedClient[] = [];

function getOnlineUsers() {
  const usersMap = new Map<string, any>();
  for (const c of clients) {
    if (c.user && c.ws.readyState === WebSocket.OPEN) {
      usersMap.set(c.user.id, c.user);
    }
  }
  return Array.from(usersMap.values());
}

function broadcast(message: any, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const c of clients) {
    if (c.ws.readyState === WebSocket.OPEN && c.ws !== excludeWs) {
      try {
        c.ws.send(payload);
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  }
}

function recordActivity(activity: any) {
  activities.unshift(activity);
  if (activities.length > 150) {
    activities = activities.slice(0, 150);
  }
  saveActivities(activities);
  broadcast({
    type: 'activity:new',
    activity,
  });
}

// REST API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', onlineCount: getOnlineUsers().length, projectCount: projects.length });
});

app.get('/api/projects', (_req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  try {
    const { project, user } = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ error: 'Invalid project data' });
    }
    const exists = projects.some((p) => p.id === project.id);
    if (!exists) {
      projects.unshift(project);
      saveProjects(projects);

      const act = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        user: user || project.createdBy || { name: 'PIC Input', role: 'PMO' },
        type: 'create_project',
        title: 'Project Baru Dibuat',
        description: `${user?.name || project.name} menambahkan project: ${project.name}`,
        projectId: project.id,
        projectName: project.name,
      };
      recordActivity(act);

      broadcast({
        type: 'project:created',
        project,
      });
    }
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const { project, user, fieldChanged } = req.body;
    const { id } = req.params;
    const idx = projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      projects[idx] = project;
      saveProjects(projects);

      const act = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        user: user || project.lastModifiedBy || { name: 'PIC Input', role: 'PMO' },
        type: 'update_project',
        title: 'Project Diperbarui',
        description: `${user?.name || 'PIC'} mengedit ${fieldChanged || 'data'} project: ${project.name}`,
        projectId: project.id,
        projectName: project.name,
      };
      recordActivity(act);

      broadcast({
        type: 'project:updated',
        project,
      });
      res.json({ success: true, project });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { user, projectName } = req.body || {};
    const existing = projects.find((p) => p.id === id);
    projects = projects.filter((p) => p.id !== id);
    saveProjects(projects);

    const act = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      user: user || { name: 'PIC Input', role: 'PMO' },
      type: 'delete_project',
      title: 'Project Dihapus',
      description: `${user?.name || 'PIC'} menghapus project: ${projectName || existing?.name || id}`,
      projectId: id,
      projectName: projectName || existing?.name,
    };
    recordActivity(act);

    broadcast({
      type: 'project:deleted',
      projectId: id,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.delete('/api/projects', (req, res) => {
  try {
    const { user } = req.body || {};
    projects = [];
    saveProjects(projects);

    const act = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      user: user || { name: 'PIC Input', role: 'PMO' },
      type: 'clear_all',
      title: 'Semua Project Direset',
      description: `${user?.name || 'PIC'} mereset seluruh daftar project`,
    };
    recordActivity(act);

    broadcast({
      type: 'project:cleared',
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear projects' });
  }
});

app.get('/api/activities', (_req, res) => {
  res.json(activities);
});

app.delete('/api/activities', (_req, res) => {
  activities = [];
  saveActivities(activities);
  broadcast({ type: 'activities:cleared' });
  res.json({ success: true, message: 'All activities history cleared' });
});

app.get('/api/presence', (_req, res) => {
  res.json(getOnlineUsers());
});

app.post('/api/presence', (req, res) => {
  const { user } = req.body || {};
  if (user) {
    user.name = cleanUserName(user.name);
  }
  res.json({ onlineUsers: getOnlineUsers() });
});

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  const client: ConnectedClient = { ws };
  clients.push(client);

  // Send initial data to this client
  ws.send(
    JSON.stringify({
      type: 'init',
      projects,
      activities: activities.slice(0, 50),
      onlineUsers: getOnlineUsers(),
    })
  );

  ws.on('message', (rawData: string) => {
    try {
      const msg = JSON.parse(rawData.toString());
      if (msg.user) {
        msg.user.name = cleanUserName(msg.user.name);
      }

      switch (msg.type) {
        case 'user:join': {
          client.user = {
            ...msg.user,
            joinedAt: new Date().toISOString(),
          };

          const joinActivity = {
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            timestamp: new Date().toISOString(),
            user: msg.user,
            type: 'open_link',
            title: 'Membuka Link Dashboard',
            description: `${msg.user.name} (${msg.user.role}) sedang online & membuka aplikasi`,
          };
          recordActivity(joinActivity);

          broadcast({
            type: 'presence:update',
            onlineUsers: getOnlineUsers(),
          });
          break;
        }

        case 'project:create': {
          const newProject = msg.project;
          projects.unshift(newProject);
          saveProjects(projects);

          const act = {
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            timestamp: new Date().toISOString(),
            user: msg.user,
            type: 'create_project',
            title: 'Membuat Project Baru',
            description: `${msg.user.name} membuat project "${newProject.name || newProject.id}"`,
            projectId: newProject.id,
            projectName: newProject.name,
          };
          recordActivity(act);

          broadcast(
            {
              type: 'project:created',
              project: newProject,
              user: msg.user,
            },
            ws
          );
          break;
        }

        case 'project:update': {
          const updated = msg.project;
          const index = projects.findIndex((p) => p.id === updated.id);
          if (index !== -1) {
            projects[index] = updated;
          } else {
            projects.unshift(updated);
          }
          saveProjects(projects);

          const act = {
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            timestamp: new Date().toISOString(),
            user: msg.user,
            type: 'update_project',
            title: 'Memperbarui Data Project',
            description: `${msg.user.name} memperbarui ${msg.fieldChanged || 'data'} pada "${updated.name || updated.id}"`,
            projectId: updated.id,
            projectName: updated.name,
          };
          recordActivity(act);

          broadcast(
            {
              type: 'project:updated',
              project: updated,
              user: msg.user,
            },
            ws
          );
          break;
        }

        case 'project:delete': {
          const { projectId, projectName, user } = msg;
          projects = projects.filter((p) => p.id !== projectId);
          saveProjects(projects);

          const act = {
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            timestamp: new Date().toISOString(),
            user,
            type: 'delete_project',
            title: 'Menghapus Project',
            description: `${user.name} menghapus project "${projectName || projectId}"`,
            projectId,
            projectName,
          };
          recordActivity(act);

          broadcast(
            {
              type: 'project:deleted',
              projectId,
              user,
            },
            ws
          );
          break;
        }

        case 'project:clear_all': {
          const { user } = msg;
          projects = [];
          saveProjects(projects);

          const act = {
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            timestamp: new Date().toISOString(),
            user,
            type: 'clear_all',
            title: 'Mengosongkan Database',
            description: `${user.name} mengosongkan seluruh data project`,
          };
          recordActivity(act);

          broadcast(
            {
              type: 'project:cleared',
              user,
            },
            ws
          );
          break;
        }

        case 'activities:clear': {
          activities = [];
          saveActivities(activities);
          broadcast(
            {
              type: 'activities:cleared',
            },
            ws
          );
          break;
        }

        case 'project:view': {
          const { projectId, user } = msg;
          const proj = projects.find((p) => p.id === projectId);
          if (proj) {
            proj.viewCount = (proj.viewCount || 0) + 1;
            proj.lastViewedBy = {
              name: user.name,
              at: new Date().toISOString(),
            };
            saveProjects(projects);

            broadcast({
              type: 'project:viewed',
              projectId,
              viewCount: proj.viewCount,
              lastViewedBy: proj.lastViewedBy,
            });
          }
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    const idx = clients.indexOf(client);
    if (idx !== -1) {
      clients.splice(idx, 1);
    }
    broadcast({
      type: 'presence:update',
      onlineUsers: getOnlineUsers(),
    });
  });

  ws.on('error', (err) => {
    console.error('Client WS error:', err);
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Live Collaborative Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
