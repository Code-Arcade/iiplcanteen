/**
 * Daily Reset & Data Integrity Guard
 * Manages only local device state (like device locks).
 * The main token sequence is now managed globally via Supabase.
 */
function dailyResetCheck() {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("activeDate");

    if (savedDate !== today) {
        console.log("New day detected. Resetting local device state...");

        // Update active date
        localStorage.setItem("activeDate", today);

        // Clear local device lock
        localStorage.removeItem("deviceTokenId");

        // We can clear legacy localStorage keys to save space
        localStorage.removeItem("issuedTokens");
        localStorage.removeItem("servedTokens");
        localStorage.removeItem("lastEmployeeToken");
        localStorage.removeItem("lastGuestToken");
    }
}

// Run immediately
dailyResetCheck();
