const BASE = "/server/sprints_management_function";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    // ignore
  }

  if (!res.ok) {
    return {
      success: false,
      status: res.status,
      message: json?.message || "Request failed",
      error: json?.error || null,
      data: json?.data || null,
    };
  }

  return json || { success: true };
}

export const SprintAPI = {
  list: (projectId = "") => request(`/sprints${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`),
  create: (payload) => request(`/sprints`, { method: "POST", body: payload }),
  getById: (id) => request(`/sprints/${encodeURIComponent(id)}`),
  update: (id, payload) => request(`/sprints/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),
  remove: (id) => request(`/sprints/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const HierarchyAPI = {
  list: (projectId = "") => request(`/hierarchy${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`),

  createMilestone: (payload) => request(`/milestones`, { method: "POST", body: payload }),
  updateMilestone: (id, payload) => request(`/milestones/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),
  removeMilestone: (id) => request(`/milestones/${encodeURIComponent(id)}`, { method: "DELETE" }),

  createEpic: (payload) => request(`/epics`, { method: "POST", body: payload }),
  updateEpic: (id, payload) => request(`/epics/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),
  removeEpic: (id) => request(`/epics/${encodeURIComponent(id)}`, { method: "DELETE" }),

  createStory: (payload) => request(`/stories`, { method: "POST", body: payload }),
  updateStory: (id, payload) => request(`/stories/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),
  removeStory: (id) => request(`/stories/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const TaskAPI = {
  listByStory: (storyId) => request(`/tasks?storyId=${encodeURIComponent(storyId)}`),
  create: (payload) => request(`/tasks`, { method: "POST", body: payload }),
  update: (id, payload) => request(`/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),
  remove: (id) => request(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const SubTaskAPI = {
  create: (payload) => request(`/subtasks`, { method: "POST", body: payload }),
  update: (id, payload) => request(`/subtasks/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),
  remove: (id) => request(`/subtasks/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
