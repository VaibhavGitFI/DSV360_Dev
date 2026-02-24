import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

import TaskCreationModal from "./TaskCreationModal";
import SubTaskCreationModal from "./SubTaskCreationModal";

const formatTime = (decimalHours) => {
  const h = Math.floor(decimalHours || 0);
  const m = Math.round(((decimalHours || 0) - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const IssueDetailDrawer = ({
  selectedIssueId,
  selectedStory,
  setSelectedIssueId,
  users,
  sprints,
  updateStoryStatus,
  updateStoryAssignment,
  assignStoryToSprint,
  handleOpenCreate,
  TaskStatus,
  addTaskToStory,
  addSubTaskToTask,
  projectId,
  projectName,
  isEmployee,
}) => {
  const muiTheme = useTheme();
  const mode = muiTheme?.palette?.mode === "dark" ? "dark" : "light";

  // ── Current user from localStorage ──
  const currUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("currUser")) || {}; } catch { return {}; }
  }, []);

  // ── Log Time inline form state ──
  const [logTimeTarget, setLogTimeTarget] = useState(null); // { taskId, subTaskId? }
  const [logTimeForm, setLogTimeForm] = useState({ date: "", startTime: "", endTime: "", note: "", type: "Non-Billable" });
  const [logTimeLoading, setLogTimeLoading] = useState(false);
  const [logTimeMsg, setLogTimeMsg] = useState("");

  // ── Timer state ──
  const [timerRunning, setTimerRunning] = useState(null); // { timerId, taskId, subTaskId?, startTime }
  const [timerLoading, setTimerLoading] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState("");

  // Tick the elapsed timer every second
  useEffect(() => {
    if (!timerRunning?.startTime) { setTimerElapsed(""); return; }
    const tick = () => {
      const start = new Date(timerRunning.startTime.replace(" ", "T"));
      const now = new Date();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimerElapsed(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerRunning?.startTime]);

  // Check for running timer on mount / story change
  useEffect(() => {
    if (!currUser.userid) return;
    axios.get("/server/time_entry_management_application_function/timeentry/timer", {
      params: { User_ID: currUser.userid }
    }).then((res) => {
      if (res.data?.TimerId) {
        setTimerRunning({
          timerId: res.data.TimerId,
          taskId: res.data.Sprint_Task_ID || res.data.Task_ID,
          startTime: res.data.startTime,
        });
      }
    }).catch(() => {});
  }, [currUser.userid, selectedStory?.id]);

  const openLogTime = (taskId, subTaskId) => {
    setLogTimeTarget({ taskId, subTaskId: subTaskId || null });
    setLogTimeForm({ date: new Date().toISOString().split("T")[0], startTime: "", endTime: "", note: "", type: "Non-Billable" });
    setLogTimeMsg("");
  };

  const closeLogTime = () => { setLogTimeTarget(null); setLogTimeMsg(""); };

  const formatTimeToAMPM = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const handleLogTimeSubmit = useCallback(async () => {
    if (!logTimeTarget || !logTimeForm.date || !logTimeForm.startTime || !logTimeForm.endTime || !logTimeForm.note) return;
    const start = new Date(`1970-01-01T${logTimeForm.startTime}`);
    const end = new Date(`1970-01-01T${logTimeForm.endTime}`);
    const diffMin = (end - start) / 60000;
    if (diffMin <= 0) { setLogTimeMsg("End time must be after start time"); return; }

    const task = selectedStory?.tasks?.find(t => t.id === logTimeTarget.taskId);
    const subTask = logTimeTarget.subTaskId ? task?.subTasks?.find(st => st.id === logTimeTarget.subTaskId) : null;
    const taskName = subTask ? `${task?.title} > ${subTask.title}` : (task?.title || "");

    setLogTimeLoading(true);
    try {
      const payload = {
        Username: `${currUser.firstName || ""} ${currUser.lastName || ""}`.trim(),
        User_ID: currUser.userid,
        Entry_Date: logTimeForm.date,
        Note: logTimeForm.note,
        Type: logTimeForm.type,
        Start_time: formatTimeToAMPM(logTimeForm.startTime),
        End_time: formatTimeToAMPM(logTimeForm.endTime),
        Total_time: diffMin,
        Task_ID: logTimeTarget.taskId,
        Task_Name: taskName,
        Project_ID: projectId || "",
        Project_Name: projectName || "",
      };

      // Build sprint fields, only include non-empty values
      const sprintFields = {};
      const sourceType = logTimeTarget.subTaskId ? "SPRINT_SUBTASK" : "SPRINT_TASK";
      if (sourceType) sprintFields.Source_Type = sourceType;
      if (selectedStory?.sprintId) sprintFields.Sprint_ID = selectedStory.sprintId;
      if (selectedStory?.id) sprintFields.Story_ID = selectedStory.id;
      if (logTimeTarget.taskId) sprintFields.Sprint_Task_ID = logTimeTarget.taskId;
      if (logTimeTarget.subTaskId) sprintFields.Sprint_SubTask_ID = logTimeTarget.subTaskId;

      // Try with sprint fields first, fall back without them only on 500
      try {
        await axios.post("/server/time_entry_management_application_function/timeentry", {
          ...payload,
          ...sprintFields,
        });
      } catch (err) {
        // Only retry without sprint fields if it was a 500 (column missing), not 400 (validation)
        if (err.response?.status === 500) {
          await axios.post("/server/time_entry_management_application_function/timeentry", payload);
        } else {
          throw err;
        }
      }
      setLogTimeMsg("Time entry added!");
      setTimeout(closeLogTime, 1200);
    } catch (err) {
      setLogTimeMsg(err.response?.data?.message || "Failed to add time entry");
    } finally {
      setLogTimeLoading(false);
    }
  }, [logTimeTarget, logTimeForm, selectedStory, currUser, projectId, projectName]);

  const handleStartTimer = useCallback(async (taskId, subTaskId) => {
    if (timerRunning) return;
    const task = selectedStory?.tasks?.find(t => t.id === taskId);
    const subTask = subTaskId ? task?.subTasks?.find(st => st.id === subTaskId) : null;
    const taskName = subTask ? `${task?.title} > ${subTask.title}` : (task?.title || "");

    setTimerLoading(true);
    try {
      const timerPayload = {
        Project_ID: projectId || "",
        Project_Name: projectName || "",
        Entry_Date: new Date().toISOString().split("T")[0],
        Task_Name: taskName,
        Task_ID: taskId,
        Username: `${currUser.firstName || ""} ${currUser.lastName || ""}`.trim(),
        User_ID: currUser.userid,
      };
      const sprintFields = {};
      const srcType = subTaskId ? "SPRINT_SUBTASK" : "SPRINT_TASK";
      if (srcType) sprintFields.Source_Type = srcType;
      if (selectedStory?.sprintId) sprintFields.Sprint_ID = selectedStory.sprintId;
      if (selectedStory?.id) sprintFields.Story_ID = selectedStory.id;
      if (taskId) sprintFields.Sprint_Task_ID = taskId;
      if (subTaskId) sprintFields.Sprint_SubTask_ID = subTaskId;
      let res;
      try {
        res = await axios.post("/server/time_entry_management_application_function/timeentry/timer/start", { ...timerPayload, ...sprintFields });
      } catch (err) {
        // Only retry without sprint fields if it was a 500, not 400
        if (err.response?.status === 500) {
          res = await axios.post("/server/time_entry_management_application_function/timeentry/timer/start", timerPayload);
        } else {
          throw err;
        }
      }
      if (res.data?.data?.ROWID || res.data?.TimerId) {
        setTimerRunning({
          timerId: res.data?.data?.ROWID || res.data?.TimerId,
          taskId,
          startTime: res.data?.data?.Start_time || res.data?.startTime,
        });
      }
    } catch { /* silent */ }
    finally { setTimerLoading(false); }
  }, [timerRunning, selectedStory, currUser, projectId, projectName]);

  const handleStopTimer = useCallback(async (note, type) => {
    if (!timerRunning?.timerId) return;
    setTimerLoading(true);
    try {
      await axios.post("/server/time_entry_management_application_function/timeentry/timer/end", {
        ROWID: timerRunning.timerId,
        Note: note || "Sprint task work",
        Type: type || "Non-Billable",
      });
      setTimerRunning(null);
    } catch { /* silent */ }
    finally { setTimerLoading(false); }
  }, [timerRunning]);

  // Stop timer prompt state
  const [stopTimerOpen, setStopTimerOpen] = useState(false);
  const [stopNote, setStopNote] = useState("");
  const [stopType, setStopType] = useState("Non-Billable");

  const C = useMemo(() => {
    const light = {
      page: "#FCF8F8",
      surface: "#FFFFFF",
      surface2: "#FCF8F8",
      border: "rgba(0,0,0,0.12)",
      borderSoft: "rgba(0,0,0,0.08)",
      text: "#000000",
      textSoft: "#000000",
      accentA: "#9CAB84",
      accentB: "#FD7979",
      danger: "#FD7979",
      todo: "#4E56C0",
      prog: "#9B5DE0",
      rev: "#D78FEE",
      qa: "#FDCFFA",
      blocked: "#FD7979",
      done: "#9CAB84",
    };

    const dark = {
      page: "#191919",
      surface: "#191919",
      surface2: "#191919",
      border: "rgba(255,255,255,0.14)",
      borderSoft: "rgba(255,255,255,0.10)",
      text: "#FFFFFF",
      textSoft: "#FFFFFF",
      accentA: "#E3651D",
      accentB: "#750E21",
      danger: "#E3651D",
      todo: "#4E56C0",
      prog: "#9B5DE0",
      rev: "#D78FEE",
      qa: "#FDCFFA",
      blocked: "#750E21",
      done: "#E3651D",
    };

    return mode === "dark" ? dark : light;
  }, [mode]);

  const statusColor = (st) => {
    switch (st) {
      case TaskStatus.TODO:
        return C.todo;
      case TaskStatus.IN_PROGRESS:
        return C.prog;
      case TaskStatus.CODE_REVIEW:
        return C.rev;
      case TaskStatus.QA:
        return C.qa;
      case TaskStatus.BLOCKED:
        return C.blocked;
      case TaskStatus.DONE:
        return C.done;
      default:
        return mode === "dark" ? "#FFFFFF" : "#000000";
    }
  };

  const textForBg = (hex) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 160 ? "#000000" : "#FFFFFF";
  };

  // Expanded task detail view
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const toggleTaskExpand = (taskId) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // ✅ New: separate modals
  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [subTaskCreateOpen, setSubTaskCreateOpen] = useState(false);
  const [activeTaskForSubtask, setActiveTaskForSubtask] = useState(null);

  const openTaskCreate = () => setTaskCreateOpen(true);
  const closeTaskCreate = () => setTaskCreateOpen(false);

  const openSubTaskCreate = (task) => {
    setActiveTaskForSubtask(task);
    setSubTaskCreateOpen(true);
  };
  const closeSubTaskCreate = () => {
    setActiveTaskForSubtask(null);
    setSubTaskCreateOpen(false);
  };

  const shell = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 500,
    backgroundColor: C.surface,
    borderLeft: `1px solid ${C.border}`,
    boxShadow: mode === "dark" ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.12)",
    transform: selectedIssueId ? "translateX(0)" : "translateX(100%)",
    transition: "transform 280ms ease",
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const header = {
    padding: 18,
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: C.surface2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexShrink: 0,
  };

  const idPill = {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: 12,
    border: "none",
    backgroundColor: C.accentA,
  };

  const closeBtn = {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    border: `1px solid ${C.borderSoft}`,
    backgroundColor: C.surface,
    color: C.text,
    cursor: "pointer",
  };

  const section = { padding: 22, overflowY: "auto", flex: 1 };

  const label = {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: C.textSoft,
    marginBottom: 8,
  };

  const fieldWrap = { display: "flex", flexDirection: "column", gap: 8 };

  const selectBase = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    backgroundColor: C.surface,
    color: C.text,
    outline: "none",
    fontWeight: 800,
    fontSize: 13,
    appearance: "none",
  };

  const twoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

  const card = { border: `1px solid ${C.borderSoft}`, backgroundColor: C.surface2, borderRadius: 18, padding: 16 };

  const footer = {
    padding: 18,
    borderTop: `1px solid ${C.border}`,
    backgroundColor: C.surface2,
    display: "flex",
    gap: 12,
    flexShrink: 0,
  };

  const btn = (variant) => {
    const primary = variant === "primary";
    return {
      flex: primary ? 2 : 1,
      padding: "12px 14px",
      borderRadius: 16,
      border: `1px solid ${primary ? "transparent" : C.border}`,
      backgroundColor: primary ? (mode === "dark" ? C.accentA : C.accentA) : C.surface,
      color: primary ? textForBg(mode === "dark" ? C.accentA : C.accentA) : C.text,
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      cursor: "pointer",
    };
  };

  if (!selectedIssueId) return <aside style={shell} />;

  return (
    <>
      <aside style={shell}>
        {selectedStory ? (
          <>
            <div style={header}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={idPill}>{selectedStory.displayId}</span>

                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <select
                    value={selectedStory.status}
                    onChange={(e) => updateStoryStatus(selectedStory.id, e.target.value)}
                    style={{
                      padding: "6px 28px 6px 12px",
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: statusColor(selectedStory.status),
                      color: textForBg(statusColor(selectedStory.status)),
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      outline: "none",
                      appearance: "none",
                      cursor: "pointer",
                    }}
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <option key={s} value={s} style={{ color: "#000000" }}>
                        {String(s).replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke={textForBg(statusColor(selectedStory.status))} strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "absolute", right: 8, pointerEvents: "none" }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              <button onClick={() => setSelectedIssueId(null)} style={closeBtn} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={section} className="custom-scrollbar">
              <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, lineHeight: 1.15, marginBottom: 18 }}>
                {selectedStory.title}
              </h1>

              <div style={{ ...twoCol, marginBottom: 16 }}>
                <div style={fieldWrap}>
                  <div style={label}>Assignee</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {users.find((u) => u.id === selectedStory.assigneeId)?.avatar ? (
                      <img
                        src={users.find((u) => u.id === selectedStory.assigneeId).avatar}
                        alt="avatar"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 14,
                          border: `1px solid ${C.border}`,
                          objectFit: "cover",
                          backgroundColor: C.surface2,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 14,
                          border: `1px solid ${C.border}`,
                          backgroundColor: C.surface2,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 16,
                        }}
                      >
                        👤
                      </div>
                    )}
                    {isEmployee ? (
                      <span style={{ ...selectBase, border: "none", padding: "12px 0" }}>
                        {users.find((u) => u.id === selectedStory.assigneeId)?.name || "Unassigned"}
                      </span>
                    ) : (
                      <select
                        value={selectedStory.assigneeId || ""}
                        onChange={(e) => updateStoryAssignment(selectedStory.id, e.target.value)}
                        style={selectBase}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div style={fieldWrap}>
                  <div style={label}>Sprint</div>
                  <select
                    value={selectedStory.sprintId || ""}
                    onChange={(e) => assignStoryToSprint(selectedStory.id, e.target.value || "")}
                    style={selectBase}
                  >
                    <option value="">Backlog Pool</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={label}>Description</div>
                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 12,
                    border: `1px solid ${C.borderSoft}`,
                    backgroundColor: C.surface,
                    color: C.text,
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {selectedStory.points} SP
                </div>
              </div>

              <div style={card}>
                <p style={{ margin: 0, color: C.text, fontWeight: 700, fontStyle: "italic", lineHeight: 1.6 }}>
                  “{selectedStory.description || "No description"}”
                </p>
              </div>

              {/* Tasks */}
              <div style={{ marginTop: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={label}>Tasks</div>

                  {!isEmployee && (
                    <button
                      onClick={openTaskCreate}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: `1px solid ${C.border}`,
                        backgroundColor: C.surface,
                        color: C.text,
                        fontSize: 11,
                        fontWeight: 900,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      + Add Task
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedStory.tasks?.map((task) => {
                    const bg = statusColor(task.status);
                    const fg = textForBg(bg);
                    const assignee = users.find((u) => u.id === task.assigneeId);
                    const isExpanded = expandedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        style={{
                          borderRadius: 18,
                          border: `1.5px solid ${mode === "dark" ? "rgba(96,165,250,0.35)" : "rgba(37,99,235,0.22)"}`,
                          borderLeft: `4px solid ${mode === "dark" ? "#60A5FA" : "#2563EB"}`,
                          backgroundColor: mode === "dark" ? "rgba(59,130,246,0.12)" : "rgba(219,234,254,0.7)",
                          boxShadow: mode === "dark"
                            ? "0 2px 12px rgba(59,130,246,0.15), inset 0 1px 0 rgba(96,165,250,0.08)"
                            : "0 2px 8px rgba(37,99,235,0.08), inset 0 1px 0 rgba(219,234,254,0.5)",
                          overflow: "hidden",
                        }}
                      >
                        {/* Clickable task header */}
                        <div
                          onClick={() => toggleTaskExpand(task.id)}
                          style={{
                            padding: "12px 14px 12px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                              fill="none" stroke={C.text} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                              style={{ flexShrink: 0, transition: "transform 200ms", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", opacity: 0.6 }}
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                            <span style={{ fontSize: 11, fontWeight: 900, color: "#FFFFFF", backgroundColor: "#4E56C0", padding: "2px 8px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0 }}>{task.displayId}</span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 900,
                                color: C.text,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {task.title}
                            </span>
                          </div>

                          <span
                            style={{
                              padding: "5px 8px",
                              borderRadius: 10,
                              backgroundColor: bg,
                              color: fg,
                              fontSize: 9,
                              fontWeight: 900,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {String(task.status || "").replaceAll("_", " ")}
                          </span>
                        </div>

                        {/* Expanded task detail */}
                        {isExpanded && (
                          <div
                            style={{
                              padding: "0 14px 14px 18px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 14,
                              borderTop: `1px solid ${mode === "dark" ? "rgba(96,165,250,0.20)" : "rgba(37,99,235,0.12)"}`,
                            }}
                          >
                            {/* Task detail grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                              <div style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                                border: `1px solid ${C.borderSoft}`,
                              }}>
                                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: C.text, opacity: 0.5, marginBottom: 4 }}>Assignee</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {assignee?.avatar ? (
                                    <img src={assignee.avatar} alt="av" style={{ width: 22, height: 22, borderRadius: 8, border: `1px solid ${C.borderSoft}`, objectFit: "cover" }} />
                                  ) : (
                                    <div style={{ width: 22, height: 22, borderRadius: 8, border: `1px solid ${C.borderSoft}`, backgroundColor: C.surface2 }} />
                                  )}
                                  <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{assignee?.name || "Unassigned"}</span>
                                </div>
                              </div>

                              <div style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                                border: `1px solid ${C.borderSoft}`,
                              }}>
                                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: C.text, opacity: 0.5, marginBottom: 4 }}>Est. Time</div>
                                <span style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{formatTime(Number(task.estimatedHours || 0))}</span>
                              </div>

                              <div style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                                border: `1px solid ${C.borderSoft}`,
                              }}>
                                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: C.text, opacity: 0.5, marginBottom: 4 }}>Due Date</div>
                                <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{task.dueDate || "Not set"}</span>
                              </div>

                              <div style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                                border: `1px solid ${C.borderSoft}`,
                              }}>
                                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: C.text, opacity: 0.5, marginBottom: 4 }}>Status</div>
                                <span style={{
                                  padding: "3px 8px", borderRadius: 8, backgroundColor: bg, color: fg,
                                  fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase",
                                }}>{String(task.status || "").replaceAll("_", " ")}</span>
                              </div>
                            </div>

                            {/* Time entry actions for task */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); openLogTime(task.id, null); }}
                                style={{
                                  padding: "7px 12px", borderRadius: 10,
                                  border: `1px solid ${C.borderSoft}`,
                                  backgroundColor: mode === "dark" ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.10)",
                                  color: mode === "dark" ? "#4ade80" : "#16a34a",
                                  fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", cursor: "pointer",
                                }}
                              >
                                + Log Time
                              </button>
                              {timerRunning?.taskId === task.id ? (
                                <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setStopTimerOpen(true); }}
                                  disabled={timerLoading}
                                  style={{
                                    padding: "7px 12px", borderRadius: 10,
                                    border: `1px solid ${C.borderSoft}`,
                                    backgroundColor: mode === "dark" ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.10)",
                                    color: mode === "dark" ? "#f87171" : "#dc2626",
                                    fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", cursor: "pointer",
                                  }}
                                >
                                  Stop Timer
                                </button>
                                {timerElapsed && (
                                  <span style={{
                                    padding: "7px 12px", borderRadius: 10,
                                    backgroundColor: mode === "dark" ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.06)",
                                    color: mode === "dark" ? "#f87171" : "#dc2626",
                                    fontSize: 12, fontWeight: 900, fontFamily: "monospace",
                                  }}>{timerElapsed}</span>
                                )}
                                </>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStartTimer(task.id, null); }}
                                  disabled={timerLoading || !!timerRunning}
                                  style={{
                                    padding: "7px 12px", borderRadius: 10,
                                    border: `1px solid ${C.borderSoft}`,
                                    backgroundColor: mode === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.10)",
                                    color: mode === "dark" ? "#60a5fa" : "#2563eb",
                                    fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase",
                                    cursor: timerRunning ? "not-allowed" : "pointer", opacity: timerRunning ? 0.5 : 1,
                                  }}
                                >
                                  Start Timer
                                </button>
                              )}
                            </div>

                            {/* Inline Log Time form for this task */}
                            {logTimeTarget?.taskId === task.id && !logTimeTarget?.subTaskId && (
                              <div style={{
                                padding: 12, borderRadius: 12,
                                border: `1px solid ${C.borderSoft}`,
                                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
                                display: "flex", flexDirection: "column", gap: 8,
                              }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                  <input type="date" value={logTimeForm.date}
                                    onChange={e => setLogTimeForm(f => ({ ...f, date: e.target.value }))}
                                    style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 12, colorScheme: mode === "dark" ? "dark" : "light" }}
                                  />
                                  <input type="time" value={logTimeForm.startTime} placeholder="Start"
                                    onChange={e => setLogTimeForm(f => ({ ...f, startTime: e.target.value }))}
                                    style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 12, colorScheme: mode === "dark" ? "dark" : "light" }}
                                  />
                                  <input type="time" value={logTimeForm.endTime} placeholder="End"
                                    onChange={e => setLogTimeForm(f => ({ ...f, endTime: e.target.value }))}
                                    style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 12, colorScheme: mode === "dark" ? "dark" : "light" }}
                                  />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                                  <input type="text" placeholder="Note (required)" value={logTimeForm.note} maxLength={700}
                                    onChange={e => setLogTimeForm(f => ({ ...f, note: e.target.value }))}
                                    style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 12 }}
                                  />
                                  <select value={logTimeForm.type}
                                    onChange={e => setLogTimeForm(f => ({ ...f, type: e.target.value }))}
                                    style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 12, colorScheme: mode === "dark" ? "dark" : "light" }}
                                  >
                                    <option value="Non-Billable">Non-Billable</option>
                                    <option value="Billable">Billable</option>
                                  </select>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <button onClick={handleLogTimeSubmit} disabled={logTimeLoading}
                                    style={{
                                      padding: "7px 14px", borderRadius: 10, border: "none",
                                      backgroundColor: mode === "dark" ? "#16a34a" : "#22c55e", color: "#fff",
                                      fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", cursor: "pointer",
                                    }}
                                  >{logTimeLoading ? "Saving..." : "Save"}</button>
                                  <button onClick={closeLogTime}
                                    style={{
                                      padding: "7px 14px", borderRadius: 10, border: `1px solid ${C.borderSoft}`,
                                      backgroundColor: C.surface, color: C.text,
                                      fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", cursor: "pointer",
                                    }}
                                  >Cancel</button>
                                  {logTimeMsg && <span style={{ fontSize: 11, fontWeight: 700, color: logTimeMsg.includes("added") ? "#16a34a" : "#dc2626" }}>{logTimeMsg}</span>}
                                </div>
                              </div>
                            )}

                            {/* Sub-tasks section */}
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: C.text, opacity: 0.6 }}>
                                  Sub-tasks {Array.isArray(task.subTasks) && task.subTasks.length > 0 ? `(${task.subTasks.length})` : ""}
                                </div>
                                {!isEmployee && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openSubTaskCreate(task); }}
                                    style={{
                                      padding: "6px 10px",
                                      borderRadius: 10,
                                      border: `1px solid ${C.borderSoft}`,
                                      backgroundColor: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
                                      color: C.text,
                                      fontSize: 10,
                                      fontWeight: 900,
                                      letterSpacing: "0.12em",
                                      textTransform: "uppercase",
                                      cursor: "pointer",
                                    }}
                                  >
                                    + Add
                                  </button>
                                )}
                              </div>

                              {Array.isArray(task.subTasks) && task.subTasks.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  {task.subTasks.map((st) => {
                                    const stBg = statusColor(st.status);
                                    const stFg = textForBg(stBg);
                                    const stAssignee = users.find((u) => u.id === st.assigneeId);

                                    return (
                                      <div
                                        key={st.id}
                                        style={{
                                          borderRadius: 14,
                                          border: `1.5px solid ${mode === "dark" ? "rgba(251,146,60,0.35)" : "rgba(234,88,12,0.20)"}`,
                                          borderLeft: `4px solid ${mode === "dark" ? "#FB923C" : "#EA580C"}`,
                                          backgroundColor: mode === "dark" ? "rgba(251,146,60,0.12)" : "rgba(255,237,213,0.75)",
                                          boxShadow: mode === "dark"
                                            ? "0 2px 10px rgba(251,146,60,0.12), inset 0 1px 0 rgba(251,146,60,0.06)"
                                            : "0 2px 6px rgba(234,88,12,0.06), inset 0 1px 0 rgba(255,237,213,0.5)",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {/* Subtask header row */}
                                        <div style={{ padding: "10px 12px 10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                            <span style={{ fontSize: 10, fontWeight: 900, color: "#FFFFFF", backgroundColor: "#9B5DE0", padding: "2px 7px", borderRadius: 7, whiteSpace: "nowrap", flexShrink: 0 }}>{st.displayId}</span>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.title}</span>
                                          </div>
                                          <span style={{
                                            padding: "4px 7px", borderRadius: 8, backgroundColor: stBg, color: stFg,
                                            fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
                                          }}>{String(st.status || "").replaceAll("_", " ")}</span>
                                        </div>

                                        {/* Subtask detail row */}
                                        <div style={{
                                          padding: "8px 12px 10px 14px",
                                          borderTop: `1px solid ${mode === "dark" ? "rgba(251,146,60,0.18)" : "rgba(234,88,12,0.10)"}`,
                                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                                        }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            {stAssignee?.avatar ? (
                                              <img src={stAssignee.avatar} alt="av" style={{ width: 20, height: 20, borderRadius: 8, border: `1px solid ${C.borderSoft}`, objectFit: "cover" }} />
                                            ) : (
                                              <div style={{ width: 20, height: 20, borderRadius: 8, border: `1px solid ${C.borderSoft}`, backgroundColor: C.surface }} />
                                            )}
                                            <span style={{ fontSize: 11, fontWeight: 800, color: C.text, opacity: 0.7 }}>{stAssignee?.name || "Unassigned"}</span>
                                          </div>
                                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                            <span style={{ fontSize: 10, fontWeight: 800, color: C.text, opacity: 0.6 }}>{formatTime(Number(st.estimatedHours || 0))}</span>
                                            {st.dueDate && <span style={{ fontSize: 10, fontWeight: 800, color: C.text, opacity: 0.6 }}>{st.dueDate}</span>}
                                            <button
                                              onClick={(e) => { e.stopPropagation(); openLogTime(task.id, st.id); }}
                                              style={{
                                                padding: "4px 8px", borderRadius: 7,
                                                border: `1px solid ${C.borderSoft}`,
                                                backgroundColor: mode === "dark" ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.08)",
                                                color: mode === "dark" ? "#4ade80" : "#16a34a",
                                                fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                                              }}
                                            >Log Time</button>
                                          </div>
                                        </div>

                                        {/* Inline Log Time form for this subtask */}
                                        {logTimeTarget?.taskId === task.id && logTimeTarget?.subTaskId === st.id && (
                                          <div style={{
                                            padding: 10, borderTop: `1px solid ${mode === "dark" ? "rgba(251,146,60,0.12)" : "rgba(234,88,12,0.06)"}`,
                                            display: "flex", flexDirection: "column", gap: 6,
                                          }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                                              <input type="date" value={logTimeForm.date}
                                                onChange={e => setLogTimeForm(f => ({ ...f, date: e.target.value }))}
                                                style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 11, colorScheme: mode === "dark" ? "dark" : "light" }}
                                              />
                                              <input type="time" value={logTimeForm.startTime}
                                                onChange={e => setLogTimeForm(f => ({ ...f, startTime: e.target.value }))}
                                                style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 11, colorScheme: mode === "dark" ? "dark" : "light" }}
                                              />
                                              <input type="time" value={logTimeForm.endTime}
                                                onChange={e => setLogTimeForm(f => ({ ...f, endTime: e.target.value }))}
                                                style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 11, colorScheme: mode === "dark" ? "dark" : "light" }}
                                              />
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}>
                                              <input type="text" placeholder="Note" value={logTimeForm.note} maxLength={700}
                                                onChange={e => setLogTimeForm(f => ({ ...f, note: e.target.value }))}
                                                style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 11 }}
                                              />
                                              <select value={logTimeForm.type}
                                                onChange={e => setLogTimeForm(f => ({ ...f, type: e.target.value }))}
                                                style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 11, colorScheme: mode === "dark" ? "dark" : "light" }}
                                              >
                                                <option value="Non-Billable">Non-Billable</option>
                                                <option value="Billable">Billable</option>
                                              </select>
                                            </div>
                                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                              <button onClick={handleLogTimeSubmit} disabled={logTimeLoading}
                                                style={{
                                                  padding: "5px 10px", borderRadius: 7, border: "none",
                                                  backgroundColor: mode === "dark" ? "#16a34a" : "#22c55e", color: "#fff",
                                                  fontSize: 9, fontWeight: 900, cursor: "pointer",
                                                }}
                                              >{logTimeLoading ? "..." : "Save"}</button>
                                              <button onClick={closeLogTime}
                                                style={{
                                                  padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.borderSoft}`,
                                                  backgroundColor: C.surface, color: C.text,
                                                  fontSize: 9, fontWeight: 900, cursor: "pointer",
                                                }}
                                              >Cancel</button>
                                              {logTimeMsg && <span style={{ fontSize: 10, fontWeight: 700, color: logTimeMsg.includes("added") ? "#16a34a" : "#dc2626" }}>{logTimeMsg}</span>}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div style={{
                                  padding: 12, borderRadius: 12, border: `1px dashed ${C.borderSoft}`,
                                  backgroundColor: mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
                                  textAlign: "center", fontSize: 11, fontWeight: 800, color: C.text, opacity: 0.5,
                                }}>
                                  No sub-tasks yet
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(!selectedStory.tasks || selectedStory.tasks.length === 0) && (
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        border: `1px dashed ${C.border}`,
                        backgroundColor: C.surface,
                        color: C.text,
                        textAlign: "center",
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                    >
                      No tasks yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={footer}>
              <button onClick={() => setSelectedIssueId(null)} style={btn("secondary")}>
                Dismiss
              </button>
              <button onClick={() => updateStoryStatus(selectedStory.id, TaskStatus.DONE)} style={btn("primary")}>
                Verify &amp; Close
              </button>
            </div>
          </>
        ) : (
          <div style={{ height: "100%", display: "grid", placeItems: "center", padding: 24 }}>
            <div
              style={{
                width: "100%",
                maxWidth: 360,
                padding: 18,
                borderRadius: 22,
                border: `1px dashed ${C.border}`,
                backgroundColor: C.surface,
                textAlign: "center",
                color: C.text,
              }}
            >
              <div style={{ fontSize: 38, marginBottom: 10 }}>📄</div>
              <div style={{ fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                No Story Selected
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ✅ Task Creation Modal */}
      <TaskCreationModal
        open={taskCreateOpen}
        onClose={closeTaskCreate}
        users={users}
        TaskStatus={TaskStatus}
        story={selectedStory}
        onSubmit={(payload) => {
          if (!selectedStory?.id) return;

          if (typeof addTaskToStory === "function") {
            addTaskToStory(selectedStory.id, payload);
            closeTaskCreate();
            return;
          }

          // fallback if needed
          if (typeof handleOpenCreate === "function") {
            handleOpenCreate("TASK", selectedStory.id);
            closeTaskCreate();
          }
        }}
      />

      {/* Stop Timer Dialog */}
      {stopTimerOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "grid", placeItems: "center",
        }} onClick={() => setStopTimerOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 360, padding: 24, borderRadius: 18,
            backgroundColor: C.surface, border: `1px solid ${C.border}`,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>Stop Timer</div>
              {timerElapsed && <span style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", color: mode === "dark" ? "#f87171" : "#dc2626" }}>{timerElapsed}</span>}
            </div>
            <input type="text" placeholder="Note (required)" value={stopNote}
              onChange={e => setStopNote(e.target.value)} maxLength={700}
              style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 13 }}
            />
            <select value={stopType} onChange={e => setStopType(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: 13, colorScheme: mode === "dark" ? "dark" : "light" }}
            >
              <option value="Non-Billable">Non-Billable</option>
              <option value="Billable">Billable</option>
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={async () => { await handleStopTimer(stopNote, stopType); setStopTimerOpen(false); setStopNote(""); }}
                disabled={!stopNote || timerLoading}
                style={{
                  flex: 1, padding: "10px", borderRadius: 12, border: "none",
                  backgroundColor: "#dc2626", color: "#fff",
                  fontSize: 11, fontWeight: 900, cursor: stopNote ? "pointer" : "not-allowed", opacity: stopNote ? 1 : 0.5,
                }}
              >{timerLoading ? "Stopping..." : "Stop & Save"}</button>
              <button onClick={() => setStopTimerOpen(false)}
                style={{
                  padding: "10px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
                  backgroundColor: C.surface, color: C.text,
                  fontSize: 11, fontWeight: 900, cursor: "pointer",
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Sub-task Creation Modal */}
      <SubTaskCreationModal
        open={subTaskCreateOpen}
        onClose={closeSubTaskCreate}
        users={users}
        TaskStatus={TaskStatus}
        story={selectedStory}
        task={activeTaskForSubtask}
        onSubmit={(payload) => {
          if (!selectedStory?.id || !activeTaskForSubtask?.id) return;
          if (typeof addSubTaskToTask !== "function") return;

          addSubTaskToTask(selectedStory.id, activeTaskForSubtask.id, payload);
          closeSubTaskCreate();
        }}
      />
    </>
  );
};

export default React.memo(IssueDetailDrawer);
