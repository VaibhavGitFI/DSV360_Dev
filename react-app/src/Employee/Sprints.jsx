import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { useAppState, TaskStatus, Priority } from "../context/AppStateContext";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";

import Toolbar from "../components/sprints/Toolbar";
import Navigator from "../components/sprints/Navigator";
import WorkspaceContent from "../components/sprints/WorkspaceContent";
import IssueDetailDrawer from "../components/sprints/IssueDetailDrawer";

const EmpSprints = () => {
  const theme = useTheme();
  const isDark = theme?.palette?.mode === "dark";
  const dispatch = useDispatch();

  // Current user
  const currUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("currUser")) || {}; } catch { return {}; }
  }, []);
  const userId = currUser?.userid;

  /* -- Data from context (API-backed) -- */
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
    assignStoryToSprint,
  } = useAppState();

  /* -- Projects from Redux -- */
  const { data: projects, isLoading: projectsLoading } = useSelector((state) => state.projectReducer);
  const projectsFetched = useRef(false);

  useEffect(() => {
    if (!projectsFetched.current && !projects?.length && !projectsLoading) {
      projectsFetched.current = true;
      dispatch(fetchProjects());
    }
  }, [dispatch, projects, projectsLoading]);

  /* -- Users from Redux -- */
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

  /* -- Filter stories to only those assigned to current user -- */
  const myStories = useMemo(() => {
    if (!userId) return [];
    return stories.filter((s) =>
      s.assigneeId === userId ||
      (s.tasks || []).some((t) =>
        t.assigneeId === userId ||
        (t.subTasks || []).some((st) => st.assigneeId === userId)
      )
    );
  }, [stories, userId]);

  /* -- UI state (local only) -- */
  const [activeTab, setActiveTab] = useState("board");
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
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
  }, [milestones, epics]);

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

  // Auto-select active sprint
  useEffect(() => {
    if (sprints.length === 0) return;
    if (currentSprintId && sprints.some((s) => s.id === currentSprintId)) return;
    const active = sprints.find((s) => s.status === "ACTIVE");
    setCurrentSprintId(active?.id || sprints[0].id);
  }, [sprints, currentSprintId]);

  // Reset UI when project changes
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
    () => myStories.filter((s) => s.sprintId === activeSprint?.id),
    [myStories, activeSprint]
  );

  const backlogStories = useMemo(
    () => myStories.filter((s) => !s.sprintId || s.sprintId === ""),
    [myStories]
  );

  const selectedStory = useMemo(() => myStories.find((s) => s.id === selectedIssueId), [myStories, selectedIssueId]);

  const tw = (light, dark) => (isDark ? dark : light);

  const columns = useMemo(
    () => [
      { status: TaskStatus.TODO, title: "To Do", color: tw("bg-slate-50/50", "bg-slate-900/40"), border: tw("border-slate-200/50", "border-slate-800/60") },
      { status: TaskStatus.IN_PROGRESS, title: "In Progress", color: tw("bg-blue-50/30", "bg-blue-950/20"), border: tw("border-blue-200/30", "border-blue-900/40") },
      { status: TaskStatus.CODE_REVIEW, title: "Review", color: tw("bg-amber-50/30", "bg-amber-950/15"), border: tw("border-amber-200/30", "border-amber-900/35") },
      { status: TaskStatus.QA, title: "QA", color: tw("bg-purple-50/30", "bg-purple-950/15"), border: tw("border-purple-200/30", "border-purple-900/35") },
      { status: TaskStatus.BLOCKED, title: "Blocked", color: tw("bg-red-50/30", "bg-red-950/15"), border: tw("border-red-200/30", "border-red-900/35") },
      { status: TaskStatus.DONE, title: "Done", color: tw("bg-emerald-50/30", "bg-emerald-950/15"), border: tw("border-emerald-200/30", "border-emerald-900/35") },
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
        return { icon: "\u2191\u2191", color: tw("text-red-600", "text-red-300"), bg: tw("bg-red-50", "bg-red-950/30"), border: tw("border-red-100", "border-red-900/50") };
      case Priority.HIGH:
        return { icon: "\u2191", color: tw("text-orange-600", "text-orange-300"), bg: tw("bg-orange-50", "bg-orange-950/25"), border: tw("border-orange-100", "border-orange-900/50") };
      case Priority.MEDIUM:
        return { icon: "=", color: tw("text-blue-600", "text-blue-300"), bg: tw("bg-blue-50", "bg-blue-950/25"), border: tw("border-blue-100", "border-blue-900/50") };
      default:
        return { icon: "\u2193", color: tw("text-slate-400", "text-slate-400"), bg: tw("bg-slate-50", "bg-slate-900/30"), border: tw("border-slate-100", "border-slate-800/60") };
    }
  }, [isDark]); // eslint-disable-line react-hooks/exhaustive-deps

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
          Select a project to view your assigned work
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
            currentSprintId={currentSprintId}
            setCurrentSprintId={setCurrentSprintId}
            sprints={sprints}
            theme={theme}
            isDark={isDark}
            isEmployee
          />

          <div className="flex flex-1 overflow-hidden">
            <Navigator
              milestones={milestones}
              epics={epics}
              stories={myStories}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              selectedIssueId={selectedIssueId}
              setSelectedIssueId={setSelectedIssueId}
              handleOpenCreate={() => {}}
              theme={theme}
              isDark={isDark}
              isEmployee
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
              handleOpenCreate={() => {}}
              activeSprint={activeSprint}
              TaskStatus={TaskStatus}
              theme={theme}
              isDark={isDark}
              isEmployee
            />

            <IssueDetailDrawer
              selectedIssueId={selectedIssueId}
              selectedStory={selectedStory}
              setSelectedIssueId={setSelectedIssueId}
              users={users}
              sprints={sprints}
              updateStoryStatus={updateStoryStatus}
              assignStoryToSprint={assignStoryToSprint}
              handleOpenCreate={() => {}}
              TaskStatus={TaskStatus}
              theme={theme}
              isDark={isDark}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
              isEmployee
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpSprints;
