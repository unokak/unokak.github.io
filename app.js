// Bejelentkezési állapot ellenőrzése
function checkLoginState() {
    return localStorage.getItem("unokak_logged_in_user");
}

// Hiányzó segédfüggvény a hiba elkerülésére
function checkLoginState() {
    return localStorage.getItem("unokak_logged_in_user");
}
// --- BIZTONSÁGI ÉS BEJELENTKEZÉSI ALAPOK ---
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("unokak_logged_in_user");
    const page = window.location.pathname;
    
    // Védett oldalak ellenőrzése: ha nincs bejelentkezve senki, visszadob a főoldalra
    const isProtected = page.includes("unoka.html") || page.includes("admin.html");
    if (isProtected && !currentUser) {
        window.location.href = "index.html";
        return;
    }

    // Felhasználói név megjelenítése, ha be van lépve
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay && currentUser) {
        userDisplay.textContent = `Bejelentkezve: ${currentUser}`;
    }

    // Kilépés gomb kezelése
    const logoutBtn = document.getElementById("logoutBtn") || document.querySelector("button[onclick*='logout']");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("unokak_logged_in_user");
            window.location.href = "index.html";
        });
    }

    // Bejelentkezési űrlap kezelése a főoldalon
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("username").value.trim();
            const passwordInput = document.getElementById("password").value.trim();

            const data = await fetchAppData();
            if (!data || !data.users) {
                alert("Nem sikerült elérni az adatbázist!");
                return;
            }

            const user = data.users.find(u => u.username === usernameInput && u.password === passwordInput);
            if (user) {
                localStorage.setItem("unokak_logged_in_user", user.username);
                window.location.reload();
            } else {
                alert("Hibás felhasználónév vagy jelszó!");
            }
        });
    }

    initApp();
});

// JSONBin.io Konfiguráció
const JSONBIN_BIN_ID = '6ae71ab9ac6210605a634fba';
const JSONBIN_API_KEY = '$2a$10$4IGyh09KryVZw6kgbdEA1uG602Yi7nB0.kxu2eXGwbnk1ctGxtsAm';

// --- FŐ PROGRAM LOGIKA ---
async function fetchAppData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        if (!response.ok) throw new Error("Hiba az adatok lekérdezésekor");
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error("Adatbázis hiba:", error);
        return null;
    }
}

function initApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const kidId = urlParams.get('id');

    if (kidId) {
        loadPhotoGallery(kidId);
    }
}

async function loadPhotoGallery(kidId) {
    const container = document.getElementById("photoContainer");
    if (!container) return;

    const data = await fetchAppData();
    if (!data || !data.photos || !data.photos[kidId]) {
        container.innerHTML = "<p style='color: white; text-align: center; padding: 2rem;'>Nincsenek még képek ebben az albumban.</p>";
        return;
    }

    const currentUser = localStorage.getItem("unokak_logged_in_user");
    const isAdmin = currentUser === "admin" || currentUser === "Timi";

    container.innerHTML = "";
    data.photos[kidId].forEach((photo, index) => {
        const card = document.createElement("div");
        card.className = "photo-card";
        
        let adminButtons = '';
        if (isAdmin) {
            adminButtons = `
                <div class="admin-controls" style="margin-top: 10px;">
                    <button onclick="editPhoto('${kidId}', ${index})" class="btn-edit">Szerk</button>
                    <button onclick="deletePhoto('${kidId}', ${index})" class="btn-delete">Törlés</button>
                </div>
            `;
        }

        card.innerHTML = `
            <img src="${photo.url}" alt="${photo.title || 'Fotó'}">
            <div class="photo-info">
                <p>${photo.title || 'Nincs megjegyzés'}</p>
                ${adminButtons}
            </div>
        `;
        container.appendChild(card);
    });
}
