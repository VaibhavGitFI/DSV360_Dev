import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { useAppState, TaskStatus, Priority, IssueType } from "../context/AppStateContext";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";

import Toolbar from "../components/sprints/Toolbar";
import Navigator from "../components/sprints/Navigator";
import WorkspaceContent from "../components/sprints/WorkspaceContent";
import IssueDetailDrawer from "../components/sprints/IssueDetailDrawer";
import IssueConstructionModal from "../components/sprints/IssueConstructionModal";
import SprintPlanningModal from "../components/sprints/SprintPlanningModal";

const Sprints = () => {
  const theme = useTheme();
  const isDark = theme?.palette?.mode === "dark";
  const tw = (light, dark) => (isDark ? dark : light);
  const dispatch = useDispatch();

  /* ── Data from context (API-backed) ── */
  const {
    milestones,
    epics,
    sprints,
    stories,
    selectedProjectId,
    setSelectedProjectId,
    loading,
    error,
    setError,
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
  } = useAppState();

  /* ── Projects from Redux ── */
  const { data: projects, isLoading: projectsLoading } = useSelector((state) => state.projectReducer);
  const projectsFetched = useRef(false);

  useEffect(() => {
    if (!projectsFetched.current && !projects?.length && !projectsLoading) {
      projectsFetched.current = true;
      dispatch(fetchProjects());
    }
  }, [dispatch, projects, projectsLoading]);

  /* ── Users from Redux ── */
  const { data: employeesData, isLoading: employeesLoading } = useSelector((state) => state.employeeReducer);
  const employeesFetched = useRef(false);

  useEffect(() => {
    if (!employeesFetched.current && !employeesData?.length && !employeesLoading) {
      employeesFetched.current = true;
      dispatch(fetchEmployees());
    }
  }, [dispatch, employeesData, employeesLoading]);

  const users = useMemo(() => {
    if (!employeesData?.length) return [];
    return employeesData.map((emp) => ({
      id: emp.user_id || "",
      name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Unknown",
      avatar: emp.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.first_name || "U")}&background=random`,
    }));
  }, [employeesData]);

  /* ── UI state (local only) ── */
  const [activeTab, setActiveTab] = useState("board");
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [currentSprintId, setCurrentSprintId] = useState(() => {
    try {
      const saved = localStorage.getItem("dsv_sprintByProject");
      if (saved) {
        const map = JSON.parse(saved);
        const projId = localStorage.getItem("sprintSelectedProjectId") || "";
        return map[projId] || "";
      }
    } catch {}
    return "";
  });

  const [createType, setCreateType] = useState(IssueType.STORY);
  const [createData, setCreateData] = useState({
    title: "",
    description: "",
    priority: Priority.MEDIUM,
    points: 3,
    epicId: "",
    milestoneId: "",
    parentId: "",
    dueDate: "",
    color: "#243859",
    assigneeId: "",
    sprintId: "",
    status: TaskStatus.NOT_STARTED,
    groupName: "",
    requirementType: "",
    billingType: "",
    primaryOwnership: "",
    secondaryOwnership: "",
    fiRemarks: "",
    clientRemarks: "",
    zohoProductName: "",
    moduleName: "",
  });

  const [sprintData, setSprintData] = useState({ name: "", goal: "", startDate: "", endDate: "" });

  // Custom project dropdown state
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const dropdownRef = useRef(null);

  const handleClickOutside = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setProjectDropdownOpen(false);
      setProjectSearch("");
    }
  }, []);

  useEffect(() => {
    if (projectDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [projectDropdownOpen, handleClickOutside]);

  const filteredProjects = useMemo(() => {
    if (!projects?.length) return [];
    if (!projectSearch.trim()) return projects;
    const q = projectSearch.toLowerCase();
    return projects.filter((p) => (p.Project_Name || "").toLowerCase().includes(q));
  }, [projects, projectSearch]);

  const selectedProjectName = useMemo(() => {
    if (!selectedProjectId || !projects?.length) return "";
    const p = projects.find((p) => p.ROWID === selectedProjectId);
    return p?.Project_Name || "";
  }, [selectedProjectId, projects]);

  // Auto-expand first milestone/epic when data loads
  const hasAutoExpanded = useRef(false);
  useEffect(() => {
    if (milestones.length > 0 && !hasAutoExpanded.current) {
      hasAutoExpanded.current = true;
      const initial = new Set();
      milestones.forEach((m) => initial.add(m.id));
      epics.forEach((e) => initial.add(e.id));
      setExpandedNodes(initial);
    }
  }, [milestones, epics]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist selected sprint to localStorage (per project)
  useEffect(() => {
    try {
      if (currentSprintId && selectedProjectId) {
        const saved = localStorage.getItem("dsv_sprintByProject");
        const map = saved ? JSON.parse(saved) : {};
        map[selectedProjectId] = currentSprintId;
        localStorage.setItem("dsv_sprintByProject", JSON.stringify(map));
      }
    } catch {}
  }, [currentSprintId, selectedProjectId]);

  // Auto-select active sprint (only if no saved/valid sprint)
  useEffect(() => {
    if (sprints.length === 0) return;
    // If current sprint is set and exists in the loaded sprints, keep it
    if (currentSprintId && sprints.some((s) => s.id === currentSprintId)) return;
    // Otherwise pick active or first
    const active = sprints.find((s) => s.status === "ACTIVE");
    setCurrentSprintId(active?.id || sprints[0].id);
  }, [sprints, currentSprintId]);

  // Reset UI when project changes — restore saved sprint for new project
  useEffect(() => {
    setSelectedIssueId(null);
    try {
      const saved = localStorage.getItem("dsv_sprintByProject");
      const map = saved ? JSON.parse(saved) : {};
      setCurrentSprintId(map[selectedProjectId] || "");
    } catch {
      setCurrentSprintId("");
    }
    setExpandedNodes(new Set());
    hasAutoExpanded.current = false;
  }, [selectedProjectId]);

  const activeSprint = useMemo(
    () => sprints.find((s) => s.id === currentSprintId) || sprints[0],
    [sprints, currentSprintId]
  );

  const sprintStories = useMemo(
    () => stories.filter((s) => s.sprintId === activeSprint?.id),
    [stories, activeSprint]
  );

  const backlogStories = useMemo(
    () => stories.filter((s) => !s.sprintId || s.sprintId === ""),
    [stories]
  );

  const selectedStory = useMemo(() => stories.find((s) => s.id === selectedIssueId), [stories, selectedIssueId]);

  const columns = useMemo(
    () => [
      { status: TaskStatus.NOT_STARTED, title: "Not Started", color: tw("bg-slate-50/50", "bg-slate-900/40"), border: tw("border-slate-200/50", "border-slate-800/60") },
      { status: TaskStatus.WIP, title: "WIP", color: tw("bg-blue-50/30", "bg-blue-950/20"), border: tw("border-blue-200/30", "border-blue-900/40") },
      { status: TaskStatus.UNDER_INTERNAL_TESTING, title: "Internal Testing", color: tw("bg-amber-50/30", "bg-amber-950/15"), border: tw("border-amber-200/30", "border-amber-900/35") },
      { status: TaskStatus.PENDING_FROM_ZOHO, title: "Pending Zoho", color: tw("bg-orange-50/30", "bg-orange-950/15"), border: tw("border-orange-200/30", "border-orange-900/35") },
      { status: TaskStatus.PENDING_FROM_CLIENT, title: "Pending Client", color: tw("bg-rose-50/30", "bg-rose-950/15"), border: tw("border-rose-200/30", "border-rose-900/35") },
      { status: TaskStatus.RELEASED_FOR_UAT, title: "Released For UAT", color: tw("bg-purple-50/30", "bg-purple-950/15"), border: tw("border-purple-200/30", "border-purple-900/35") },
      { status: TaskStatus.UAT_APPROVED_BY_CLIENT, title: "UAT Approved", color: tw("bg-teal-50/30", "bg-teal-950/15"), border: tw("border-teal-200/30", "border-teal-900/35") },
      { status: TaskStatus.CLOSED, title: "Closed", color: tw("bg-emerald-50/30", "bg-emerald-950/15"), border: tw("border-emerald-200/30", "border-emerald-900/35") },
    ],
    [isDark] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleNode = useCallback((id) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getPriorityConfig = useCallback((p) => {
    switch (p) {
      case Priority.CRITICAL:
        return { icon: "↑↑", color: tw("text-red-600", "text-red-300"), bg: tw("bg-red-50", "bg-red-950/30"), border: tw("border-red-100", "border-red-900/50") };
      case Priority.HIGH:
        return { icon: "↑", color: tw("text-orange-600", "text-orange-300"), bg: tw("bg-orange-50", "bg-orange-950/25"), border: tw("border-orange-100", "border-orange-900/50") };
      case Priority.MEDIUM:
        return { icon: "=", color: tw("text-blue-600", "text-blue-300"), bg: tw("bg-blue-50", "bg-blue-950/25"), border: tw("border-blue-100", "border-blue-900/50") };
      default:
        return { icon: "↓", color: tw("text-slate-400", "text-slate-400"), bg: tw("bg-slate-50", "bg-slate-900/30"), border: tw("border-slate-100", "border-slate-800/60") };
    }
  }, [isDark]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Create flow */
  const epicsRef = useRef(epics);
  epicsRef.current = epics;
  const milestonesRef = useRef(milestones);
  milestonesRef.current = milestones;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const currentSprintIdRef = useRef(currentSprintId);
  currentSprintIdRef.current = currentSprintId;

  const handleOpenCreate = useCallback((type, parentId, forcedStatus) => {
    setCreateType(type);
    setCreateData({
      title: "",
      description: "",
      priority: Priority.MEDIUM,
      points: 3,
      epicId: type === IssueType.STORY ? parentId || epicsRef.current[0]?.id || "" : "",
      milestoneId: type === IssueType.EPIC ? parentId || milestonesRef.current[0]?.id || "" : "",
      parentId: "",
      dueDate: "",
      color: "#243859",
      assigneeId: "",
      sprintId: type === IssueType.STORY && activeTabRef.current === "board" ? currentSprintIdRef.current : "",
      status: forcedStatus || (activeTabRef.current === "board" ? TaskStatus.NOT_STARTED : TaskStatus.BACKLOG),
      groupName: "",
      requirementType: "",
      billingType: "",
      primaryOwnership: "",
      secondaryOwnership: "",
      fiRemarks: "",
      clientRemarks: "",
      zohoProductName: "",
      moduleName: "",
    });
    setIsCreateModalOpen(true);
  }, []);

  const handleOpenCreateStory = useCallback(() => {
    handleOpenCreate(IssueType.STORY);
  }, [handleOpenCreate]);

  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
  const closeSprintModal = useCallback(() => setIsSprintModalOpen(false), []);

  const createTypeRef = useRef(createType);
  createTypeRef.current = createType;
  const createDataRef = useRef(createData);
  createDataRef.current = createData;

  const handleCreateSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const ct = createTypeRef.current;
    const cd = createDataRef.current;
    if (!cd.title) return;

    if (ct === IssueType.MILESTONE) {
      const newId = await addMilestone({ title: cd.title, description: cd.description, dueDate: cd.dueDate });
      if (newId) setExpandedNodes((prev) => new Set(prev).add(newId));
    } else if (ct === IssueType.EPIC) {
      const newId = await addEpic({
        title: cd.title,
        description: cd.description,
        color: cd.color,
        milestoneId: cd.milestoneId || milestonesRef.current[0]?.id || "",
      });
      if (newId) setExpandedNodes((prev) => new Set(prev).add(cd.milestoneId).add(newId));
    } else if (ct === IssueType.STORY) {
      await addStory({
        title: cd.title,
        description: cd.description,
        points: cd.points,
        priority: cd.priority,
        status: cd.status,
        epicId: cd.epicId || epicsRef.current[0]?.id || "",
        sprintId: cd.sprintId || "",
        assigneeId: cd.assigneeId || "",
        groupName: cd.groupName || "",
        requirementType: cd.requirementType || "",
        billingType: cd.billingType || "",
        primaryOwnership: cd.primaryOwnership || "",
        secondaryOwnership: cd.secondaryOwnership || "",
        fiRemarks: cd.fiRemarks || "",
        clientRemarks: cd.clientRemarks || "",
        zohoProductName: cd.zohoProductName || "",
        moduleName: cd.moduleName || "",
      });
    }

    setIsCreateModalOpen(false);
  }, [addMilestone, addEpic, addStory]);

  const sprintDataRef = useRef(sprintData);
  sprintDataRef.current = sprintData;

  const handleSprintSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const sd = sprintDataRef.current;
    if (!sd.name) return;

    const newId = await addSprint({ ...sd });
    if (newId) setCurrentSprintId(newId);
    setIsSprintModalOpen(false);
    setSprintData({ name: "", goal: "", startDate: "", endDate: "" });
  }, [addSprint]);

  /* ── Export sprint data to Excel ── */
  const handleExport = useCallback(() => {
    if (!activeSprint) return;

    const getUserName = (id) => {
      const u = users.find((u) => u.id === id);
      return u ? u.name : "";
    };

    const sprintName = activeSprint.name || "Sprint";

    // Sheet 1: Sprint Summary
    const summaryData = [
      { Field: "Sprint Name", Value: activeSprint.name },
      { Field: "Goal", Value: activeSprint.goal },
      { Field: "Start Date", Value: activeSprint.startDate },
      { Field: "End Date", Value: activeSprint.endDate },
      { Field: "Status", Value: activeSprint.status },
      { Field: "Total Stories", Value: sprintStories.length },
      { Field: "Total Story Points", Value: sprintStories.reduce((sum, s) => sum + (s.points || 0), 0) },
      { Field: "Done Stories", Value: sprintStories.filter((s) => s.status === "DONE").length },
      { Field: "Total Tasks", Value: sprintStories.reduce((sum, s) => sum + (s.tasks || []).length, 0) },
      { Field: "Total SubTasks", Value: sprintStories.reduce((sum, s) => sum + (s.tasks || []).reduce((ts, t) => ts + (t.subTasks || []).length, 0), 0) },
    ];

    // Sheet 2: Stories
    const storiesData = sprintStories.map((s) => {
      const epic = epics.find((e) => e.id === s.epicId);
      return {
        "Story ID": s.displayId,
        Title: s.title,
        Description: s.description,
        Epic: epic?.title || "",
        Priority: s.priority,
        Status: s.status,
        "Story Points": s.points,
        "Estimated Hours": s.estimatedHours,
        Assignee: getUserName(s.assigneeId),
        "Group Name": s.groupName || "",
        "Requirement Type": s.requirementType || "",
        "Billing Type": s.billingType || "",
        "Primary Ownership": getUserName(s.primaryOwnership),
        "Secondary Ownership": getUserName(s.secondaryOwnership),
        "FI Remarks": s.fiRemarks || "",
        "Client Remarks": s.clientRemarks || "",
        "Zoho Product": s.zohoProductName || "",
        "Module Name": s.moduleName || "",
        "Tasks Count": (s.tasks || []).length,
      };
    });

    // Sheet 3: Tasks (flat list with story reference)
    const tasksData = [];
    sprintStories.forEach((s) => {
      (s.tasks || []).forEach((t) => {
        tasksData.push({
          "Task ID": t.displayId,
          Title: t.title,
          "Parent Story": s.title,
          "Story ID": s.displayId,
          Status: t.status,
          "Estimated Hours": t.estimatedHours,
          Assignee: getUserName(t.assigneeId),
          "Due Date": t.dueDate,
          "SubTasks Count": (t.subTasks || []).length,
        });
      });
    });

    // Sheet 4: SubTasks (flat list with task + story reference)
    const subTasksData = [];
    sprintStories.forEach((s) => {
      (s.tasks || []).forEach((t) => {
        (t.subTasks || []).forEach((st) => {
          subTasksData.push({
            "SubTask ID": st.displayId,
            Title: st.title,
            "Parent Task": t.title,
            "Parent Story": s.title,
            Status: st.status,
            "Estimated Hours": st.estimatedHours,
            Assignee: getUserName(st.assigneeId),
            "Due Date": st.dueDate,
          });
        });
      });
    });

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    ws1["!cols"] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Sprint Summary");

    const ws2 = XLSX.utils.json_to_sheet(storiesData.length ? storiesData : [{ "No stories in this sprint": "" }]);
    ws2["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 40 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Stories");

    const ws3 = XLSX.utils.json_to_sheet(tasksData.length ? tasksData : [{ "No tasks in this sprint": "" }]);
    ws3["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Tasks");

    const ws4 = XLSX.utils.json_to_sheet(subTasksData.length ? subTasksData : [{ "No subtasks in this sprint": "" }]);
    ws4["!cols"] = [{ wch: 14 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws4, "SubTasks");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const safeName = sprintName.replace(/[^a-zA-Z0-9_-]/g, "_");
    saveAs(blob, `${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [activeSprint, sprintStories, epics, users]);

  const pageStyle = useMemo(
    () => ({
      backgroundColor: theme?.palette?.background?.default,
      color: theme?.palette?.text?.primary,
    }),
    [theme]
  );

  const shellStyle = useMemo(
    () => ({
      backgroundColor: theme?.palette?.background?.paper,
      borderColor: theme?.palette?.divider,
    }),
    [theme]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={pageStyle}>
      {/* Project Selector */}
      <div
        style={{
          padding: "10px 24px",
          borderBottom: `1px solid ${theme?.palette?.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          backgroundColor: theme?.palette?.background?.paper,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: theme?.palette?.text?.secondary,
          }}
        >
          Project
        </span>
        <div ref={dropdownRef} style={{ position: "relative", minWidth: 240 }}>
          <button
            onClick={() => { setProjectDropdownOpen((v) => !v); setProjectSearch(""); }}
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: 12,
              border: `1px solid ${theme?.palette?.divider}`,
              backgroundColor: theme?.palette?.background?.default,
              color: theme?.palette?.text?.primary,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              outline: "none",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedProjectName || "Select a project..."}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: projectDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {projectDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                backgroundColor: theme?.palette?.background?.paper,
                border: `1px solid ${theme?.palette?.divider}`,
                borderRadius: 14,
                boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.6)" : "0 16px 48px rgba(0,0,0,0.14)",
                zIndex: 100,
                maxHeight: 280,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {(projects || []).length > 5 && (
                <div style={{ padding: "8px 10px", borderBottom: `1px solid ${theme?.palette?.divider}` }}>
                  <input
                    autoFocus
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects..."
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${theme?.palette?.divider}`,
                      backgroundColor: theme?.palette?.background?.default,
                      color: theme?.palette?.text?.primary,
                      fontSize: 12,
                      fontWeight: 600,
                      outline: "none",
                    }}
                  />
                </div>
              )}
              <div style={{ overflowY: "auto", maxHeight: 230 }}>
                <div
                  onClick={() => { setSelectedProjectId(""); setProjectDropdownOpen(false); setProjectSearch(""); }}
                  style={{
                    padding: "9px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: theme?.palette?.text?.secondary,
                    cursor: "pointer",
                    backgroundColor: !selectedProjectId ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent",
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
                  }}
                  onMouseEnter={(e) => { if (selectedProjectId) e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}
                  onMouseLeave={(e) => { if (selectedProjectId) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  Select a project...
                </div>
                {filteredProjects.map((p) => (
                  <div
                    key={p.ROWID}
                    onClick={() => { setSelectedProjectId(p.ROWID); setProjectDropdownOpen(false); setProjectSearch(""); }}
                    style={{
                      padding: "9px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme?.palette?.text?.primary,
                      cursor: "pointer",
                      backgroundColor: selectedProjectId === p.ROWID ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => { if (selectedProjectId !== p.ROWID) e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}
                    onMouseLeave={(e) => { if (selectedProjectId !== p.ROWID) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {selectedProjectId === p.ROWID && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    )}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.Project_Name}</span>
                  </div>
                ))}
                {filteredProjects.length === 0 && projectSearch && (
                  <div style={{ padding: "12px 14px", fontSize: 12, fontWeight: 600, color: theme?.palette?.text?.secondary, textAlign: "center" }}>
                    No projects match "{projectSearch}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {(loading || projectsLoading) && <CircularProgress size={18} />}
      </div>

      {/* Error banner */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!selectedProjectId && !loading && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme?.palette?.text?.secondary,
            fontSize: 15,
          }}
        >
          Select a project to view sprints
        </div>
      )}

      {/* Loading state */}
      {selectedProjectId && loading && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      )}

      {/* Sprint content */}
      {selectedProjectId && !loading && (
        <div className="flex flex-col flex-1 overflow-hidden" style={{ ...shellStyle, borderWidth: 0 }}>
          <Toolbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsSprintModalOpen={setIsSprintModalOpen}
            currentSprintId={currentSprintId}
            setCurrentSprintId={setCurrentSprintId}
            sprints={sprints}
            onCreateIssue={handleOpenCreateStory}
            onExport={handleExport}
            theme={theme}
            isDark={isDark}
          />

          <div className="flex flex-1 overflow-hidden">
            <Navigator
              milestones={milestones}
              epics={epics}
              stories={stories}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              selectedIssueId={selectedIssueId}
              setSelectedIssueId={setSelectedIssueId}
              handleOpenCreate={handleOpenCreate}
              theme={theme}
              isDark={isDark}
            />

            <WorkspaceContent
              activeTab={activeTab}
              columns={columns}
              sprintStories={sprintStories}
              backlogStories={backlogStories}
              epics={epics}
              sprints={sprints}
              users={users}
              selectedIssueId={selectedIssueId}
              setSelectedIssueId={setSelectedIssueId}
              getPriorityConfig={getPriorityConfig}
              assignStoryToSprint={assignStoryToSprint}
              updateStoryStatus={updateStoryStatus}
              handleOpenCreate={handleOpenCreate}
              activeSprint={activeSprint}
              TaskStatus={TaskStatus}
              theme={theme}
              isDark={isDark}
            />

            <IssueDetailDrawer
              selectedIssueId={selectedIssueId}
              selectedStory={selectedStory}
              setSelectedIssueId={setSelectedIssueId}
              users={users}
              sprints={sprints}
              updateStoryStatus={updateStoryStatus}
              updateStoryAssignment={updateStoryAssignment}
              assignStoryToSprint={assignStoryToSprint}
              handleOpenCreate={handleOpenCreate}
              TaskStatus={TaskStatus}
              theme={theme}
              isDark={isDark}
              addTaskToStory={addTaskToStory}
              addSubTaskToTask={addSubTaskToTask}
              updateStoryMeta={updateStoryMeta}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
            />
          </div>

          <IssueConstructionModal
            open={isCreateModalOpen}
            onClose={closeCreateModal}
            createType={createType}
            createData={createData}
            setCreateData={setCreateData}
            handleCreateSubmit={handleCreateSubmit}
            epics={epics}
            sprints={sprints}
            milestones={milestones}
            users={users}
            Priority={Priority}
            TaskStatus={TaskStatus}
            theme={theme}
            isDark={isDark}
          />

          <SprintPlanningModal
            open={isSprintModalOpen}
            onClose={closeSprintModal}
            sprintData={sprintData}
            setSprintData={setSprintData}
            onSubmit={handleSprintSubmit}
            theme={theme}
            isDark={isDark}
          />
        </div>
      )}
    </div>
  );
};

export default Sprints;
