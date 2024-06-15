/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
    const access_token = cookies.get('access_token')

    if (access_token) {
        const limit = url.searchParams.get('limit') || 50
        const time_range = url.searchParams.get('time_range') || 'short_term'
        const type = url.searchParams.get('type') || 'artists'

        const result = await fetch(`https://api.spotify.com/v1/me/top/${type}?time_range=${time_range}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })

        console.log(result)
        
        return Response.json(await result.json())
    } else {
        return Response.json({ error: { status: 401, message: 'Invalid access token' } })
    }
}
