/**
 * Admin Report Logic (Powered by Supabase)
 */

async function generateReport() {
    const today = new Date().toISOString().split('T')[0];

    const { data: tokens, error } = await supabaseClient
        .from('tokens')
        .select('*')
        .eq('created_at', today);

    if (error) {
        console.error("Error fetching report data:", error);
        return;
    }

    const served = tokens.filter(t => t.status === 'served');
    const pending = tokens.filter(t => t.status === 'pending');
    const servedEmployees = served.filter(t => t.type === 'emp').length;
    const servedGuests = served.filter(t => t.type === 'guest').length;

    // Update DOM
    document.getElementById("reportDate").textContent = `Summary for ${today}`;
    document.getElementById("issuedCount").textContent = tokens.length;
    document.getElementById("empCount").textContent = servedEmployees;
    document.getElementById("guestCount").textContent = servedGuests;
    document.getElementById("servedCount").textContent = served.length;
    document.getElementById("pendingCount").textContent = pending.length;
}

// Initial Generation
generateReport();

// Refresher
setInterval(generateReport, 3000); // Auto refresh every 3s
