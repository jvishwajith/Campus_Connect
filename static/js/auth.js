// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const authForm = document.querySelector('.auth-form');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            const inputs = this.querySelectorAll('input[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--danger)';
                } else {
                    input.style.borderColor = 'var(--gray-300)';
                }
            });

            // Email validation
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value)) {
                    isValid = false;
                    emailInput.style.borderColor = 'var(--danger)';
                    showError('Please enter a valid email address');
                }
            }

            // Password confirmation
            const password = this.querySelector('input[name="password"]');
            const confirmPassword = this.querySelector('input[name="confirm_password"]');
            
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                isValid = false;
                confirmPassword.style.borderColor = 'var(--danger)';
                showError('Passwords do not match');
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    // Input focus effects
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary-purple)';
        });

        input.addEventListener('blur', function() {
            if (!this.value.trim() && this.hasAttribute('required')) {
                this.style.borderColor = 'var(--danger)';
            } else {
                this.style.borderColor = 'var(--gray-300)';
            }
        });
    });

    // Enhanced password validation for registration
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirm_password"]');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePasswordStrength(this.value);
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.querySelector('input[name="password"]').value;
            if (this.value && this.value !== password) {
                this.style.borderColor = 'var(--danger)';
                showError('Passwords do not match');
            } else {
                this.style.borderColor = 'var(--gray-300)';
            }
        });
    }
});

function validatePasswordStrength(password) {
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (password.length < 8) {
        passwordInput.style.borderColor = 'var(--danger)';
        return false;
    }
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
        passwordInput.style.borderColor = 'var(--danger)';
        return false;
    }
    
    passwordInput.style.borderColor = 'var(--success)';
    return true;
};

function showError(message) {
    showFlashMessage(message, 'error');
}

function showInfo(message) {
    showFlashMessage(message, 'info');
}

function showFlashMessage(message, type) {
    const flashContainer = document.querySelector('.flash-messages') || createFlashContainer();
    
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash-message flash-${type}`;
    flashDiv.innerHTML = `
        <span>${message}</span>
        <button class="flash-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    flashContainer.appendChild(flashDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (flashDiv.parentNode) {
            flashDiv.remove();
        }
    }, 5000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
}
