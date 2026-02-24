// IssueConstructionModal.jsx
import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@mui/material/styles";
import DateInput from "./DateInput";

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
      overlay: isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.55)",
      primary: isDark ? "#E3651D" : "#9CAB84",
      hintA: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
      hintB: "rgba(255,255,255,0)",
    },
  };
};

const IssueConstructionModal = ({
  open,
  onClose,
  createType,
  createData,
  setCreateData,
  handleCreateSubmit,
  epics = [],
  sprints = [],
  milestones = [],
  Priority,
  TaskStatus,
  users = [],
}) => {
  const theme = useTheme();
  const { isDark, C, fontFamily } = getUI(theme);

  const meta = useMemo(() => {
    const map = {
      STORY: { titleText: "Create story", submitText: "Create story", typeBadge: "Story" },
      EPIC: { titleText: "Create epic", submitText: "Create epic", typeBadge: "Epic" },
      TASK: { titleText: "Create task", submitText: "Create task", typeBadge: "Task" },
      SUBTASK: { titleText: "Create sub-task", submitText: "Create sub-task", typeBadge: "Sub-task" },
      MILESTONE: { titleText: "Create release", submitText: "Create release", typeBadge: "Release" },
    };
    return map[createType] || { titleText: "Create", submitText: "Create", typeBadge: "Issue" };
  }, [createType]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const labelStyle = {
    fontFamily,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: C.text,
    marginBottom: 8,
  };

  const inputBase = {
    fontFamily,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    backgroundColor: C.surface2,
    color: C.text,
    outline: "none",
    fontWeight: 600,
    fontSize: 13,
  };

  const selectBase = {
    ...inputBase,
    paddingRight: 40,
    appearance: "none",
    cursor: "pointer",
  };

  const arrow = {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: C.muted,
  };

  const smallBadge = (bg) => ({
    fontFamily,
    padding: "6px 10px",
    borderRadius: 12,
    border: `1px solid ${C.borderSoft}`,
    backgroundColor: bg,
    color: C.text,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  });

  const btn = (variant) => {
    const primary = variant === "primary";
    return {
      fontFamily,
      flex: primary ? 2 : 1,
      padding: "12px 14px",
      borderRadius: 16,
      border: `1px solid ${primary ? "transparent" : C.border}`,
      backgroundColor: primary ? C.primary : C.surface,
      color: primary ? (isDark ? "#FFFFFF" : "#000000") : C.text,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      cursor: "pointer",
    };
  };

  const showAssignee = Array.isArray(users) && users.length > 0 && (createType === "STORY" || createType === "TASK");

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: C.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily,
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          boxShadow: isDark ? "0 28px 90px rgba(0,0,0,0.70)" : "0 28px 90px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 18px",
            backgroundColor: C.surface2,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  fontFamily,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: C.text,
                  whiteSpace: "nowrap",
                }}
              >
                {meta.titleText}
              </div>
              <span style={smallBadge(isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)")}>{meta.typeBadge}</span>
            </div>

            <div style={{ fontFamily, fontSize: 12, fontWeight: 600, color: C.muted }}>
              Fill in the details below.
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              border: `1px solid ${C.borderSoft}`,
              backgroundColor: C.surface,
              color: C.text,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleCreateSubmit}
          style={{
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxHeight: "72vh",
            overflowY: "auto",
          }}
        >
          {/* Summary */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={labelStyle}>Summary</div>
            <input
              required
              autoFocus
              value={createData.title || ""}
              onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
              placeholder="What needs to be done?"
              style={inputBase}
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={labelStyle}>Description</div>
            <textarea
              value={createData.description || ""}
              onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
              placeholder="Add details…"
              style={{
                ...inputBase,
                minHeight: 120,
                resize: "none",
                borderRadius: 16,
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            />
          </div>

          {/* STORY */}
          {createType === "STORY" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={labelStyle}>Story points</div>
                  <input
                    type="number"
                    value={createData.points || ""}
                    onChange={(e) => setCreateData({ ...createData, points: e.target.value })}
                    style={inputBase}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={labelStyle}>Priority</div>
                  <div style={{ position: "relative" }}>
                    <select
                      value={createData.priority || ""}
                      onChange={(e) => setCreateData({ ...createData, priority: e.target.value })}
                      style={selectBase}
                    >
                      {Priority ? (
                        Object.values(Priority).map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                        </>
                      )}
                    </select>
                    <div style={arrow}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={labelStyle}>Epic</div>
                  <div style={{ position: "relative" }}>
                    <select
                      value={createData.epicId || ""}
                      onChange={(e) => setCreateData({ ...createData, epicId: e.target.value })}
                      style={selectBase}
                    >
                      {epics.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                    <div style={arrow}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={labelStyle}>Sprint</div>
                  <div style={{ position: "relative" }}>
                    <select
                      value={createData.sprintId || ""}
                      onChange={(e) => setCreateData({ ...createData, sprintId: e.target.value })}
                      style={selectBase}
                    >
                      <option value="">Backlog</option>
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div style={arrow}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {showAssignee && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={labelStyle}>Assignee</div>
                  <div style={{ position: "relative" }}>
                    <select
                      value={createData.assigneeId || ""}
                      onChange={(e) => setCreateData({ ...createData, assigneeId: e.target.value })}
                      style={selectBase}
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <div style={arrow}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={labelStyle}>Status</div>
                <div style={{ position: "relative" }}>
                  <select
                    value={createData.status || ""}
                    onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                    style={selectBase}
                  >
                    {TaskStatus ? (
                      Object.values(TaskStatus).map((s) => (
                        <option key={s} value={s}>
                          {String(s).split("_").join(" ")}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </>
                    )}
                  </select>
                  <div style={arrow}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* EPIC */}
          {createType === "EPIC" && (
            <>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={labelStyle}>Epic color</div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    backgroundColor: C.surface2,
                  }}
                >
                  {[
                    { name: "Dark Gray", hex: "#243859" },
                    { name: "Dark Yellow", hex: "#FA9920" },
                    { name: "Yellow", hex: "#FAC304" },
                    { name: "Dark Blue", hex: "#2A53CC" },
                    { name: "Dark Teal", hex: "#2AA3BF" },
                    { name: "Green", hex: "#58D8A4" },
                    { name: "Purple", hex: "#8677D9" },
                    { name: "Dark Purple", hex: "#5244AA" },
                    { name: "Orange", hex: "#FA7353" },
                    { name: "Blue", hex: "#3884FF" },
                    { name: "Teal", hex: "#34C7E6" },
                    { name: "Gray", hex: "#6B778C" },
                    { name: "Dark Green", hex: "#128759" },
                    { name: "Dark Orange", hex: "#DD350D" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => setCreateData({ ...createData, color: c.hex })}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: c.hex,
                        border: (createData.color || "#243859") === c.hex
                          ? `3px solid ${isDark ? "#FFFFFF" : "#000000"}`
                          : "3px solid transparent",
                        cursor: "pointer",
                        outline: "none",
                        transition: "transform 0.1s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={labelStyle}>Release</div>
                <div style={{ position: "relative" }}>
                  <select
                    value={createData.milestoneId || ""}
                    onChange={(e) => setCreateData({ ...createData, milestoneId: e.target.value })}
                    style={selectBase}
                  >
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                  <div style={arrow}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* RELEASE (MILESTONE) */}
          {createType === "MILESTONE" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={labelStyle}>Release date</div>
              <DateInput
                isDark={isDark}
                value={createData.dueDate || ""}
                onChange={(e) => setCreateData({ ...createData, dueDate: e.target.value })}
                style={{ ...inputBase, fontSize: 12, fontWeight: 800 }}
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ padding: 18, borderTop: `1px solid ${C.border}`, display: "flex", gap: 12, backgroundColor: C.surface }}>
          <button type="button" onClick={onClose} style={btn("secondary")}>
            Cancel
          </button>
          <button type="button" onClick={handleCreateSubmit} style={btn("primary")}>
            {meta.submitText}
          </button>
        </div>

        <div aria-hidden="true" style={{ height: 8, backgroundColor: C.hintA }} />
      </div>
    </div>,
    document.body
  );
};

export default IssueConstructionModal;
