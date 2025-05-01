"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerContainer');
    const registerLink = document.getElementById('register-link');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/views/register.html';
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                const data = await response.json();
                if (response.ok) {
                    // Store the authentication token if provided
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                    }
                    window.location.href = '/';
                }
                else {
                    showError(data.message || 'Invalid credentials');
                }
            }
            catch (error) {
                console.error('Login error:', error);
                showError('An error occurred during login');
            }
        });
    }
    if (registerForm) {
        console.log("registerForm found");
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.href = '/views/login';
                }
                else {
                    showError(data.message || 'Registration failed');
                }
            }
            catch (error) {
                console.error('Registration error:', error);
                showError('An error occurred during registration');
            }
        });
    }
});
function showError(message) {
    // Create error message element if it doesn't exist
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        document.querySelector('.login-container')?.prepend(errorElement);
    }
    // Set error message and make it visible
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    // Hide error message after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}
