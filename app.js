// Bejelentkezési állapot segédfüggvény
function checkLoginState() {
    return localStorage.getItem("unokak_logged_in_user");
}

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("unokak_logged_in_user");
    const page = window.location.pathname;
    
    // Védett oldalak ellenőrzése
    const isProtected = page.includes("unoka.html") || page.includes("admin.html");
    if (isProtected && !currentUser) {
        window.location.href = "index.html";
        return;
    }

    // Felhasználói név megjelenítése
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay && currentUser) {
        userDisplay.textContent = `Bejelentkezve: ${currentUser}`;
    }

    // UNIVERZÁLIS KATTINTÁSFIGYELŐ A BEJELENTKEZÉSRE
    document.addEventListener("click", async (e) => {
        const target = e.target;
        // Ha olyan gombra kattintottak, aminek a felirata "Belépés"
        if (target && target.textContent && target.textContent.trim() === "Belépés") {
            const usernameInput = document.getElementById("username")?.value.trim();
            const passwordInput = document.getElementById("password")?.value.trim();

            if (usernameInput && passwordInput) {
                e.preventDefault();
                await performLoginManual(usernameInput, passwordInput);
            }
        }
    });

    // Ha Entert nyomnak a jelszó mezőben
    const passwordField = document.getElementById("password");
    if (passwordField) {
        passwordField.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const usernameInput = document.getElementById("username")?.value.trim();
                const passwordInput = document.getElementById("password")?.value.trim();
                if (usernameInput && passwordInput) {
                    await performLoginManual(usernameInput, passwordInput);
                }
            }
        });
    }
});

// JSONBin.io Konfiguráció
const JSONBIN_BIN_ID = '6ae71ab9ac6210605a634fba';
const JSONBIN_API_KEY = '$2a$10$4IGyh09KryVZw6kgbdEA1uG602Yi7nB0.kxu2eXGwbnk1ctGxtsAm';

async function performLoginManual(usernameInput, passwordInput) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        if (!response.ok) throw new Error("Hiba az adatbázis elérésekor");
        const data = await response.json();
        
        const users = data.record.users || [];
        const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

        if (user) {
            localStorage.setItem("unokak_logged_in_user", user.username);
            window.location.reload();
        } else {
            alert("Hibás felhasználónév vagy jelszó!");
        }
    } catch (error) {
        console.error("Bejelentkezési hiba:", error);
        alert("Nem sikerült kapcsolódni az adatbázishoz!");
    }
}
