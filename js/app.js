const moviesList = document.getElementById("movies");
const statusText = document.getElementById("status");
const filtersForm = document.getElementById("filters");
const searchInput = document.getElementById("search");
const genreSelect = document.getElementById("genre");
const directorsList = document.getElementById("directors");
const directorsStatus = document.getElementById("directors-status");

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Помилка ${response.status}`);
  }
  return data;
}

async function loadGenres() {
  const genres = await fetchJson("/genres");
  for (const genre of genres) {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.name;
    genreSelect.append(option);
  }
}

function renderMovie(movie) {
  const item = document.createElement("li");
  item.className = "movie";

  const title = document.createElement("h2");
  title.textContent = movie.title;

  const details = document.createElement("p");
  const director = `${movie.director.first_name} ${movie.director.last_name}`;
  details.textContent = `${movie.release_year} · ${movie.duration_min} хв · ${movie.age_rating} · реж. ${director}`;

  const genres = document.createElement("p");
  genres.className = "genres";
  genres.textContent = movie.genres.map((genre) => genre.name).join(", ");

  item.append(title, details, genres);
  return item;
}

async function loadMovies() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) {
    params.set("search", searchInput.value.trim());
  }
  if (genreSelect.value) {
    params.set("genre", genreSelect.value);
  }

  statusText.textContent = "Завантаження...";
  moviesList.replaceChildren();
  try {
    const data = await fetchJson(`/movies?${params}`);
    statusText.textContent = data.count ?
      `Знайдено фільмів: ${data.count}` :
      "Фільмів не знайдено.";
    moviesList.append(...data.results.map(renderMovie));
  } catch (error) {
    statusText.textContent = `Не вдалося завантажити фільми: ${error.message}`;
  }
}

function renderDirector(director) {
  const item = document.createElement("li");
  item.className = "director";
  item.textContent = `${director.first_name} ${director.last_name}`;
  return item;
}

async function loadDirectors() {
  try {
    const data = await fetchJson("/directors?ordering=last_name&page_size=100");
    directorsStatus.textContent = data.count ?
      `Режисерів: ${data.count}` :
      "Режисерів поки немає.";
    directorsList.append(...data.results.map(renderDirector));
  } catch (error) {
    directorsStatus.textContent = `Не вдалося завантажити режисерів: ${error.message}`;
  }
}

filtersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadMovies();
});

loadGenres().catch(() => {});
loadMovies();
loadDirectors();
renderNav();
