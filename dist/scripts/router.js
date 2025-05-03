import { updateUserView } from "./utils.js";
import { initViewScripts } from "./views.js";
class Router {
    constructor() {
        const container = document.getElementById('view-container');
        if (!container) {
            throw new Error('View container not found');
        }
        this.viewContainer = container;
        this.currentView = null;
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Handle navigation links
        document.addEventListener('click', (e) => {
            const target = e.target;
            const link = target.closest('[data-view]');
            if (link) {
                // Only prevent default if it's not a form submission
                if (!target.closest('form') || target.tagName === 'A') {
                    e.preventDefault();
                    const viewName = link.getAttribute('data-view');
                    if (viewName) {
                        this.loadView(viewName);
                    }
                }
            }
        });
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const state = e.state;
            if (state && state.view) {
                this.loadView(state.view);
            }
            else {
                this.clearView();
            }
        });
    }
    async loadView(viewName) {
        try {
            console.log("Router loadView");
            // Update URL without page reload
            window.history.pushState({ view: viewName }, '', `#${viewName}`);
            // Show loading state
            this.viewContainer.innerHTML = '<div class="loading">Loading...</div>';
            // Fetch the view content - using relative path from the current location
            const response = await fetch(`/views/${viewName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load view: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            if (!html) {
                throw new Error('View content is empty');
            }
            // Inject the view content
            this.viewContainer.innerHTML = html;
            this.currentView = viewName;
            // Initialize view scripts after the HTML is injected
            initViewScripts(viewName);
            // Update user view state
            updateUserView();
            // Reinitialize any scripts in the new view
            this.initializeViewScripts();
            // Update the main content visibility
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.display = 'none';
            }
        }
        catch (error) {
            console.error('Error loading view:', error);
            console.log("Router loadView error");
            this.viewContainer.innerHTML = `
                <div class="error">
                    <p>Error loading view: ${error.message}</p>
                    <button onclick="window.router.clearView()" class="login-btn">Go Back</button>
                </div>
            `;
            // Show the main content if view loading fails
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.display = 'block';
            }
        }
    }
    clearView() {
        this.viewContainer.innerHTML = '';
        this.currentView = null;
        // Show the main content when view is cleared
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    }
    initializeViewScripts() {
        // Reinitialize auth.js for the new view
        if (typeof window.initializeAuth === 'function') {
            window.initializeAuth();
        }
    }
}
// Initialize the router
const router = new Router();
// Export the router instance
export { router };
