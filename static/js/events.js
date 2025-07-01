// Events JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Filter toggle functionality
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');

    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', function() {
            filterPanel.classList.toggle('active');
            
            // Update button text
            const isActive = filterPanel.classList.contains('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fas fa-times' : 'fas fa-filter';
            }
        });
    }

    // Add change listeners to filter inputs for auto-submission
    const collegeFilter = document.getElementById('college_filter');
    const dateFromFilter = document.getElementById('date_from');
    const dateToFilter = document.getElementById('date_to');
    
    if (collegeFilter) {
        collegeFilter.addEventListener('change', applyFilters);
    }
    
    if (dateFromFilter) {
        dateFromFilter.addEventListener('change', applyFilters);
    }
    
    if (dateToFilter) {
        dateToFilter.addEventListener('change', applyFilters);
    }
    
    // For category checkboxes, apply filters when changed
    const categoryCheckboxes = document.querySelectorAll('input[name="category_filter"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedText('categoryMultiselect');
            setTimeout(applyFilters, 100); // Small delay to allow UI update
        });
    });

    // Date validation for event forms
    const eventDateInput = document.getElementById('event_date');
    if (eventDateInput) {
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        eventDateInput.setAttribute('min', minDate);

        eventDateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate <= today) {
                this.style.borderColor = 'var(--danger)';
                showFlashMessage('Event date must be in the future', 'error');
                this.value = '';
            } else {
                this.style.borderColor = 'var(--gray-300)';
            }
        });
    }

    // URL validation
    const urlInputs = document.querySelectorAll('input[type="url"]');
    urlInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidURL(this.value)) {
                this.style.borderColor = 'var(--danger)';
                
                if (this.name === 'location') {
                    showFlashMessage('Please enter a valid Google Maps URL', 'error');
                } else {
                    showFlashMessage('Please enter a valid URL', 'error');
                }
            } else {
                this.style.borderColor = 'var(--gray-300)';
            }
        });
    });

    // Google Maps URL validation
    const locationInput = document.querySelector('input[name="location"]');
    if (locationInput) {
        locationInput.addEventListener('blur', function() {
            if (this.value && !isGoogleMapsURL(this.value)) {
                this.style.borderColor = 'var(--danger)';
                showFlashMessage('Please enter a valid Google Maps URL', 'error');
            }
        });
    }

    // Form validation
    const eventForm = document.querySelector('.event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            let isValid = true;

            // Check required fields
            const requiredInputs = this.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--danger)';
                }
            });

            // Validate URLs
            const locationInput = this.querySelector('input[name="location"]');
            const registrationInput = this.querySelector('input[name="registration_link"]');

            if (locationInput && locationInput.value && !isGoogleMapsURL(locationInput.value)) {
                isValid = false;
                locationInput.style.borderColor = 'var(--danger)';
                showFlashMessage('Please enter a valid Google Maps URL', 'error');
            }

            if (registrationInput && registrationInput.value && !isValidURL(registrationInput.value)) {
                isValid = false;
                registrationInput.style.borderColor = 'var(--danger)';
                showFlashMessage('Please enter a valid registration URL', 'error');
            }

            // Validate future date
            const dateInput = this.querySelector('input[name="event_date"]');
            if (dateInput && dateInput.value) {
                const selectedDate = new Date(dateInput.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate <= today) {
                    isValid = false;
                    dateInput.style.borderColor = 'var(--danger)';
                    showFlashMessage('Event date must be in the future', 'error');
                }
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    // Real-time search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    // Submit the form automatically
                    this.closest('form').submit();
                }, 500);
            }
        });
    }

    // Card hover effects
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initialize selected text on page load
    updateSelectedText('categoryMultiselect');
});

// Function to handle filter changes and submit form
function applyFilters() {
    const form = document.querySelector('.search-form');
    if (form) {
        form.submit();
    }
}

// URL validation functions
function isValidURL(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function isGoogleMapsURL(url) {
    if (!isValidURL(url)) return false;
    
    const validDomains = [
        'maps.google.com',
        'www.google.com/maps',
        'google.com/maps',
        'maps.app.goo.gl',
        'goo.gl'
    ];
    
    try {
        const urlObj = new URL(url);
        return validDomains.some(domain => 
            urlObj.hostname.includes(domain) || urlObj.hostname === domain
        );
    } catch (_) {
        return false;
    }
}

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

// Toggle dropdown visibility
function toggleDropdown(selectId) {
    const multiselect = document.getElementById(selectId);
    const selected = multiselect.querySelector('.multiselect-selected');
    const options = multiselect.querySelector('.multiselect-options');
    
    selected.classList.toggle('active');
    options.classList.toggle('active');
    
    // Close other dropdowns
    document.querySelectorAll('.custom-multiselect').forEach(dropdown => {
        if (dropdown.id !== selectId) {
            dropdown.querySelector('.multiselect-selected').classList.remove('active');
            dropdown.querySelector('.multiselect-options').classList.remove('active');
        }
    });
}

// Update selected text based on checked options
function updateSelectedText(selectId) {
    const multiselect = document.getElementById(selectId);
    if (!multiselect) return;
    
    const checkboxes = multiselect.querySelectorAll('input[type="checkbox"]:checked');
    const selectedText = multiselect.querySelector('.selected-text');
    
    if (!selectedText) return;
    
    if (checkboxes.length === 0) {
        selectedText.textContent = 'All Categories';
        selectedText.style.color = 'var(--gray-700)';
    } else if (checkboxes.length === 1) {
        selectedText.textContent = checkboxes[0].nextElementSibling.textContent;
        selectedText.style.color = 'var(--gray-700)';
    } else {
        selectedText.textContent = `${checkboxes.length} categories selected`;
        selectedText.style.color = 'var(--primary-purple)';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const multiselects = document.querySelectorAll('.custom-multiselect');
    multiselects.forEach(multiselect => {
        if (!multiselect.contains(event.target)) {
            multiselect.querySelector('.multiselect-selected').classList.remove('active');
            multiselect.querySelector('.multiselect-options').classList.remove('active');
        }
    });
});
