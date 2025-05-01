import { updateUserView } from "./app.js";
import { initViewScripts } from "./views.js";

interface RouterState {
    view: string;
}

class Router {
    private viewContainer: HTMLElement;
    private currentView: string | null;

    constructor() {
        const container = document.getElementById('view-container');
        if (!container) {
            throw new Error('View container not found');
        }
        this.viewContainer = container;
        this.currentView = null;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Handle navigation links
        document.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Skip if the click is on a form or form element
            if (target.closest('form')) {
                return;
            }
            
            const link = target.closest('[data-view]') as HTMLElement;
            
            if (link) {
                e.preventDefault();
                const viewName = link.getAttribute('data-view');
                if (viewName) {
                    this.loadView(viewName);
                }
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e: PopStateEvent) => {
            const state = e.state as RouterState;
            if (state && state.view) {
                this.loadView(state.view);
            } else {
                this.clearView();
            }
        });
    }

    private async loadView(viewName: string): Promise<void> {
        try {
            console.log("Router loadView"); 
                   
            // Update URL without page reload
            window.history.pushState({ view: viewName } as RouterState, '', `#${viewName}`);

            // Show loading state
            this.viewContainer.innerHTML = '<div class="loading">Loading...</div>';

            // Fetch the view content - using relative path from the current location
            const response = await fetch(`../../views/${viewName}.html`);
            
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
            //updateUserView();

            // Reinitialize any scripts in the new view
            this.initializeViewScripts();

            // Update the main content visibility
            const mainContent = document.querySelector('.main-content') as HTMLElement;
            if (mainContent) {
                mainContent.style.display = 'none';
            }       
        } catch (error) {
            console.error('Error loading view:', error);
            console.log("Router loadView error");
            this.viewContainer.innerHTML = `
                <div class="error">
                    <p>Error loading view: ${(error as Error).message}</p>
                    <button onclick="window.router.clearView()" class="login-btn">Go Back</button>
                </div>
            `;
            
            // Show the main content if view loading fails
            const mainContent = document.querySelector('.main-content') as HTMLElement;
            if (mainContent) {
                mainContent.style.display = 'block';
            }
        }
    }

    private clearView(): void {
        this.viewContainer.innerHTML = '';
        this.currentView = null;
        
        // Show the main content when view is cleared
        const mainContent = document.querySelector('.main-content') as HTMLElement;
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    }

    private initializeViewScripts(): void {
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