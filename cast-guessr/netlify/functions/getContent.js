exports.handler = async function(event, context) {
    const API_KEY = process.env.TMDB_API_KEY; 
    const { mode, page, genre, decade, isWorldWide, isDaily } = event.queryStringParameters;

    let url = `https://api.themoviedb.org/3/discover/${mode}?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}`;
    
    // QUALITY FILTER: Set to 75 minimum ratings. 
    // Filters out absolute spam/unseen titles while keeping a massive, fun variety.
    url += `&vote_count.gte=75`;

    if (isWorldWide !== 'true') url += `&with_original_language=en`;
    if (genre !== 'all') url += `&with_genres=${genre}`;
    if (decade !== 'all') {
        const start = parseInt(decade);
        const dateField = mode === 'movie' ? 'primary_release_date' : 'first_air_date';
        url += `&${dateField}.gte=${start}-01-01&${dateField}.lte=${start+9}-12-31`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        const cacheTime = isDaily === 'true' ? 86400 : 3600; 

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, s-maxage=${cacheTime}, stale-while-revalidate=60`
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed fetching content data" }) };
    }
};
