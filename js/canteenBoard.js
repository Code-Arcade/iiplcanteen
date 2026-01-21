const pendingGrid = document.getElementById("pendingTokens");
const servedGrid = document.getElementById("servedTokens");

/**
 * Fetch and Render Board
 */
async function refreshBoard() {
    const today = new Date().toISOString().split('T')[0];

    const { data: tokens, error } = await supabaseClient
        .from('tokens')
        .select('*')
        .eq('created_at', today)
        .order('token_number', { ascending: true });

    if (error) {
        console.error("Error fetching board:", error);
        return;
    }

    renderGrid(tokens.filter(t => t.status === 'pending'), pendingGrid, true);
    renderGrid(tokens.filter(t => t.status === 'served'), servedGrid, false);
}

/**
 * Handle Serving a Token
 */
async function serveToken(dbId, tokenNumber) {
    const { error } = await supabaseClient
        .from('tokens')
        .update({ status: 'served', served_at: new Date().toISOString() })
        .eq('id', dbId);

    if (error) {
        showNotification("Unable to update status. Please check your connection and try again.", "error");
        console.error(error);
        return;
    }

    showNotification(`Token #${tokenNumber} marked as served!`, "success");
    refreshBoard();
}

/**
 * UI Renderer
 */
function renderGrid(list, container, isClickable) {
    container.innerHTML = "";
    list.forEach(token => {
        const div = document.createElement("div");
        div.textContent = token.token_number;

        if (isClickable) {
            div.onclick = () => serveToken(token.id, token.token_number);
            div.title = `Click to serve ${token.name}`;
        }

        container.appendChild(div);
    });
}

// Initial Load
refreshBoard();

// Live Updates! (Supabase Realtime)
supabaseClient
    .channel('public:tokens')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => {
        refreshBoard();
    })
    .subscribe();

// Fallback Polling
setInterval(refreshBoard, 3000);
