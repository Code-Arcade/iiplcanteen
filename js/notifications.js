/**
 * Enhanced Notification System
 */

// Initialize Containers
document.addEventListener('DOMContentLoaded', () => {
    // Toast Container
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    // Confirm Modal Overlay
    if (!document.getElementById('confirm-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-modal">
                <h3 id="confirm-title">Confirm Action</h3>
                <p id="confirm-message">Are you sure you want to proceed?</p>
                <div class="confirm-btns">
                    <button class="btn-cancel" id="confirm-cancel">Cancel</button>
                    <button class="btn-confirm" id="confirm-ok">Yes, Proceed</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) hideConfirm();
        };
    }
});

function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icon}</span>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);

    // Force reflow
    void toast.offsetWidth;

    // Show
    toast.classList.add('show');

    // Auto-remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

let confirmCallback = null;

function showConfirm(message, callback, title = "Confirm Action") {
    const overlay = document.getElementById('confirm-overlay');
    const msgEl = document.getElementById('confirm-message');
    const titleEl = document.getElementById('confirm-title');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    titleEl.textContent = title;
    msgEl.textContent = message;
    confirmCallback = callback;

    overlay.classList.add('active');

    okBtn.onclick = () => {
        hideConfirm();
        if (confirmCallback) confirmCallback();
    };

    cancelBtn.onclick = () => {
        hideConfirm();
    };
}

function hideConfirm() {
    const overlay = document.getElementById('confirm-overlay');
    overlay.classList.remove('active');
    confirmCallback = null;
}

// Global replacement (Optional but helpful for transition)
window.showAlert = showNotification;
window.showConfirmModal = showConfirm;
