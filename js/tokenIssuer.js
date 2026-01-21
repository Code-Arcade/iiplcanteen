const empBtn = document.getElementById("empBtn");
const tokenBox = document.getElementById("tokenBox");
const nameInput = document.getElementById("userName");

/**
 * Visual Feedback
 */
function animateToken() {
    tokenBox.classList.remove("animate");
    void tokenBox.offsetWidth; // Trigger reflow
    tokenBox.classList.add("animate");
}

/**
 * Safety Cooldown
 */
function setCooldown() {
    empBtn.disabled = true;
    setTimeout(() => {
        empBtn.disabled = false;
    }, 800);
}

/**
 * Duplicate Check Logic (Now checks Supabase)
 */
async function checkNameDuplicate(name) {
    if (!name || !name.trim()) return { status: 'empty' };
    const formattedName = name.trim();

    const { data: existingToken, error } = await supabaseClient
        .from('tokens')
        .select('token_number, status')
        .eq('name', formattedName)
        .eq('created_at', new Date().toISOString().split('T')[0])
        .maybeSingle();

    if (error) {
        console.error("Connection Error:", error);
        return { status: 'ok' }; // Fallback
    }

    if (existingToken) {
        return {
            status: existingToken.status === 'pending' ? 'pending' : 'served',
            id: existingToken.token_number
        };
    }

    return { status: 'ok' };
}

/**
 * Get Last Token Number from Supabase
 */
async function getNextTokenNumber(type) {
    const minRange = type === 'emp' ? 0 : 500;
    const maxRange = type === 'emp' ? 499 : 9999;

    const { data, error } = await supabaseClient
        .from('tokens')
        .select('token_number')
        .eq('created_at', new Date().toISOString().split('T')[0])
        .gte('token_number', minRange)
        .lte('token_number', maxRange)
        .order('token_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching last token:", error);
        return minRange + 1;
    }

    return data ? data.token_number + 1 : (minRange + 1);
}

/**
 * Main Token Issuance
 */
async function generateToken(type) {
    const name = nameInput.value.trim();

    // 1. Device Lock Check (Keep in LocalStorage for simplicity)
    const deviceToken = localStorage.getItem("deviceTokenId");
    if (deviceToken) {
        showNotification(`You have already generated Token #${deviceToken} today.`, 'warning');
        tokenBox.textContent = deviceToken;
        return;
    }

    if (!name) {
        showNotification("Please enter your name first!", 'warning');
        nameInput.focus();
        return;
    }

    empBtn.disabled = true;
    tokenBox.textContent = "...";

    // Speed Optimization: Fetch check and next number in parallel
    const [check, nextNumber] = await Promise.all([
        checkNameDuplicate(name),
        getNextTokenNumber(type)
    ]);

    if (check.status === 'pending') {
        showNotification(`Hello ${name}, you already have a pending Token #${check.id}.`, 'info');
        tokenBox.textContent = check.id;
        empBtn.disabled = false;
        return;
    }
    if (check.status === 'served') {
        showNotification(`Sorry ${name}, your Token #${check.id} was already used today.`, 'error');
        tokenBox.textContent = check.id;
        empBtn.disabled = false;
        return;
    }
    // nextNumber is already fetched above in Promise.all

    const { data, error } = await supabaseClient
        .from('tokens')
        .insert([{
            token_number: nextNumber,
            name: name,
            type: type,
            status: 'pending'
        }])
        .select();

    if (error) {
        showNotification("The system is currently unable to issue a token. Please try again in a moment.", 'error');
        console.error(error);
        empBtn.disabled = false;
        tokenBox.textContent = "--";
        return;
    }

    // 2. Set Device Lock
    localStorage.setItem("deviceTokenId", nextNumber);

    tokenBox.textContent = nextNumber;
    animateToken();
    setCooldown();
    nameInput.value = "";
    showNotification(`Token #${nextNumber} issued successfully!`, 'success');
}

// Events
empBtn.onclick = () => generateToken('emp');
