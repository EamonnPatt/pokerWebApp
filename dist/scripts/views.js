import { updateUserView } from "./utils.js";
import { initProfile } from "./profile.js";
export async function initViewScripts(view) {
    if (view === 'login') {
        console.log("login view - views.ts ");
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                console.log("Login form submitted");
                const username = document.getElementById("username")?.value;
                const password = document.getElementById("password")?.value;
                console.log("Form values:", { username, password });
                try {
                    console.log("Attempting login...");
                    await handleLogin(username, password);
                    console.log("Login successful");
                    alert("Login successful!");
                    location.hash = "#/";
                    updateUserView();
                }
                catch (err) {
                    console.error("Login error:", err);
                    alert("Login failed: " + err.message);
                }
            });
        }
        else {
            console.error("Login form not found");
        }
    }
    else if (view === 'register') {
        console.log("register view - views.ts ");
        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            registerForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                console.log("Register form submitted");
                const username = document.getElementById("username")?.value;
                const email = document.getElementById("email")?.value;
                const password = document.getElementById("password")?.value;
                const confirmPassword = document.getElementById("confirmPassword")?.value;
                console.log("Form values:", { username, email, password, confirmPassword });
                // Validate password match
                if (password !== confirmPassword) {
                    alert("Passwords do not match!");
                    return;
                }
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert("Please enter a valid email address!");
                    return;
                }
                try {
                    console.log("Attempting registration...");
                    await handleRegister(username, email, password);
                    console.log("Registration successful");
                    alert("Registration successful!");
                    //updateUserView();
                    location.hash = "#/login";
                }
                catch (err) {
                    console.error("Registration error:", err);
                    alert("Registration failed");
                }
            });
        }
        else {
            console.error("Register form not found");
        }
    }
    else if (view === 'Profile') {
        console.log("profile view - views.ts ");
        initProfile();
    }
    else if (view === 'activeGame') {
        console.log("activeGame view - views.ts ");
    }
}
async function handleLogin(username, password) {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    const userData = await response.json();
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
}
async function handleRegister(username, email, password) {
    console.log("handleRegister");
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
        throw new Error('Registration failed');
    }
}
