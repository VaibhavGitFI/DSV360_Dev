// Navigator.jsx
import React, { useMemo } from "react";
import { useTheme } from "@mui/material/styles";

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
      accent: isDark ? "#E3651D" : "#9CAB84",
      danger: isDark ? "#750E21" : "#FD7979",
      sel: ["#4E56C0", "#9B5DE0", "#D78FEE", "#FDCFFA"],
    },
  };
};

const Navigator = ({
  milestones = [],
  epics = [],
  stories = [],
  expandedNodes,
  toggleNode,
  selectedIssueId,
  setSelectedIssueId,
  handleOpenCreate,
  isEmployee,
}) => {
  const theme = useTheme();
  const { C, fontFamily } = getUI(theme);

  const pickSel = useMemo(() => {
    return (id) => {
      const n = parseInt(String(id).replace(/\D/g, ""), 10) || 0;
      return C.sel[n % C.sel.length];
    };
  }, [C.sel]);

  const asideStyle = {
    width: 264,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: C.base,
    borderRight: `1px solid ${C.border}`,
    fontFamily,
  };

  const headerStyle = {
    height: 56,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
  };

  const iconButton = (tone = "neutral") => {
    const color = tone === "danger" ? C.danger : C.text;
    return {
      width: 32,
      height: 32,
      borderRadius: 12,
      display: "grid",
      placeItems: "center",
      backgroundColor: C.surface,
      border: `1px solid ${C.borderSoft}`,
      color,
      cursor: "pointer",
    };
  };

  const listStyle = { flex: 1, overflowY: "auto", padding: 12 };

  const rowBase = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 14,
    textAlign: "left",
    cursor: "pointer",
    userSelect: "none",
    fontFamily,
  };

  const smallAction = {
    fontSize: 16,
    fontWeight: 800,
    lineHeight: "16px",
    width: 26,
    height: 26,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    border: `1px solid ${C.borderSoft}`,
    backgroundColor: C.surface,
    color: C.text,
    cursor: "pointer",
    fontFamily,
  };

  return (
    <aside style={asideStyle}>
      <div style={headerStyle}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.text }}>
          Navigator
        </span>

        {!isEmployee && (
          <button onClick={() => handleOpenCreate("MILESTONE")} style={iconButton()} title="Add Release" aria-label="Add Release">
            <span style={{ fontSize: 18, fontWeight: 800 }}>+</span>
          </button>
        )}
      </div>

      <div style={listStyle} className="custom-scrollbar">
        {milestones.map((ms) => {
          const open = expandedNodes.has(ms.id);
          return (
            <div key={ms.id} style={{ marginBottom: 10 }}>
              <button
                onClick={() => toggleNode(ms.id)}
                style={{
                  ...rowBase,
                  backgroundColor: open ? C.surface : C.base,
                  border: `1px solid ${open ? C.borderSoft : "transparent"}`,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 800, color: C.text, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 120ms ease" }}>
                  ▶
                </span>
                <span style={{ fontSize: 14 }}>🚩</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ms.title}
                </span>

                {!isEmployee && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCreate("EPIC", ms.id);
                    }}
                    style={smallAction}
                    title="Add Epic"
                  >
                    +
                  </span>
                )}
              </button>

              {open &&
                epics
                  .filter((e) => e.milestoneId === ms.id)
                  .map((epic) => {
                    const epicOpen = expandedNodes.has(epic.id);

                    return (
                      <div key={epic.id} style={{ marginLeft: 14, marginTop: 10, borderLeft: `1px solid ${C.border}`, paddingLeft: 10 }}>
                        <button onClick={() => toggleNode(epic.id)} style={{ ...rowBase, backgroundColor: C.base, border: "1px solid transparent" }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: C.text, transform: epicOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 120ms ease" }}>
                            ▶
                          </span>

                          <div style={{ width: 10, height: 10, borderRadius: 4, backgroundColor: epic.color || C.accent, border: `1px solid ${C.borderSoft}` }} />

                          <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {epic.title}
                          </span>

                          {!isEmployee && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreate("STORY", epic.id);
                              }}
                              style={smallAction}
                              title="Add Story"
                            >
                              +
                            </span>
                          )}
                        </button>

                        {epicOpen && (
                          <div style={{ marginLeft: 18, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                            {stories
                              .filter((s) => s.epicId === epic.id)
                              .map((story) => {
                                const selected = selectedIssueId === story.id;
                                const accent = pickSel(story.id);

                                return (
                                  <button
                                    key={story.id}
                                    onClick={() => setSelectedIssueId(selectedIssueId === story.id ? null : story.id)}
                                    style={{
                                      width: "100%",
                                      padding: "10px 12px",
                                      borderRadius: 14,
                                      textAlign: "left",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      border: `1px solid ${selected ? "transparent" : C.borderSoft}`,
                                      backgroundColor: selected ? accent : C.surface,
                                      color: selected ? "#FFFFFF" : C.text,
                                      cursor: "pointer",
                                      fontFamily,
                                    }}
                                  >
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "#FFFFFF", backgroundColor: selected ? "rgba(255,255,255,0.25)" : C.accent, padding: "1px 6px", borderRadius: 6 }}>{story.displayId}</span>
                                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {story.title}
                                    </span>
                                  </button>
                                );
                              })}

                            {stories.filter((s) => s.epicId === epic.id).length === 0 && (
                              <div style={{ padding: "12px 12px", borderRadius: 14, border: `1px dashed ${C.border}`, backgroundColor: C.surface, color: C.text, textAlign: "center", fontSize: 11, fontWeight: 800 }}>
                                No stories
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          );
        })}

        {milestones.length === 0 && (
          <div style={{ padding: 18, borderRadius: 16, backgroundColor: C.surface, border: `1px dashed ${C.border}`, color: C.text, textAlign: "center", fontWeight: 800, fontSize: 11 }}>
            No releases yet
          </div>
        )}
      </div>
    </aside>
  );
};

export default React.memo(Navigator);
