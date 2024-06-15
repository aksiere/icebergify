/** @type {import('./$types').PageLoad} */
export async function load({ cookies }) {
	return { 
		is_logged: cookies.get('access_token') ? true : false
	}
}
