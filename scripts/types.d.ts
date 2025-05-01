declare global {
    interface Window {
        router: Router;
    }

    function initializeAuth(): void;
}

export {}; 