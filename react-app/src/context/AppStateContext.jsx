import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SprintAPI, HierarchyAPI, TaskAPI, SubTaskAPI } from "../Admin/sprintsApi";

/** Enums */
export const TaskStatus = {
  // Legacy statuses (backward compat)
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  CODE_REVIEW: "CODE_REVIEW",
  QA: "QA",
  BLOCKED: "BLOCKED",
  DONE: "DONE",
  // New statuses
  NOT_STARTED: "NOT_STARTED",
  WIP: "WIP",
  UNDER_INTERNAL_TESTING: "UNDER_INTERNAL_TESTING",
  PENDING_FROM_ZOHO: "PENDING_FROM_ZOHO",
  PENDING_FROM_CLIENT: "PENDING_FROM_CLIENT",
  RELEASED_FOR_UAT: "RELEASED_FOR_UAT",
  UAT_APPROVED_BY_CLIENT: "UAT_APPROVED_BY_CLIENT",
  CLOSED: "CLOSED",
};

export const Priority = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

export const IssueType = {
  MILESTONE: "MILESTONE",
  EPIC: "EPIC",
  STORY: "STORY",
  TASK: "TASK",
  SUBTASK: "SUBTASK",
};

const AppStateContext = createContext(null);
export const useAppState = () => useContext(AppStateContext);

/* ── API → Frontend mappers ── */

function mapSprint(row) {
  return {
    id: row.ROWID,
    name: row.SprintName || "",
    goal: row.Goal || "",
    startDate: row.StartDate || "",
    endDate: row.EndDate || "",
    status: row.Status || "PLANNED",
  };
}

function mapMilestone(row) {
  return {
    id: row.ROWID,
    title: row.Title || "",
    description: row.Description || "",
    dueDate: row.DueDate || "",
  };
}

function mapEpic(row) {
  return {
    id: row.ROWID,
    title: row.Title || "",
    description: row.Description || "",
    color: row.Color || "#243859",
    milestoneId: row.MilestoneID || "",
  };
}

function mapSubTask(row) {
  return {
    id: row.ROWID,
    title: row.Title || "",
    status: row.Status || "TODO",
    estimatedHours: Number(row.EstimatedHours || 0),
    assigneeId: row.AssigneeID || "",
    dueDate: row.DueDate || "",
    taskId: row.TaskID || "",
    storyId: row.StoryID || "",
  };
}

function mapTask(row) {
  return {
    id: row.ROWID,
    title: row.Title || "",
    status: row.Status || "TODO",
    estimatedHours: Number(row.EstimatedHours || 0),
    assigneeId: row.AssigneeID || "",
    dueDate: row.DueDate || "",
    storyId: row.StoryID || "",
    subTasks: [],
  };
}

function mapStory(row) {
  return {
    id: row.ROWID,
    title: row.Title || "",
    description: row.Description || "",
    points: Number(row.Points || 0),
    priority: row.Priority || row.Priorityy || "MEDIUM",
    status: row.Status || "NOT_STARTED",
    epicId: row.EpicID || "",
    sprintId: row.SprintID || "",
    assigneeId: row.AssigneeID || "",
    estimatedHours: (Number(row.Points || 0)) * 4,
    dueDate: "",
    tasks: [],
    groupName: row.GroupName || "",
    requirementType: row.RequirementType || "",
    billingType: row.BillingType || "",
    primaryOwnership: row.PrimaryOwnership || "",
    secondaryOwnership: row.SecondaryOwnership || "",
    fiRemarks: row.FIRemarks || "",
    clientRemarks: row.ClientRemarks || "",
    zohoProductName: row.ZohoProductName || "",
    moduleName: row.ModuleName || "",
  };
}

/** Nest tasks+subtasks into stories from flat arrays, assign short displayIds */
function assembleStories(storiesRaw, tasksRaw, subTasksRaw) {
  let taskCounter = 0;
  let subTaskCounter = 0;

  const mappedSubs = (subTasksRaw || []).map((r) => ({
    ...mapSubTask(r),
    displayId: `SubTask-${++subTaskCounter}`,
  }));
  const subsByTask = {};
  for (const st of mappedSubs) {
    if (!subsByTask[st.taskId]) subsByTask[st.taskId] = [];
    subsByTask[st.taskId].push(st);
  }

  const mappedTasks = (tasksRaw || []).map((t) => ({
    ...mapTask(t),
    displayId: `Task-${++taskCounter}`,
    subTasks: subsByTask[t.ROWID] || [],
  }));
  const tasksByStory = {};
  for (const t of mappedTasks) {
    if (!tasksByStory[t.storyId]) tasksByStory[t.storyId] = [];
    tasksByStory[t.storyId].push(t);
  }

  return (storiesRaw || []).map((s, i) => ({
    ...mapStory(s),
    displayId: `Story-${i + 1}`,
    tasks: tasksByStory[s.ROWID] || [],
  }));
}

export const AppStateProvider = ({ children }) => {
  const [milestones, setMilestones] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState(
    () => localStorage.getItem("sprintSelectedProjectId") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist selected project across refreshes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("sprintSelectedProjectId", selectedProjectId);
    } else {
      localStorage.removeItem("sprintSelectedProjectId");
    }
  }, [selectedProjectId]);

  // Race-condition guard for project switching
  const fetchGen = useRef(0);

  const fetchAll = useCallback(async (projectId) => {
    if (!projectId) {
      setMilestones([]);
      setEpics([]);
      setSprints([]);
      setStories([]);
      return;
    }

    const gen = ++fetchGen.current;
    setLoading(true);
    setError(null);

    try {
      const [sprintRes, hierRes] = await Promise.all([
        SprintAPI.list(projectId),
        HierarchyAPI.list(projectId),
      ]);

      // Stale guard — discard if user switched project while we were loading
      if (gen !== fetchGen.current) return;

      if (sprintRes.success) {
        setSprints((sprintRes.data || []).map(mapSprint));
      }

      if (hierRes.success) {
        const d = hierRes.data || {};
        setMilestones((d.milestones || []).map(mapMilestone));
        setEpics((d.epics || []).map(mapEpic));
        setStories(assembleStories(d.stories, d.tasks, d.subTasks));
      }
    } catch (err) {
      if (gen !== fetchGen.current) return;
      setError(err.message || "Failed to load sprint data");
    } finally {
      if (gen === fetchGen.current) setLoading(false);
    }
  }, []);

  // Re-fetch whenever project changes
  useEffect(() => {
    fetchAll(selectedProjectId);
  }, [selectedProjectId, fetchAll]);

  /* ── Actions (optimistic update + API call) ── */

  const selectedProjectIdRef = useRef(selectedProjectId);
  selectedProjectIdRef.current = selectedProjectId;

  const updateStoryStatus = useCallback(async (storyId, status) => {
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, status } : s)));
    try {
      await HierarchyAPI.updateStory(storyId, { Status: status });
    } catch (err) {
      setError(err.message);
      fetchAll(selectedProjectIdRef.current); // revert
    }
  }, [fetchAll]);

  const updateStoryAssignment = useCallback(async (storyId, assigneeId) => {
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, assigneeId } : s)));
    try {
      await HierarchyAPI.updateStory(storyId, { AssigneeID: assigneeId });
    } catch (err) {
      setError(err.message);
      fetchAll(selectedProjectIdRef.current);
    }
  }, [fetchAll]);

  const updateStoryMeta = useCallback(async (storyId, patch) => {
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, ...patch } : s)));
    try {
      const apiPatch = {};
      if (patch.title !== undefined) apiPatch.Title = patch.title;
      if (patch.description !== undefined) apiPatch.Description = patch.description;
      if (patch.points !== undefined) apiPatch.Points = patch.points;
      if (patch.priority !== undefined) apiPatch.Priority = patch.priority;
      if (patch.status !== undefined) apiPatch.Status = patch.status;
      if (patch.epicId !== undefined) apiPatch.EpicID = patch.epicId;
      if (patch.sprintId !== undefined) apiPatch.SprintID = patch.sprintId;
      if (patch.assigneeId !== undefined) apiPatch.AssigneeID = patch.assigneeId;
      if (patch.groupName !== undefined) apiPatch.GroupName = patch.groupName;
      if (patch.requirementType !== undefined) apiPatch.RequirementType = patch.requirementType;
      if (patch.billingType !== undefined) apiPatch.BillingType = patch.billingType;
      if (patch.primaryOwnership !== undefined) apiPatch.PrimaryOwnership = patch.primaryOwnership;
      if (patch.secondaryOwnership !== undefined) apiPatch.SecondaryOwnership = patch.secondaryOwnership;
      if (patch.fiRemarks !== undefined) apiPatch.FIRemarks = patch.fiRemarks;
      if (patch.clientRemarks !== undefined) apiPatch.ClientRemarks = patch.clientRemarks;
      if (patch.zohoProductName !== undefined) apiPatch.ZohoProductName = patch.zohoProductName;
      if (patch.moduleName !== undefined) apiPatch.ModuleName = patch.moduleName;
      await HierarchyAPI.updateStory(storyId, apiPatch);
    } catch (err) {
      setError(err.message);
      fetchAll(selectedProjectIdRef.current);
    }
  }, [fetchAll]);

  const assignStoryToSprint = useCallback(async (storyId, sprintId) => {
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, sprintId } : s)));
    try {
      await HierarchyAPI.updateStory(storyId, { SprintID: sprintId });
    } catch (err) {
      setError(err.message);
      fetchAll(selectedProjectIdRef.current);
    }
  }, [fetchAll]);

  const addMilestone = useCallback(async ({ title, description, dueDate }) => {
    const tempId = `TEMP-MS-${Date.now()}`;
    setMilestones((prev) => [...prev, { id: tempId, title, description, dueDate }]);
    try {
      const res = await HierarchyAPI.createMilestone({
        ProjectID: selectedProjectIdRef.current,
        Title: title,
        Description: description || "",
        DueDate: dueDate || "",
      });
      if (res.success) {
        const newId = res.data?.ROWID;
        setMilestones((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: newId } : m)));
        return newId;
      } else {
        setMilestones((prev) => prev.filter((m) => m.id !== tempId));
        setError(res.message);
      }
    } catch (err) {
      setMilestones((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message);
    }
    return null;
  }, []);

  const addEpic = useCallback(async ({ title, description, color, milestoneId }) => {
    const tempId = `TEMP-EP-${Date.now()}`;
    setEpics((prev) => [...prev, { id: tempId, title, description, color: color || "#243859", milestoneId }]);
    try {
      const res = await HierarchyAPI.createEpic({
        ProjectID: selectedProjectIdRef.current,
        MilestoneID: milestoneId,
        Title: title,
        Description: description || "",
        Color: color || "#243859",
      });
      if (res.success) {
        const newId = res.data?.ROWID;
        setEpics((prev) => prev.map((e) => (e.id === tempId ? { ...e, id: newId } : e)));
        return newId;
      } else {
        setEpics((prev) => prev.filter((e) => e.id !== tempId));
        setError(res.message);
      }
    } catch (err) {
      setEpics((prev) => prev.filter((e) => e.id !== tempId));
      setError(err.message);
    }
    return null;
  }, []);

  const addSprint = useCallback(async ({ name, goal, startDate, endDate }) => {
    const tempId = `TEMP-SP-${Date.now()}`;
    setSprints((prev) => [...prev, { id: tempId, name, goal, startDate, endDate, status: "ACTIVE" }]);
    try {
      const res = await SprintAPI.create({
        ProjectID: selectedProjectIdRef.current,
        SprintName: name,
        Goal: goal || "",
        StartDate: startDate || "",
        EndDate: endDate || "",
        Status: "ACTIVE",
      });
      if (res.success) {
        const newId = res.data?.ROWID;
        setSprints((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: newId } : s)));
        return newId;
      } else {
        setSprints((prev) => prev.filter((s) => s.id !== tempId));
        setError(res.message);
      }
    } catch (err) {
      setSprints((prev) => prev.filter((s) => s.id !== tempId));
      setError(err.message);
    }
    return null;
  }, []);

  const addStory = useCallback(async ({ title, description, points, priority, status, epicId, sprintId, assigneeId, dueDate, groupName, requirementType, billingType, primaryOwnership, secondaryOwnership, fiRemarks, clientRemarks, zohoProductName, moduleName }) => {
    const tempId = `TEMP-US-${Date.now()}`;
    const pts = Number(points) || 0;
    setStories((prev) => [
      ...prev,
      {
        id: tempId,
        displayId: `Story-${prev.length + 1}`,
        title,
        description,
        points: pts,
        priority,
        status,
        epicId,
        sprintId: sprintId || "",
        assigneeId: assigneeId || "",
        estimatedHours: pts * 4,
        dueDate: dueDate || "",
        tasks: [],
        groupName: groupName || "",
        requirementType: requirementType || "",
        billingType: billingType || "",
        primaryOwnership: primaryOwnership || "",
        secondaryOwnership: secondaryOwnership || "",
        fiRemarks: fiRemarks || "",
        clientRemarks: clientRemarks || "",
        zohoProductName: zohoProductName || "",
        moduleName: moduleName || "",
      },
    ]);
    try {
      const res = await HierarchyAPI.createStory({
        ProjectID: selectedProjectIdRef.current,
        EpicID: epicId,
        SprintID: sprintId || "",
        Title: title,
        Description: description || "",
        Points: pts,
        Priority: priority || "MEDIUM",
        Status: status || "NOT_STARTED",
        AssigneeID: assigneeId || "",
        GroupName: groupName || "",
        RequirementType: requirementType || "",
        BillingType: billingType || "",
        PrimaryOwnership: primaryOwnership || "",
        SecondaryOwnership: secondaryOwnership || "",
        FIRemarks: fiRemarks || "",
        ClientRemarks: clientRemarks || "",
        ZohoProductName: zohoProductName || "",
        ModuleName: moduleName || "",
      });
      if (res.success) {
        const newId = res.data?.ROWID;
        setStories((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: newId } : s)));
        return newId;
      } else {
        setStories((prev) => prev.filter((s) => s.id !== tempId));
        setError(res.message);
      }
    } catch (err) {
      setStories((prev) => prev.filter((s) => s.id !== tempId));
      setError(err.message);
    }
    return null;
  }, []);

  const addTaskToStory = useCallback(async (storyId, { title, status, estimatedHours, assigneeId, dueDate }) => {
    const tempId = `TEMP-T-${Date.now()}`;
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? {
              ...s,
              tasks: [
                ...(s.tasks || []),
                { id: tempId, displayId: `Task-${(s.tasks || []).length + 1}`, title, status, estimatedHours: Number(estimatedHours) || 0, assigneeId: assigneeId || "", dueDate: dueDate || "", subTasks: [] },
              ],
            }
          : s
      )
    );
    try {
      const res = await TaskAPI.create({
        ProjectID: selectedProjectIdRef.current,
        StoryID: storyId,
        Title: title,
        Status: status || "TODO",
        EstimatedHours: Number(estimatedHours) || 0,
        AssigneeID: assigneeId || "",
        DueDate: dueDate || "",
      });
      if (res.success) {
        const newId = res.data?.ROWID;
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? { ...s, tasks: (s.tasks || []).map((t) => (t.id === tempId ? { ...t, id: newId } : t)) }
              : s
          )
        );
      } else {
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId ? { ...s, tasks: (s.tasks || []).filter((t) => t.id !== tempId) } : s
          )
        );
        setError(res.message);
      }
    } catch (err) {
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId ? { ...s, tasks: (s.tasks || []).filter((t) => t.id !== tempId) } : s
        )
      );
      setError(err.message);
    }
  }, []);

  const addSubTaskToTask = useCallback(async (storyId, taskId, { title, status, estimatedHours, assigneeId, dueDate }) => {
    const tempId = `TEMP-ST-${Date.now()}`;
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? {
              ...s,
              tasks: (s.tasks || []).map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      subTasks: [
                        ...(t.subTasks || []),
                        { id: tempId, displayId: `SubTask-${(t.subTasks || []).length + 1}`, title, status, estimatedHours: Number(estimatedHours) || 0, assigneeId: assigneeId || "", dueDate: dueDate || "" },
                      ],
                    }
                  : t
              ),
            }
          : s
      )
    );
    try {
      const res = await SubTaskAPI.create({
        ProjectID: selectedProjectIdRef.current,
        TaskID: taskId,
        StoryID: storyId,
        Title: title,
        Status: status || "TODO",
        EstimatedHours: Number(estimatedHours) || 0,
        AssigneeID: assigneeId || "",
        DueDate: dueDate || "",
      });
      if (res.success) {
        const newId = res.data?.ROWID;
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? {
                  ...s,
                  tasks: (s.tasks || []).map((t) =>
                    t.id === taskId
                      ? { ...t, subTasks: (t.subTasks || []).map((st) => (st.id === tempId ? { ...st, id: newId } : st)) }
                      : t
                  ),
                }
              : s
          )
        );
      } else {
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? {
                  ...s,
                  tasks: (s.tasks || []).map((t) =>
                    t.id === taskId ? { ...t, subTasks: (t.subTasks || []).filter((st) => st.id !== tempId) } : t
                  ),
                }
              : s
          )
        );
        setError(res.message);
      }
    } catch (err) {
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? {
                ...s,
                tasks: (s.tasks || []).map((t) =>
                  t.id === taskId ? { ...t, subTasks: (t.subTasks || []).filter((st) => st.id !== tempId) } : t
                ),
              }
            : s
        )
      );
      setError(err.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      milestones,
      epics,
      sprints,
      stories,
      TaskStatus,
      Priority,
      IssueType,

      selectedProjectId,
      setSelectedProjectId,
      loading,
      error,
      setError,
      fetchAll,

      updateStoryStatus,
      updateStoryAssignment,
      updateStoryMeta,
      assignStoryToSprint,

      addMilestone,
      addEpic,
      addSprint,
      addStory,
      addTaskToStory,
      addSubTaskToTask,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [milestones, epics, sprints, stories, selectedProjectId, loading, error, fetchAll]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};
