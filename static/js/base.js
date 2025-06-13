// Base JavaScript - Core functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar functionality
    initializeSidebar();
    
    // Initialize flash messages
    initializeFlashMessages();
    
    // Initialize responsive features
    initializeResponsiveFeatures();
    
    // Initialize form enhancements
    initializeFormEnhancements();
});

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');

    // Desktop sidebar toggle
    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            // Store sidebar state
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // Restore sidebar state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    // Mobile menu toggle
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        });
    }

    // Close mobile sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = sidebar && sidebar.contains(e.target);
            const isClickOnToggle = mobileMenuToggle && mobileMenuToggle.contains(e.target);
            
            if (!isClickInsideSidebar && !isClickOnToggle && sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                document.body.classList.remove('sidebar-open');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar && sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });

    // Active navigation highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initializeFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(flash => {
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (flash.parentNode) {
                hideFlashMessage(flash);
            }
        }, 5000);
        
        // Manual close functionality
        const closeBtn = flash.querySelector('.flash-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideFlashMessage(flash);
            });
        }
    });
}

function hideFlashMessage(flashElement) {
    flashElement.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
        if (flashElement.parentNode) {
            flashElement.remove();
        }
    }, 300);
}

function initializeResponsiveFeatures() {
    // Handle responsive tables
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentNode.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });

    // Handle responsive images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.classList.contains('responsive')) {
            img.classList.add('responsive');
        }
    });
}

function initializeFormEnhancements() {
    // Enhanced form validation feedback
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Real-time validation feedback
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                // Clear error state on input
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    this.style.borderColor = '';
                }
            });
        });
    });

    // File input enhancements (if any)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
            const label = this.nextElementSibling;
            if (label && label.classList.contains('file-label')) {
                label.textContent = fileName;
            }
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Email validation
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // URL validation
    if (input.type === 'url' && value) {
        try {
            new URL(value);
        } catch (_) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }
    }

    // Date validation (future dates)
    if (input.type === 'date' && value && input.name === 'event_date') {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
            isValid = false;
            errorMessage = 'Date must be in the future';
        }
    }

    // Password strength (basic)
    if (input.type === 'password' && value && input.name === 'password') {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        }
    }

    // Update input styling
    if (isValid) {
        input.classList.remove('error');
        input.style.borderColor = '';
        hideInputError(input);
    } else {
        input.classList.add('error');
        input.style.borderColor = 'var(--danger)';
        showInputError(input, errorMessage);
    }

    return isValid;
}

function showInputError(input, message) {
    hideInputError(input); // Remove existing error
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--danger);
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

function hideInputError(input) {
    const existingError = input.parentNode.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
}

// Utility functions
function showFlashMessage(message, type = 'info') {
    const flashContainer = document.querySelector('.flash-messages') || createFlashContainer();
    
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash-message flash-${type}`;
    flashDiv.innerHTML = `
        <span>${message}</span>
        <button class="flash-close" type="button" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    flashContainer.appendChild(flashDiv);
    
    // Add close functionality
    const closeBtn = flashDiv.querySelector('.flash-close');
    closeBtn.addEventListener('click', () => hideFlashMessage(flashDiv));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (flashDiv.parentNode) {
            hideFlashMessage(flashDiv);
        }
    }, 5000);
}

function createFlashContainer() {
    let container = document.querySelector('.flash-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
    }
    return container;
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Loading states for buttons
function addLoadingState(button, loadingText = 'Loading...') {
    const originalText = button.textContent;
    const originalHTML = button.innerHTML;
    
    button.disabled = true;
    button.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        ${loadingText}
    `;
    
    return function removeLoadingState() {
        button.disabled = false;
        button.innerHTML = originalHTML;
    };
}

// Confirmation dialogs
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Local storage utilities
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage not available');
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn('localStorage not available');
        return defaultValue;
    }
}

// Add slideOut animation styles if not present
if (!document.querySelector('#slideOutAnimation')) {
    const style = document.createElement('style');
    style.id = 'slideOutAnimation';
    style.textContent = `
        @keyframes slideOut {
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .input-error {
            animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .responsive {
            max-width: 100%;
            height: auto;
        }
        
        .sidebar-open {
            overflow: hidden;
        }
        
        @media (max-width: 768px) {
            .sidebar-open .sidebar {
                transform: translateX(0) !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for use in other scripts
window.ATYAUtils = {
    showFlashMessage,
    hideFlashMessage,
    validateInput,
    addLoadingState,
    confirmAction,
    setLocalStorage,
    getLocalStorage
};
