export const uiTokens = (isDark) => {
  const c = (light, dark) => (isDark ? dark : light);

  return {
    page: c("bg-slate-50 text-slate-900", "bg-[#0b1220] text-slate-100"),
    surface: c("bg-white border-slate-200", "bg-[#0f1a2b] border-white/10"),
    surface2: c("bg-slate-50 border-slate-200", "bg-[#0c1526] border-white/10"),
    textMuted: c("text-slate-500", "text-slate-400"),
    textStrong: c("text-slate-900", "text-slate-100"),
    border: c("border-slate-200", "border-white/10"),
    hover: c("hover:bg-slate-50", "hover:bg-white/5"),

    btnPrimary: c("bg-blue-700 hover:bg-blue-800 text-white", "bg-blue-600 hover:bg-blue-500 text-white"),
    btnSoft: c("bg-slate-100 hover:bg-slate-200 text-slate-800", "bg-white/10 hover:bg-white/15 text-slate-100"),
    btnOutline: c("border border-slate-300 hover:bg-slate-50", "border border-white/15 hover:bg-white/5"),

    pill: c("bg-slate-100 text-slate-700", "bg-white/10 text-slate-200"),

    input:
      c("bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
        "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500"),
  };
};
