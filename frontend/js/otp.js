document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.Clerk.load();
        const signupEmail = sessionStorage.getItem('signupEmail');
        
        if (!signupEmail) {
            window.location.href = 'signup.html';
            return;
        }

        const form = document.getElementById('otp-form');
        const inputs = document.querySelectorAll('.otp-input');
        const submitButton = form.querySelector('button[type="submit"]');
        const errorMessage = document.getElementById('error-message');
        const countdownTimer = document.getElementById('countdown-timer');
        const resendLink = document.getElementById('resend-otp');

        // Get the current sign-up attempt
        const signUpAttempt = await window.Clerk.client.signUpAttempts.get();
        
        let timeLeft = 120; // 2 minutes in seconds
        let countdownInterval;

        function startCountdown() {
            clearInterval(countdownInterval);
            timeLeft = 120;
            resendLink.classList.add('disabled');
            resendLink.style.cursor = 'not-allowed';
            
            countdownInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                countdownTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    resendLink.classList.remove('disabled');
                    resendLink.style.cursor = 'pointer';
                }
            }, 1000);
        }

        // Send initial verification email and start countdown
        try {
            await signUpAttempt.prepareEmailAddressVerification();
            startCountdown();
        } catch (error) {
            console.error('Error sending verification email:', error);
            errorMessage.textContent = 'Failed to send verification code. Please try again.';
            errorMessage.style.display = 'block';
            return;
        }

        // Handle input focus and auto-tab
        inputs.forEach((input, index) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= 0 && e.key <= 9) {
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                } else if (e.key === 'Backspace') {
                    if (index > 0) {
                        inputs[index - 1].focus();
                    }
                }
            });
        });

        // Handle form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const otp = Array.from(inputs).map(input => input.value).join('');

            try {
                // Verify OTP with Clerk
                await signUpAttempt.attemptEmailAddressVerification({
                    code: otp
                });

                // Clear signup email from session storage
                sessionStorage.removeItem('signupEmail');
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Error verifying OTP:', error);
                errorMessage.textContent = 'Invalid verification code. Please try again.';
                errorMessage.style.display = 'block';
            }
        });

        // Handle resend OTP
        resendLink.addEventListener('click', async function(e) {
            e.preventDefault();
            if (resendLink.classList.contains('disabled')) {
                return;
            }

            try {
                await signUpAttempt.prepareEmailAddressVerification();
                startCountdown();
                errorMessage.textContent = 'Verification code resent successfully!';
                errorMessage.style.color = '#4CAF50';
                errorMessage.style.display = 'block';
            } catch (error) {
                console.error('Error resending verification code:', error);
                errorMessage.textContent = 'Failed to resend verification code';
                errorMessage.style.color = '#ff0000';
                errorMessage.style.display = 'block';
            }
        });

        // Clear inputs when receiving focus
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.select();
            });

            // Allow only numbers
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        });

        // Initialize the form
        inputs[0].focus();
    } catch (error) {
        console.error('Error initializing OTP verification:', error);
        if (errorMessage) {
            errorMessage.textContent = 'Error initializing verification. Please try again.';
            errorMessage.style.display = 'block';
        }
    }
});