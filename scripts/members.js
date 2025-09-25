// Members management functionality
let currentPage = 1
const itemsPerPage = 10
let filteredMembers = []

document.addEventListener("DOMContentLoaded", () => {
  loadMembers()
  initializeFilters()
  initializeMemberForm()
})

function loadMembers() {
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")
  filteredMembers = [...members]
  displayMembers()
  updatePagination()
}

function displayMembers() {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const membersToShow = filteredMembers.slice(startIndex, endIndex)

  const tbody = document.getElementById("membersTableBody")
  if (!tbody) return

  if (membersToShow.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No members found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = membersToShow
    .map(
      (member) => `
        <tr>
            <td><span class="member-id">${member.id}</span></td>
            <td><span class="member-name">${member.name}</span></td>
            <td><span class="member-email">${member.email}</span></td>
            <td>${member.phone || "-"}</td>
            <td><span class="member-type type-${member.type.toLowerCase()}">${member.type}</span></td>
            <td><span class="member-status status-${member.status.toLowerCase()}">${member.status}</span></td>
            <td><span class="join-date">${formatDate(member.joinDate)}</span></td>
            <td>
                <div class="book-actions">
                    <button class="action-btn btn-view" onclick="viewMember('${member.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="editMember('${member.id}')" title="Edit Member">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteMember('${member.id}')" title="Delete Member">
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
  const searchInput = document.getElementById("memberSearch")
  const statusFilter = document.getElementById("statusFilter")
  const typeFilter = document.getElementById("typeFilter")

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters)
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", applyFilters)
  }
}

function applyFilters() {
  const searchTerm = document.getElementById("memberSearch").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value
  const typeFilter = document.getElementById("typeFilter").value

  const members = JSON.parse(localStorage.getItem("library_members") || "[]")

  filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchTerm ||
      member.name.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm) ||
      member.id.toLowerCase().includes(searchTerm)

    const matchesStatus = !statusFilter || member.status === statusFilter
    const matchesType = !typeFilter || member.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  currentPage = 1
  displayMembers()
  updatePagination()
}

function updatePagination() {
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const paginationContainer = document.getElementById("membersPagination")

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
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  if (page < 1 || page > totalPages) return

  currentPage = page
  displayMembers()
  updatePagination()
}

function initializeMemberForm() {
  const memberForm = document.getElementById("memberForm")
  if (memberForm) {
    memberForm.addEventListener("submit", handleMemberSubmit)
  }
}

function openAddMemberModal() {
  document.getElementById("modalTitle").textContent = "Add New Member"
  document.getElementById("memberForm").reset()
  document.getElementById("memberForm").removeAttribute("data-member-id")
  document.getElementById("memberModal").style.display = "block"
}

function closeMemberModal() {
  document.getElementById("memberModal").style.display = "none"
}

function editMember(memberId) {
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")
  const member = members.find((m) => m.id === memberId)

  if (!member) return

  document.getElementById("modalTitle").textContent = "Edit Member"
  document.getElementById("memberName").value = member.name
  document.getElementById("memberEmail").value = member.email
  document.getElementById("memberPhone").value = member.phone || ""
  document.getElementById("memberType").value = member.type
  document.getElementById("memberAddress").value = member.address || ""

  document.getElementById("memberForm").setAttribute("data-member-id", memberId)
  document.getElementById("memberModal").style.display = "block"
}

function handleMemberSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const memberId = e.target.getAttribute("data-member-id")

  const memberData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    type: formData.get("type"),
    address: formData.get("address"),
    status: "Active",
  }

  const members = JSON.parse(localStorage.getItem("library_members") || "[]")

  if (memberId) {
    // Edit existing member
    const memberIndex = members.findIndex((m) => m.id === memberId)
    if (memberIndex !== -1) {
      members[memberIndex] = { ...members[memberIndex], ...memberData }
      showAlert("Member updated successfully!", "success")
    }
  } else {
    // Add new member
    const newMember = {
      id: generateId("M"),
      ...memberData,
      joinDate: new Date().toISOString().split("T")[0],
    }
    members.push(newMember)
    showAlert("Member added successfully!", "success")
  }

  localStorage.setItem("library_members", JSON.stringify(members))
  closeMemberModal()
  loadMembers()
}

function deleteMember(memberId) {
  if (!confirm("Are you sure you want to delete this member?")) return

  let members = JSON.parse(localStorage.getItem("library_members") || "[]")
  members = members.filter((m) => m.id !== memberId)

  localStorage.setItem("library_members", JSON.stringify(members))
  showAlert("Member deleted successfully!", "success")
  loadMembers()
}

function viewMember(memberId) {
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")
  const member = members.find((m) => m.id === memberId)

  if (!member) return

  alert(`Member Details:
    
Name: ${member.name}
Email: ${member.email}
Phone: ${member.phone || "N/A"}
Type: ${member.type}
Status: ${member.status}
Join Date: ${formatDate(member.joinDate)}
Address: ${member.address || "N/A"}`)
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  const modal = document.getElementById("memberModal")
  if (e.target === modal) {
    closeMemberModal()
  }
})

// Declare formatDate function
function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

// Declare showAlert function
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

// Declare generateId function
function generateId(prefix) {
  return `${prefix}${Math.floor(Math.random() * 100000)}`
}
