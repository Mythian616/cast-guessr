// netlify/functions/getContent.js
exports.handler = async function(event, context) {
    const API_KEY = process.env.TMDB_API_KEY; // Pulled from Netlify secrets
    const { mode, page, genre, decade, isWorldWide, isDaily } = event.queryStringParameters;

    let url = `https://api.themoviedb.org/3/discover/${mode}?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}`;
    
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
        
        // CACHING MAGIC: 
        // If Daily, cache this exact request on Netlify's global edge servers for 24 hours.
        // If Unlimited, cache this specific random page for 1 hour to handle massive user spikes.
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
        return { statusCode: 500, body: JSON.stringify({ error: "Failed fetching data" }) };
    }
};