export function updateUserView() {
    console.log("updateUserView called");
    const user = localStorage.getItem('user');
    console.log("User in localStorage:", user);
    
    // Get the user display element from the navbar
    const userDisplay = document.querySelector('.navbar .user-display') as HTMLElement;
    const authLinks = document.querySelector('.auth-links') as HTMLElement;
    const logoutLink = document.querySelector('.logout-link') as HTMLElement;
    
    console.log("Found elements:", {
        userDisplay: !!userDisplay,
        authLinks: !!authLinks,
        logoutLink: !!logoutLink
    });
    
    if (!userDisplay || !authLinks || !logoutLink) {
        console.log("Required elements not found, skipping user view update");
        return;
    }

    if (user) {
        try {
            const userObj = JSON.parse(user);
            console.log("Logged in user:", userObj);
            
            // Update user display
            userDisplay.textContent = `Welcome, ${userObj.username}`;
            userDisplay.classList.add('show');
            
            // Hide login/register, show logout
            console.log("Hiding auth links, showing logout");
            authLinks.style.display = 'none';
            logoutLink.style.display = 'block';
            
            // Force the logout button to be visible
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                console.log("Found logout button, ensuring it's visible");
                logoutBtn.style.display = 'block';
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem('user');
            userDisplay.classList.remove('show');
            authLinks.style.display = 'block';
            logoutLink.style.display = 'none';
        }
    } else {
        console.log("No user found, hiding logout and showing auth links");
        userDisplay.classList.remove('show');
        authLinks.style.display = 'block';
        logoutLink.style.display = 'none';
    }
} 

// Wait for DOM to be fully loaded before running updateUserView
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded in utils.ts");
    
            updateUserView();
        });
 
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        console.log("Logout button clicked");
        localStorage.removeItem('user');
        updateUserView();
    });
}
