/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
    const access_token = cookies.get('access_token')

    if (access_token) {
        const limit = url.searchParams.get('limit') || 50
        const after = url.searchParams.get('after') || 0

        const result = await (await fetch(`https://api.spotify.com/v1/me/following?type=artist&limit=${limit}&after=${after}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })).json()
        
        return Response.json(result)
    } else {
        return Response.json({ error: { status: 401, message: 'Invalid access token' } })
    }
}

// /** @type {import('./$types').RequestHandler} */
// export async function DELETE({ request, cookies }) {
//     const access_token = cookies.get('access_token')
    
//     if (access_token) {
//         const { ids } = await request.json()

//         await fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${encodeURIComponent(ids.join())}`, {
//             method: 'DELETE',
//             headers: {
//                 'Authorization': `Bearer ${access_token}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 ids
//             })
//         })
        
//         return Response.json({ success: true })
//     } else {
//         return Response.json({ error: { status: 401, message: 'Invalid access token' } })
//     }
// }
