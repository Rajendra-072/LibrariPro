// Home page functionality
console.log("🏠 Home.js Loading...")

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded - Home.js")

  // Check if user is logged in and update navigation
  checkLoginStatus()

  // Animate statistics
  animateStats()

  // Handle contact form
  handleContactForm()

  // Setup smooth scrolling for navigation links
  setupSmoothScrolling()
})

// Check login status and update navigation
function checkLoginStatus() {
  const session = localStorage.getItem("library_session")
  console.log("🔍 Checking login status:", session ? "Found" : "Not found")

  if (session) {
    try {
      const sessionData = JSON.parse(session)
      if (sessionData.isLoggedIn) {
        console.log("✅ User is logged in:", sessionData.email)

        // Update navigation elements
        const loginBtn = document.getElementById("loginBtn")
        const dashboardBtn = document.getElementById("dashboardBtn")
        const getStartedBtn = document.getElementById("getStartedBtn")
        const dashboardHeroBtn = document.getElementById("dashboardHeroBtn")

        if (loginBtn) {
          loginBtn.textContent = "Logout"
          loginBtn.href = "#"
          loginBtn.onclick = (e) => {
            e.preventDefault()
            logout()
          }
        }

        if (dashboardBtn) {
          dashboardBtn.style.display = "block"
        }

        if (getStartedBtn) {
          getStartedBtn.style.display = "none"
        }

        if (dashboardHeroBtn) {
          dashboardHeroBtn.style.display = "inline-block"
        }
      }
    } catch (error) {
      console.error("❌ Error parsing session data:", error)
      localStorage.removeItem("library_session")
    }
  }
}

// Animate statistics
function animateStats() {
  const statNumbers = document.querySelectorAll(".stat-number")

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number.parseInt(entry.target.getAttribute("data-target"))
        animateNumber(entry.target, target)
        observer.unobserve(entry.target)
      }
    })
  })

  statNumbers.forEach((stat) => observer.observe(stat))
}

// Animate number counting
function animateNumber(element, target) {
  let current = 0
  const increment = target / 100
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current)
  }, 20)
}

// Handle contact form
function handleContactForm() {
  const contactForm = document.querySelector(".contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const name = contactForm.querySelector('input[type="text"]').value
      const email = contactForm.querySelector('input[type="email"]').value
      const message = contactForm.querySelector("textarea").value

      console.log("📧 Contact form submitted:", { name, email, message })

      // Simulate form submission
      showAlert("Thank you for your message! We'll get back to you soon.", "success")

      // Reset form
      contactForm.reset()
    })
  }
}

// Setup smooth scrolling
function setupSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]')

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()

      const targetId = link.getAttribute("href")
      const targetSection = document.querySelector(targetId)

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    console.log("🚪 User logging out from home page...")
    localStorage.removeItem("library_session")
    showAlert("Logged out successfully!", "success")
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }
}

// Show alert function
function showAlert(message, type = "success") {
  console.log(`🔔 Home Alert: ${message} (${type})`)

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

  setTimeout(() => {
    if (alert.parentNode) {
      alert.style.animation = "slideOut 0.3s ease"
      setTimeout(() => alert.remove(), 300)
    }
  }, 5000)
}

console.log("✅ Home.js loaded successfully")
