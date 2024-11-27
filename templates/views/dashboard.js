// Function to toggle the profile menu display
function toggleProfileMenu() {
  const profileSection = document.querySelector(".profile-section");
  profileSection.classList.toggle("active");
}

// Close the profile menu if clicked outside
window.onclick = function (event) {
  const profileSection = document.querySelector(".profile-section");
  if (!profileSection.contains(event.target)) {
    profileSection.classList.remove("active");
  }
};

// Open the Add Expense Modal
function openAddExpenseModal() {
  document.getElementById("addExpenseModal").style.display = "flex";
}

// Close the Add Expense Modal
function closeAddExpenseModal() {
  document.getElementById("addExpenseModal").style.display = "none";
}

// Set the username in the header
function setUsernameInHeader() {
  const currentUser = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((user) => user.email === currentUser);

  if (user) {
    document.querySelector(".profile-button").textContent =
      user.name || user.email;
  }
}

// Save Expense to Local Storage with multiple participants
function saveExpense() {
  const emails = document
    .getElementById("expense-emails")
    .value.split(",")
    .map((email) => email.trim());
  const description = document.getElementById("expense-description").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const date =
    document.getElementById("expense-date").value ||
    new Date().toISOString().split("T")[0];

  if (emails.length === 0 || !description || isNaN(amount)) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Calculate each participant's share
  const splitAmount = (amount / (emails.length + 1)).toFixed(2); // +1 includes the current user

  // Retrieve the list of users from local storage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Get the current user
  const currentUser = localStorage.getItem("currentUser");

  // Add expense for each participant
  emails.forEach((email) => {
    if (email === currentUser) return; // Skip adding the current user to their own shared list

    let participant = users.find((user) => user.email === email);
    if (!participant) {
      participant = { email, expenses: [] };
      users.push(participant);
    }

    participant.expenses = participant.expenses || [];
    participant.expenses.push({
      description,
      amount: splitAmount,
      date,
      paidBy: currentUser,
      sharedWith: [currentUser],
    });
  });

  // Add expense to the current user's list as well
  const currentUserData = users.find((user) => user.email === currentUser);
  if (currentUserData) {
    currentUserData.expenses = currentUserData.expenses || [];
    currentUserData.expenses.push({
      description,
      amount: splitAmount,
      date,
      paidBy: currentUser,
      sharedWith: emails.filter((email) => email !== currentUser), // Exclude current user
    });
  }

  localStorage.setItem("users", JSON.stringify(users));

  alert("Expense added successfully!");
  closeAddExpenseModal();
  document.getElementById("expense-emails").value = "";
  document.getElementById("expense-description").value = "";
  document.getElementById("expense-amount").value = "";
  document.getElementById("expense-date").value = "";

  // Update the dashboard after saving an expense
  updateDashboard();
}

// Update the dashboard display with current balances and detailed expenses
function updateDashboard() {
  const currentUser = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((user) => user.email === currentUser);

  let totalBalance = 0;
  let youOwe = 0;
  let youAreOwed = 0;

  const oweList = document.getElementById("you-owe-list");
  const areOwedList = document.getElementById("you-are-owed-list");
  oweList.innerHTML = "";
  areOwedList.innerHTML = "";

  if (user && user.expenses) {
    user.expenses.forEach((expense) => {
      const amount = parseFloat(expense.amount);

      if (expense.paidBy === currentUser) {
        // This means the current user paid the expense, so others owe them
        youAreOwed += amount;
        totalBalance += amount;

        const listItem = document.createElement("li");
        listItem.textContent = `${expense.sharedWith.join(
          ", "
        )} owes you $${amount} for "${expense.description}"`;
        areOwedList.appendChild(listItem);
      } else {
        // This means the current user owes this expense
        youOwe += amount;
        totalBalance -= amount;

        const listItem = document.createElement("li");
        listItem.textContent = `You owe ${expense.paidBy} $${amount} for "${expense.description}"`;
        oweList.appendChild(listItem);
      }
    });
  }

  document.getElementById(
    "total-balance"
  ).textContent = `$${totalBalance.toFixed(2)}`;
  document.getElementById("you-owe").textContent = `$${youOwe.toFixed(2)}`;
  document.getElementById("you-are-owed").textContent = `$${youAreOwed.toFixed(
    2
  )}`;
}

// Function to reset all expenses for testing
function resetExpenses() {
  if (
    confirm(
      "Are you sure you want to reset all expenses? This action cannot be undone."
    )
  ) {
    // Clear expenses for all users in localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.forEach((user) => (user.expenses = [])); // Clear expenses for each user
    localStorage.setItem("users", JSON.stringify(users));

    // Update the dashboard to reflect the reset
    updateDashboard();

    alert("All expenses have been reset.");
  }
}

// Logout function
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// Call updateDashboard and setUsernameInHeader when the page loads to populate the data
window.onload = function () {
  updateDashboard();
  setUsernameInHeader(); // Set the username in the header
};
