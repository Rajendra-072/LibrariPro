// Transactions management functionality
let currentPage = 1
const itemsPerPage = 10
let filteredTransactions = []

function formatDate(date) {
  if (!date) return ""
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

function showAlert(message, type) {
  const alertContainer = document.getElementById("alertContainer")
  if (!alertContainer) return

  alertContainer.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `

  setTimeout(() => {
    alertContainer.innerHTML = ""
  }, 3000)
}

function generateId(prefix) {
  return `${prefix}${Math.floor(Math.random() * 1000000)}`
}

document.addEventListener("DOMContentLoaded", () => {
  loadTransactions()
  initializeFilters()
  initializeForms()
  populateDropdowns()
  setDefaultDates()
})

function loadTransactions() {
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  filteredTransactions = [...transactions]
  displayTransactions()
  updatePagination()
}

function displayTransactions() {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const transactionsToShow = filteredTransactions.slice(startIndex, endIndex)

  const tbody = document.getElementById("transactionsTableBody")
  if (!tbody) return

  if (transactionsToShow.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-exchange-alt"></i>
                        <h3>No transactions found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = transactionsToShow
    .map(
      (transaction) => `
        <tr>
            <td><span class="transaction-id">${transaction.id}</span></td>
            <td><span class="book-title">${transaction.bookTitle}</span></td>
            <td><span class="member-name">${transaction.memberName}</span></td>
            <td><span class="date-cell">${formatDate(transaction.issueDate)}</span></td>
            <td><span class="date-cell">${formatDate(transaction.dueDate)}</span></td>
            <td><span class="date-cell">${formatDate(transaction.returnDate)}</span></td>
            <td><span class="transaction-status status-${transaction.status.toLowerCase()}">${transaction.status}</span></td>
            <td>
                <div class="transaction-actions">
                    ${
                      transaction.status === "Issued"
                        ? `
                        <button class="action-btn btn-return" onclick="returnBookQuick('${transaction.id}')" title="Return Book">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="action-btn btn-renew" onclick="renewBook('${transaction.id}')" title="Renew Book">
                            <i class="fas fa-refresh"></i>
                        </button>
                    `
                        : ""
                    }
                    <button class="action-btn btn-view" onclick="viewTransaction('${transaction.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function initializeFilters() {
  const searchInput = document.getElementById("transactionSearch")
  const statusFilter = document.getElementById("statusFilter")
  const dateFilter = document.getElementById("dateFilter")

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters)
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", applyFilters)
  }
}

function applyFilters() {
  const searchTerm = document.getElementById("transactionSearch").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value
  const dateFilter = document.getElementById("dateFilter").value

  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")

  filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchTerm ||
      transaction.bookTitle.toLowerCase().includes(searchTerm) ||
      transaction.memberName.toLowerCase().includes(searchTerm) ||
      transaction.id.toLowerCase().includes(searchTerm)

    const matchesStatus = !statusFilter || transaction.status === statusFilter
    const matchesDate = !dateFilter || transaction.issueDate === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  currentPage = 1
  displayTransactions()
  updatePagination()
}

function updatePagination() {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginationContainer = document.getElementById("transactionsPagination")

  if (!paginationContainer) return

  if (totalPages <= 1) {
    paginationContainer.innerHTML = ""
    return
  }

  let paginationHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
            <button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ""}>
                ${i}
            </button>
        `
  }

  paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `

  paginationContainer.innerHTML = paginationHTML
}

function changePage(page) {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  if (page < 1 || page > totalPages) return

  currentPage = page
  displayTransactions()
  updatePagination()
}

function initializeForms() {
  const issueForm = document.getElementById("issueBookForm")
  const returnForm = document.getElementById("returnBookForm")

  if (issueForm) {
    issueForm.addEventListener("submit", handleIssueBook)
  }

  if (returnForm) {
    returnForm.addEventListener("submit", handleReturnBook)
  }
}

function populateDropdowns() {
  populateBookDropdown()
  populateMemberDropdown()
  populateTransactionDropdown()
}

function populateBookDropdown() {
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const availableBooks = books.filter((book) => book.status === "Available")

  const select = document.getElementById("issueBookSelect")
  if (!select) return

  select.innerHTML = '<option value="">Choose a book...</option>'
  availableBooks.forEach((book) => {
    select.innerHTML += `<option value="${book.id}">${book.title} - ${book.author}</option>`
  })
}

function populateMemberDropdown() {
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")
  const activeMembers = members.filter((member) => member.status === "Active")

  const select = document.getElementById("issueMemberSelect")
  if (!select) return

  select.innerHTML = '<option value="">Choose a member...</option>'
  activeMembers.forEach((member) => {
    select.innerHTML += `<option value="${member.id}">${member.name} (${member.id})</option>`
  })
}

function populateTransactionDropdown() {
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const issuedTransactions = transactions.filter((t) => t.status === "Issued")

  const select = document.getElementById("returnTransactionSelect")
  if (!select) return

  select.innerHTML = '<option value="">Choose a transaction...</option>'
  issuedTransactions.forEach((transaction) => {
    select.innerHTML += `<option value="${transaction.id}">${transaction.bookTitle} - ${transaction.memberName}</option>`
  })
}

function setDefaultDates() {
  const today = new Date().toISOString().split("T")[0]
  const twoWeeksLater = new Date()
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
  const dueDate = twoWeeksLater.toISOString().split("T")[0]

  const issueDateInput = document.getElementById("issueDate")
  const dueDateInput = document.getElementById("dueDate")
  const returnDateInput = document.getElementById("returnDate")

  if (issueDateInput) issueDateInput.value = today
  if (dueDateInput) dueDateInput.value = dueDate
  if (returnDateInput) returnDateInput.value = today
}

function openIssueBookModal() {
  populateBookDropdown()
  populateMemberDropdown()
  setDefaultDates()
  document.getElementById("issueBookModal").style.display = "block"
}

function closeIssueBookModal() {
  document.getElementById("issueBookModal").style.display = "none"
}

function openReturnBookModal() {
  populateTransactionDropdown()
  setDefaultDates()
  document.getElementById("returnBookModal").style.display = "block"
}

function closeReturnBookModal() {
  document.getElementById("returnBookModal").style.display = "none"
}

function handleIssueBook(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const bookId = formData.get("bookId")
  const memberId = formData.get("memberId")
  const issueDate = formData.get("issueDate")
  const dueDate = formData.get("dueDate")
  const notes = formData.get("notes")

  // Get book and member details
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")

  const book = books.find((b) => b.id === bookId)
  const member = members.find((m) => m.id === memberId)

  if (!book || !member) {
    showAlert("Invalid book or member selection!", "error")
    return
  }

  // Create transaction
  const transaction = {
    id: generateId("T"),
    bookId: bookId,
    bookTitle: book.title,
    memberId: memberId,
    memberName: member.name,
    issueDate: issueDate,
    dueDate: dueDate,
    returnDate: null,
    status: "Issued",
    notes: notes || "",
  }

  // Update book status
  book.status = "Issued"
  localStorage.setItem("library_books", JSON.stringify(books))

  // Add transaction
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  transactions.push(transaction)
  localStorage.setItem("library_transactions", JSON.stringify(transactions))

  showAlert("Book issued successfully!", "success")
  closeIssueBookModal()
  loadTransactions()
}

function handleReturnBook(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const transactionId = formData.get("transactionId")
  const returnDate = formData.get("returnDate")
  const condition = formData.get("condition")
  const notes = formData.get("notes")

  // Update transaction
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const transactionIndex = transactions.findIndex((t) => t.id === transactionId)

  if (transactionIndex === -1) {
    showAlert("Transaction not found!", "error")
    return
  }

  const transaction = transactions[transactionIndex]
  transaction.returnDate = returnDate
  transaction.status = "Returned"
  transaction.notes = (transaction.notes || "") + (notes ? ` | Return: ${notes}` : "")

  // Update book status
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const book = books.find((b) => b.id === transaction.bookId)
  if (book) {
    book.status = "Available"
  }

  localStorage.setItem("library_transactions", JSON.stringify(transactions))
  localStorage.setItem("library_books", JSON.stringify(books))

  showAlert("Book returned successfully!", "success")
  closeReturnBookModal()
  loadTransactions()
}

function returnBookQuick(transactionId) {
  if (!confirm("Are you sure you want to return this book?")) return

  const today = new Date().toISOString().split("T")[0]

  // Update transaction
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const transactionIndex = transactions.findIndex((t) => t.id === transactionId)

  if (transactionIndex === -1) {
    showAlert("Transaction not found!", "error")
    return
  }

  const transaction = transactions[transactionIndex]
  transaction.returnDate = today
  transaction.status = "Returned"

  // Update book status
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const book = books.find((b) => b.id === transaction.bookId)
  if (book) {
    book.status = "Available"
  }

  localStorage.setItem("library_transactions", JSON.stringify(transactions))
  localStorage.setItem("library_books", JSON.stringify(books))

  showAlert("Book returned successfully!", "success")
  loadTransactions()
}

function renewBook(transactionId) {
  if (!confirm("Are you sure you want to renew this book for 2 more weeks?")) return

  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const transaction = transactions.find((t) => t.id === transactionId)

  if (!transaction) {
    showAlert("Transaction not found!", "error")
    return
  }

  // Extend due date by 2 weeks
  const currentDueDate = new Date(transaction.dueDate)
  currentDueDate.setDate(currentDueDate.getDate() + 14)
  transaction.dueDate = currentDueDate.toISOString().split("T")[0]

  localStorage.setItem("library_transactions", JSON.stringify(transactions))

  showAlert("Book renewed successfully!", "success")
  loadTransactions()
}

function viewTransaction(transactionId) {
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const transaction = transactions.find((t) => t.id === transactionId)

  if (!transaction) return

  alert(`Transaction Details:
    
Transaction ID: ${transaction.id}
Book: ${transaction.bookTitle}
Member: ${transaction.memberName}
Issue Date: ${formatDate(transaction.issueDate)}
Due Date: ${formatDate(transaction.dueDate)}
Return Date: ${formatDate(transaction.returnDate)}
Status: ${transaction.status}
Notes: ${transaction.notes || "N/A"}`)
}

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  const issueModal = document.getElementById("issueBookModal")
  const returnModal = document.getElementById("returnBookModal")

  if (e.target === issueModal) {
    closeIssueBookModal()
  }

  if (e.target === returnModal) {
    closeReturnBookModal()
  }
})
