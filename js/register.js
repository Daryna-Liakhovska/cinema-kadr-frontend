redirectIfLoggedIn();
renderNav();

const registerForm = document.getElementById("register-form");
const registerError = document.getElementById("form-error");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  registerError.textContent = "";
  showFieldErrors(registerForm, {});

  const data = Object.fromEntries(new FormData(registerForm));
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });
  const body = await response.json();

  if (!response.ok) {
    showFieldErrors(registerForm, body.details);
    registerError.textContent = body.error;
    return;
  }

  window.location.href = "login.html?registered=1";
});
