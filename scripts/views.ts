import { updateUserView } from "./utils.js";

export function initViewScripts(view: string) {
    console.log("initViewScripts");
    if (view === 'login') {
        console.log("login view - views.ts ");
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                console.log("Login form submitted");
                
                const username = (document.getElementById("username") as HTMLInputElement)?.value;
                const password = (document.getElementById("password") as HTMLInputElement)?.value;

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
                    alert("Login failed: " + (err as Error).message);
                }
            });
        } else {
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
                
                const username = (document.getElementById("username") as HTMLInputElement)?.value;
                const email = (document.getElementById("email") as HTMLInputElement)?.value;
                const password = (document.getElementById("password") as HTMLInputElement)?.value;
                const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement)?.value;

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
        } else {
            console.error("Register form not found");
        }
    }
}

async function handleLogin(username: string, password: string) {
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

async function handleRegister(username: string, email: string, password: string) {
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


