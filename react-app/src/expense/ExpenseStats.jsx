const ExpenseStats = ({ expenses }) => {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Stat title="Total Expenses" value={`₹${totalAmount}`} />
      <Stat title="Approved" value={expenses.filter(e => e.status === "APPROVED").length} />
      <Stat title="Pending" value={expenses.filter(e => e.status === "PENDING").length} />
      <Stat title="Rejected" value={expenses.filter(e => e.status === "REJECTED").length} />
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default ExpenseStats;
