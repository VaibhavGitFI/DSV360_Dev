// ../components/sprints/SprintPlanningModal.jsx
import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@mui/material/styles";
import DateInput from "./DateInput";

const SprintPlanningModal = ({ open, onClose, sprintData, setSprintData, onSubmit }) => {
  const muiTheme = useTheme();
  const mode = muiTheme?.palette?.mode === "dark" ? "dark" : "light";

  const C = useMemo(() => {
    const light = {
      surface: "#FFFFFF",
      surface2: "#FCF8F8",
      border: "rgba(0,0,0,0.12)",
      borderSoft: "rgba(0,0,0,0.08)",
      text: "#000000",
      muted: "rgba(0,0,0,0.65)",
      primary: "#9CAB84",
      overlay: "rgba(0,0,0,0.55)",
    };
    const dark = {
      surface: "#191919",
      surface2: "#191919",
      border: "rgba(255,255,255,0.14)",
      borderSoft: "rgba(255,255,255,0.10)",
      text: "#FFFFFF",
      muted: "rgba(255,255,255,0.70)",
      primary: "#E3651D",
      overlay: "rgba(0,0,0,0.78)",
    };
    return mode === "dark" ? dark : light;
  }, [mode]);

  useEffect(() => {
    if (!open) return;

    setSprintData({ name: "", goal: "", startDate: "", endDate: "" });

    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, setSprintData]);

  if (!open) return null;

  const label = {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: C.text,
    marginBottom: 8,
  };

  const inputBase = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    backgroundColor: C.surface2,
    color: C.text,
    outline: "none",
    fontWeight: 800,
    fontSize: 13,
  };

  const closeBtn = {
    width: 42,
    height: 42,
    borderRadius: 16,
    border: `1px solid ${C.borderSoft}`,
    backgroundColor: C.surface,
    color: C.text,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  };

  const btn = (variant) => {
    const primary = variant === "primary";
    return {
      flex: primary ? 2 : 1,
      padding: "12px 14px",
      borderRadius: 18,
      border: `1px solid ${primary ? "transparent" : C.border}`,
      backgroundColor: primary ? C.primary : C.surface,
      color: primary ? (mode === "dark" ? "#FFFFFF" : "#000000") : C.text,
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      cursor: "pointer",
    };
  };

  const dateError = sprintData?.startDate && sprintData?.endDate && sprintData.endDate < sprintData.startDate;

  const submit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!sprintData?.name?.trim()) return;
    if (dateError) return;
    onSubmit?.(e);
  };

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
        padding: 18,
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 24,
          boxShadow: mode === "dark" ? "0 24px 80px rgba(0,0,0,0.7)" : "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: 18,
            backgroundColor: C.surface2,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: C.text }}>
              Create Sprint
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text, opacity: 0.75 }}>
              Define sprint name, goal & dates
            </div>
          </div>

          <button onClick={onClose} style={closeBtn} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={label}>Sprint name</div>
            <input
              autoFocus
              value={sprintData?.name || ""}
              onChange={(e) => setSprintData((p) => ({ ...(p || {}), name: e.target.value }))}
              placeholder="e.g. Sprint 2"
              style={inputBase}
              required
            />
          </div>

          <div>
            <div style={label}>Goal</div>
            <textarea
              value={sprintData?.goal || ""}
              onChange={(e) => setSprintData((p) => ({ ...(p || {}), goal: e.target.value }))}
              placeholder="e.g. Ship task/subtask creation workflow"
              style={{ ...inputBase, minHeight: 92, resize: "vertical", fontWeight: 800 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={label}>Start date</div>
              <DateInput
                isDark={mode === "dark"}
                value={sprintData?.startDate || ""}
                onChange={(e) => setSprintData((p) => ({ ...(p || {}), startDate: e.target.value }))}
                style={{ ...inputBase, fontSize: 12, fontWeight: 900 }}
              />
            </div>

            <div>
              <div style={label}>End date</div>
              <DateInput
                isDark={mode === "dark"}
                value={sprintData?.endDate || ""}
                onChange={(e) => setSprintData((p) => ({ ...(p || {}), endDate: e.target.value }))}
                style={{ ...inputBase, fontSize: 12, fontWeight: 900 }}
              />
            </div>
          </div>

          {dateError && (
            <div style={{ fontSize: 12, fontWeight: 800, color: "#DD350D", padding: "4px 0" }}>
              End date cannot be before start date.
            </div>
          )}

          <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={btn("secondary")}>
              Cancel
            </button>
            <button type="submit" style={{ ...btn("primary"), opacity: dateError ? 0.5 : 1, pointerEvents: dateError ? "none" : "auto" }}>
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default SprintPlanningModal;
