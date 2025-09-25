// Main JavaScript functionality
console.log("🚀 LibrariPro Main.js Loading...")

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded - Main.js")

  // Mobile navigation toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })
  }

  // Sidebar toggle for dashboard
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  const sidebar = document.querySelector(".sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && !sidebarToggle?.contains(e.target)) {
      sidebar.classList.remove("active")
    }
  })

  // Initialize data and check auth
  initializeData()

  // Only check auth for dashboard pages, not for public pages
  const currentPage = window.location.pathname.split("/").pop()
  const publicPages = ["index.html", "login.html", "register.html", ""]

  if (!publicPages.includes(currentPage)) {
    checkAuth()
  }
})

// Initialize sample data
function initializeData() {
  console.log("📊 Initializing sample data...")

  // Initialize books if not exists
  if (!localStorage.getItem("library_books")) {
    const sampleBooks = [
      {
        id: "B001",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        category: "Fiction",
        publisher: "J.B. Lippincott & Co.",
        year: 1960,
        status: "Available",
        description: "A gripping tale of racial injustice and childhood innocence.",
        addedDate: "2024-01-15",
      },
      {
        id: "B002",
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        category: "Fiction",
        publisher: "Secker & Warburg",
        year: 1949,
        status: "Issued",
        description: "A dystopian social science fiction novel.",
        addedDate: "2024-01-16",
      },
      {
        id: "B003",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        category: "Fiction",
        publisher: "Charles Scribner's Sons",
        year: 1925,
        status: "Available",
        description: "A classic American novel set in the Jazz Age.",
        addedDate: "2024-01-17",
      },
      {
        id: "B004",
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "978-0-553-38016-3",
        category: "Science",
        publisher: "Bantam Books",
        year: 1988,
        status: "Available",
        description: "A landmark volume in science writing.",
        addedDate: "2024-01-18",
      },
      {
        id: "B005",
        title: "The Art of War",
        author: "Sun Tzu",
        isbn: "978-1-59030-963-7",
        category: "History",
        publisher: "Various",
        year: -500,
        status: "Issued",
        description: "Ancient Chinese military treatise.",
        addedDate: "2024-01-19",
      },
    ]
    localStorage.setItem("library_books", JSON.stringify(sampleBooks))
    console.log("📚 Sample books initialized")
  }

  // Initialize members if not exists
  if (!localStorage.getItem("library_members")) {
    const sampleMembers = [
      {
        id: "M001",
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0101",
        type: "Student",
        status: "Active",
        address: "123 Main St, City, State 12345",
        joinDate: "2024-01-10",
      },
      {
        id: "M002",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1-555-0102",
        type: "Faculty",
        status: "Active",
        address: "456 Oak Ave, City, State 12345",
        joinDate: "2024-01-12",
      },
      {
        id: "M003",
        name: "Mike Davis",
        email: "mike.davis@email.com",
        phone: "+1-555-0103",
        type: "Staff",
        status: "Active",
        address: "789 Pine St, City, State 12345",
        joinDate: "2024-01-14",
      },
      {
        id: "M004",
        name: "Emily Brown",
        email: "emily.brown@email.com",
        phone: "+1-555-0104",
        type: "Public",
        status: "Active",
        address: "321 Elm St, City, State 12345",
        joinDate: "2024-01-16",
      },
      {
        id: "M005",
        name: "David Wilson",
        email: "david.wilson@email.com",
        phone: "+1-555-0105",
        type: "Student",
        status: "Inactive",
        address: "654 Maple Ave, City, State 12345",
        joinDate: "2024-01-18",
      },
    ]
    localStorage.setItem("library_members", JSON.stringify(sampleMembers))
    console.log("👥 Sample members initialized")
  }

  // Initialize transactions if not exists
  if (!localStorage.getItem("library_transactions")) {
    const sampleTransactions = [
      {
        id: "T001",
        bookId: "B002",
        bookTitle: "1984",
        memberId: "M001",
        memberName: "John Smith",
        issueDate: "2024-01-20",
        dueDate: "2024-02-03",
        returnDate: null,
        status: "Issued",
        notes: "Regular issue",
      },
      {
        id: "T002",
        bookId: "B005",
        bookTitle: "The Art of War",
        memberId: "M002",
        memberName: "Sarah Johnson",
        issueDate: "2024-01-18",
        dueDate: "2024-02-01",
        returnDate: null,
        status: "Overdue",
        notes: "Faculty loan",
      },
      {
        id: "T003",
        bookId: "B001",
        bookTitle: "To Kill a Mockingbird",
        memberId: "M003",
        memberName: "Mike Davis",
        issueDate: "2024-01-15",
        dueDate: "2024-01-29",
        returnDate: "2024-01-28",
        status: "Returned",
        notes: "Returned in good condition",
      },
      {
        id: "T004",
        bookId: "B003",
        bookTitle: "The Great Gatsby",
        memberId: "M004",
        memberName: "Emily Brown",
        issueDate: "2024-01-22",
        dueDate: "2024-02-05",
        returnDate: "2024-02-04",
        status: "Returned",
        notes: "Public member loan",
      },
    ]
    localStorage.setItem("library_transactions", JSON.stringify(sampleTransactions))
    console.log("📋 Sample transactions initialized")
  }

  console.log("✅ Data initialization completed")
}

// Check authentication
function checkAuth() {
  const currentPage = window.location.pathname.split("/").pop()
  console.log("🔐 Checking authentication for:", currentPage)

  const session = localStorage.getItem("library_session")

  if (!session) {
    console.log("❌ No session found, redirecting to login")
    showAlert("Please login first to access the dashboard!", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
    return false
  }

  try {
    const sessionData = JSON.parse(session)
    if (!sessionData.isLoggedIn) {
      console.log("❌ User not logged in, redirecting")
      showAlert("Please login first to access the dashboard!", "error")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 2000)
      return false
    }
    console.log("✅ User authenticated successfully:", sessionData.email)
    return true
  } catch (error) {
    console.error("❌ Error parsing session data:", error)
    localStorage.removeItem("library_session")
    showAlert("Session expired. Please login again!", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
    return false
  }
}

// Utility functions
function generateId(prefix) {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

function formatDate(dateString) {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function showAlert(message, type = "success") {
  console.log(`🔔 Alert: ${message} (${type})`)

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

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    console.log("🚪 User logging out...")
    localStorage.removeItem("library_session")
    showAlert("Logged out successfully!", "success")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
  }
}

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`
document.head.appendChild(style)

console.log("✅ Main.js loaded successfully")
