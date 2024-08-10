// Initial References
const movieNameRef = document.getElementById("movie-name");
const searchBtn = document.getElementById("search-btn");
const result = document.getElementById("result");

// API Keys (in a real application, these should be kept secret)
const OMDB_API_KEY = "c57c4c36";
const WATCHMODE_API_KEY = "2bq7QAq9jtl9jYzUSlpulCH4c1ZRKrnYBEFgMWKL "; // Replace with your actual Watchmode API key

const getMovie = async () => {
    const movieName = movieNameRef.value.trim();
    const omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${OMDB_API_KEY}`;

    if (movieName.length === 0) {
        result.innerHTML = `<h3 class="msg">Please enter a valid movie name</h3>`;
        return;
    }

    try {
        // Fetch movie data from OMDb
        const omdbResponse = await fetch(omdbUrl);
        const omdbData = await omdbResponse.json();

        if (omdbData.Response === "True") {
            // Fetch streaming info from Watchmode
            const streamingInfo = await getStreamingInfo(omdbData.imdbID);

            result.innerHTML = `
                <div class="info">
                    <img src="${omdbData.Poster}" class="poster" alt="${omdbData.Title} poster">
                    <div>
                        <h2>${omdbData.Title}</h2>
                        <div class="rating">
                            <img src="star-icon.svg" alt="star icon">
                            <h4>${omdbData.imdbRating}</h4>
                        </div>
                        <div class="details">
                            <span>${omdbData.Rated}</span>
                            <span>${omdbData.Year}</span>
                            <span>${omdbData.Runtime}</span>
                        </div>
                        <div class="genre">
                            ${omdbData.Genre.split(",").map(genre => `<div>${genre.trim()}</div>`).join("")}
                        </div>
                    </div>
                </div>
                <h3>Plot:</h3>
                <p>${omdbData.Plot}</p>
                <h3>Cast:</h3>
                <p>${omdbData.Actors}</p>
                <h3>Streaming Availability:</h3>
                <div class="streaming-info">${streamingInfo}</div>
            `;
        } else {
            result.innerHTML = `<h3 class='msg'>${omdbData.Error}</h3>`;
        }
    } catch (error) {
        console.error("Error fetching movie data:", error);
        result.innerHTML = `<h3 class="msg">An error occurred. Please try again later.</h3>`;
    }
};

const getStreamingInfo = async (imdbId) => {
    const watchmodeUrl = `https://api.watchmode.com/v1/title/${imdbId}/sources/?apiKey=${WATCHMODE_API_KEY}`;

    try {
        const response = await fetch(watchmodeUrl);
        const data = await response.json();

        if (data && data.length > 0) {
            const streamingServices = data
                .filter(service => service.type === "sub" || service.type === "free")
                .map(service => service.name);
            
            const uniqueServices = [...new Set(streamingServices)];

            if (uniqueServices.length > 0) {
                return `<p>Available on: ${uniqueServices.join(", ")}</p>`;
            } else {
                return "<p>Not currently available on major streaming platforms.</p>";
            }
        } else {
            return "<p>Streaming information not available.</p>";
        }
    } catch (error) {
        console.error("Error fetching streaming data:", error);
        return "<p>Unable to fetch streaming information.</p>";
    }
};

// Event listener for search button click
searchBtn.addEventListener("click", getMovie);

// Event listener for Enter key press
movieNameRef.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        getMovie();
    }
});

// Clear results when input is cleared
movieNameRef.addEventListener("input", () => {
    if (movieNameRef.value.trim() === "") {
        result.innerHTML = "";
    }
});
