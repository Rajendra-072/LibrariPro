// Authentication functionality
console.log("🔐 Auth.js Loading...")

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded - Auth.js")

  const loginForm = document.getElementById("loginForm")
  const togglePassword = document.querySelector(".toggle-password")
  const passwordInput = document.getElementById("password")

  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      const icon = this.querySelector("i")
      icon.classList.toggle("fa-eye")
      icon.classList.toggle("fa-eye-slash")
    })
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      console.log("📝 Login form submitted")

      const email = document.getElementById("email").value.trim()
      const password = document.getElementById("password").value
      const remember = document.getElementById("remember").checked

      console.log("🔍 Login attempt:", { email, password: "***", remember })

      // Show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.innerHTML
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...'
      submitBtn.disabled = true

      // Demo credentials - multiple options for flexibility
      const validCredentials = [
        { email: "admin@libraripro.com", password: "admin123", role: "admin", name: "Admin User" },
        { email: "admin", password: "admin123", role: "admin", name: "Admin User" },
        { email: "librarian@libraripro.com", password: "lib123", role: "librarian", name: "Librarian" },
        { email: "librarian", password: "lib123", role: "librarian", name: "Librarian" },
        { email: "demo@libraripro.com", password: "demo123", role: "user", name: "Demo User" },
        { email: "demo", password: "demo123", role: "user", name: "Demo User" },
      ]

      // Simulate network delay
      setTimeout(() => {
        // Check credentials
        const user = validCredentials.find(
          (cred) => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password,
        )

        if (user) {
          console.log("✅ Login successful for user:", user.email)

          // Set session data
          const sessionData = {
            email: user.email,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString(),
            remember: remember,
            isLoggedIn: true,
          }

          localStorage.setItem("library_session", JSON.stringify(sessionData))
          console.log("💾 Session data saved:", sessionData)

          showAlert("Login successful! Redirecting to dashboard...", "success")

          // Redirect to dashboard
          setTimeout(() => {
            console.log("🚀 Redirecting to dashboard...")
            window.location.href = "dashboard.html"
          }, 1500)
        } else {
          console.log("❌ Login failed - invalid credentials")
          showAlert("Invalid credentials! Please use: admin / admin123", "error")

          // Reset button
          submitBtn.innerHTML = originalText
          submitBtn.disabled = false
        }
      }, 1000)
    })
  }
})

// Fill demo credentials function
function fillDemoCredentials() {
  console.log("🎯 Filling demo credentials")
  document.getElementById("email").value = "admin"
  document.getElementById("password").value = "admin123"

  // Add visual feedback
  const inputs = document.querySelectorAll("#email, #password")
  inputs.forEach((input) => {
    input.style.borderColor = "#28a745"
    input.style.backgroundColor = "#f8fff9"
  })

  showAlert("Demo credentials filled! Click Sign In to continue.", "success")
}

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById("password")
  const toggleIcon = document.getElementById("passwordToggleIcon")

  if (passwordInput && toggleIcon) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text"
      toggleIcon.classList.remove("fa-eye")
      toggleIcon.classList.add("fa-eye-slash")
    } else {
      passwordInput.type = "password"
      toggleIcon.classList.remove("fa-eye-slash")
      toggleIcon.classList.add("fa-eye")
    }
  }
}

function showAlert(message, type = "success") {
  console.log(`🔔 Auth Alert: ${message} (${type})`)

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

console.log("✅ Auth.js loaded successfully")
