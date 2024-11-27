// Show and hide the budget modal
document.getElementById("add-budget-btn").onclick = () => {
  document.getElementById("budget-modal").style.display = "flex";
};
document.getElementById("close-budget-modal").onclick = () => {
  document.getElementById("budget-modal").style.display = "none";
};

// Show and hide the expense modal
document.getElementById("expenses-btn").onclick = () => {
  document.getElementById("expense-modal").style.display = "flex";
};
document.getElementById("close-expense-modal").onclick = () => {
  document.getElementById("expense-modal").style.display = "none";
};

// Save Budget
document.getElementById("save-budget-btn").onclick = () => {
  const budget = parseFloat(document.getElementById("budget-input").value);
  if (!isNaN(budget) && budget > 0) {
    const currentUser = localStorage.getItem("currentUser");
    localStorage.setItem(`budget_${currentUser}`, budget);
    updateBudgetDisplay();
    alert("Budget saved successfully!");
    document.getElementById("budget-modal").style.display = "none";
  } else {
    alert("Please enter a valid budget.");
  }
};

// Save Expense
document.getElementById("save-expense-btn").onclick = () => {
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const description = document.getElementById("expense-description").value;
  const date = document.getElementById("expense-date").value;

  if (amount > 0 && description && date) {
    const currentUser = localStorage.getItem("currentUser");
    const expensesKey = `expenses_${currentUser}`;
    const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
    expenses.push({ amount, description, date });
    localStorage.setItem(expensesKey, JSON.stringify(expenses));
    updateExpenseList();
    updateBudgetDisplay();
    alert("Expense added successfully!");
    document.getElementById("expense-modal").style.display = "none";
  } else {
    alert("Please fill out all expense fields.");
  }
};

// Update Budget Display
function updateBudgetDisplay() {
  const currentUser = localStorage.getItem("currentUser");
  const budgetKey = `budget_${currentUser}`;
  const expensesKey = `expenses_${currentUser}`;

  const budget = parseFloat(localStorage.getItem(budgetKey)) || 0;
  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = budget - totalExpense;

  document.getElementById("budget-display").textContent = `$${budget.toFixed(
    2
  )}`;
  document.getElementById(
    "total-expense-display"
  ).textContent = `$${totalExpense.toFixed(2)}`;
  document.getElementById(
    "remaining-budget-display"
  ).textContent = `$${remainingBudget.toFixed(2)}`;
}

// Update Expense List
function updateExpenseList() {
  const currentUser = localStorage.getItem("currentUser");
  const expensesKey = `expenses_${currentUser}`;

  const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
  const expenseList = document.getElementById("expense-list");
  expenseList.innerHTML = expenses
    .map((exp) => `<li>${exp.description} - $${exp.amount} (${exp.date})</li>`)
    .join("");
}

// Initialize Page
window.onload = () => {
  updateBudgetDisplay();
  updateExpenseList();
};
