const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = `${window.location.origin}/`
const SCOPES = 'playlist-modify-public playlist-modify-private'

function generateVerifier() {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function generateLoginUrl() {
  const verifier = generateVerifier()
  const challenge = await generateChallenge(verifier)
  sessionStorage.setItem('pkce_verifier', verifier)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })
  return `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCode(code) {
  const verifier = sessionStorage.getItem('pkce_verifier')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || 'Auth failed')
  return { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
}

export function getStoredToken() {
  const token = sessionStorage.getItem('spotify_token')
  const expiry = sessionStorage.getItem('spotify_token_expiry')
  if (!token || !expiry || Date.now() > parseInt(expiry, 10)) return null
  return token
}

export function storeToken(accessToken, expiresAt) {
  sessionStorage.setItem('spotify_token', accessToken)
  sessionStorage.setItem('spotify_token_expiry', String(expiresAt))
}

export function clearToken() {
  sessionStorage.removeItem('spotify_token')
  sessionStorage.removeItem('spotify_token_expiry')
}
