/**
 * Token View Logic (Powered by Supabase)
 */

async function loadTokenTable() {
    const tableBody = document.getElementById("tokenTableBody");
    const noDataMessage = document.getElementById("noDataMessage");
    const today = new Date().toISOString().split('T')[0];

    const { data: tokens, error } = await supabaseClient
        .from('tokens')
        .select('*')
        .eq('created_at', today)
        .order('token_number', { ascending: true });

    if (error) {
        console.error("Error loading table:", error);
        return;
    }

    tableBody.innerHTML = "";
    if (!tokens || tokens.length === 0) {
        noDataMessage.style.display = "block";
    } else {
        noDataMessage.style.display = "none";
        tokens.forEach(t => {
            const row = document.createElement("tr");

            const statusClass = t.status === 'served' ? 'status-served' : 'status-pending';
            const typeLabel = t.type === 'emp' ? 'Employee' : 'Guest';
            const timeStr = t.issued_at ? new Date(t.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

            row.innerHTML = `
                <td><strong>#${t.token_number}</strong></td>
                <td>${t.name}</td>
                <td>${typeLabel}</td>
                <td>${timeStr}</td>
                <td><span class="status-badge ${statusClass}">${t.status.toUpperCase()}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Initial Load
loadTokenTable();

// Realtime Update logic
supabaseClient
    .channel('public:tokens_view')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => {
        loadTokenTable();
    })
    .subscribe();

// PDF Download Logic
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const element = document.querySelector('.container');
    const today = new Date().toISOString().split('T')[0];
    const options = {
        margin: 10,
        filename: `Token_Details_${today}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Hide buttons temporarily for clean PDF
    const btnGroup = document.querySelector('.btn-group');
    const backBtn = document.querySelector('.back-btn');
    btnGroup.style.display = 'none';
    backBtn.style.display = 'none';

    html2pdf().set(options).from(element).save().then(() => {
        btnGroup.style.display = 'flex';
        backBtn.style.display = 'block';
    });
});

// Fallback Polling
setInterval(loadTokenTable, 3000);

