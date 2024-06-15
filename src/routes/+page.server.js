import { SPOTIFY_CLIENT_ID } from '$env/static/private'
import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').Actions} */
export const actions = {
	signIn: async ({ url }) => {
		// throw redirect(303, `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=user-top-read%20playlist-read-private%20playlist-read-collaborative%20playlist-modify-private%20playlist-modify-public%20user-follow-modify%20user-follow-read&redirect_uri=${url.origin}/api&state=${randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')}`)
		throw redirect(303, `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=user-top-read&redirect_uri=${url.origin}/api&state=${randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')}`)
	},

	signOut: async ({ cookies }) => {
		cookies.delete('access_token', { path: '/' })
		cookies.delete('user_id', { path: '/' })
	}
}

function randomString(length, chars) {
	var result = ''
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
	return result
}
