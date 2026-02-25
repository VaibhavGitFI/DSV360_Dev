// ../components/sprints/WorkspaceContent.jsx
import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import TimelineModule from "./TimelineModule";

const getUI = (theme) => {
  const isDark = theme?.palette?.mode === "dark";
  return {
    isDark,
    fontFamily: theme?.typography?.fontFamily,
    C: {
      base: theme?.palette?.background?.default || (isDark ? "#121212" : "#fafafa"),
      surface: theme?.palette?.background?.paper || (isDark ? "#1d1d1d" : "#ffffff"),
      surface2: isDark ? "#191919" : "#FCF8F8",
      border: theme?.palette?.divider || (isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"),
      borderSoft: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
      text: isDark ? "#FFFFFF" : "#000000",
      muted: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.65)",
      surface0: "rgba(255,255,255,0)",
      accentA: isDark ? "#E3651D" : "#9CAB84",
      danger: isDark ? "#750E21" : "#FD7979",
      combo: { todo: "#4E56C0", prog: "#9B5DE0", rev: "#D78FEE", qa: "#FDCFFA" },
    },
  };
};

const WorkspaceContent = ({
  activeTab,
  columns,
  sprintStories,
  backlogStories,
  epics,
  sprints,
  users,
  selectedIssueId,
  setSelectedIssueId,
  getPriorityConfig,
  assignStoryToSprint,
  updateStoryStatus,
  handleOpenCreate,
  activeSprint,
  TaskStatus,
  isEmployee,
}) => {
  const theme = useTheme();
  const { C, fontFamily } = getUI(theme);

  const columnColor = (status) => {
    if (status === TaskStatus.TODO || status === TaskStatus.NOT_STARTED) return C.combo.todo;
    if (status === TaskStatus.IN_PROGRESS || status === TaskStatus.WIP) return C.combo.prog;
    if (status === TaskStatus.CODE_REVIEW || status === TaskStatus.UNDER_INTERNAL_TESTING) return C.combo.rev;
    if (status === TaskStatus.QA || status === TaskStatus.RELEASED_FOR_UAT) return C.combo.qa;
    if (status === TaskStatus.BLOCKED || status === TaskStatus.PENDING_FROM_ZOHO || status === TaskStatus.PENDING_FROM_CLIENT) return C.danger;
    if (status === TaskStatus.DONE || status === TaskStatus.UAT_APPROVED_BY_CLIENT || status === TaskStatus.CLOSED) return C.accentA;
    return C.combo.todo;
  };

  // Drag & drop state
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const boardScrollRef = useRef(null);
  const autoScrollRAF = useRef(null);
  const isDragging = useRef(false);

  const SCROLL_ZONE = 120;
  const SCROLL_SPEED = 18;

  const handleAutoScroll = useCallback((e) => {
    const container = boardScrollRef.current;
    if (!container || !isDragging.current) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX;

    cancelAnimationFrame(autoScrollRAF.current);

    const distFromLeft = x - rect.left;
    const distFromRight = rect.right - x;

    if (distFromLeft < SCROLL_ZONE) {
      const intensity = 1 - distFromLeft / SCROLL_ZONE;
      const step = () => {
        if (!isDragging.current) return;
        container.scrollLeft -= SCROLL_SPEED * intensity;
        autoScrollRAF.current = requestAnimationFrame(step);
      };
      autoScrollRAF.current = requestAnimationFrame(step);
    } else if (distFromRight < SCROLL_ZONE) {
      const intensity = 1 - distFromRight / SCROLL_ZONE;
      const step = () => {
        if (!isDragging.current) return;
        container.scrollLeft += SCROLL_SPEED * intensity;
        autoScrollRAF.current = requestAnimationFrame(step);
      };
      autoScrollRAF.current = requestAnimationFrame(step);
    }
  }, []);

  const handleDragStart = (e, storyId, currentStatus) => {
    e.dataTransfer.setData("storyId", storyId);
    e.dataTransfer.setData("fromStatus", currentStatus);
    e.dataTransfer.effectAllowed = "move";
    isDragging.current = true;
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const stopAutoScroll = useCallback(() => {
    isDragging.current = false;
    cancelAnimationFrame(autoScrollRAF.current);
  }, []);

  const handleDragEnd = useCallback(() => {
    stopAutoScroll();
    setDragOverStatus(null);
  }, [stopAutoScroll]);

  useEffect(() => {
    return () => cancelAnimationFrame(autoScrollRAF.current);
  }, []);

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    stopAutoScroll();
    setDragOverStatus(null);
    const storyId = e.dataTransfer.getData("storyId");
    const fromStatus = e.dataTransfer.getData("fromStatus");
    if (storyId && fromStatus !== targetStatus && typeof updateStoryStatus === "function") {
      updateStoryStatus(storyId, targetStatus);
    }
  };

  // Keep layout identical: board/backlog/timeline/capacity
  const shellStyle = useMemo(
    () => ({
      backgroundColor: C.base,
      color: C.text,
      fontFamily,
    }),
    [C.base, C.text, fontFamily]
  );

  return (
    <main
      ref={boardScrollRef}
      className={`flex-1 overflow-y-auto flex flex-col custom-scrollbar ${
        activeTab === "board" || activeTab === "timeline" ? "overflow-x-auto" : ""
      }`}
      style={shellStyle}
      onDragOver={activeTab === "board" ? handleAutoScroll : undefined}
    >
      {/* =========================
          BOARD
      ========================= */}
      {activeTab === "board" ? (
        <div className="p-6 flex gap-6 h-full min-w-max">
          {columns.map((col) => {
            const items = sprintStories.filter((s) => s.status === col.status);
            const accent = columnColor(col.status);

            return (
              <div
                key={col.status}
                className="w-80 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden border"
                style={{
                  borderColor: dragOverStatus === col.status ? columnColor(col.status) : C.border,
                  backgroundColor: C.surface,
                  transition: "border-color 200ms",
                  boxShadow: dragOverStatus === col.status ? `0 0 0 2px ${columnColor(col.status)}40` : "none",
                }}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                <div style={{ height: 6, backgroundColor: accent }} />

                <div className="px-4 py-4 border-b" style={{ borderColor: C.border, backgroundColor: C.base }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[12px] font-black uppercase tracking-[0.22em]" style={{ color: C.text }}>
                        {col.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-lg text-[11px] font-black border"
                        style={{ borderColor: C.borderSoft, backgroundColor: C.surface0, color: C.text }}
                      >
                        {items.length}
                      </span>
                    </div>

                    {!isEmployee && (
                      <button
                        onClick={() => handleOpenCreate("STORY", undefined, col.status)}
                        className="w-8 h-8 rounded-lg font-black text-lg flex items-center justify-center border"
                        style={{ borderColor: C.borderSoft, backgroundColor: accent, color: "#FFFFFF" }}
                        title="Create in this column"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-20">
                    {items.map((story) => {
                      const assignee = users.find((u) => u.id === story.assigneeId);
                      const prio = getPriorityConfig(story.priority);
                      const isSelected = selectedIssueId === story.id;

                      return (
                        <div
                          key={story.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, story.id, col.status)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedIssueId(story.id)}
                          className="p-3.5 rounded-xl border transition-all cursor-grab flex flex-col gap-3"
                          style={{ backgroundColor: C.base, borderColor: isSelected ? accent : C.borderSoft }}
                        >
                          <h4 className="text-[14px] font-semibold line-clamp-2 leading-relaxed" style={{ color: C.text }}>
                            {story.title}
                          </h4>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className="px-2 py-0.5 rounded-lg text-[9px] font-black border"
                                style={{ backgroundColor: accent, borderColor: C.borderSoft, color: "#FFFFFF" }}
                              >
                                {prio.icon}
                              </div>
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md" style={{ color: "#FFFFFF", backgroundColor: C.accentA }}>
                                {story.displayId}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                className="px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                                style={{ backgroundColor: C.surface0, borderColor: C.borderSoft, color: C.text }}
                              >
                                {story.points}
                              </div>

                              {assignee?.avatar ? (
                                <img
                                  src={assignee.avatar}
                                  className="w-7 h-7 rounded-full"
                                  style={{ border: `2px solid ${accent}` }}
                                  alt={assignee.name}
                                  title={assignee.name}
                                />
                              ) : (
                                <div
                                  className="w-7 h-7 rounded-full"
                                  style={{ border: `2px solid ${accent}`, backgroundColor: C.surface2 }}
                                  title={assignee?.name || "Unassigned"}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {items.length === 0 && (
                      <div
                        className="py-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center"
                        style={{ borderColor: C.border, opacity: 0.8 }}
                      >
                        <span className="text-2xl mb-2">🧊</span>
                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: C.muted }}>
                          Empty
                        </p>
                        {sprintStories.length === 0 && col.status === columns[0]?.status && (
                          <p className="text-[11px] font-bold mt-2" style={{ color: C.muted, opacity: 0.7 }}>
                            Create a story or move one from the backlog
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : /* =========================
            BACKLOG
          ========================= */
      activeTab === "backlog" ? (
        <div className="flex-1 flex flex-col h-full bg-transparent">
          <div
            className="px-8 py-6 flex-shrink-0 flex justify-between items-center border-b"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <div>
              <h2 className="text-[22px] font-bold tracking-tight" style={{ color: C.text }}>
                Product Backlog
              </h2>
              <p className="text-[13px] mt-1" style={{ color: C.muted }}>
                Strategic scope pool awaiting cycle operationalization.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase" style={{ color: C.muted }}>
                Pool Size:
              </span>
              <div
                className="px-3 py-1 rounded-lg text-[13px] font-bold border"
                style={{ backgroundColor: C.base, borderColor: C.borderSoft, color: C.text }}
              >
                {backlogStories.length}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-1 custom-scrollbar pb-20">
            {backlogStories.map((story) => {
              const epic = epics.find((e) => e.id === story.epicId);

              return (
                <div
                  key={story.id}
                  className="group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer"
                  style={{ borderColor: C.borderSoft, backgroundColor: C.surface }}
                  onClick={() => setSelectedIssueId(story.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border text-xs"
                      style={{ backgroundColor: C.base, borderColor: C.borderSoft, color: C.text }}
                    >
                      📌
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md" style={{ color: "#FFFFFF", backgroundColor: C.accentA }}>
                          {story.displayId}
                        </span>

                        {epic && (
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border"
                            style={{ backgroundColor: C.base, borderColor: C.borderSoft, color: C.text }}
                          >
                            {epic.title}
                          </span>
                        )}

                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border"
                          style={{ backgroundColor: C.surface0, borderColor: C.borderSoft, color: C.text }}
                        >
                          {story.status}
                        </span>
                      </div>

                      <h4 className="text-[15px] font-semibold truncate" style={{ color: C.text }}>
                        {story.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className="px-2 py-0.5 rounded text-[11px] font-bold border"
                      style={{ backgroundColor: C.base, borderColor: C.borderSoft, color: C.text }}
                    >
                      {story.points} SP
                    </div>

                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        assignStoryToSprint(story.id, e.target.value);
                        if (e.target.value && story.status === TaskStatus.BACKLOG) updateStoryStatus(story.id, TaskStatus.NOT_STARTED);
                      }}
                      className="rounded-lg px-3 py-2 text-[11px] font-bold uppercase outline-none border cursor-pointer"
                      style={{ backgroundColor: C.base, borderColor: C.borderSoft, color: C.text }}
                    >
                      <option value="">Deploy to Cycle...</option>
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : /* =========================
            TIMELINE (NEW)
          ========================= */
      activeTab === "timeline" ? (
        <TimelineModule
          activeSprint={activeSprint}
          stories={sprintStories}
          users={users}
          TaskStatus={TaskStatus}
          selectedIssueId={selectedIssueId}
          setSelectedIssueId={setSelectedIssueId}
        />
      ) : null}
    </main>
  );
};

export default React.memo(WorkspaceContent);
