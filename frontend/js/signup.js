// Handle signup form submission and OTP verification
let userEmail = '';

window.addEventListener('load', async function() {
    try {
        const clerk = window.Clerk;
        await clerk.load();

        // Configure Clerk with custom OAuth and email verification
        const signUpComponent = await clerk.mountSignUp(document.getElementById('clerk-sign-up'), {
            routing: 'virtual',
            signInUrl: '/html/login.html',
            afterSignUpUrl: '/html/dashboard.html',
            appearance: {
                elements: {
                    socialButtonsBlockButton: {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '1px solid #e5e7eb'
                    }
                }
            },
            signUp: {
                socialProviderStrategies: ['oauth_google'],
                redirectUrl: '/html/dashboard.html'
            }
        });

        // Handle successful OAuth sign-in
        clerk.addListener(({ user, session }) => {
            if (session) {
                if (user.primaryEmailAddress?.verification.status === 'verified' ||
                    user.externalAccounts.some(account => account.provider === 'google')) {
                    window.location.href = '/html/dashboard.html';
                }
            }
        });

        // Handle email signup
        signUpComponent.addEventListener('submitComplete', async (event) => {
            const { createdSessionId, createdUserId, emailAddress } = event;
            if (emailAddress && !event.firstFactorVerification) {
                userEmail = emailAddress;
                // Store email for OTP verification
                sessionStorage.setItem('signupEmail', emailAddress);
                // Redirect to OTP verification page
                window.location.href = '/html/otp.html';
            } else if (createdSessionId) {
                // If session is created (e.g., through OAuth), redirect to dashboard
                window.location.href = '/html/dashboard.html';
            }
        });

    } catch (error) {
        console.error('Error initializing signup:', error);
        document.getElementById('clerk-sign-up').innerHTML = 
            '<div style="color: red; text-align: center; margin-top: 20px;">Error initializing signup. Please try again later.</div>';
    }
});