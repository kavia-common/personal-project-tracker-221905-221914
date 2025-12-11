import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { DashboardAPI, ProjectsAPI, TasksAPI } from './api';
import { Button, Card, Input, Modal, TextArea, Spinner, colors, useAsync } from './components';

// PUBLIC_INTERFACE
function App() {
  /** Main app: sidebar + main content with dashboard/projects */
  const [theme, setTheme] = useState('light');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'projects'
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load dashboard
  const dash = useAsync(() => DashboardAPI.summary(), []);
  // Load projects list
  const projects = useAsync(() => ProjectsAPI.list(), []);

  // Derived selected project data from list when selectedProject is id
  const selectedProjectData = useMemo(() => {
    if (!projects.data || !selectedProject) return null;
    return projects.data.find((p) => String(p.id) === String(selectedProject)) || null;
  }, [projects.data, selectedProject]);

  // Handlers
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const onCreateProject = async (payload) => {
    await ProjectsAPI.create(payload);
    await projects.reload();
    setProjectModalOpen(false);
  };

  const onUpdateProject = async (id, payload) => {
    await ProjectsAPI.update(id, payload);
    await projects.reload();
    setEditingProject(null);
  };

  const onDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await ProjectsAPI.remove(id);
    if (String(selectedProject) === String(id)) {
      setSelectedProject(null);
    }
    await projects.reload();
  };

  // Tasks state loading per selected project
  const tasksState = useAsync(
    () => (selectedProject ? TasksAPI.list(selectedProject) : Promise.resolve([])),
    [selectedProject]
  );

  const onAddTask = async (title, description) => {
    if (!selectedProject) return;
    await TasksAPI.create(selectedProject, { title, description });
    await tasksState.reload();
  };

  const onToggleTask = async (taskId) => {
    if (!selectedProject) return;
    await TasksAPI.toggleComplete(selectedProject, taskId);
    await tasksState.reload();
  };

  const onUpdateTask = async (taskId, payload) => {
    if (!selectedProject) return;
    await TasksAPI.update(selectedProject, taskId, payload);
    await tasksState.reload();
  };

  const onDeleteTask = async (taskId) => {
    if (!selectedProject) return;
    await TasksAPI.remove(selectedProject, taskId);
    await tasksState.reload();
  };

  return (
    <div className="App" style={{ background: colors.bg, color: colors.text, minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: colors.surface,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 800, color: colors.primary }}>Personal Project Tracker</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </Button>
          <Button variant={activeView === 'dashboard' ? 'primary' : 'ghost'} onClick={() => setActiveView('dashboard')}>
            Dashboard
          </Button>
          <Button variant={activeView === 'projects' ? 'primary' : 'ghost'} onClick={() => setActiveView('projects')}>
            Projects
          </Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, padding: 16 }}>
        {/* Sidebar */}
        <aside
          style={{
            background: colors.surface,
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 12,
            height: 'calc(100vh - 88px)',
            position: 'sticky',
            top: 72,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, color: colors.text }}>Projects</div>
            <div style={{ marginLeft: 'auto' }}>
              <Button onClick={() => { setEditingProject(null); setProjectModalOpen(true); }} variant="success">+ New</Button>
            </div>
          </div>
          <div>
            {projects.loading && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading projects…</div>}
            {projects.error && <div style={{ color: colors.error }}>Error: {projects.error.message}</div>}
            {!projects.loading && projects.data && projects.data.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: 14 }}>No projects yet. Create one.</div>
            )}
            {!projects.loading && projects.data && projects.data.map((p) => (
              <div
                key={p.id}
                onClick={() => { setSelectedProject(p.id); setActiveView('projects'); }}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: String(selectedProject) === String(p.id) ? 'rgba(59,130,246,0.08)' : '#fff',
                  cursor: 'pointer',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{p.description}</div>}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingProject(p); setProjectModalOpen(true); }}>Edit</Button>
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main>
          {activeView === 'dashboard' && (
            <DashboardView dash={dash} projects={projects} />
          )}

          {activeView === 'projects' && (
            <ProjectsView
              selectedProject={selectedProject}
              selectedProjectData={selectedProjectData}
              tasksState={tasksState}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onUpdateTask={onUpdateTask}
            />
          )}
        </main>
      </div>

      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={(payload) => (editingProject ? onUpdateProject(editingProject.id, payload) : onCreateProject(payload))}
        initialData={editingProject || { name: '', description: '' }}
        mode={editingProject ? 'edit' : 'create'}
      />
    </div>
  );
}

function DashboardStat({ label, value, accent = colors.primary }) {
  return (
    <Card style={{ borderLeft: `4px solid ${accent}` }}>
      <div style={{ color: '#6b7280', fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 24 }}>{value}</div>
    </Card>
  );
}

function DashboardView({ dash, projects }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {dash.loading ? (
          <>
            <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading…</div></Card>
            <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading…</div></Card>
            <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading…</div></Card>
            <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading…</div></Card>
          </>
        ) : dash.error ? (
          <Card><div style={{ color: colors.error }}>Error: {dash.error.message}</div></Card>
        ) : (
          <>
            <DashboardStat label="Projects" value={dash.data?.projects_count ?? (projects.data?.length || 0)} />
            <DashboardStat label="Tasks" value={dash.data?.tasks_count ?? 0} accent={colors.secondary} />
            <DashboardStat label="Completed Tasks" value={dash.data?.completed_tasks ?? 0} accent={colors.success} />
            <DashboardStat label="Pending Tasks" value={dash.data?.pending_tasks ?? 0} accent={colors.primary} />
          </>
        )}
      </div>

      <Card title="Recent Projects">
        {projects.loading && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading projects…</div>}
        {projects.error && <div style={{ color: colors.error }}>Error: {projects.error.message}</div>}
        {!projects.loading && projects.data && projects.data.length === 0 && (
          <div style={{ color: '#6b7280', fontSize: 14 }}>No projects yet.</div>
        )}
        {!projects.loading && projects.data && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {projects.data.slice(0, 5).map((p) => (
              <li key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{p.description}</div>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ProjectsView({
  selectedProject,
  selectedProjectData,
  tasksState,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}) {
  return (
    <div>
      {!selectedProject && (
        <Card>
          <div style={{ color: '#6b7280' }}>Select a project from the left panel to view and manage tasks.</div>
        </Card>
      )}
      {selectedProject && (
        <>
          <Card
            title={selectedProjectData ? selectedProjectData.name : 'Project'}
          >
            <div style={{ color: '#6b7280', marginBottom: 8 }}>
              {selectedProjectData?.description || 'No description'}
            </div>
            <TaskForm onSubmit={onAddTask} />
          </Card>

          <Card title="Tasks">
            {tasksState.loading && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading tasks…</div>}
            {tasksState.error && <div style={{ color: colors.error }}>Error: {tasksState.error.message}</div>}
            {!tasksState.loading && tasksState.data && tasksState.data.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: 14 }}>No tasks yet. Add one above.</div>
            )}
            {!tasksState.loading && tasksState.data && (
              <div style={{ display: 'grid', gap: 8 }}>
                {tasksState.data.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onToggle={() => onToggleTask(t.id)}
                    onDelete={() => onDeleteTask(t.id)}
                    onUpdate={(payload) => onUpdateTask(t.id, payload)}
                  />
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(title.trim(), description.trim());
      setTitle('');
      setDescription('');
    } catch (e2) {
      setError(e2.message || 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handle}>
      <Input label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Implement auth" />
      <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details..." />
      {error && <div style={{ color: colors.error, marginBottom: 8 }}>{error}</div>}
      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Task'}
      </Button>
    </form>
  );
}

function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({ title, description });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 12,
        background: '#fff',
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={onToggle}
          aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        {!editing ? (
          <div style={{ fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#6b7280' : colors.text }}>
            {task.title}
          </div>
        ) : (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {!editing ? (
            <>
              <Button variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="ghost" onClick={onDelete}>Delete</Button>
            </>
          ) : (
            <>
              <Button variant="success" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
              <Button variant="ghost" onClick={() => { setEditing(false); setTitle(task.title || ''); setDescription(task.description || ''); }}>Cancel</Button>
            </>
          )}
        </div>
      </div>
      {!editing ? (
        <div style={{ fontSize: 14, color: '#6b7280' }}>{task.description || 'No details'}</div>
      ) : (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', minHeight: 60 }}
        />
      )}
    </div>
  );
}

function ProjectModal({ open, onClose, onSubmit, initialData, mode }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(initialData?.name || '');
    setDescription(initialData?.description || '');
  }, [initialData]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (e2) {
      setError(e2.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={mode === 'edit' ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <form onSubmit={submit}>
        <Input label="Project name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Awesome App" />
        <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        {error && <div style={{ color: colors.error, marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : (mode === 'edit' ? 'Save' : 'Create')}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default App;
