import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ cookies }) {
	const access_token = cookies.get('access_token')

	if (access_token) {
		const result = await fetch(`https://api.spotify.com/v1/me`, {
			headers: { 'Authorization': `Bearer ${access_token}` }
		})

		console.log(3, result, await result.json())

		const { id } = await result.json()

		cookies.set('user_id', id, { path: '/' })

		return {
			user_id: id
		}
	} else {
		throw redirect(301, '/')
	}
}
