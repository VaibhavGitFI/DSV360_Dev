import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { useAppState } from "../context/AppStateContext";
import DateInput from "../components/sprints/DateInput";

/**
 * Calendar.jsx
 * ✅ Uses MUI theme mode via: const muiTheme = useTheme()
 * ✅ NO light/dark toggle button added
 * ✅ NO backgroundImage / NO linear-gradient
 * ✅ Solid surfaces + your requested rgba whites
 *
 * If your AppStateContext exposes setThemeMode, this component will sync it automatically
 * whenever MUI theme mode changes.
 */

const Calendar = () => {
  const muiTheme = useTheme();

  // Pull from your existing app state
  const appState = useAppState();
  const { stories, milestones, sprints, addSprint, selectedProjectId } = appState;

  // If your context has setThemeMode, we will use it (no button)
  const setThemeMode = appState?.setThemeMode;

  const themeMode = muiTheme?.palette?.mode === "dark" ? "dark" : "light";

  // Sync the themeMode back to your app state if setThemeMode exists
  useEffect(() => {
    if (typeof setThemeMode === "function") {
      setThemeMode(themeMode);
    }
  }, [themeMode, setThemeMode]);

  const T = useMemo(() => {
    const light = {
      // Light theme (FCF8F8, C5D89D, 9CAB84, FD7979)
      pageBg: "#FCF8F8",
      surface: "rgba(255, 255, 255, 0.7)", // requested
      surfaceZero: "rgba(255, 255, 255, 0)", // requested (available if needed)
      surfaceSolid: "#FFFFFF",
      border: "rgba(0,0,0,0.12)",
      borderSoft: "rgba(0,0,0,0.08)",
      text: "#000000",
      textMuted: "rgba(0,0,0,0.60)",
      chip: "#9CAB84",
      focus: "#C5D89D",
      danger: "#FD7979",
      ok: "#9CAB84",
      header: "#FFFFFF",
      dayHeaderBg: "rgba(255, 255, 255, 0.7)",
      hoverCell: "rgba(197, 216, 157, 0.22)",
      todayBg: "#9CAB84",
      todayText: "#FFFFFF",
      modalOverlay: "rgba(0,0,0,0.35)",
      modalBg: "#FFFFFF",
      btnPrimaryBg: "#191919",
      btnPrimaryText: "#FFFFFF",
      shadow: "rgba(0,0,0,0.10)",
      shadowStrong: "rgba(0,0,0,0.14)",
    };

    const dark = {
      // Dark theme (191919, 750E21, E3651D, BED754)
      pageBg: "#191919",
      surface: "rgba(255, 255, 255, 0.07)",
      surfaceZero: "rgba(255, 255, 255, 0)",
      surfaceSolid: "#191919",
      border: "rgba(255,255,255,0.14)",
      borderSoft: "rgba(255,255,255,0.10)",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.72)",
      chip: "#BED754",
      focus: "#BED754",
      danger: "#E3651D",
      ok: "#BED754",
      header: "#191919",
      dayHeaderBg: "rgba(255, 255, 255, 0.05)",
      hoverCell: "rgba(190, 215, 84, 0.08)",
      todayBg: "#BED754",
      todayText: "#191919",
      modalOverlay: "rgba(0,0,0,0.55)",
      modalBg: "#191919",
      btnPrimaryBg: "#BED754",
      btnPrimaryText: "#191919",
      shadow: "rgba(0,0,0,0.40)",
      shadowStrong: "rgba(0,0,0,0.55)",
    };

    return themeMode === "dark" ? dark : light;
  }, [themeMode]);

  const [viewDate, setViewDate] = useState(new Date(2026, 0, 1));
  const [hoverState, setHoverState] = useState(null); // { id: string, day: number }
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  const [sprintData, setSprintData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let i = currentYear - 2; i <= currentYear + 5; i++) arr.push(i);
    return arr;
  }, []);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleMonthChange = (e) =>
    setViewDate(new Date(year, parseInt(e.target.value, 10), 1));
  const handleYearChange = (e) =>
    setViewDate(new Date(parseInt(e.target.value, 10), month, 1));

  const days = useMemo(() => {
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let i = 1; i <= totalDays; i++) arr.push(i);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  const numRows = Math.ceil(days.length / 7);

  // Sprint colors are limited to your theme palette (no random colors)
  const getSprintColor = (sprintId) => {
    const idNum = parseInt(String(sprintId).replace(/\D/g, ""), 10) || 0;
    const bg = idNum % 2 === 0 ? T.chip : T.danger;
    return {
      bg,
      text: themeMode === "dark" ? "#191919" : "#FFFFFF",
      border: themeMode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
    };
  };

  const getDayData = (day) => {
    if (!day) return null;

    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

    const dayStories = stories.filter((s) => s.dueDate === dateStr);
    const dayMilestones = milestones.filter((m) => m.dueDate === dateStr);

    const activeSprints = sprints.filter((s) => {
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    });

    return { stories: dayStories, milestones: dayMilestones, sprints: activeSprints, d };
  };

  const handleSprintSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!sprintData.name) return;

    addSprint({ ...sprintData, projectId: selectedProjectId || "" });

    setIsSprintModalOpen(false);
    setSprintData({ name: "", goal: "", startDate: "", endDate: "" });
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden p-6 relative"
      style={{ backgroundColor: T.pageBg, color: T.text }}
    >
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: T.text }}>
            System Calendar
          </h1>

          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
          >
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg transition-all shadow-sm active:scale-95"
              style={{
                backgroundColor: T.header,
                color: T.text,
                border: `1px solid ${T.borderSoft}`,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>

            <div className="flex gap-2 px-3 items-center text-sm font-black uppercase tracking-widest" style={{ color: T.text }}>
              <select
                value={month}
                onChange={handleMonthChange}
                className="bg-transparent border-none focus:outline-none cursor-pointer"
                style={{ color: T.text }}
              >
                {monthNames.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={handleYearChange}
                className="bg-transparent border-none focus:outline-none cursor-pointer"
                style={{ color: themeMode === "dark" ? T.chip : T.text }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg transition-all shadow-sm active:scale-95"
              style={{
                backgroundColor: T.header,
                color: T.text,
                border: `1px solid ${T.borderSoft}`,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="hidden lg:flex items-center gap-6 px-6 py-2.5 rounded-2xl shadow-sm"
            style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
          >
            {[
              { label: "Issue", dot: themeMode === "dark" ? T.chip : T.ok },
              { label: "Milestone", dot: T.danger },
              { label: "Sprint Range", dot: T.chip },
            ].map((legend) => (
              <div key={legend.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: legend.dot }} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: T.textMuted }}>
                  {legend.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsSprintModalOpen(true)}
            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 active:scale-95"
            style={{
              backgroundColor: T.btnPrimaryBg,
              color: T.btnPrimaryText,
              border: `1px solid ${T.border}`,
              boxShadow: `0 14px 30px ${T.shadow}`,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Plan Sprint
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="flex-1 rounded-[24px] shadow-xl overflow-hidden flex flex-col min-h-0"
        style={{ backgroundColor: T.header, border: `1px solid ${T.border}` }}
      >
        {/* Days Header */}
        <div className="grid grid-cols-7 flex-shrink-0" style={{ backgroundColor: T.dayHeaderBg, borderBottom: `1px solid ${T.border}` }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] border-r last:border-r-0"
              style={{ color: T.textMuted, borderColor: T.border }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}>
          {days.map((day, idx) => {
            const data = getDayData(day);
            const now = new Date();
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

            return (
              <div
                key={idx}
                onClick={() => day && !(data && data.sprints.length) && setIsSprintModalOpen(true)}
                className="relative transition-all duration-300 flex flex-col p-2 gap-1 overflow-hidden"
                style={{
                  borderRight: `1px solid ${T.borderSoft}`,
                  borderBottom: `1px solid ${T.borderSoft}`,
                  backgroundColor: !day ? T.dayHeaderBg : "transparent",
                  cursor: day ? "pointer" : "default",
                }}
                onMouseEnter={(e) => {
                  if (!day) return;
                  e.currentTarget.style.backgroundColor = T.hoverCell;
                }}
                onMouseLeave={(e) => {
                  if (!day) return;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-center mb-1 flex-shrink-0">
                      <span
                        className="text-[11px] font-black px-2 py-1 rounded-lg transition-all"
                        style={{
                          backgroundColor: isToday ? T.todayBg : "transparent",
                          color: isToday ? T.todayText : T.textMuted,
                          border: isToday ? `1px solid ${T.border}` : "1px solid transparent",
                        }}
                      >
                        {day}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1 overflow-hidden relative z-10 flex flex-col">
                      {data &&
                        data.sprints.map((s) => {
                          const start = new Date(s.startDate);
                          const end = new Date(s.endDate);

                          const isStartDay =
                            start.getDate() === day &&
                            start.getMonth() === month &&
                            start.getFullYear() === year;

                          const isEndDay =
                            end.getDate() === day &&
                            end.getMonth() === month &&
                            end.getFullYear() === year;

                          const colors = getSprintColor(s.id);

                          const isThisSegmentHovered =
                            hoverState && hoverState.id === s.id && hoverState.day === day;

                          return (
                            <div
                              key={s.id}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                setHoverState({ id: s.id, day });
                              }}
                              onMouseLeave={() => setHoverState(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSprint(s);
                              }}
                              className="h-5 flex-shrink-0 flex items-center transition-all relative"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                                borderTop: `1px solid ${colors.border}`,
                                borderBottom: `1px solid ${colors.border}`,
                                boxShadow: `0 6px 14px ${T.shadow}`,
                                transform: isThisSegmentHovered ? "scale(1.05)" : "scale(1)",
                                filter: isThisSegmentHovered ? "brightness(1.05)" : "none",
                                zIndex: isThisSegmentHovered ? 200 : 20,
                                borderTopLeftRadius: isStartDay ? 10 : 0,
                                borderBottomLeftRadius: isStartDay ? 10 : 0,
                                borderTopRightRadius: isEndDay ? 10 : 0,
                                borderBottomRightRadius: isEndDay ? 10 : 0,
                                marginLeft: isStartDay ? 4 : 0,
                                marginRight: isEndDay ? 4 : 0,
                              }}
                            >
                              <div className="px-2 overflow-hidden flex items-center w-full">
                                <span className="text-[7px] font-black uppercase tracking-widest truncate leading-none" style={{ color: colors.text }}>
                                  {isStartDay ? s.name : ""}
                                </span>
                              </div>

                              {/* Tooltip */}
                              {isThisSegmentHovered && (
                                <div
                                  className="absolute bottom-full left-0 mb-3 w-56 p-4 rounded-[20px] z-[300] pointer-events-none border"
                                  style={{
                                    backgroundColor: T.modalBg,
                                    color: T.text,
                                    borderColor: T.border,
                                    boxShadow: `0 20px 60px ${T.shadowStrong}`,
                                  }}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div
                                      className="px-2 py-0.5 rounded-lg text-[6px] font-black uppercase tracking-[0.2em]"
                                      style={{
                                        backgroundColor: colors.bg,
                                        color: colors.text,
                                        border: `1px solid ${colors.border}`,
                                      }}
                                    >
                                      Sprint Segment
                                    </div>
                                    <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
                                      {s.startDate} - {s.endDate}
                                    </span>
                                  </div>
                                  <h4 className="font-black text-xs leading-tight mb-2" style={{ color: T.text }}>
                                    {s.name}
                                  </h4>
                                  <p className="text-[10px] font-medium italic line-clamp-2 leading-relaxed" style={{ color: T.textMuted }}>
                                    "{s.goal}"
                                  </p>
                                  <div
                                    className="absolute -bottom-1 left-4 w-3 h-3 rotate-45 border-r border-b"
                                    style={{ backgroundColor: T.modalBg, borderColor: T.border }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}

                      {data &&
                        data.milestones.map((m) => (
                          <div
                            key={m.id}
                            className="px-2 py-1 text-[8px] font-black rounded-lg border truncate flex items-center gap-1.5 shadow-sm flex-shrink-0"
                            style={{
                              backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
                              borderColor: T.border,
                              color: T.text,
                            }}
                          >
                            🚩 <span className="uppercase tracking-tighter truncate">{m.title}</span>
                          </div>
                        ))}

                      {data &&
                        data.stories.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className="px-2 py-1 text-[8px] font-bold rounded-lg border truncate flex items-center gap-1.5 shadow-sm flex-shrink-0"
                            style={{
                              backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
                              borderColor: T.borderSoft,
                              color: T.text,
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: s.status === "DONE" ? T.ok : T.chip }}
                            />
                            <span className="truncate">{s.title}</span>
                          </div>
                        ))}

                      {data && data.stories.length > 3 && (
                        <div className="text-[7px] font-black uppercase tracking-widest text-center py-0.5" style={{ color: T.textMuted }}>
                          + {data.stories.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sprint Insight Modal */}
      {selectedSprint && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-6"
          style={{ backgroundColor: T.modalOverlay }}
          onClick={() => setSelectedSprint(null)}
        >
          <div
            className="rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border"
            style={{ backgroundColor: T.modalBg, borderColor: T.border, color: T.text }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-8"
              style={{
                backgroundColor: getSprintColor(selectedSprint.id).bg,
                color: getSprintColor(selectedSprint.id).text,
              }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                    Operational Cycle
                  </span>
                  <h2 className="text-2xl font-black tracking-tight leading-none">
                    {selectedSprint.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedSprint(null)}
                  className="p-2 rounded-xl"
                  style={{
                    backgroundColor: themeMode === "dark" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.20)",
                    border: "1px solid rgba(255,255,255,0.20)",
                    color: getSprintColor(selectedSprint.id).text,
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)" }}>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-80 mb-1">Commencement</p>
                  <p className="text-sm font-bold">{selectedSprint.startDate}</p>
                </div>
                <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)" }}>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-80 mb-1">Conclusion</p>
                  <p className="text-sm font-bold">{selectedSprint.endDate}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: T.textMuted }}>
                  Defined Goal
                </h3>
                <div className="p-6 rounded-2xl border" style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)", borderColor: T.borderSoft }}>
                  <p className="text-base font-bold leading-relaxed italic text-center" style={{ color: T.text }}>
                    "{selectedSprint.goal}"
                  </p>
                </div>
              </section>
            </div>

            <div className="p-6 border-t" style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)", borderColor: T.border }}>
              <button
                onClick={() => setSelectedSprint(null)}
                className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-xs active:scale-[0.99]"
                style={{ backgroundColor: T.btnPrimaryBg, color: T.btnPrimaryText, border: `1px solid ${T.border}` }}
              >
                Acknowledge Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Sprint Modal */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ backgroundColor: T.modalOverlay }}>
          <div className="w-full max-w-xl rounded-[32px] shadow-2xl border overflow-hidden flex flex-col" style={{ backgroundColor: T.modalBg, borderColor: T.border, color: T.text }}>
            <div className="px-8 py-6 border-b flex justify-between items-center" style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)", borderColor: T.border }}>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: T.text }}>
                  Construct New Sprint Cycle
                </h3>
                <p className="text-[9px] font-bold uppercase mt-1" style={{ color: T.textMuted }}>
                  Operational Capacity Definition
                </p>
              </div>

              <button
                onClick={() => setIsSprintModalOpen(false)}
                className="p-2 rounded-xl transition-all"
                style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)", border: `1px solid ${T.border}`, color: T.text }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSprintSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: T.textMuted }}>
                  Cycle Nomenclature
                </label>
                <input
                  required
                  type="text"
                  value={sprintData.name}
                  onChange={(e) => setSprintData({ ...sprintData, name: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl text-sm font-bold outline-none border-2 transition-all"
                  style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)", borderColor: "transparent", color: T.text }}
                  placeholder="e.g., Sprint 26 - Core Infrastructure"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: T.textMuted }}>
                  Operational Goal
                </label>
                <textarea
                  value={sprintData.goal}
                  onChange={(e) => setSprintData({ ...sprintData, goal: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-2xl text-sm font-medium outline-none border-2 transition-all h-24 resize-none"
                  style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)", borderColor: "transparent", color: T.text }}
                  placeholder="What core value is being delivered?"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: T.textMuted }}>
                    Commence Date
                  </label>
                  <DateInput
                    required
                    isDark={themeMode === "dark"}
                    value={sprintData.startDate}
                    onChange={(e) => setSprintData({ ...sprintData, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border"
                    style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)", borderColor: T.border, color: T.text }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: T.textMuted }}>
                    Conclude Date
                  </label>
                  <DateInput
                    required
                    isDark={themeMode === "dark"}
                    value={sprintData.endDate}
                    onChange={(e) => setSprintData({ ...sprintData, endDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border"
                    style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)", borderColor: T.border, color: T.text }}
                  />
                </div>
              </div>
            </form>

            <div className="p-8 border-t flex gap-4" style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)", borderColor: T.border }}>
              <button
                type="button"
                onClick={() => setIsSprintModalOpen(false)}
                className="flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                style={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)", border: `1px solid ${T.border}`, color: T.text }}
              >
                Discard
              </button>
              <button
                onClick={handleSprintSubmit}
                className="flex-[2] py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                style={{ backgroundColor: T.btnPrimaryBg, border: `1px solid ${T.border}`, color: T.btnPrimaryText }}
              >
                Commit Sprint Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
