// --- 1. ALAPVETŐ SEGÉDFÜGGVÉNYEK ---
function checkLoginState() {
    return localStorage.getItem("unokak_logged_in_user");
}

function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "block";
    }
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// --- 2. BEJELENTKEZÉS KEZELÉSE ---
async function handleLogin() {
    const usernameInput = document.getElementById("username")?.value.trim();
    const passwordInput = document.getElementById("password")?.value.trim();

    if (!usernameInput || !passwordInput) {
        alert("Kérlek add meg a felhasználónevet és a jelszót!");
        return;
    }

    // Helyi mentőöv admin belépéshez
    if (usernameInput === "admin" && passwordInput === "123") {
        localStorage.setItem("unokak_logged_in_user", "admin");
        window.location.reload();
        return;
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });

        if (!response.ok) throw new Error("Szerver hiba");

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
        console.error("Hálózati hiba:", error);
        if (usernameInput === "admin") {
            alert("Hálózati hiba miatt az admin fiókkal most helyileg léptetlek be.");
            localStorage.setItem("unokak_logged_in_user", "admin");
            window.location.reload();
        } else {
            alert("Nem sikerült kapcsolódni az adatbázishoz!");
        }
    }
}

// --- 3. OLDAL BETÖLTÉSE ÉS ESEMÉNYEK ---
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("unokak_logged_in_user");
    const page = window.location.pathname;
    
    const isProtected = page.includes("unoka.html") || page.includes("admin.html");
    if (isProtected && !currentUser) {
        window.location.href = "index.html";
        return;
    }

    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay && currentUser) {
        userDisplay.textContent = `Bejelentkezve: ${currentUser}`;
    }

    // Kilépés gomb
    const logoutBtn = document.getElementById("logoutBtn") || document.querySelector("button[onclick*='logout']");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("unokak_logged_in_user");
            window.location.href = "index.html";
        });
    }

    initApp();
});

// JSONBin.io Konfiguráció
const JSONBIN_BIN_ID = '6ae71ab9ac6210605a634fba';
const JSONBIN_API_KEY = '$2a$10$4IGyh09KryVZw6kgbdEA1uG602Yi7nB0.kxu2eXGwbnk1ctGxtsAm';

async function fetchAppData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.record;
    } catch (error) {
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
    const container = document.getElementById("photoContainer") || document.querySelector(".photo-container") || document.body;
    if (!container) return;

    container.innerHTML = "<p style='color: white; text-align: center; padding: 2rem;'>Adatok betöltése...</p>";

    const data = await fetchAppData();
    
    if (data && data.photos && data.photos[kidId]) {
        renderPhotos(kidId, data.photos[kidId], container);
    } else {
        container.innerHTML = `
            <div style="text-align: center; color: white; padding: 2rem;">
                <p>Még nincsenek regisztrált képek ebben az albumban a JSONBin-ben.</p>
                <p style="color: #aaa; font-size: 0.9rem;">ID: ${kidId}</p>
            </div>
        `;
    }
}

function renderPhotos(kidId, photosArray, container) {
    const currentUser = localStorage.getItem("unokak_logged_in_user");
    const isAdmin = currentUser === "admin" || currentUser === "Timi";

    container.innerHTML = "";
    photosArray.forEach((photo, index) => {
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
            <img src="${photo.url}" alt="${photo.title || 'Fotó'}" style="max-width: 100%; border-radius: 8px;">
            <div class="photo-info" style="margin-top: 8px;">
                <p style="color: white;">${photo.title || 'Nincs megjegyzés'}</p>
                ${adminButtons}
            </div>
        `;
        container.appendChild(card);
    });
}
