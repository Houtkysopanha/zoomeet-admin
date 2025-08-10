
const AUTH_COOKIE = 'auth'

export function useAuth() {
	const cookie = useCookie(AUTH_COOKIE)
	let parsed = null
	if (cookie.value) {
		try {
			parsed = JSON.parse(cookie.value)
		} catch (e) {
			parsed = null
			cookie.value = null
		}
	}
	const user = ref(parsed)

	function setAuth(authData) {
		try {
			cookie.value = JSON.stringify(authData)
			user.value = authData
		} catch (e) {
			cookie.value = null
			user.value = null
		}
	}

	function clearAuth() {
		cookie.value = null
		user.value = null
	}

	return {
		user,
		setAuth,
		clearAuth,
	}
}
