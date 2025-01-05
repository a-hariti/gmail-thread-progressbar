// Gmail Progress Bar Content Script

class GmailProgressBar {
    constructor() {
        this.progressBarContainer = null;
        this.progressBar = null;
        this.progressText = null;
        this.intersectionObserver = null;
        this.currentEmail = 1;
        this.totalEmails = 0;
        this.visibleEmails = new Set();
        this.init();
    }

    init() {
        // Wait for Gmail to load completely
        this.waitForGmailToLoad().then(() => {
            this.createProgressBar();
            this.setupIntersectionObserver();
            this.observeEmailThread();
            this.observeUrlChanges();
        });
    }

    waitForGmailToLoad() {
        return new Promise((resolve) => {
            const checkLoaded = setInterval(() => {
                if (document.querySelector('[role="main"]')) {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
        });
    }

    createProgressBar() {
        // Create progress bar container if it doesn't exist
        if (!this.progressBarContainer) {
            this.progressBarContainer = document.createElement('div');
            this.progressBarContainer.className = 'gmail-progress-container';
            
            this.progressBar = document.createElement('div');
            this.progressBar.className = 'gmail-progress-bar';
            
            this.progressText = document.createElement('div');
            this.progressText.className = 'gmail-progress-text';
            
            this.progressBarContainer.appendChild(this.progressBar);
            this.progressBarContainer.appendChild(this.progressText);
        }
    }

    isInEmailThread() {
        // Check if we're in a thread by looking for multiple email items
        const emails = document.querySelectorAll('[role="listitem"]');
        return emails.length > 1;
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            threshold: 0.5
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const emailElement = entry.target;
                if (entry.isIntersecting && emailElement.getAttribute('aria-expanded') !== 'false') {
                    this.visibleEmails.add(emailElement);
                } else {
                    this.visibleEmails.delete(emailElement);
                }
                this.updateProgressBasedOnLastVisibleEmail();
            });
        }, options);
    }

    updateProgressBasedOnLastVisibleEmail() {
        if (!this.isInEmailThread()) {
            this.hideProgressBar();
            return;
        }

        const emails = Array.from(document.querySelectorAll('[role="listitem"]'));
        this.totalEmails = emails.length;

        if (this.visibleEmails.size > 0) {
            // Convert Set to Array and sort by DOM position
            const visibleEmailsArray = Array.from(this.visibleEmails);
            const lastVisibleEmail = visibleEmailsArray.reduce((last, current) => {
                const lastRect = last.getBoundingClientRect();
                const currentRect = current.getBoundingClientRect();
                return currentRect.top > lastRect.top ? current : last;
            });

            const index = emails.indexOf(lastVisibleEmail);
            if (index !== -1) {
                this.currentEmail = index + 1;
                this.updateProgressBar();
                this.showProgressBar();
            }
        }
    }

    observeEmailThread() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            for (const mutation of mutations) {
                // Check for attribute changes
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'aria-expanded') {
                    shouldUpdate = true;
                    break;
                }
                // Check for DOM changes
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    shouldUpdate = true;
                    break;
                }
            }

            if (shouldUpdate) {
                if (this.isInEmailThread()) {
                    // Small delay to let the expansion/collapse animation complete
                    setTimeout(() => {
                        this.updateEmailObservers();
                    }, 100);
                } else {
                    this.hideProgressBar();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-expanded']
        });

        // Initial setup
        this.updateEmailObservers();
    }

    observeUrlChanges() {
        // Watch for URL changes using History API
        const pushState = history.pushState;
        history.pushState = function() {
            pushState.apply(history, arguments);
            window.dispatchEvent(new Event('pushstate'));
        };

        window.addEventListener('pushstate', () => this.handleUrlChange());
        window.addEventListener('popstate', () => this.handleUrlChange());
    }

    handleUrlChange() {
        setTimeout(() => {
            if (this.isInEmailThread()) {
                this.updateEmailObservers();
            } else {
                this.hideProgressBar();
            }
        }, 500); // Give Gmail some time to update the DOM
    }

    hideProgressBar() {
        if (this.progressBarContainer && this.progressBarContainer.parentNode) {
            this.progressBarContainer.parentNode.removeChild(this.progressBarContainer);
        }
    }

    showProgressBar() {
        const toolbarContainer = document.querySelector('[role="banner"]');
        if (toolbarContainer && !document.querySelector('.gmail-progress-container')) {
            toolbarContainer.appendChild(this.progressBarContainer);
        }
    }

    updateEmailObservers() {
        const emailContainer = document.querySelector('[role="main"]');
        if (!emailContainer) return;

        const emails = emailContainer.querySelectorAll('[role="listitem"]');
        if (!emails.length) return;

        // Update total emails count
        this.totalEmails = emails.length;

        // Clear previous visible emails
        this.visibleEmails.clear();

        // Remove previous observers and add new ones
        emails.forEach(email => {
            // Only consider expanded emails as visible initially
            if (email.getAttribute('aria-expanded') !== 'false') {
                const rect = email.getBoundingClientRect();
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    this.visibleEmails.add(email);
                }
            }
            this.intersectionObserver.observe(email);
        });

        if (this.isInEmailThread()) {
            this.showProgressBar();
            // Initial update
            this.updateProgressBasedOnLastVisibleEmail();
        }
    }

    updateProgressBar() {
        const progress = (this.currentEmail / this.totalEmails) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `Email ${this.currentEmail} of ${this.totalEmails}`;
    }
}

// Initialize the progress bar
new GmailProgressBar();
