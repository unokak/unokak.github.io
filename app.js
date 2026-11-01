// --- KONFIGURÁCIÓ ---
const JSONBIN_BIN_ID = '6ae71ab9ac6210605a634fba';
const JSONBIN_API_KEY = '$2a$10$4IGyh09KryVZw6kgbdEA1uG602Yi7nB0.kxu2eXGwbnk1ctGxtsAm';

// --- BEJELENTKEZÉS ÉS JOGOSULTSÁG ---
function checkLoginState() {
    return localStorage.getItem("unokak_logged_in_user");
}

function isAdmin() {
    const user = localStorage.getItem("unokak_logged_in_user");
    return user === "admin" || user === "Timi";
}

function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "block";
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "none";
}

async function handleLogin() {
    const usernameInput = document.getElementById("username")?.value.trim();
    const passwordInput = document.getElementById("password")?.value.trim();

    if (!usernameInput || !passwordInput) {
        alert("Kérlek add meg a felhasználónevet és a jelszót!");
        return;
    }

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
        console.error("Bejelentkezési hiba:", error);
        if (usernameInput === "admin") {
            localStorage.setItem("unokak_logged_in_user", "admin");
            window.location.reload();
        } else {
            alert("Nem sikerült kapcsolódni az adatbázishoz!");
        }
    }
}

// --- ALAPOK ÉS GALÉRIA BETÖLTÉSE ---
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("unokak_logged_in_user");
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay && currentUser) {
        userDisplay.textContent = `Bejelentkezve: ${currentUser}`;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("unokak_logged_in_user");
            window.location.href = "index.html";
        });
    }

    initApp();
});

async function fetchAppData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        if (!response.ok) throw new Error("API hiba");
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.warn("JSONBin hiba, helyi adatok használata.");
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

function loadKidGallery(kidId) {
    loadPhotoGallery(kidId);
}

async function loadPhotoGallery(kidId) {
    const container = document.getElementById("photoContainer");
    if (!container) return;

    container.innerHTML = "<p style='color: white; text-align: center; padding: 2rem;'>Képek betöltése...</p>";

    const data = await fetchAppData();
    const targetKey = kidId ? kidId.toLowerCase() : "";

    let photosArray = null;
    if (data && data.photos && data.photos[targetKey]) {
        photosArray = data.photos[targetKey];
    } else if (targetKey === "abris") {
        // Biztonsági mentőöv Ábris képeivel
        photosArray = [
            { id: 1, year: 2003, url: "https://unokak.github.io/Abris/Abris-2003-12-24.jpg", caption: "Karácsony / Születés" },
            { id: 2, year: 2003, url: "https://unokak.github.io/Abris/Abris-itthon.jpg", caption: "Otthon" }
        ];
    }

    if (photosArray && photosArray.length > 0) {
        renderPhotos(targetKey, photosArray, container);
    } else {
        container.innerHTML = "<p style='color: white; text-align: center; padding: 2rem;'>Még nincsenek feltöltött képek.</p>";
    }
}

function renderPhotos(kidId, photosArray, container) {
    const admin = isAdmin();

    container.innerHTML = "";
    photosArray.forEach((photo, index) => {
        const card = document.createElement("div");
        card.className = "photo-card";
        
        let adminButtons = '';
        if (admin) {
            adminButtons = `
                <div class="admin-controls" style="margin-top: 10px;">
                    <button onclick="editPhoto('${kidId}', ${index})" class="btn-edit">Szerk</button>
                    <button onclick="deletePhoto('${kidId}', ${index})" class="btn-delete">Törlés</button>
                </div>
            `;
        }

        const caption = photo.caption || photo.title || '';

        card.innerHTML = `
            <img src="${photo.url}" alt="${caption}" style="max-width: 100%; border-radius: 8px;">
            <div class="photo-info" style="margin-top: 8px;">
                <p style="color: white;">${caption} (${photo.year || ''})</p>
                ${adminButtons}
            </div>
        `;
        container.appendChild(card);
    });
}
