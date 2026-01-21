const empBtn = document.getElementById("empBtn");
const guestBtn = document.getElementById("guestBtn");
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
 * Admin Token Issuance (No restriction)
 */
async function generateToken(type) {
    let name = nameInput.value.trim();

    if (!name) {
        alert(`Please enter ${type === 'guest' ? 'guest' : 'employee'} name!`);
        nameInput.focus();
        return;
    }

    tokenBox.textContent = "...";
    const nextNumber = await getNextTokenNumber(type);

    const { error } = await supabaseClient
        .from('tokens')
        .insert([{
            token_number: nextNumber,
            name: name,
            type: type,
            status: 'pending'
        }]);

    if (error) {
        alert("The system is currently unable to issue a token. Please try again in a moment.");
        console.error(error);
        tokenBox.textContent = "--";
        return;
    }

    tokenBox.textContent = nextNumber;
    animateToken();
    nameInput.value = "";
}

// Events
empBtn.onclick = () => generateToken('emp');
guestBtn.onclick = () => generateToken('guest');
