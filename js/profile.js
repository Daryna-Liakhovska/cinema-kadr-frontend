requireAuth();
renderNav();

const profileList = document.getElementById("profile");
const profileStatus = document.getElementById("profile-status");
const adminPanel = document.getElementById("admin-panel");
const genreForm = document.getElementById("genre-form");
const genreStatus = document.getElementById("genre-status");

function addProfileRow(label, value) {
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value || "—";
  profileList.append(term, description);
}

async function showProfile() {
  const user = await loadCurrentUser();
  if (!user) {
    profileStatus.textContent = "Не вдалося завантажити профіль.";
    return;
  }
  renderNav();
  profileStatus.textContent = "";
  addProfileRow("Username", user.username);
  addProfileRow("Email", user.email);
  addProfileRow("Ім'я", user.first_name);
  addProfileRow("Прізвище", user.last_name);
  addProfileRow("Роль", user.is_staff ? "Адміністратор" : "Користувач");
  adminPanel.hidden = !user.is_staff;
}

genreForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = new FormData(genreForm).get("name");
  const response = await apiFetch("/genres", {
    method: "POST",
    body: JSON.stringify({
      name
    }),
  });
  const body = await response.json();
  if (response.ok) {
    genreStatus.textContent = `Жанр «${body.name}» додано.`;
    genreForm.reset();
  } else {
    const details = Object.values(body.details || {}).flat().join(" ");
    genreStatus.textContent = details || body.error;
  }
});

showProfile();
