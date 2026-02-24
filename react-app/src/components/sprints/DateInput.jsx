import React from "react";

/**
 * DateInput — wraps a native date input.
 * In dark mode, hides the native calendar icon and shows a custom white SVG icon.
 * All extra props are forwarded to the <input type="date">.
 */
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DateInput = ({ isDark, style, className, ...rest }) => {
  const inputStyle = {
    ...style,
    colorScheme: isDark ? "dark" : "light",
    width: "100%",
  };

  if (!isDark) {
    return (
      <input
        type="date"
        className={className}
        style={inputStyle}
        {...rest}
      />
    );
  }

  return (
    <div className="dark-date-input-wrap">
      <input
        type="date"
        className={`${className || ""} dark-date-input`}
        style={inputStyle}
        {...rest}
      />
      <div className="dark-date-icon">
        <CalendarIcon />
      </div>
    </div>
  );
};

export default DateInput;
