// Issue Book functionality
let availableBooks = []
let activeMembers = []

document.addEventListener("DOMContentLoaded", () => {
  loadAvailableBooks()
  loadActiveMembers()
  setDefaultDates()
  initializeSearchFilters()
  initializeForm()
  loadRecentIssues()
})

function loadAvailableBooks() {
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  availableBooks = books.filter((book) => book.status === "Available")
  populateBookDropdown(availableBooks)
}

function loadActiveMembers() {
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")
  activeMembers = members.filter((member) => member.status === "Active")
  populateMemberDropdown(activeMembers)
}

function populateBookDropdown(books) {
  const select = document.getElementById("bookSelect")
  if (!select) return

  select.innerHTML = '<option value="">Choose a book...</option>'
  books.forEach((book) => {
    select.innerHTML += `<option value="${book.id}" data-book='${JSON.stringify(book)}'>${book.title} - ${book.author}</option>`
  })
}

function populateMemberDropdown(members) {
  const select = document.getElementById("memberSelect")
  if (!select) return

  select.innerHTML = '<option value="">Choose a member...</option>'
  members.forEach((member) => {
    select.innerHTML += `<option value="${member.id}" data-member='${JSON.stringify(member)}'>${member.name} (${member.id})</option>`
  })
}

function setDefaultDates() {
  const today = new Date().toISOString().split("T")[0]
  const twoWeeksLater = new Date()
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
  const dueDate = twoWeeksLater.toISOString().split("T")[0]

  const issueDateInput = document.getElementById("issueDate")
  const dueDateInput = document.getElementById("dueDate")

  if (issueDateInput) issueDateInput.value = today
  if (dueDateInput) dueDateInput.value = dueDate
}

function initializeSearchFilters() {
  const bookSearch = document.getElementById("bookSearch")
  const memberSearch = document.getElementById("memberSearch")

  if (bookSearch) {
    bookSearch.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      const filteredBooks = availableBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm) ||
          book.isbn.toLowerCase().includes(searchTerm),
      )
      populateBookDropdown(filteredBooks)
    })
  }

  if (memberSearch) {
    memberSearch.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      const filteredMembers = activeMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm) ||
          member.email.toLowerCase().includes(searchTerm) ||
          member.id.toLowerCase().includes(searchTerm),
      )
      populateMemberDropdown(filteredMembers)
    })
  }
}

function initializeForm() {
  const bookSelect = document.getElementById("bookSelect")
  const memberSelect = document.getElementById("memberSelect")
  const issueForm = document.getElementById("issueBookForm")

  if (bookSelect) {
    bookSelect.addEventListener("change", (e) => {
      const selectedOption = e.target.selectedOptions[0]
      if (selectedOption && selectedOption.dataset.book) {
        const book = JSON.parse(selectedOption.dataset.book)
        displaySelectedBook(book)
      } else {
        hideSelectedBook()
      }
    })
  }

  if (memberSelect) {
    memberSelect.addEventListener("change", (e) => {
      const selectedOption = e.target.selectedOptions[0]
      if (selectedOption && selectedOption.dataset.member) {
        const member = JSON.parse(selectedOption.dataset.member)
        displaySelectedMember(member)
      } else {
        hideSelectedMember()
      }
    })
  }

  if (issueForm) {
    issueForm.addEventListener("submit", handleIssueSubmit)
  }
}

function displaySelectedBook(book) {
  const bookInfo = document.getElementById("selectedBookInfo")
  const bookTitle = document.getElementById("bookTitle")
  const bookAuthor = document.getElementById("bookAuthor")
  const bookCategory = document.getElementById("bookCategory")
  const bookISBN = document.getElementById("bookISBN")

  if (bookInfo && bookTitle && bookAuthor && bookCategory && bookISBN) {
    bookTitle.textContent = book.title
    bookAuthor.textContent = book.author
    bookCategory.textContent = book.category
    bookISBN.textContent = book.isbn || "N/A"
    bookInfo.style.display = "block"
  }
}

function hideSelectedBook() {
  const bookInfo = document.getElementById("selectedBookInfo")
  if (bookInfo) {
    bookInfo.style.display = "none"
  }
}

function displaySelectedMember(member) {
  const memberInfo = document.getElementById("selectedMemberInfo")
  const memberName = document.getElementById("memberName")
  const memberEmail = document.getElementById("memberEmail")
  const memberType = document.getElementById("memberType")
  const memberStatus = document.getElementById("memberStatus")
  const memberBooksIssued = document.getElementById("memberBooksIssued")

  if (memberInfo && memberName && memberEmail && memberType && memberStatus) {
    memberName.textContent = member.name
    memberEmail.textContent = member.email
    memberType.textContent = member.type
    memberStatus.textContent = member.status

    // Calculate books issued to this member
    const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
    const issuedCount = transactions.filter((t) => t.memberId === member.id && t.status === "Issued").length

    if (memberBooksIssued) {
      memberBooksIssued.textContent = issuedCount
    }

    memberInfo.style.display = "block"
  }
}

function hideSelectedMember() {
  const memberInfo = document.getElementById("selectedMemberInfo")
  if (memberInfo) {
    memberInfo.style.display = "none"
  }
}

function updateDueDate() {
  const issuePeriod = document.getElementById("issuePeriod").value
  const issueDate = document.getElementById("issueDate").value
  const dueDateInput = document.getElementById("dueDate")

  if (issuePeriod !== "custom" && issueDate && dueDateInput) {
    const issueDateTime = new Date(issueDate)
    const dueDateTime = new Date(issueDateTime)
    dueDateTime.setDate(dueDateTime.getDate() + Number.parseInt(issuePeriod))

    dueDateInput.value = dueDateTime.toISOString().split("T")[0]
  }
}

function handleIssueSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const bookId = formData.get("bookId")
  const memberId = formData.get("memberId")
  const issueDate = formData.get("issueDate")
  const dueDate = formData.get("dueDate")
  const priority = formData.get("priority")
  const notes = formData.get("notes")

  // Validate form
  if (!bookId || !memberId || !issueDate || !dueDate) {
    showAlert("Please fill in all required fields!", "error")
    return
  }

  // Get book and member details
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")

  const book = books.find((b) => b.id === bookId)
  const member = members.find((m) => m.id === memberId)

  if (!book || !member) {
    showAlert("Invalid book or member selection!", "error")
    return
  }

  if (book.status !== "Available") {
    showAlert("Selected book is not available for issue!", "error")
    return
  }

  // Create transaction
  const transaction = {
    id: generateTransactionId(),
    bookId: bookId,
    bookTitle: book.title,
    memberId: memberId,
    memberName: member.name,
    issueDate: issueDate,
    dueDate: dueDate,
    returnDate: null,
    status: "Issued",
    priority: priority || "Normal",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  }

  // Update book status
  book.status = "Issued"
  localStorage.setItem("library_books", JSON.stringify(books))

  // Add transaction
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  transactions.push(transaction)
  localStorage.setItem("library_transactions", JSON.stringify(transactions))

  showAlert("Book issued successfully!", "success")

  // Reset form and reload data
  setTimeout(() => {
    resetForm()
    loadAvailableBooks()
    loadRecentIssues()
  }, 1500)
}

function generateTransactionId() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `T${timestamp}${random}`
}

function resetForm() {
  const form = document.getElementById("issueBookForm")
  if (form) {
    form.reset()
    setDefaultDates()
    hideSelectedBook()
    hideSelectedMember()
    loadAvailableBooks()
    loadActiveMembers()
  }
}

function loadRecentIssues() {
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const recentIssues = transactions
    .filter((t) => t.status === "Issued")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const container = document.getElementById("recentIssues")
  if (!container) return

  if (recentIssues.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No recent issues</p>'
    return
  }

  container.innerHTML = recentIssues
    .map(
      (transaction) => `
        <div class="recent-item">
            <div class="item-info">
                <div class="item-title">${transaction.bookTitle}</div>
                <div class="item-subtitle">${transaction.memberName}</div>
                <div class="item-time">Issued: ${formatDate(transaction.issueDate)}</div>
            </div>
            <span class="status-badge issued">Issued</span>
        </div>
    `,
    )
    .join("")
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
  const alertContainer = document.getElementById("alertContainer")
  if (!alertContainer) return

  // Remove existing alerts
  alertContainer.innerHTML = ""

  // Create new alert
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"}"></i>
            <span>${message}</span>
        </div>
    `

  alertContainer.appendChild(alert)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove()
    }
  }, 5000)
}

// Initialize issue period change handler
document.addEventListener("DOMContentLoaded", () => {
  const issuePeriodSelect = document.getElementById("issuePeriod")
  if (issuePeriodSelect) {
    issuePeriodSelect.addEventListener("change", updateDueDate)
  }

  const issueDateInput = document.getElementById("issueDate")
  if (issueDateInput) {
    issueDateInput.addEventListener("change", updateDueDate)
  }
})
