// Bejelentkezési segédfüggvény az index.html hívásához
async function handleLogin() {
    const usernameInput = document.getElementById("username")?.value.trim();
    const passwordInput = document.getElementById("password")?.value.trim();

    if (!usernameInput || !passwordInput) {
        alert("Kérlek add meg a felhasználónevet és a jelszót!");
        return;
    }

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
