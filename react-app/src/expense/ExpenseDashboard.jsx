import { useState } from "react";
import { dummyExpenses } from "./dummyExpenses";
import ExpenseStats from "./ExpenseStats";
import ExpenseCharts from "./ExpenseCharts";
import ExpenseTable from "./ExpenseTable";

const ExpenseDashboard = () => {
  const [expenses, setExpenses] = useState(dummyExpenses);

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-2xl font-semibold">Expense Tracker (DSV360)</h1>

      <ExpenseStats expenses={expenses} />
      <ExpenseCharts expenses={expenses} />
      <ExpenseTable expenses={expenses} setExpenses={setExpenses} />
    </div>
  );
};

export default ExpenseDashboard;
