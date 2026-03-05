// netlify/functions/search.js
exports.handler = async function(event, context) {
    const API_KEY = process.env.TMDB_API_KEY;
    const { mode, query } = event.queryStringParameters;

    const url = `https://api.themoviedb.org/3/search/${mode}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, s-maxage=86400" // Cache exact search queries for 24 hours
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Search failed" }) };
    }
};