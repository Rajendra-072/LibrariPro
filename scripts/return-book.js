// Return Book functionality
let issuedTransactions = []
let currentTab = "transaction"

document.addEventListener("DOMContentLoaded", () => {
  loadIssuedTransactions()
  setDefaultReturnDate()
  initializeReturnForm()
  loadRecentReturns()
  initializeSearch()
  initializeBarcode()
})

function loadIssuedTransactions() {
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  issuedTransactions = transactions.filter((t) => t.status === "Issued" || t.status === "Overdue")
  populateTransactionDropdown(issuedTransactions)
}

function populateTransactionDropdown(transactions) {
  const select = document.getElementById("transactionSelect")
  if (!select) return

  select.innerHTML = '<option value="">Choose a transaction...</option>'
  transactions.forEach((transaction) => {
    const daysOverdue = calculateDaysOverdue(transaction.dueDate)
    const overdueText = daysOverdue > 0 ? ` (${daysOverdue} days overdue)` : ""

    select.innerHTML += `<option value="${transaction.id}" data-transaction='${JSON.stringify(transaction)}'>${transaction.bookTitle} - ${transaction.memberName}${overdueText}</option>`
  })
}

function setDefaultReturnDate() {
  const today = new Date().toISOString().split("T")[0]
  const returnDateInput = document.getElementById("returnDate")

  if (returnDateInput) {
    returnDateInput.value = today
  }
}

function initializeReturnForm() {
  const transactionSelect = document.getElementById("transactionSelect")
  const transactionSearch = document.getElementById("transactionSearch")
  const returnForm = document.getElementById("returnByTransactionForm")

  if (transactionSelect) {
    transactionSelect.addEventListener("change", (e) => {
      const selectedOption = e.target.selectedOptions[0]
      if (selectedOption && selectedOption.dataset.transaction) {
        const transaction = JSON.parse(selectedOption.dataset.transaction)
        displaySelectedTransaction(transaction)
      } else {
        hideSelectedTransaction()
      }
    })
  }

  if (transactionSearch) {
    transactionSearch.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      const filteredTransactions = issuedTransactions.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(searchTerm) ||
          transaction.bookTitle.toLowerCase().includes(searchTerm) ||
          transaction.memberName.toLowerCase().includes(searchTerm),
      )
      populateTransactionDropdown(filteredTransactions)
    })
  }

  if (returnForm) {
    returnForm.addEventListener("submit", handleReturnSubmit)
  }
}

function displaySelectedTransaction(transaction) {
  const transactionInfo = document.getElementById("selectedTransactionInfo")
  const bookTitle = document.getElementById("transactionBookTitle")
  const memberName = document.getElementById("transactionMemberName")
  const issueDate = document.getElementById("transactionIssueDate")
  const dueDate = document.getElementById("transactionDueDate")
  const status = document.getElementById("transactionStatus")
  const daysInfo = document.getElementById("daysInfo")
  const daysNumber = document.getElementById("daysNumber")
  const daysLabel = document.getElementById("daysLabel")

  if (transactionInfo && bookTitle && memberName && issueDate && dueDate && status) {
    bookTitle.textContent = transaction.bookTitle
    memberName.textContent = transaction.memberName
    issueDate.textContent = formatDate(transaction.issueDate)
    dueDate.textContent = formatDate(transaction.dueDate)

    // Calculate days and status
    const today = new Date()
    const dueDateObj = new Date(transaction.dueDate)
    const daysDiff = Math.ceil((today - dueDateObj) / (1000 * 60 * 60 * 24))

    if (daysDiff > 0) {
      // Overdue
      status.textContent = "Overdue"
      status.className = "status-badge overdue"
      daysNumber.textContent = daysDiff
      daysLabel.textContent = "Days Overdue"
      daysInfo.className = "days-count overdue"
      showFineCalculation(daysDiff)
    } else if (daysDiff > -3) {
      // Due soon
      status.textContent = "Due Soon"
      status.className = "status-badge due-soon"
      daysNumber.textContent = Math.abs(daysDiff)
      daysLabel.textContent = "Days Left"
      daysInfo.className = "days-count due-soon"
      hideFineCalculation()
    } else {
      // Normal
      status.textContent = "Issued"
      status.className = "status-badge issued"
      daysNumber.textContent = Math.abs(daysDiff)
      daysLabel.textContent = "Days Left"
      daysInfo.className = "days-count"
      hideFineCalculation()
    }

    transactionInfo.style.display = "block"
  }
}

function hideSelectedTransaction() {
  const transactionInfo = document.getElementById("selectedTransactionInfo")
  if (transactionInfo) {
    transactionInfo.style.display = "none"
  }
  hideFineCalculation()
}

function showFineCalculation(overdueDays) {
  const fineSection = document.getElementById("fineCalculation")
  const overdueDaysSpan = document.getElementById("overdueDays")
  const totalFineSpan = document.getElementById("totalFine")

  if (fineSection && overdueDaysSpan && totalFineSpan) {
    const finePerDay = 1.0
    const totalFine = overdueDays * finePerDay

    overdueDaysSpan.textContent = overdueDays
    totalFineSpan.textContent = `$${totalFine.toFixed(2)}`

    fineSection.style.display = "block"
  }
}

function hideFineCalculation() {
  const fineSection = document.getElementById("fineCalculation")
  if (fineSection) {
    fineSection.style.display = "none"
  }
}

function calculateDaysOverdue(dueDate) {
  const today = new Date()
  const dueDateObj = new Date(dueDate)
  const daysDiff = Math.ceil((today - dueDateObj) / (1000 * 60 * 60 * 24))
  return Math.max(0, daysDiff)
}

function handleReturnSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const transactionId = formData.get("transactionId")
  const returnDate = formData.get("returnDate")
  const condition = formData.get("condition")
  const notes = formData.get("notes")
  const fineWaived = document.getElementById("fineWaived").checked
  const finePaid = document.getElementById("finePaid").checked

  if (!transactionId || !returnDate) {
    showAlert("Please select a transaction and return date!", "error")
    return
  }

  // Update transaction
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const transactionIndex = transactions.findIndex((t) => t.id === transactionId)

  if (transactionIndex === -1) {
    showAlert("Transaction not found!", "error")
    return
  }

  const transaction = transactions[transactionIndex]

  // Calculate fine if overdue
  const overdueDays = calculateDaysOverdue(transaction.dueDate)
  let fineAmount = 0
  if (overdueDays > 0) {
    fineAmount = overdueDays * 1.0 // $1 per day
  }

  // Update transaction
  transaction.returnDate = returnDate
  transaction.status = "Returned"
  transaction.condition = condition
  transaction.notes = (transaction.notes || "") + (notes ? ` | Return: ${notes}` : "")

  if (fineAmount > 0) {
    transaction.fine = {
      amount: fineAmount,
      waived: fineWaived,
      paid: finePaid,
      overdueDays: overdueDays,
    }
  }

  // Update book status
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const book = books.find((b) => b.id === transaction.bookId)
  if (book) {
    book.status = "Available"
  }

  localStorage.setItem("library_transactions", JSON.stringify(transactions))
  localStorage.setItem("library_books", JSON.stringify(books))

  showAlert("Book returned successfully!", "success")

  // Reset form and reload data
  setTimeout(() => {
    resetReturnForm()
    loadIssuedTransactions()
    loadRecentReturns()
  }, 1500)
}

function resetReturnForm() {
  const form = document.getElementById("returnByTransactionForm")
  if (form) {
    form.reset()
    setDefaultReturnDate()
    hideSelectedTransaction()
    loadIssuedTransactions()
  }
}

function switchTab(tabName) {
  currentTab = tabName

  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add("active")

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(`${tabName}Tab`).classList.add("active")

  // Initialize tab-specific functionality
  if (tabName === "search") {
    initializeGlobalSearch()
  } else if (tabName === "scan") {
    initializeBarcodeInput()
  }
}

function initializeSearch() {
  // This will be called when search tab is activated
}

function initializeGlobalSearch() {
  const globalSearch = document.getElementById("globalSearch")
  const searchResults = document.getElementById("searchResults")

  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()

      if (searchTerm.length < 2) {
        searchResults.innerHTML = ""
        return
      }

      const filteredTransactions = issuedTransactions.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(searchTerm) ||
          transaction.bookTitle.toLowerCase().includes(searchTerm) ||
          transaction.memberName.toLowerCase().includes(searchTerm),
      )

      displaySearchResults(filteredTransactions)
    })
  }
}

function displaySearchResults(transactions) {
  const searchResults = document.getElementById("searchResults")
  if (!searchResults) return

  if (transactions.length === 0) {
    searchResults.innerHTML = '<p class="text-center text-muted">No matching transactions found</p>'
    return
  }

  searchResults.innerHTML = transactions
    .map((transaction) => {
      const daysOverdue = calculateDaysOverdue(transaction.dueDate)
      const overdueClass = daysOverdue > 0 ? "overdue" : ""

      return `
          <div class="result-item ${overdueClass}">
            <div class="result-info">
              <h4>${transaction.bookTitle}</h4>
              <p>${transaction.memberName} • Transaction ID: ${transaction.id}</p>
              <div class="result-meta">
                <span>Issued: ${formatDate(transaction.issueDate)}</span>
                <span>Due: ${formatDate(transaction.dueDate)}</span>
                ${daysOverdue > 0 ? `<span class="overdue-text">${daysOverdue} days overdue</span>` : ""}
              </div>
            </div>
            <div class="result-actions">
              <button class="btn btn-primary btn-sm" onclick="quickReturn('${transaction.id}')">
                <i class="fas fa-undo"></i>
                Return
              </button>
            </div>
          </div>
        `
    })
    .join("")
}

function quickReturn(transactionId) {
  if (!confirm("Are you sure you want to return this book?")) return

  const today = new Date().toISOString().split("T")[0]

  // Find transaction
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const transactionIndex = transactions.findIndex((t) => t.id === transactionId)

  if (transactionIndex === -1) {
    showAlert("Transaction not found!", "error")
    return
  }

  const transaction = transactions[transactionIndex]

  // Calculate fine if overdue
  const overdueDays = calculateDaysOverdue(transaction.dueDate)
  let fineAmount = 0
  if (overdueDays > 0) {
    fineAmount = overdueDays * 1.0
  }

  // Update transaction
  transaction.returnDate = today
  transaction.status = "Returned"
  transaction.condition = "Good"

  if (fineAmount > 0) {
    transaction.fine = {
      amount: fineAmount,
      waived: false,
      paid: false,
      overdueDays: overdueDays,
    }
  }

  // Update book status
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const book = books.find((b) => b.id === transaction.bookId)
  if (book) {
    book.status = "Available"
  }

  localStorage.setItem("library_transactions", JSON.stringify(transactions))
  localStorage.setItem("library_books", JSON.stringify(books))

  showAlert("Book returned successfully!", "success")

  // Refresh data
  loadIssuedTransactions()
  loadRecentReturns()

  // Clear search results
  document.getElementById("globalSearch").value = ""
  document.getElementById("searchResults").innerHTML = ""
}

function initializeBarcode() {
  const barcodeInput = document.getElementById("barcodeInput")
  const barcodeResults = document.getElementById("barcodeResults")

  if (barcodeInput) {
    barcodeInput.addEventListener("input", (e) => {
      const barcode = e.target.value.trim()

      if (barcode.length < 3) {
        barcodeResults.innerHTML = ""
        return
      }

      // Search for books by ISBN or ID
      const books = JSON.parse(localStorage.getItem("library_books") || "[]")
      const matchingBooks = books.filter(
        (book) =>
          book.isbn === barcode || book.id === barcode || book.isbn?.includes(barcode) || book.id.includes(barcode),
      )

      if (matchingBooks.length > 0) {
        displayBarcodeResults(matchingBooks)
      } else {
        barcodeResults.innerHTML = '<p class="text-center text-muted">No books found with this barcode</p>'
      }
    })

    // Auto-focus for barcode scanning
    barcodeInput.focus()
  }
}

function initializeBarcodeInput() {
  const barcodeInput = document.getElementById("barcodeInput")
  if (barcodeInput) {
    barcodeInput.focus()
  }
}

function displayBarcodeResults(books) {
  const barcodeResults = document.getElementById("barcodeResults")
  if (!barcodeResults) return

  // Find issued transactions for these books
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")

  const results = books.map((book) => {
    const issuedTransaction = transactions.find(
      (t) => t.bookId === book.id && (t.status === "Issued" || t.status === "Overdue"),
    )
    return { book, transaction: issuedTransaction }
  })

  barcodeResults.innerHTML = results
    .map(({ book, transaction }) => {
      if (!transaction) {
        return `
          <div class="result-item">
            <div class="result-info">
              <h4>${book.title}</h4>
              <p>${book.author}</p>
              <div class="result-meta">
                <span class="status-badge available">Available</span>
              </div>
            </div>
            <div class="result-actions">
              <span class="text-muted">Not currently issued</span>
            </div>
          </div>
        `
      }

      const daysOverdue = calculateDaysOverdue(transaction.dueDate)
      const overdueClass = daysOverdue > 0 ? "overdue" : ""

      return `
        <div class="result-item ${overdueClass}">
          <div class="result-info">
            <h4>${book.title}</h4>
            <p>${transaction.memberName} • ${book.author}</p>
            <div class="result-meta">
              <span>Due: ${formatDate(transaction.dueDate)}</span>
              ${daysOverdue > 0 ? `<span class="overdue-text">${daysOverdue} days overdue</span>` : ""}
            </div>
          </div>
          <div class="result-actions">
            <button class="btn btn-primary btn-sm" onclick="quickReturn('${transaction.id}')">
              <i class="fas fa-undo"></i>
              Return
            </button>
          </div>
        </div>
      `
    })
    .join("")
}

function loadRecentReturns() {
  const transactions = JSON.parse(localStorage.getItem("library_transactions") || "[]")
  const recentReturns = transactions
    .filter((t) => t.status === "Returned")
    .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate))
    .slice(0, 5)

  const container = document.getElementById("recentReturns")
  if (!container) return

  if (recentReturns.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No recent returns</p>'
    return
  }

  container.innerHTML = recentReturns
    .map(
      (transaction) => `
        <div class="recent-item">
          <div class="item-info">
            <div class="item-title">${transaction.bookTitle}</div>
            <div class="item-subtitle">${transaction.memberName}</div>
            <div class="item-time">Returned: ${formatDate(transaction.returnDate)}</div>
          </div>
          <span class="status-badge returned">Returned</span>
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
