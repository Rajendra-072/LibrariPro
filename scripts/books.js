// Books management functionality
let currentPage = 1
const itemsPerPage = 10
let filteredBooks = []

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
  return `${prefix}${Math.floor(Math.random() * 100000)}`
}

document.addEventListener("DOMContentLoaded", () => {
  loadBooks()
  initializeFilters()
  initializeBookForm()
})

function loadBooks() {
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  filteredBooks = [...books]
  displayBooks()
  updatePagination()
}

function displayBooks() {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const booksToShow = filteredBooks.slice(startIndex, endIndex)

  const tbody = document.getElementById("booksTableBody")
  if (!tbody) return

  if (booksToShow.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <h3>No books found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = booksToShow
    .map(
      (book) => `
        <tr>
            <td><span class="book-id">${book.id}</span></td>
            <td><span class="book-title">${book.title}</span></td>
            <td><span class="book-author">${book.author}</span></td>
            <td><span class="book-category">${book.category}</span></td>
            <td>${book.isbn || "-"}</td>
            <td><span class="book-status status-${book.status.toLowerCase()}">${book.status}</span></td>
            <td>
                <div class="book-actions">
                    <button class="action-btn btn-view" onclick="viewBook('${book.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="editBook('${book.id}')" title="Edit Book">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteBook('${book.id}')" title="Delete Book">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function initializeFilters() {
  const searchInput = document.getElementById("bookSearch")
  const categoryFilter = document.getElementById("categoryFilter")
  const statusFilter = document.getElementById("statusFilter")

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters)
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters)
  }
}

function applyFilters() {
  const searchTerm = document.getElementById("bookSearch").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value
  const statusFilter = document.getElementById("statusFilter").value

  const books = JSON.parse(localStorage.getItem("library_books") || "[]")

  filteredBooks = books.filter((book) => {
    const matchesSearch =
      !searchTerm ||
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.isbn.toLowerCase().includes(searchTerm)

    const matchesCategory = !categoryFilter || book.category === categoryFilter
    const matchesStatus = !statusFilter || book.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  currentPage = 1
  displayBooks()
  updatePagination()
}

function updatePagination() {
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const paginationContainer = document.getElementById("booksPagination")

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
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  if (page < 1 || page > totalPages) return

  currentPage = page
  displayBooks()
  updatePagination()
}

function initializeBookForm() {
  const bookForm = document.getElementById("bookForm")
  if (bookForm) {
    bookForm.addEventListener("submit", handleBookSubmit)
  }
}

function openAddBookModal() {
  document.getElementById("modalTitle").textContent = "Add New Book"
  document.getElementById("bookForm").reset()
  document.getElementById("bookForm").removeAttribute("data-book-id")
  document.getElementById("bookModal").style.display = "block"
}

function closeBookModal() {
  document.getElementById("bookModal").style.display = "none"
}

function editBook(bookId) {
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const book = books.find((b) => b.id === bookId)

  if (!book) return

  document.getElementById("modalTitle").textContent = "Edit Book"
  document.getElementById("bookTitle").value = book.title
  document.getElementById("bookAuthor").value = book.author
  document.getElementById("bookISBN").value = book.isbn || ""
  document.getElementById("bookCategory").value = book.category
  document.getElementById("bookPublisher").value = book.publisher || ""
  document.getElementById("bookYear").value = book.year || ""
  document.getElementById("bookDescription").value = book.description || ""

  document.getElementById("bookForm").setAttribute("data-book-id", bookId)
  document.getElementById("bookModal").style.display = "block"
}

function handleBookSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const bookId = e.target.getAttribute("data-book-id")

  const bookData = {
    title: formData.get("title"),
    author: formData.get("author"),
    isbn: formData.get("isbn"),
    category: formData.get("category"),
    publisher: formData.get("publisher"),
    year: formData.get("year"),
    description: formData.get("description"),
    status: "Available",
  }

  const books = JSON.parse(localStorage.getItem("library_books") || "[]")

  if (bookId) {
    // Edit existing book
    const bookIndex = books.findIndex((b) => b.id === bookId)
    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], ...bookData }
      showAlert("Book updated successfully!", "success")
    }
  } else {
    // Add new book
    const newBook = {
      id: generateId("B"),
      ...bookData,
      addedDate: new Date().toISOString().split("T")[0],
    }
    books.push(newBook)
    showAlert("Book added successfully!", "success")
  }

  localStorage.setItem("library_books", JSON.stringify(books))
  closeBookModal()
  loadBooks()
}

function deleteBook(bookId) {
  if (!confirm("Are you sure you want to delete this book?")) return

  let books = JSON.parse(localStorage.getItem("library_books") || "[]")
  books = books.filter((b) => b.id !== bookId)

  localStorage.setItem("library_books", JSON.stringify(books))
  showAlert("Book deleted successfully!", "success")
  loadBooks()
}

function viewBook(bookId) {
  const books = JSON.parse(localStorage.getItem("library_books") || "[]")
  const book = books.find((b) => b.id === bookId)

  if (!book) return

  alert(`Book Details:
    
Title: ${book.title}
Author: ${book.author}
ISBN: ${book.isbn || "N/A"}
Category: ${book.category}
Publisher: ${book.publisher || "N/A"}
Year: ${book.year || "N/A"}
Status: ${book.status}
Description: ${book.description || "N/A"}`)
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  const modal = document.getElementById("bookModal")
  if (e.target === modal) {
    closeBookModal()
  }
})
