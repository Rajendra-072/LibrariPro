// Registration functionality
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm")
  const togglePasswordButtons = document.querySelectorAll(".toggle-password")

  // Toggle password visibility
  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target")
      const passwordInput = document.getElementById(targetId)

      if (passwordInput) {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
        passwordInput.setAttribute("type", type)

        const icon = this.querySelector("i")
        icon.classList.toggle("fa-eye")
        icon.classList.toggle("fa-eye-slash")
      }
    })
  })

  // Handle registration form submission
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(registerForm)
      const userData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        username: formData.get("username"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        phone: formData.get("phone"),
        userType: formData.get("userType"),
        agreeTerms: formData.get("agreeTerms"),
        newsletter: formData.get("newsletter"),
      }

      // Validate form
      if (!validateForm(userData)) {
        return
      }

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem("library_users") || "[]")
      const userExists = existingUsers.some(
        (user) => user.username === userData.username || user.email === userData.email,
      )

      if (userExists) {
        showAlert("Username or email already exists!", "error")
        return
      }

      // Create new user
      const newUser = {
        id: generateUserId(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        username: userData.username,
        password: userData.password, // In real app, this would be hashed
        phone: userData.phone || "",
        userType: userData.userType,
        status: "Active",
        registrationDate: new Date().toISOString(),
        newsletter: userData.newsletter === "on",
        lastLogin: null,
      }

      // Save user
      existingUsers.push(newUser)
      localStorage.setItem("library_users", JSON.stringify(existingUsers))

      // Also add to members if not admin
      if (userData.userType !== "Admin") {
        addToMembers(newUser)
      }

      showAlert("Registration successful! Redirecting to login...", "success")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "login.html"
      }, 2000)
    })
  }
})

function validateForm(userData) {
  // Check required fields
  if (!userData.firstName || !userData.lastName || !userData.email || !userData.username || !userData.password) {
    showAlert("Please fill in all required fields!", "error")
    return false
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userData.email)) {
    showAlert("Please enter a valid email address!", "error")
    return false
  }

  // Validate username (alphanumeric, 3-20 characters)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  if (!usernameRegex.test(userData.username)) {
    showAlert("Username must be 3-20 characters and contain only letters, numbers, and underscores!", "error")
    return false
  }

  // Validate password strength
  if (userData.password.length < 6) {
    showAlert("Password must be at least 6 characters long!", "error")
    return false
  }

  // Check password confirmation
  if (userData.password !== userData.confirmPassword) {
    showAlert("Passwords do not match!", "error")
    return false
  }

  // Check terms agreement
  if (!userData.agreeTerms) {
    showAlert("You must agree to the Terms of Service and Privacy Policy!", "error")
    return false
  }

  // Validate phone number if provided
  if (userData.phone) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(userData.phone.replace(/[\s\-$$$$]/g, ""))) {
      showAlert("Please enter a valid phone number!", "error")
      return false
    }
  }

  return true
}

function generateUserId() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `U${timestamp}${random}`
}

function addToMembers(user) {
  const members = JSON.parse(localStorage.getItem("library_members") || "[]")

  const newMember = {
    id: `M${user.id.slice(1)}`, // Convert U123456 to M123456
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    type: user.userType,
    status: "Active",
    address: "",
    joinDate: new Date().toISOString().split("T")[0],
  }

  members.push(newMember)
  localStorage.setItem("library_members", JSON.stringify(members))
}

function showAlert(message, type = "success") {
  // Remove existing alerts
  const existingAlert = document.querySelector(".alert")
  if (existingAlert) {
    existingAlert.remove()
  }

  // Create new alert
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.textContent = message
  alert.style.position = "fixed"
  alert.style.top = "20px"
  alert.style.right = "20px"
  alert.style.zIndex = "9999"
  alert.style.maxWidth = "400px"

  document.body.appendChild(alert)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove()
    }
  }, 5000)
}

// Social registration (placeholder functionality)
document.addEventListener("click", (e) => {
  if (e.target.closest(".social-btn")) {
    const provider = e.target.closest(".social-btn").classList.contains("google-btn") ? "Google" : "Facebook"
    showAlert(`${provider} registration coming soon!`, "warning")
  }
})

// Real-time validation
document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirmPassword")

  // Username validation
  if (usernameInput) {
    usernameInput.addEventListener("blur", () => {
      const username = usernameInput.value
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/

      if (username && !usernameRegex.test(username)) {
        usernameInput.style.borderColor = "#dc3545"
        showValidationMessage(usernameInput, "Username must be 3-20 characters (letters, numbers, underscore only)")
      } else {
        usernameInput.style.borderColor = "#28a745"
        removeValidationMessage(usernameInput)
      }
    })
  }

  // Email validation
  if (emailInput) {
    emailInput.addEventListener("blur", () => {
      const email = emailInput.value
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (email && !emailRegex.test(email)) {
        emailInput.style.borderColor = "#dc3545"
        showValidationMessage(emailInput, "Please enter a valid email address")
      } else {
        emailInput.style.borderColor = "#28a745"
        removeValidationMessage(emailInput)
      }
    })
  }

  // Password strength validation
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const password = passwordInput.value
      const strength = getPasswordStrength(password)

      updatePasswordStrength(passwordInput, strength)
    })
  }

  // Confirm password validation
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      const password = passwordInput.value
      const confirmPassword = confirmPasswordInput.value

      if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.style.borderColor = "#dc3545"
        showValidationMessage(confirmPasswordInput, "Passwords do not match")
      } else if (confirmPassword) {
        confirmPasswordInput.style.borderColor = "#28a745"
        removeValidationMessage(confirmPasswordInput)
      }
    })
  }
})

function showValidationMessage(input, message) {
  removeValidationMessage(input)

  const validationMsg = document.createElement("div")
  validationMsg.className = "validation-message"
  validationMsg.textContent = message
  validationMsg.style.color = "#dc3545"
  validationMsg.style.fontSize = "12px"
  validationMsg.style.marginTop = "5px"

  input.parentNode.parentNode.appendChild(validationMsg)
}

function removeValidationMessage(input) {
  const existingMsg = input.parentNode.parentNode.querySelector(".validation-message")
  if (existingMsg) {
    existingMsg.remove()
  }
}

function getPasswordStrength(password) {
  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  return strength
}

function updatePasswordStrength(input, strength) {
  removeValidationMessage(input)

  const strengthLevels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"]
  const strengthColors = ["#dc3545", "#fd7e14", "#ffc107", "#20c997", "#28a745", "#007bff"]

  const strengthMsg = document.createElement("div")
  strengthMsg.className = "validation-message password-strength"
  strengthMsg.textContent = `Password Strength: ${strengthLevels[strength] || "Very Weak"}`
  strengthMsg.style.color = strengthColors[strength] || "#dc3545"
  strengthMsg.style.fontSize = "12px"
  strengthMsg.style.marginTop = "5px"

  input.parentNode.parentNode.appendChild(strengthMsg)
}
