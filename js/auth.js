
const AUTH_CONFIG = {
    admin: { pwd: "senthiliipl", redirect: "admin.html" },
    canteen: { pwd: "canteen2026", redirect: "canteen.html" },
    employee: { pwd: "iiplpwd2026", redirect: "portal.html" }
};

function checkPageAuth(role) {
    const auth = localStorage.getItem(`${role}Auth`);
    if (auth !== "true") {
        window.location.href = `index.html?target=${role}`;
    }
}

function verifyPassword(role, inputPwd) {
    if (AUTH_CONFIG[role] && AUTH_CONFIG[role].pwd === inputPwd) {
        localStorage.setItem(`${role}Auth`, "true");
        return true;
    }
    return false;
}

function logout() {
    // Only remove auth keys, preserve deviceTokenId and activeDate
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("canteenAuth");
    localStorage.removeItem("employeeAuth");
    window.location.href = "index.html";
}
