import React, { useMemo } from "react";
import { useTheme } from "@mui/material/styles";

const getUI = (theme) => {
  const isDark = theme?.palette?.mode === "dark";

  const LIGHT = {
    base: "#FAFAFA",
    a: "#C5D89D",
    b: "#4ac23aff",
    danger: "#FD7979",
    text: "#191919",
    muted: "#000000ff",
    surface: "#FAFAFA",
    surface0: "rgba(255,255,255,0)",
    border: "#9CAB84",
  };

  const DARK = {
    base: "#191919",
    maroon: "#750E21",
    orange: "#E3651D",
    lime: "#BED754",
    text: "#FCF8F8",
    muted: "#eceee3ff",
    surface: "#191919",
    surface0: "rgba(255,255,255,0)",
    border: "#750E21",
  };

  const C = isDark ? DARK : LIGHT;
  return { isDark, C };
};

const Toolbar = ({
  activeTab,
  setActiveTab,
  setIsSprintModalOpen,
  currentSprintId,
  setCurrentSprintId,
  sprints,
  onCreateIssue,
  onExport,
  isEmployee,
}) => {
  const theme = useTheme();
  const { C, isDark } = getUI(theme);

  const activeColor = isDark ? C.lime : C.b;

  const cycleBox = useMemo(
    () => ({
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : C.base,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "6px 10px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 36,
      boxShadow: isDark ? "0 0 0 1px rgba(255,255,255,0.03) inset" : "0 0 0 1px rgba(0,0,0,0.03) inset",
    }),
    [C.base, C.border, isDark]
  );

  const selectStyle = useMemo(
    () => ({
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      color: C.text,
      fontWeight: 900,
      fontSize: 12,
      letterSpacing: "0.06em",
      paddingRight: 28, // space for chevron
      cursor: "pointer",
      lineHeight: "18px",
      maxWidth: 180,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
    }),
    [C.text]
  );

  return (
    <div
      className="flex-shrink-0 h-14 px-6 flex items-center justify-between z-40"
      style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}
    >
      <div className="flex h-full gap-2">
        {["board", "backlog", "timeline"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="h-full flex items-center px-4 text-[12px] font-bold uppercase tracking-widest transition-all relative"
            style={{
              color: activeTab === tab ? activeColor : C.muted,
              opacity: activeTab === tab ? 1 : 0.85,
            }}
          >
            {tab}
            {activeTab === tab && (
              <div
                className="absolute bottom-0 left-0 w-full h-[2px]"
                style={{ backgroundColor: activeColor }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {!isEmployee && (
          <button
            onClick={() => setIsSprintModalOpen(true)}
            className="px-4 py-1.5 text-[12px] font-bold uppercase rounded-md transition-all border flex items-center gap-2"
            style={{
              backgroundColor: C.surface0,
              borderColor: C.border,
              color: C.text,
              height: 36,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Create Sprint
          </button>
        )}

        {!isEmployee && (
          <button
            onClick={onExport}
            className="px-4 py-1.5 text-[12px] font-bold uppercase rounded-md transition-all border flex items-center gap-2"
            style={{
              backgroundColor: C.surface0,
              borderColor: C.border,
              color: C.text,
              height: 36,
            }}
            title="Export sprint data to Excel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        )}

        {!isEmployee && <div className="h-6 w-px" style={{ backgroundColor: C.border }} />}

        {/* Cycle / Sprint dropdown */}
        <div style={cycleBox}>
          <span
            className="text-[10px] font-black uppercase"
            style={{
              color: C.muted,
              letterSpacing: "0.22em",
              opacity: 0.95,
              userSelect: "none",
            }}
          >
            Cycle
          </span>

          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <select
              value={currentSprintId}
              onChange={(e) => setCurrentSprintId(e.target.value)}
              style={selectStyle}
            >
              {sprints.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  style={{
                    backgroundColor: isDark ? C.surface : C.base,
                    color: isDark ? C.text : C.text,
                    fontWeight: 800,
                  }}
                >
                  {s.name}
                </option>
              ))}
            </select>

            {/* Chevron */}
            <div
              style={{
                position: "absolute",
                right: 6,
                pointerEvents: "none",
                color: C.text,
                opacity: isDark ? 0.85 : 0.7,
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {!isEmployee && (
          <button
            onClick={onCreateIssue}
            className="px-4 py-1.5 text-[12px] font-bold uppercase rounded-md transition-all border flex items-center gap-2"
            style={{
              backgroundColor: isDark ? C.orange : C.b,
              borderColor: C.border,
              color: C.text,
              height: 36,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Issue
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(Toolbar);
