exports.handler = async function(event, context) {
    const API_KEY = process.env.TMDB_API_KEY;
    const { mode, id } = event.queryStringParameters;

    const url = `https://api.themoviedb.org/3/${mode}/${id}/credits?api_key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, s-maxage=86400"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed fetching credits" }) };
    }
};
