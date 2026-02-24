// ../components/sprints/TimelineModule.jsx
import React, { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";

/**
 * Timeline / Gantt-like module
 * - Horizontal scrolling ✅
 * - Uses selected sprint dates from Toolbar dropdown (pass activeSprint) ✅
 * - Keeps your existing design language (MUI theme + your palette patterns) ✅
 *
 * Expected props:
 *  - activeSprint: { id, name, startDate, endDate }
 *  - stories: array (ideally sprintStories only)
 *  - users: [{id,name,avatar}]
 *  - TaskStatus: enum object
 *  - selectedIssueId, setSelectedIssueId (optional) to open drawer on click
 */
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

const pad2 = (n) => String(n).padStart(2, "0");

const formatTime = (decimalHours) => {
  const h = Math.floor(decimalHours || 0);
  const m = Math.round(((decimalHours || 0) - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const toDateOnly = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  // normalize to midnight local for consistent day diffs
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
};

const addDays = (d, days) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

const diffDays = (a, b) => {
  // a - b in days
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((a.getTime() - b.getTime()) / ms);
};

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

const monthLabel = (date) =>
  date.toLocaleString(undefined, { month: "short", year: "numeric" });

const TimelineModule = ({
  activeSprint,
  stories = [],
  users = [],
  TaskStatus,
  selectedIssueId,
  setSelectedIssueId,
}) => {
  const theme = useTheme();
  const { C, isDark, fontFamily } = getUI(theme);

  const [expanded, setExpanded] = useState(() => new Set()); // expands story rows to show tasks

  const toggleExpand = (storyId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  };

  const { start, end } = useMemo(() => {
    // Use sprint dates; fallback to a 14-day window if missing
    const s = toDateOnly(activeSprint?.startDate) || toDateOnly(new Date());
    const e = toDateOnly(activeSprint?.endDate) || addDays(s, 13);
    // ensure start <= end
    return s.getTime() <= e.getTime() ? { start: s, end: e } : { start: e, end: s };
  }, [activeSprint?.startDate, activeSprint?.endDate]);

  const days = useMemo(() => {
    const total = diffDays(end, start);
    const arr = [];
    for (let i = 0; i <= total; i++) arr.push(addDays(start, i));
    return arr;
  }, [start, end]);

  // pixels per day (controls horizontal scale)
  const pxPerDay = 38;
  const gridWidth = Math.max(days.length * pxPerDay, 720);

  const statusColor = (st) => {
    if (!TaskStatus) return C.combo.todo;
    switch (st) {
      case TaskStatus.TODO:
        return C.combo.todo;
      case TaskStatus.IN_PROGRESS:
        return C.combo.prog;
      case TaskStatus.CODE_REVIEW:
        return C.combo.rev;
      case TaskStatus.QA:
        return C.combo.qa;
      case TaskStatus.BLOCKED:
        return C.danger;
      case TaskStatus.DONE:
        return C.accentA;
      default:
        return C.combo.todo;
    }
  };

  const textForBg = (hex) => {
    const c = String(hex || "").replace("#", "");
    if (c.length !== 6) return isDark ? "#FFFFFF" : "#000000";
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 160 ? "#000000" : "#FFFFFF";
  };

  const today = useMemo(() => toDateOnly(new Date()), []);
  const todayX = useMemo(() => {
    if (!today) return null;
    const x = diffDays(today, start) * pxPerDay;
    if (x < 0 || x > gridWidth) return null;
    return x;
  }, [today, start, pxPerDay, gridWidth]);

  // If items don't have date fields, we still render a "placement bar" near the start of sprint
  const computeBar = (item, indexHint = 0) => {
    // Accepts optional: item.startDate / item.endDate / item.dueDate
    const s = toDateOnly(item?.startDate);
    const e = toDateOnly(item?.endDate);
    const d = toDateOnly(item?.dueDate);

    let barStart = s || null;
    let barEnd = e || null;

    if (!barStart && d) barStart = addDays(d, -1);
    if (!barEnd && d) barEnd = d;

    // If still missing, distribute a little so bars don't overlap perfectly
    if (!barStart) barStart = addDays(start, clamp(indexHint, 0, Math.max(0, days.length - 2)));
    if (!barEnd) barEnd = addDays(barStart, 1);

    // Clamp to sprint range
    if (barStart.getTime() < start.getTime()) barStart = start;
    if (barEnd.getTime() > end.getTime()) barEnd = end;
    if (barEnd.getTime() < barStart.getTime()) barEnd = barStart;

    const leftDays = clamp(diffDays(barStart, start), 0, days.length - 1);
    const rightDays = clamp(diffDays(barEnd, start), 0, days.length - 1);
    const left = leftDays * pxPerDay;
    const width = Math.max((rightDays - leftDays + 1) * pxPerDay - 10, 22);

    return { left, width, from: barStart, to: barEnd };
  };

  const rows = useMemo(() => {
    // Build rows with optional task nesting
    const out = [];
    stories.forEach((s, idx) => {
      out.push({ kind: "story", item: s, depth: 0, idx });
      if (expanded.has(s.id) && Array.isArray(s.tasks)) {
        s.tasks.forEach((t, tIdx) => {
          out.push({ kind: "task", item: t, parent: s, depth: 1, idx: idx + tIdx + 1 });
          if (expanded.has(`${s.id}:${t.id}`) && Array.isArray(t.subTasks)) {
            t.subTasks.forEach((st, stIdx) => {
              out.push({ kind: "subtask", item: st, parent: s, task: t, depth: 2, idx: idx + tIdx + stIdx + 2 });
            });
          }
        });
      }
    });
    return out;
  }, [stories, expanded]);

  const shell = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: C.base,
    color: C.text,
    fontFamily,
  };

  const header = {
    padding: "16px 18px",
    backgroundColor: C.surface,
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexShrink: 0,
  };

  const title = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  };

  const titleTop = {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: C.text,
  };

  const titleBottom = {
    fontSize: 13,
    fontWeight: 800,
    color: C.text,
    opacity: 0.85,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const rangePill = {
    padding: "8px 10px",
    borderRadius: 14,
    border: `1px solid ${C.borderSoft}`,
    backgroundColor: C.surface2,
    color: C.text,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
  };

  // horizontal scroll area
  const scroller = {
    flex: 1,
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
  };

  // sticky left column width
  const leftW = 340;

  const gridWrap = {
    minWidth: leftW + gridWidth,
    width: leftW + gridWidth,
  };

  const gridHeaderRow = {
    display: "flex",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: C.surface,
    borderBottom: `1px solid ${C.border}`,
  };

  const leftHeaderCell = {
    width: leftW,
    flexShrink: 0,
    padding: "12px 12px",
    borderRight: `1px solid ${C.border}`,
    backgroundColor: C.surface,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    position: "sticky",
    left: 0,
    zIndex: 12,
  };

  const rightHeaderCell = {
    width: gridWidth,
    position: "relative",
    backgroundColor: C.surface,
  };

  const monthRow = {
    display: "flex",
    height: 34,
    borderBottom: `1px solid ${C.borderSoft}`,
  };

  const dayRow = {
    display: "flex",
    height: 34,
  };

  const dayCell = {
    width: pxPerDay,
    flexShrink: 0,
    borderRight: `1px solid ${C.borderSoft}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 900,
    color: C.text,
    opacity: 0.75,
  };

  const bodyRow = {
    display: "flex",
    borderBottom: `1px solid ${C.borderSoft}`,
    backgroundColor: C.base,
  };

  const leftCell = (depth, selected) => ({
    width: leftW,
    flexShrink: 0,
    padding: "10px 12px",
    borderRight: `1px solid ${C.border}`,
    backgroundColor: selected ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : C.surface,
    position: "sticky",
    left: 0,
    zIndex: 9,
    display: "flex",
    alignItems: "center",
    gap: 10,
  });

  const indent = (depth) => ({ width: depth * 14, flexShrink: 0 });

  const rightCell = {
    width: gridWidth,
    position: "relative",
    backgroundColor: C.base,
  };

  const gridLine = (x) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: x,
    width: 1,
    backgroundColor: C.borderSoft,
    pointerEvents: "none",
  });

  const todayLine = (x) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: x,
    width: 2,
    backgroundColor: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
    pointerEvents: "none",
  });

  const barStyle = (bg) => ({
    position: "absolute",
    height: 28,
    top: 10,
    borderRadius: 12,
    backgroundColor: bg,
    color: textForBg(bg),
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 10px",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.02em",
    boxShadow: isDark ? "0 10px 24px rgba(0,0,0,0.45)" : "0 10px 24px rgba(0,0,0,0.12)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"}`,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  });

  const miniPill = (bg) => ({
    padding: "6px 8px",
    borderRadius: 12,
    backgroundColor: bg,
    color: textForBg(bg),
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    flexShrink: 0,
  });

  // Build month segments for the month header row
  const monthSegments = useMemo(() => {
    if (days.length === 0) return [];
    const segments = [];
    let i = 0;
    while (i < days.length) {
      const cur = days[i];
      const m = cur.getMonth();
      const y = cur.getFullYear();
      let j = i;
      while (j < days.length && days[j].getMonth() === m && days[j].getFullYear() === y) j++;
      segments.push({
        label: monthLabel(cur),
        startIndex: i,
        count: j - i,
      });
      i = j;
    }
    return segments;
  }, [days]);

  const emptyState = stories.length === 0;

  return (
    <section style={shell}>
      <div style={header}>
        <div style={title}>
          <div style={titleTop}>Timeline</div>
          <div style={titleBottom}>
            {activeSprint?.name ? `${activeSprint.name} — Gantt view` : "Gantt view"}
          </div>
        </div>

        <div style={rangePill}>
          {start.getFullYear()}-{pad2(start.getMonth() + 1)}-{pad2(start.getDate())} →{" "}
          {end.getFullYear()}-{pad2(end.getMonth() + 1)}-{pad2(end.getDate())}
        </div>
      </div>

      <div style={scroller} className="custom-scrollbar">
        <div style={gridWrap}>
          {/* Header grid */}
          <div style={gridHeaderRow}>
            <div style={leftHeaderCell}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Tasks
              </div>
              <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.7 }}>
                {emptyState ? "0 items" : `${stories.length} stories`}
              </div>
            </div>

            <div style={rightHeaderCell}>
              <div style={monthRow}>
                {monthSegments.map((seg) => (
                  <div
                    key={`${seg.label}-${seg.startIndex}`}
                    style={{
                      width: seg.count * pxPerDay,
                      flexShrink: 0,
                      borderRight: `1px solid ${C.borderSoft}`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 10,
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: C.text,
                      opacity: 0.8,
                    }}
                  >
                    {seg.label}
                  </div>
                ))}
              </div>

              <div style={dayRow}>
                {days.map((d, idx) => (
                  <div key={idx} style={dayCell} title={d.toDateString()}>
                    {d.getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body */}
          {emptyState ? (
            <div style={{ padding: 24, backgroundColor: C.base }}>
              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: `1px dashed ${C.border}`,
                  backgroundColor: C.surface,
                  textAlign: "center",
                  fontWeight: 900,
                  color: C.text,
                }}
              >
                No sprint items to show in Timeline.
              </div>
            </div>
          ) : (
            rows.map((r, idx) => {
              const isStory = r.kind === "story";
              const isTask = r.kind === "task";
              const isSubTask = r.kind === "subtask";

              const story = isStory ? r.item : r.parent;
              const selected = selectedIssueId && story?.id && selectedIssueId === story.id;

              const assigneeId = r.item?.assigneeId || "";
              const assignee = users.find((u) => u.id === assigneeId);

              const titleText = isStory
                ? `${r.item.displayId || r.item.id} — ${r.item.title}`
                : isTask
                ? `${r.item.displayId || r.item.id} — ${r.item.title}`
                : `${r.item.displayId || r.item.id || "ST"} — ${r.item.title}`;

              const st = r.item.status;
              const bg = statusColor(st);

              const bar = computeBar(
                r.item,
                // indexHint to spread bars slightly when missing dates
                (idx % Math.max(1, days.length - 1))
              );

              const canExpandStory = isStory && Array.isArray(r.item.tasks) && r.item.tasks.length > 0;
              const canExpandTask = isTask && Array.isArray(r.item.subTasks) && r.item.subTasks.length > 0;

              return (
                <div key={`${r.kind}-${r.item.id}-${idx}`} style={bodyRow}>
                  <div style={leftCell(r.depth, selected)}>
                    <div style={indent(r.depth)} />

                    {(canExpandStory || canExpandTask) ? (
                      <button
                        onClick={() => {
                          if (canExpandStory) toggleExpand(r.item.id);
                          else if (canExpandTask) toggleExpand(`${r.parent.id}:${r.item.id}`);
                        }}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 12,
                          border: `1px solid ${C.borderSoft}`,
                          backgroundColor: C.surface,
                          color: C.text,
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                        title={canExpandStory ? "Expand story tasks" : "Expand sub-tasks"}
                      >
                        {(canExpandStory && expanded.has(r.item.id)) ||
                        (canExpandTask && expanded.has(`${r.parent.id}:${r.item.id}`))
                          ? "–"
                          : "+"}
                      </button>
                    ) : (
                      <div style={{ width: 28, height: 28 }} />
                    )}

                    <button
                      onClick={() => {
                        // open drawer for story on click
                        if (isStory && typeof setSelectedIssueId === "function") setSelectedIssueId(r.item.id);
                        if (!isStory && typeof setSelectedIssueId === "function") setSelectedIssueId(story?.id || null);
                      }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: 0,
                        color: C.text,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span style={miniPill(bg)}>{r.kind}</span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={titleText}
                        >
                          {titleText}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, opacity: 0.9 }}>
                        {isStory ? `${r.item.points || 0} SP` : formatTime(Number(r.item.estimatedHours || 0))}
                      </div>
                    </button>

                    {/* assignee avatar */}
                    {assignee?.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 12,
                          border: `1px solid ${C.borderSoft}`,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                        title={assignee.name}
                      />
                    ) : (
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 12,
                          border: `1px solid ${C.borderSoft}`,
                          backgroundColor: C.surface2,
                          flexShrink: 0,
                        }}
                        title="Unassigned"
                      />
                    )}
                  </div>

                  <div style={rightCell}>
                    {/* vertical grid lines */}
                    {days.map((_, i) => (
                      <div key={i} style={gridLine(i * pxPerDay)} />
                    ))}

                    {/* Today line */}
                    {typeof todayX === "number" && <div style={todayLine(todayX)} />}

                    {/* Bar */}
                    <div
                      style={{
                        ...barStyle(bg),
                        left: bar.left + 6,
                        width: bar.width,
                        top: 8,
                      }}
                      title={`${titleText}\n${bar.from.toDateString()} → ${bar.to.toDateString()}`}
                    >
                      <span style={{ opacity: 0.9 }}>{r.item.displayId || r.item.id}</span>
                      <span style={{ opacity: 0.95, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.item.title}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(TimelineModule);
