import base64
import time

import httpx

from backend.models import SpotifyTrack

_TOKEN_URL = "https://accounts.spotify.com/api/token"
_SEARCH_URL = "https://api.spotify.com/v1/search"
_LIVE_KEYWORDS = frozenset({"live", "live at", "(live)", "live version", "live from"})


def _is_live(title: str) -> bool:
    lower = title.lower()
    return any(kw in lower for kw in _LIVE_KEYWORDS)


class SpotifyClient:
    def __init__(self, client_id: str, client_secret: str):
        self._client_id = client_id
        self._client_secret = client_secret
        self._token: str | None = None
        self._token_expiry: float = 0.0

    async def _get_token(self) -> str:
        if self._token and time.time() < self._token_expiry - 60:
            return self._token
        creds = base64.b64encode(
            f"{self._client_id}:{self._client_secret}".encode()
        ).decode()
        async with httpx.AsyncClient() as client:
            r = await client.post(
                _TOKEN_URL,
                data={"grant_type": "client_credentials"},
                headers={"Authorization": f"Basic {creds}"},
            )
            r.raise_for_status()
            data = r.json()
        self._token = data["access_token"]
        self._token_expiry = time.time() + data["expires_in"]
        return self._token

    async def search_track(self, title: str, artist: str) -> SpotifyTrack | None:
        token = await self._get_token()
        async with httpx.AsyncClient() as client:
            r = await client.get(
                _SEARCH_URL,
                params={"q": f"track:{title} artist:{artist}", "type": "track", "limit": 10},
                headers={"Authorization": f"Bearer {token}"},
            )
            r.raise_for_status()
            items = r.json().get("tracks", {}).get("items", [])

        for item in items:
            if _is_live(item["name"]):
                continue
            images = item["album"].get("images", [])
            return SpotifyTrack(
                uri=item["uri"],
                name=item["name"],
                artists=[a["name"] for a in item["artists"]],
                album=item["album"]["name"],
                album_art=images[0]["url"] if images else None,
                duration_ms=item["duration_ms"],
            )
        return None
