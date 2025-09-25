// Dashboard functionality
console.log("📊 Dashboard.js Loading...")

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded - Dashboard.js")

  // Check if user is authenticated
  const session = localStorage.getItem("library_session")
  if (!session) {
    console.log("❌ No session found on dashboard")
    showAlert("Please login first!", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
    return
  }

  try {
    const sessionData = JSON.parse(session)
    if (!sessionData.isLoggedIn) {
      console.log("❌ User not logged in")
      showAlert("Please login first!", "error")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 2000)
      return
    }

    console.log("✅ User authenticated, loading dashboard data")

    // Load dashboard data
    loadDashboardData()
    loadRecentTransactions()
    loadPopularBooks()
    loadOverdueBooks()

    // Update user info in sidebar
    updateUserInfo(sessionData)
  } catch (error) {
    console.error("❌ Error parsing session:", error)
    localStorage.removeItem("library_session")
    showAlert("Session expired. Please login again!", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
  }
})

function updateUserInfo(sessionData) {
  const userName = document.querySelector(".user-name")
  const userRole = document.querySelector(".user-role")

  if (userName) {
    userName.textContent = sessionData.name || "User"
  }

  if (userRole) {
    userRole.textContent = sessionData.role || "Member"
  }
}

function loadDashboardData() {
  console.log("📊 Loading dashboard statistics...")

  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")

  // Update statistics with animation
  animateCounter("totalBooks", books.length)
  animateCounter("totalMembers", members.filter((m) => m.status === "Active").length)
  animateCounter("issuedBooks", transactions.filter((t) => t.status === "Issued").length)
  animateCounter("overdueBooks", transactions.filter((t) => t.status === "Overdue").length)

  console.log("✅ Dashboard statistics loaded")
}

function animateCounter(elementId, targetValue) {
  const element = document.getElementById(elementId)
  if (!element) return

  let currentValue = 0
  const increment = targetValue / 50
  const timer = setInterval(() => {
    currentValue += increment
    if (currentValue >= targetValue) {
      currentValue = targetValue
      clearInterval(timer)
    }
    element.textContent = Math.floor(currentValue)
  }, 30)
}

function loadRecentTransactions() {
  console.log("📋 Loading recent transactions...")

  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const recentTransactions = transactions.slice(-5).reverse()

  const container = document.getElementById("recentTransactions")
  if (!container) {
    console.log("❌ Recent transactions container not found")
    return
  }

  if (recentTransactions.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No recent transactions</p></div>'
    return
  }

  container.innerHTML = recentTransactions
    .map(
      (transaction) => `
        <div class="transaction-item">
            <div class="item-info">
                <div class="item-title">${transaction.bookTitle}</div>
                <div class="item-subtitle">${transaction.memberName} • ${formatDate(transaction.issueDate)}</div>
            </div>
            <span class="item-status status-${transaction.status.toLowerCase()}">${transaction.status}</span>
        </div>
    `,
    )
    .join("")

  console.log("✅ Recent transactions loaded")
}

function loadPopularBooks() {
  console.log("📚 Loading popular books...")

  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")

  // Count book popularity based on transaction history
  const bookPopularity = {}
  transactions.forEach((transaction) => {
    bookPopularity[transaction.bookId] = (bookPopularity[transaction.bookId] || 0) + 1
  })

  // Sort books by popularity
  const popularBooks = books
    .map((book) => ({
      ...book,
      popularity: bookPopularity[book.id] || 0,
    }))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5)

  const container = document.getElementById("popularBooks")
  if (!container) {
    console.log("❌ Popular books container not found")
    return
  }

  if (popularBooks.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No popular books data</p></div>'
    return
  }

  container.innerHTML = popularBooks
    .map(
      (book) => `
        <div class="book-item">
            <div class="item-info">
                <div class="item-title">${book.title}</div>
                <div class="item-subtitle">${book.author} • ${book.popularity} issues</div>
            </div>
            <span class="item-status status-${book.status.toLowerCase()}">${book.status}</span>
        </div>
    `,
    )
    .join("")

  console.log("✅ Popular books loaded")
}

function loadOverdueBooks() {
  console.log("⚠️ Loading overdue books...")

  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const overdueTransactions = transactions.filter((t) => t.status === "Overdue").slice(0, 5)

  const container = document.getElementById("overdueList")
  if (!container) {
    console.log("❌ Overdue list container not found")
    return
  }

  if (overdueTransactions.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No overdue books</p></div>'
    return
  }

  container.innerHTML = overdueTransactions
    .map(
      (transaction) => `
        <div class="overdue-item">
            <div class="item-info">
                <div class="item-title">${transaction.bookTitle}</div>
                <div class="item-subtitle">${transaction.memberName} • Due: ${formatDate(transaction.dueDate)}</div>
            </div>
            <span class="item-status status-overdue">Overdue</span>
        </div>
    `,
    )
    .join("")

  console.log("✅ Overdue books loaded")
}

function formatDate(date) {
  if (!date) return "-"
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

function showAlert(message, type = "success") {
  console.log(`🔔 Dashboard Alert: ${message} (${type})`)

  // Remove existing alerts
  const existingAlert = document.querySelector(".alert")
  if (existingAlert) {
    existingAlert.remove()
  }

  // Create new alert
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 400px;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    ${
      type === "success"
        ? "background: #d4edda; color: #155724; border: 1px solid #c3e6cb;"
        : "background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;"
    }
  `

  alert.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"}"></i>
    <span>${message}</span>
  `

  document.body.appendChild(alert)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.style.animation = "slideOut 0.3s ease"
      setTimeout(() => alert.remove(), 300)
    }
  }, 5000)
}

console.log("✅ Dashboard.js loaded successfully")
