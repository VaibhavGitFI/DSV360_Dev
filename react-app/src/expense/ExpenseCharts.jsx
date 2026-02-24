import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  LineChart, Line,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

const ExpenseCharts = ({ expenses }) => {
  // Status pie
  const statusData = ["APPROVED", "PENDING", "REJECTED"].map(status => ({
    name: status,
    value: expenses.filter(e => e.status === status).length,
  }));

  // Category bar
  const categoryMap = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const categoryData = Object.entries(categoryMap).map(([key, val]) => ({
    category: key,
    amount: val,
  }));

  // Monthly trend
  const monthMap = {};
  expenses.forEach(e => {
    const month = e.submittedDate.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + e.amount;
  });

  const monthData = Object.entries(monthMap).map(([m, v]) => ({
    month: m,
    amount: v,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Status */}
      <ChartCard title="Expense Status">
        <PieChart width={250} height={250}>
          <Pie data={statusData} dataKey="value" innerRadius={60}>
            {statusData.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ChartCard>

      {/* Category */}
      <ChartCard title="By Category">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categoryData}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly */}
      <ChartCard title="Monthly Trend">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="amount" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="font-medium mb-2">{title}</h3>
    {children}
  </div>
);

export default ExpenseCharts;
