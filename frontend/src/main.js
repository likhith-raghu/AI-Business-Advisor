import './style.css'
import { Clerk } from '@clerk/clerk-js'

const initializeClerk = async () => {
    const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

    if (!clerkPubKey) {
        console.error('Missing Publishable Key');
        document.getElementById('app').innerHTML = `
            <div style="color: red; text-align: center; margin-top: 50px;">
                Error: Clerk configuration is missing. Please check your environment variables.
            </div>
        `;
    } else {
        try {
            console.log('Initializing Clerk...');
            const clerk = new Clerk(clerkPubKey, {
                // Configure Clerk to use embedded components
                appearance: {
                    layout: {
                        helpPageUrl: "/help",
                        logoImageUrl: "/logo.png",
                        privacyPageUrl: "/privacy",
                        termsPageUrl: "/terms"
                    },
                    elements: {
                        rootBox: {
                            backgroundColor: "rgb(17, 17, 17)",
                            margin: "auto"
                        },
                        card: {
                            backgroundColor: "rgb(26, 26, 26)",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        },
                        formButtonPrimary: {
                            backgroundColor: "rgb(99, 102, 241)",
                            "&:hover": {
                                backgroundColor: "rgb(79, 82, 221)"
                            }
                        }
                    }
                }
            });
            
            console.log('Loading Clerk...');
            await clerk.load();
            console.log('Clerk loaded successfully');

            const appDiv = document.getElementById('app');
            if (!appDiv) {
                console.error('Could not find #app element');
                return;
            }

            // Check if we're on the sign-up page
            if (window.location.pathname === '/signup') {
                appDiv.innerHTML = `
                    <div id="sign-up"></div>
                `;
                const signUpDiv = document.getElementById('sign-up');
                clerk.mountSignUp(signUpDiv, {
                    afterSignUpUrl: "/dashboard",
                    signInUrl: "/"
                });
            } else if (clerk.user) {
                console.log('User is authenticated');
                appDiv.innerHTML = `
                    <div id="user-button"></div>
                `;
                const userButtonDiv = document.getElementById('user-button');
                clerk.mountUserButton(userButtonDiv);
            } else {
                console.log('User is not authenticated');
                appDiv.innerHTML = `
                    <div id="sign-in"></div>
                `;
                const signInDiv = document.getElementById('sign-in');
                clerk.mountSignIn(signInDiv, {
                    afterSignInUrl: "/dashboard",
                    signUpUrl: "/signup"
                });
            }
        } catch (error) {
            console.error('Error initializing Clerk:', error);
            document.getElementById('app').innerHTML = `
                <div style="color: red; text-align: center; margin-top: 50px;">
                    Error: Failed to initialize authentication. Please try again later.
                    <br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
};

initializeClerk();
