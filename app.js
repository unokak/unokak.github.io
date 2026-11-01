// --- BIZTONSÁGI ÉS BEJELENTKEZÉSI SEGÉDFÜGGVÉNYEK ---
function checkLoginState() {
    return localStorage.getItem("unokak_logged_in_user");
}

async function handleLogin() {
    // Megkeressük a bejelentkezési dobozon belüli input mezőket
    const modal = document.querySelector("#loginModal") || document.querySelector(".modal") || document.body;
    const inputs = modal.querySelectorAll("input");

    const usernameInput = inputs[0]?.value.trim();
    const passwordInput = inputs[1]?.value.trim();

    if (!usernameInput || !passwordInput) {
        alert("Kérlek add meg a felhasználónevet és a jelszót!");
        return;
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Szerver hiba: ${response.status}`);
        }

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
        console.error("Bejelentkezési hiba részletei:", error);
        alert("Nem sikerült kapcsolódni az adatbázishoz! Ellenőrizd az internetkapcsolatot vagy a kulcsokat.");
    }
}

// --- FŐ INDÍTÓ ÉS VÉDELEM ---
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

    initApp();
});

// JSONBin.io Konfiguráció
const JSONBIN_BIN_ID = '6ae71ab9ac6210605a634fba';
const JSONBIN_API_KEY = '$2a$10$4IGyh09KryVZw6kgbdEA1uG602Yi7nB0.kxu2eXGwbnk1ctGxtsAm';

// --- ADATBÁZIS ÉS GALÉRIA LOGIKA ---
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
// --- JSONBin.io Konfiguráció ---
const JSONBIN_BIN_ID = 'IDE_ILLESZD_A_SAJAT_BIN_ID_D-T';
const JSONBIN_API_KEY = 'IDE_ILLESZD_A_SAJAT_API_KULCSODAT';

const kidStartYears = {
    'abris': 2003,
    'gerda': 2004,
    'moira': 2007
};

let activeYearFilter = 'all';

async function fetchDB() {
    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        if (!response.ok) throw new Error('Hiba az adatok letöltésekor');
        let data = await response.json();
        return data.record;
    } catch (e) {
        console.warn('Nem sikerült a JSONBin elérése, alapértelmezett adatok használata.', e);
        return { users: [{ username: "admin", password: "123", role: "admin" }], photos: { abris: [], gerda: [], moira: [] } };
    }
}

async function saveDB(dbData) {
    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(dbData)
        });
        if (!response.ok) throw new Error('Hiba a mentés során');
        alert('Sikeres mentés!');
    } catch (e) {
        alert('Hiba történt a mentéskor: ' + e.message);
    }
}

async function handleLogin() {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    
    let db = await fetchDB();
    let foundUser = db.users.find(user => user.username === u && user.password === p);

    if (foundUser) {
        sessionStorage.setItem('currentUser', foundUser.username);
        sessionStorage.setItem('currentRole', foundUser.role);
        location.reload();
    } else {
        alert('Hibás felhasználónév vagy jelszó!');
    }
}

function handleLogout() {
    sessionStorage.clear();
    location.reload();
}

function checkLoginState() {
    const user = sessionStorage.getItem('currentUser');
    const role = sessionStorage.getItem('currentRole');
    
    if (user) {
        let loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.style.display = 'none';
        
        let statusSpan = document.getElementById('userStatus');
        if (statusSpan) {
            statusSpan.style.display = 'inline';
            statusSpan.innerText = `Bejelentkezve: ${user} (${role})`;
        }
        let logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.style.display = 'inline-block';

        let adminLink = document.getElementById('adminPanelLink');
        if (adminLink && role === 'admin') {
            adminLink.style.display = 'block';
        }
    }
}

function isAdmin() {
    return sessionStorage.getItem('currentRole') === 'admin';
}

async function loadKidGallery(kidId, selectedYear = 'all') {
    let db = await fetchDB();
    let container = document.getElementById('galleryContainer');
    let filterContainer = document.getElementById('yearFilterContainer');
    let kidPhotos = db.photos[kidId] || [];

    if (kidPhotos.length === 0) {
        if (filterContainer) filterContainer.innerHTML = '';
        container.innerHTML = `<p style="text-align:center; margin-top:2rem;">Még nincsenek feltöltött képek.</p>`;
        return;
    }

    let availableYears = [...new Set(kidPhotos.map(p => p.year))].sort((a, b) => b - a);

    if (filterContainer) {
        let filterHtml = `<button class="btn" style="background-color: ${selectedYear === 'all' ? '#2563eb' : '#333'}" onclick="filterByYear('all')">Minden év</button>`;
        availableYears.forEach(y => {
            let isActive = selectedYear == y;
            filterHtml += `<button class="btn" style="background-color: ${isActive ? '#2563eb' : '#333'};" onclick="filterByYear(${y})">${y}</button>`;
        });
        filterContainer.innerHTML = filterHtml;
    }

    let filteredPhotos = selectedYear === 'all' ? kidPhotos : kidPhotos.filter(p => p.year == selectedYear);

    let grouped = {};
    filteredPhotos.forEach((photo) => {
        let originalIndex = kidPhotos.findIndex(p => p.id === photo.id);
        if (!grouped[photo.year]) grouped[photo.year] = [];
        grouped[photo.year].push({ ...photo, originalIndex });
    });

    let sortedYears = Object.keys(grouped).sort((a, b) => b - a);
    let html = '';

    if (sortedYears.length === 0) {
        container.innerHTML = `<p style="text-align:center; margin-top:2rem;">Nincs kép a kiválasztott évben.</p>`;
        return;
    }

    sortedYears.forEach(year => {
        html += `<div class="year-section">
                    <h3 class="year-title">📅 ${year}. év</h3>
                    <div class="gallery-grid">`;
        
        grouped[year].forEach(item => {
            html += `
                <div class="photo-card">
                    <img src="${item.url}" alt="Fotó" onerror="this.src='https://via.placeholder.com/400x220?text=Kép+nem+elérhető'">
                    <div class="photo-content">
                        <p class="photo-caption">${item.caption || 'Nincs megjegyzés'}</p>`;
            
            if (isAdmin()) {
                html += `
                    <div class="admin-controls">
                        <button class="btn" style="padding:0.3rem 0.5rem; font-size:0.8rem;" onclick="editPhoto(${item.originalIndex})">✏️ Szerk</button>
                        <button class="btn btn-danger" style="padding:0.3rem 0.5rem; font-size:0.8rem;" onclick="deletePhoto(${item.originalIndex})">🗑️ Törlés</button>
                        <button class="btn" style="padding:0.3rem 0.5rem; font-size:0.8rem;" onclick="movePhoto(${item.originalIndex}, -1)">⬆️</button>
                        <button class="btn" style="padding:0.3rem 0.5rem; font-size:0.8rem;" onclick="movePhoto(${item.originalIndex}, 1)">⬇️</button>
                    </div>`;
            }

            html += `</div></div>`;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;
}

function filterByYear(year) {
    activeYearFilter = year;
    loadKidGallery(kidId, year);
}

let editingIndex = null;

function openPhotoModal(index = null) {
    editingIndex = index;
    let modal = document.getElementById('photoModal');
    let titleEl = document.getElementById('modalTitle');
    
    if (index !== null) {
        titleEl.innerText = 'Kép szerkesztése';
        fetchDB().then(db => {
            let p = db.photos[kidId][index];
            document.getElementById('photoUrl').value = p.url;
            document.getElementById('photoYear').value = p.year;
            document.getElementById('photoCaption').value = p.caption;
        });
    } else {
        titleEl.innerText = 'Új kép hozzáadása';
        document.getElementById('photoUrl').value = '';
        document.getElementById('photoYear').value = kidStartYears[kidId] || 2026;
        document.getElementById('photoCaption').value = '';
    }
    modal.style.display = 'flex';
}

function editPhoto(index) {
    openPhotoModal(index);
}

async function savePhotoData() {
    let url = document.getElementById('photoUrl').value.trim();
    let year = parseInt(document.getElementById('photoYear').value);
    let caption = document.getElementById('photoCaption').value.trim();

    if (!url) {
        alert('Kérlek add meg a kép URL címét!');
        return;
    }

    let db = await fetchDB();
    if (!db.photos[kidId]) db.photos[kidId] = [];

    if (editingIndex !== null) {
        db.photos[kidId][editingIndex] = { ...db.photos[kidId][editingIndex], url, year, caption };
    } else {
        db.photos[kidId].push({ id: Date.now(), year, url, caption });
    }

    await saveDB(db);
    document.getElementById('photoModal').style.display = 'none';
    loadKidGallery(kidId, activeYearFilter);
}

async function deletePhoto(index) {
    if (!confirm('Biztosan törölni szeretnéd ezt a képet?')) return;
    let db = await fetchDB();
    db.photos[kidId].splice(index, 1);
    await saveDB(db);
    loadKidGallery(kidId, activeYearFilter);
}

async function movePhoto(index, direction) {
    let db = await fetchDB();
    let arr = db.photos[kidId];
    let newIndex = index + direction;

    if (newIndex < 0 || newIndex >= arr.length) return;

    let temp = arr[index];
    arr[index] = arr[newIndex];
    arr[newIndex] = temp;

    await saveDB(db);
    loadKidGallery(kidId, activeYearFilter);
}

async function loadUserManagement() {
    let db = await fetchDB();
    let container = document.getElementById('userListContainer');
    let html = `<ul style="list-style:none; padding:0;">`;

    db.users.forEach((u, index) => {
        html += `<li style="display:flex; justify-content:space-between; align-items:center; padding:0.8rem 0; border-bottom:1px solid #333;">
            <span><strong>${u.username}</strong> (${u.role})</span>`;
        if (u.username !== 'admin') {
            html += `<button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteUser(${index})">Törlés</button>`;
        }
        html += `</li>`;
    });
    html += `</ul>`;
    container.innerHTML = html;
}

async function addNewUser() {
    let username = document.getElementById('newUsername').value.trim();
    let password = document.getElementById('newPassword').value.trim();
    let role = document.getElementById('newRole').value;

    if (!username || !password) {
        alert('Minden mezőt ki kell tölteni!');
        return;
    }

    let db = await fetchDB();
    if (db.users.some(u => u.username === username)) {
        alert('Ilyen nevű felhasználó már létezik!');
        return;
    }

    db.users.push({ username, password, role });
    await saveDB(db);
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    loadUserManagement();
}

async function deleteUser(index) {
    if (!confirm('Biztosan törlöd ezt a felhasználót?')) return;
    let db = await fetchDB();
    db.users.splice(index, 1);
    await saveDB(db);
    loadUserManagement();
}
