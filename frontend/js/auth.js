// Initialize Clerk when the page loads
window.addEventListener('load', async function() {
    try {
        await window.Clerk.load();
        
        // Check if we're on the dashboard page
        if (window.location.pathname.includes('dashboard')) {
            if (!window.Clerk.isAuthenticated()) {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
            } else {
                // Get user information
                const user = window.Clerk.user;
                
                // Update UI with user info
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = user.firstName || 'User';
                }
                
                // Handle sign out
                const signOutButton = document.querySelector('.sign-out-btn');
                if (signOutButton) {
                    signOutButton.addEventListener('click', async () => {
                        await window.Clerk.signOut();
                        window.location.href = 'login.html';
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error initializing Clerk:', error);
    }
});