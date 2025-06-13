// Profile JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    initializeModals();
});

function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            e.target.style.display = 'none';
        }
    });

    // Close modals with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

function showDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // Focus on password input
        const passwordInput = modal.querySelector('input[name="password"]');
        if (passwordInput) {
            setTimeout(() => passwordInput.focus(), 100);
        }
    }
}

function confirmDeleteEvent(eventId, eventName) {
    const modal = document.getElementById('deleteEventModal');
    const eventNameElement = document.getElementById('eventNameToDelete');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (modal && eventNameElement && confirmBtn) {
        eventNameElement.textContent = eventName;
        confirmBtn.href = `/delete_event/${eventId}`;
        
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Clear form inputs if any
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Enhanced event card interactions
document.addEventListener('DOMContentLoaded', function() {
    const eventCards = document.querySelectorAll('.my-event-card');
    
    eventCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
        });
    });
    
    // Profile actions animation
    const profileActions = document.querySelectorAll('.profile-actions .btn');
    profileActions.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Account deletion form validation
document.addEventListener('DOMContentLoaded', function() {
    const deleteAccountForm = document.getElementById('deleteAccountForm');
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', function(e) {
            const passwordInput = this.querySelector('input[name="password"]');
            
            if (!passwordInput.value.trim()) {
                e.preventDefault();
                passwordInput.style.borderColor = 'var(--danger)';
                showFlashMessage('Password is required to delete account', 'error');
                return;
            }
            
            // Final confirmation
            if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    }
});

// Flash message utility
function showFlashMessage(message, type = 'info') {
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
            flashDiv.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => flashDiv.remove(), 300);
        }
    }, 5000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
}

// Add slideOut animation if not exists
if (!document.querySelector('#slideOutStyle')) {
    const style = document.createElement('style');
    style.id = 'slideOutStyle';
    style.textContent = `
        @keyframes slideOut {
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
