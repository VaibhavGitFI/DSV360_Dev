import React from "react";
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Divider,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6C63FF", "#00C49A", "#FF6B6B"];

const formatVal = (v) => (Number.isFinite(v) ? v : 0);

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const { name, value } = payload[0] || {};
  return (
    <Box
      sx={{
        px: 1.2,
        py: 0.8,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 12 }}>{name}</Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {value} days
      </Typography>
    </Box>
  );
};


const DashboardSummaryBar = ({ data = [], leaveBreakdown, loading }) => {
  const theme = useTheme();

  const getProgress = (item) => {
    const totalNum = Number(item.total);
    const usedNum = Number(item.used);


    if (item.total === "∞" || !Number.isFinite(totalNum) || totalNum <= 0 || !Number.isFinite(usedNum)) {
      return null;
    }
    return Math.min(100, Math.max(0, (usedNum / totalNum) * 100)); // ✅ used/total
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        boxShadow: `0 12px 34px ${alpha(theme.palette.common.black, 0.06)}`,
      }}
    >
      {/* Header */}
     

      {/* Body */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {data.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              p: { xs: 2, sm: 2.5 },
              position: "relative",
              transition: "background 200ms ease",
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {/* Vertical divider between segments (desktop only) */}
            {idx !== 0 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  display: { xs: "none", md: "block" },
                  position: "absolute",
                  left: 0,
                  top: 14,
                  bottom: 14,
                }}
              />
            )}

            {loading ? (
              <>
                <Skeleton variant="text" width="55%" height={22} />
                <Skeleton variant="text" width="35%" height={38} sx={{ mt: 0.5 }} />
                <Skeleton variant="text" width="60%" height={18} />
                <Skeleton variant="rectangular" width="100%" height={10} sx={{ mt: 2, borderRadius: 999 }} />
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                {/* Left */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "text.secondary" }}>
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 900,
                      fontSize: "clamp(1.6rem, 2.2vw, 2.1rem)",
                      lineHeight: 1.1,
                      color: "text.primary",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                    title={String(item.total)}
                  >
                    {item.used}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary" }}>
                    {item.total} Employees
                  </Typography>

                  {/* Progress */}
                  {(() => {
                    const p = getProgress(item);

                 
                    if (p === null) return null;

                    return (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={p}
                          sx={{
                            height: 9,
                            borderRadius: 999,
                            bgcolor: alpha(theme.palette.text.primary, 0.08),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ mt: 0.75, display: "block", fontWeight: 800, color: "text.secondary" }}>
                          {Math.round(p)}% {item.meteric}
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>

                {item.title === "Total Leaves" && leaveBreakdown ? (
  (() => {
    const paid = formatVal(leaveBreakdown.Paid);
    const sick = formatVal(leaveBreakdown.Sick);
    const unpaid = formatVal(leaveBreakdown.Unpaid);
    const total = paid + sick + unpaid;

    const pieData = [
      { name: "Paid", value: paid },
      { name: "Sick", value: sick },
      { name: "Unpaid", value: unpaid },
    ].filter((d) => d.value > 0); // hide zero slices

    return (
      <Box
        sx={{
          width: 120,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.8,
        }}
      >
        {/* Pie container */}
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: 4,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ name: "None", value: 1 }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={36}
                innerRadius={22}
                paddingAngle={3}
                stroke={alpha("#000", 0.08)} // slice separation
                strokeWidth={2}
              >
                {(pieData.length ? pieData : [{ name: "None", value: 1 }]).map((_, i) => (
                  <Cell
                    key={i}
                    fill={pieData.length ? COLORS[i % COLORS.length] : alpha(theme.palette.text.primary, 0.12)}
                  />
                ))}
              </Pie>

              {/* Center total label */}
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: "12px", fontWeight: 800, fill: theme.palette.text.primary }}
              >
                {total}
              </text>
              <text
                x="50%"
                y="62%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: "10px", fill: theme.palette.text.secondary }}
              >
                Total
              </text>

              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Mini legend */}
        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Paid", value: paid, color: COLORS[0] },
            { label: "Sick", value: sick, color: COLORS[1] },
            { label: "Unpaid", value: unpaid, color: COLORS[2] },
          ]
            .filter((x) => x.value > 0)
            .map((x) => (
              <Box key={x.label} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: x.color,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary" }}>
                  {x.label}: {x.value}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>
    );
  })()
) : null}

              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default DashboardSummaryBar;
