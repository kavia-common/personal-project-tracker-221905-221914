const API_BASE = 'http://localhost:3001';

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}) {
  /** Generic API request wrapper with JSON parsing and error mapping. */
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const resp = await fetch(url, { ...options, headers });
  const contentType = resp.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await resp.json().catch(() => null);
  } else {
    data = await resp.text().catch(() => null);
  }
  if (!resp.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${resp.status}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export const ProjectsAPI = {
  /** CRUD for projects */
  list() {
    return apiRequest('/projects');
  },
  get(id) {
    return apiRequest(`/projects/${id}`);
  },
  create(payload) {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(id, payload) {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  remove(id) {
    return apiRequest(`/projects/${id}`, { method: 'DELETE' });
  },
};

// PUBLIC_INTERFACE
export const TasksAPI = {
  /** CRUD for tasks and toggling complete */
  list(projectId) {
    return apiRequest(`/projects/${projectId}/tasks`);
  },
  create(projectId, payload) {
    return apiRequest(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(projectId, taskId, payload) {
    return apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  remove(projectId, taskId) {
    return apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
  toggleComplete(projectId, taskId) {
    return apiRequest(`/projects/${projectId}/tasks/${taskId}/toggle`, {
      method: 'POST',
    });
  },
};

// PUBLIC_INTERFACE
export const DashboardAPI = {
  /** Return dashboard data summary across projects */
  summary() {
    return apiRequest('/dashboard');
  },
};
