document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.getElementById("search-input");
  const articles = document.querySelectorAll(".article-link");

  searchInput.addEventListener("keyup", function() {
    let query = searchInput.value.toLowerCase();

    articles.forEach(article => {
      let title = article.textContent.toLowerCase();
      article.style.display = title.includes(query) ? "block" : "none";
    });
  });
});
