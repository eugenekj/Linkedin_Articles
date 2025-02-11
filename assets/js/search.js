document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("search-input");
    const articles = document.querySelectorAll(".article-link");

    if (!searchInput || articles.length === 0) {
        console.error("Search input or articles not found!");
        return;
    }

    searchInput.addEventListener("keyup", function() {
        let query = searchInput.value.toLowerCase();

        articles.forEach(article => {
            let title = article.textContent.toLowerCase();
            article.parentElement.style.display = title.includes(query) ? "block" : "none";
        });
    });
});
