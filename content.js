class GmailProgressBar {
  constructor() {
    this.progressBarContainer = null;
    this.progressBar = null;
    this.init();
  }

  init() {
    // Wait for Gmail to load completely
    this.waitForGmailToLoad().then(() => {
      this.createProgressBar();
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
    if (!this.progressBarContainer) {
      this.progressBarContainer = document.createElement("div");
      this.progressBarContainer.className = "gmail-progress-container";

      this.progressBar = document.createElement("div");
      this.progressBar.className = "gmail-progress-bar";

      this.progressBarContainer.appendChild(this.progressBar);
    }
  }

  findScrollableParent(element) {
    if (!element) return null;

    // Check if the element itself is scrollable
    const style = window.getComputedStyle(element);
    const overflowY = style.getPropertyValue("overflow-y");

    if (
      element.scrollHeight > element.clientHeight &&
      (overflowY === "auto" || overflowY === "scroll")
    ) {
      return element;
    }

    // If not, check its parent
    return this.findScrollableParent(element.parentElement);
  }

  isInEmailThread() {
    // Check if we're in a thread by looking for multiple email items
    const list = document.querySelector('[role="list"]');
    const hasMultipleEmails =
      list?.querySelectorAll('[role="listitem"]').length > 1;
    return hasMultipleEmails;
  }

  updateProgress(scrollableElement) {
    if (!scrollableElement) return;

    const maxScroll =
      scrollableElement.scrollHeight - scrollableElement.clientHeight;
    const scrollPercentage =
      maxScroll > 0 ? (scrollableElement.scrollTop / maxScroll) * 100 : 0;
    this.progressBar.style.width = `${scrollPercentage}%`;
  }

  setupScrollListener() {
    const list = document.querySelector('[role="list"]');
    if (!list) return;

    // Find the scrollable container
    const scrollableElement = this.findScrollableParent(list);

    if (scrollableElement) {
      // Remove existing listener if any
      if (this._boundUpdateProgress && this._currentScrollable) {
        this._currentScrollable.removeEventListener(
          "scroll",
          this._boundUpdateProgress
        );
      }

      // Create bound function for the event listener
      this._boundUpdateProgress = () => this.updateProgress(scrollableElement);
      this._currentScrollable = scrollableElement;

      // Add new listener
      scrollableElement.addEventListener("scroll", this._boundUpdateProgress);

      // Initial update
      this.updateProgress(scrollableElement);
      this.showProgressBar();
    }
  }

  observeEmailThread() {
    const observer = new MutationObserver(() => {
      if (this.isInEmailThread()) {
        this.setupScrollListener();
      } else {
        this.hideProgressBar();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial setup
    if (this.isInEmailThread()) {
      this.setupScrollListener();
    }
  }

  observeUrlChanges() {
    // Watch for URL changes using History API
    const pushState = history.pushState;
    history.pushState = function () {
      pushState.apply(history, arguments);
      window.dispatchEvent(new Event("pushstate"));
    };

    window.addEventListener("pushstate", () => this.handleUrlChange());
    window.addEventListener("popstate", () => this.handleUrlChange());
  }

  handleUrlChange() {
    setTimeout(() => {
      if (this.isInEmailThread()) {
        this.setupScrollListener();
      } else {
        this.hideProgressBar();
      }
    }, 500); // Give Gmail some time to update the DOM
  }

  hideProgressBar() {
    if (this.progressBarContainer && this.progressBarContainer.parentNode) {
      this.progressBarContainer.parentNode.removeChild(
        this.progressBarContainer
      );
    }
    // Clean up scroll listener
    if (this._boundUpdateProgress && this._currentScrollable) {
      this._currentScrollable.removeEventListener(
        "scroll",
        this._boundUpdateProgress
      );
      this._currentScrollable = null;
    }
  }

  showProgressBar() {
    const toolbarContainer = document.querySelector('[role="banner"]');
    if (
      toolbarContainer &&
      !document.querySelector(".gmail-progress-container")
    ) {
      toolbarContainer.appendChild(this.progressBarContainer);
    }
  }
}

// Initialize the progress bar
new GmailProgressBar();
