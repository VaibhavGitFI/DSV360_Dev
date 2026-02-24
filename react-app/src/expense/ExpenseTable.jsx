const ExpenseTable = ({ expenses, refreshExpenses, loading }) => {
  const handleApprove = async (expenseId) => {
    try {
      await fetch(`/api/expenses/${expenseId}/approve`, {
        method: "POST",
      });

      await fetch(`/api/expenses/${expenseId}/notify-accounts`, {
        method: "POST",
      });

      refreshExpenses();
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleReject = async (expenseId) => {
    try {
      await fetch(`/api/expenses/${expenseId}/reject`, {
        method: "POST",
      });
      refreshExpenses();
    } catch (error) {
      console.error("Rejection failed", error);
    }
  };

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  return (
    <div className="bg-white shadow rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Employee</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Invoice</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-t">
              <td className="p-3">{expense.employeeName}</td>
              <td className="p-3">₹{expense.amount}</td>

              <td className="p-3">
                <a
                  href={expense.invoiceUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Invoice
                </a>
              </td>

              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    expense.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : expense.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {expense.status}
                </span>
              </td>

              <td className="p-3 space-x-2">
                {expense.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleApprove(expense.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(expense.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
