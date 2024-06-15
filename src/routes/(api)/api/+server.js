import { redirect } from '@sveltejs/kit'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private'

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, request, cookies }) {
	const params = new URLSearchParams(request.url.split('?').at(-1))
	const code = params.get('code')

	if (code) {
		const { access_token, token_type, expires_in, refresh_token, scope } = await (await fetch(`https://accounts.spotify.com/api/token`, {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: `grant_type=authorization_code&code=${code}&redirect_uri=${url.origin}/api`
		})).json()

		const date = new Date()
		date.setHours(date.getHours() + 1)

		cookies.set('access_token', access_token, { path: '/', expires: date })
	}

	throw redirect(301, '/')
}
