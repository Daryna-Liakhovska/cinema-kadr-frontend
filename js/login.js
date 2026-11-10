redirectIfLoggedIn();
renderNav();

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("form-error");
const loginMessage = document.getElementById("login-message");

if (new URLSearchParams(window.location.search).get("registered")) {
  loginMessage.textContent = "Реєстрація успішна. Тепер увійдіть.";
}

function getNextPage() {
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && /^[\w-]+\.html$/.test(next) && next !== "login.html") {
    return next;
  }
  return "profile.html";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";

  const formData = new FormData(loginForm);
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: formData.get("username"),
      password: formData.get("password"),
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    loginError.textContent = response.status === 401 ?
      "Неправильний username або пароль." :
      "Заповніть username і пароль.";
    return;
  }

  saveTokens(data.access, data.refresh);
  await loadCurrentUser();
  window.location.href = getNextPage();
});
