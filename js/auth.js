const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const USER_KEY = "user";

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return Boolean(getRefreshToken());
}

function saveTokens(access, refresh) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  }
}

function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "index.html";
}

function goToLogin() {
  const next = window.location.pathname.split("/").pop() || "index.html";
  window.location.href = `login.html?next=${encodeURIComponent(next)}`;
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refresh: getRefreshToken()
    }),
  });
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  saveTokens(data.access);
  return true;
}

async function apiFetch(path, options = {}) {
  const send = () => fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  let response = await send();
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      goToLogin();
      return response;
    }
    response = await send();
  }
  return response;
}

async function loadCurrentUser() {
  const response = await apiFetch("/users/me");
  if (!response.ok) {
    return null;
  }
  const user = await response.json();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

function requireAuth() {
  if (!isLoggedIn()) {
    goToLogin();
  }
}

function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = "profile.html";
  }
}

function renderNav() {
  const nav = document.getElementById("nav");
  if (!nav) {
    return;
  }
  nav.replaceChildren();

  const home = document.createElement("a");
  home.href = "index.html";
  home.textContent = "Афіша";
  nav.append(home);

  if (isLoggedIn()) {
    const user = getStoredUser();
    const profile = document.createElement("a");
    profile.href = "profile.html";
    profile.textContent = "Мій профіль";

    const name = document.createElement("span");
    name.className = "nav-user";
    name.textContent = user ? user.username : "";

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.textContent = "Вийти";
    logoutButton.addEventListener("click", logout);

    nav.append(profile, name, logoutButton);
  } else {
    const login = document.createElement("a");
    login.href = "login.html";
    login.className = "nav-button";
    login.textContent = "Увійти";

    const register = document.createElement("a");
    register.href = "register.html";
    register.textContent = "Реєстрація";

    nav.append(register, login);
  }
}

function showFieldErrors(form, details) {
  form.querySelectorAll(".field-error").forEach((element) => {
    element.textContent = "";
  });
  for (const [field, messages] of Object.entries(details || {})) {
    const element = form.querySelector(`[data-error-for="${field}"]`);
    if (element) {
      element.textContent = messages.join(" ");
    }
  }
}
