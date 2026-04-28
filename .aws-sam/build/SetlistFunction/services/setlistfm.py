import httpx
from models import ArtistResult, Setlist, Song

_BASE = "https://api.setlist.fm/rest/1.0"


class SetlistFMClient:
    def __init__(self, api_key: str):
        self._headers = {"x-api-key": api_key, "Accept": "application/json"}

    async def search_artists(self, name: str) -> list[ArtistResult]:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{_BASE}/search/artists",
                params={"artistName": name, "sort": "relevance"},
                headers=self._headers,
            )
            r.raise_for_status()
            return [
                ArtistResult(
                    mbid=a["mbid"],
                    name=a["name"],
                    disambiguation=a.get("disambiguation"),
                )
                for a in r.json().get("artist", [])
            ]

    async def get_setlists(self, mbid: str, pages: int = 3) -> list[Setlist]:
        setlists = []
        async with httpx.AsyncClient() as client:
            for page in range(1, pages + 1):
                r = await client.get(
                    f"{_BASE}/artist/{mbid}/setlists",
                    params={"p": page},
                    headers=self._headers,
                )
                if r.status_code == 404:
                    break
                r.raise_for_status()
                data = r.json()
                items = data.get("setlist", [])
                if not items:
                    break
                for item in items:
                    setlists.append(_parse_setlist(item))
                total = int(data.get("total", 0))
                if total and len(setlists) >= total:
                    break
        return setlists


def _parse_setlist(data: dict) -> Setlist:
    songs = []
    for s in data.get("sets", {}).get("set", []):
        is_encore = bool(s.get("encore")) or "encore" in s.get("name", "").lower()
        for song_data in s.get("song", []):
            if not song_data.get("name"):
                continue
            songs.append(
                Song(
                    name=song_data["name"],
                    is_encore=is_encore,
                    tape=bool(song_data.get("tape", False)),
                )
            )
    venue = data.get("venue", {})
    return Setlist(
        id=data["id"],
        event_date=data["eventDate"],
        tour_name=data.get("tour", {}).get("name"),
        venue=venue.get("name", ""),
        city=venue.get("city", {}).get("name", ""),
        artist_name=data.get("artist", {}).get("name", ""),
        songs=songs,
    )
