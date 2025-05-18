// auth.js - Authentication handling for Kuching ART website

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    // Login form elements
    const loginFormElement = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    // Register form elements
    const registerFormElement = document.getElementById('registerForm');
    const fullName = document.getElementById('fullName');
    const registerEmail = document.getElementById('registerEmail');
    const phoneNumber = document.getElementById('phoneNumber');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    // Event listeners for tab switching
    if (loginTab) {
        loginTab.addEventListener('click', function() {
            activateTab('login');
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', function() {
            activateTab('register');
        });
    }
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            activateTab('register');
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            activateTab('login');
        });
    }
    
    // Login form submission
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            if (!loginEmail.value || !loginPassword.value) {
                showError('Please fill in all fields');
                return;
            }
            
            // Mock login for demonstration
            mockLogin(loginEmail.value, loginPassword.value);
        });
    }
    
    // Register form submission
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            if (!fullName.value || !registerEmail.value || !phoneNumber.value || 
                !registerPassword.value || !confirmPassword.value) {
                showError('Please fill in all fields');
                return;
            }
            
            if (registerPassword.value !== confirmPassword.value) {
                showError('Passwords do not match');
                return;
            }
            
            if (registerPassword.value.length < 8) {
                showError('Password must be at least 8 characters long');
                return;
            }
            
            // Mock registration for demonstration
            mockRegister(fullName.value, registerEmail.value, phoneNumber.value, registerPassword.value);
        });
    }
});

function activateTab(tabName) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (tabName === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function showError(message) {
    // You could create a more sophisticated error display
    alert(message);
}

function showSuccess(message) {
    // You could create a more sophisticated success display
    alert(message);
}

// Mock authentication functions (in a real app, these would communicate with a server)
function mockLogin(email, password) {
    // For demonstration, we'll accept any email with a password that's at least 8 characters
    if (password.length >= 8) {
        // Create a user object
        const userId = 'user_' + Math.floor(Math.random() * 10000);
        const userName = email.split('@')[0]; // Use part of email as name for demo
        
        const user = new User(userId, userName, email, '0123456789', true);
        user.login(); // This stores the user in session storage
          showSuccess('Login successful!');
        
        // Redirect to dashboard page
        setTimeout(function() {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showError('Invalid credentials. Please try again.');
    }
}

function mockRegister(name, email, phone, password) {
    // In a real app, this would send data to a server
    // For demonstration, we'll just simulate a successful registration
    
    // Create a user object
    const userId = 'user_' + Math.floor(Math.random() * 10000);
    const user = new User(userId, name, email, phone, true);
    user.login(); // This stores the user in session storage
      showSuccess('Registration successful! Welcome to Kuching ART.');
    
    // Redirect to dashboard page
    setTimeout(function() {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Check if user is already logged in
function checkAuthStatus() {
    const currentUserData = sessionStorage.getItem('currentUser');
    
    if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        return new User(
            userData.id,
            userData.name,
            userData.email,
            userData.phoneNumber,
            userData.isLoggedIn
        );
    }
    
    return null;
}

// Logout function
function logout() {
    const currentUser = checkAuthStatus();
    
    if (currentUser) {
        currentUser.logout();
        window.location.href = 'index.html';
    }
}
