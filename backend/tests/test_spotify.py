import pytest
import respx
import httpx
from backend.services.spotify import SpotifyClient

TOKEN_RESPONSE = {"access_token": "test_token", "expires_in": 3600}

SEARCH_RESPONSE = {
    "tracks": {
        "items": [
            {
                "uri": "spotify:track:abc",
                "name": "Karma Police",
                "artists": [{"name": "Radiohead"}],
                "album": {
                    "name": "OK Computer",
                    "images": [{"url": "https://example.com/img.jpg"}],
                },
                "duration_ms": 264000,
            }
        ]
    }
}

LIVE_SEARCH_RESPONSE = {
    "tracks": {
        "items": [
            {
                "uri": "spotify:track:live1",
                "name": "Karma Police (Live at Glastonbury)",
                "artists": [{"name": "Radiohead"}],
                "album": {"name": "Live Album", "images": []},
                "duration_ms": 270000,
            },
            {
                "uri": "spotify:track:studio1",
                "name": "Karma Police",
                "artists": [{"name": "Radiohead"}],
                "album": {
                    "name": "OK Computer",
                    "images": [{"url": "https://example.com/img.jpg"}],
                },
                "duration_ms": 264000,
            },
        ]
    }
}


@pytest.fixture
def spotify():
    return SpotifyClient(client_id="cid", client_secret="csecret")


@pytest.mark.asyncio
@respx.mock
async def test_search_track_returns_match(spotify):
    respx.post("https://accounts.spotify.com/api/token").mock(
        return_value=httpx.Response(200, json=TOKEN_RESPONSE)
    )
    respx.get("https://api.spotify.com/v1/search").mock(
        return_value=httpx.Response(200, json=SEARCH_RESPONSE)
    )
    result = await spotify.search_track("Karma Police", "Radiohead")
    assert result is not None
    assert result.uri == "spotify:track:abc"
    assert result.name == "Karma Police"
    assert result.album_art == "https://example.com/img.jpg"


@pytest.mark.asyncio
@respx.mock
async def test_search_track_skips_live_prefers_studio(spotify):
    respx.post("https://accounts.spotify.com/api/token").mock(
        return_value=httpx.Response(200, json=TOKEN_RESPONSE)
    )
    respx.get("https://api.spotify.com/v1/search").mock(
        return_value=httpx.Response(200, json=LIVE_SEARCH_RESPONSE)
    )
    result = await spotify.search_track("Karma Police", "Radiohead")
    assert result is not None
    assert result.uri == "spotify:track:studio1"


@pytest.mark.asyncio
@respx.mock
async def test_search_track_returns_none_when_no_match(spotify):
    respx.post("https://accounts.spotify.com/api/token").mock(
        return_value=httpx.Response(200, json=TOKEN_RESPONSE)
    )
    respx.get("https://api.spotify.com/v1/search").mock(
        return_value=httpx.Response(200, json={"tracks": {"items": []}})
    )
    result = await spotify.search_track("Nonexistent Song", "Nobody")
    assert result is None


@pytest.mark.asyncio
@respx.mock
async def test_token_cached(spotify):
    token_mock = respx.post("https://accounts.spotify.com/api/token").mock(
        return_value=httpx.Response(200, json=TOKEN_RESPONSE)
    )
    respx.get("https://api.spotify.com/v1/search").mock(
        return_value=httpx.Response(200, json={"tracks": {"items": []}})
    )
    await spotify.search_track("Song A", "Artist")
    await spotify.search_track("Song B", "Artist")
    assert token_mock.call_count == 1
