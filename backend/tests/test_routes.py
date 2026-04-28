import pytest
import respx
import httpx
import json
from unittest.mock import patch

ARTIST_SEARCH_RESPONSE = {
    "artist": [{"mbid": "abc123", "name": "Radiohead", "disambiguation": "UK"}]
}

SETLIST_FM_RESPONSE = {
    "setlist": [
        {
            "id": "set001",
            "eventDate": "15-08-2024",
            "artist": {"mbid": "abc123", "name": "Radiohead"},
            "tour": {"name": "OK Tour"},
            "venue": {"name": "O2", "city": {"name": "London"}},
            "sets": {
                "set": [
                    {"song": [{"name": "Airbag"}, {"name": "Karma Police"}, {"name": "Creep"}]},
                    {"name": "Encore", "encore": 1, "song": [{"name": "Fake Plastic Trees"}]},
                ]
            },
        }
    ],
    "total": 1,
    "page": 1,
    "itemsPerPage": 20,
}


@pytest.mark.asyncio
@respx.mock
async def test_artist_search_proxies_setlistfm(client):
    respx.get("https://api.setlist.fm/rest/1.0/search/artists").mock(
        return_value=httpx.Response(200, json=ARTIST_SEARCH_RESPONSE)
    )
    response = client.get("/api/artists/search?q=Radiohead")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["mbid"] == "abc123"
    assert data[0]["name"] == "Radiohead"


def test_artist_search_requires_q(client):
    response = client.get("/api/artists/search")
    assert response.status_code == 422


@pytest.mark.asyncio
@respx.mock
async def test_get_setlists_returns_tours(client):
    respx.get("https://api.setlist.fm/rest/1.0/artist/abc123/setlists").mock(
        return_value=httpx.Response(200, json=SETLIST_FM_RESPONSE)
    )
    with patch("backend.services.cache.SetlistCache.get", return_value=None), \
         patch("backend.services.cache.SetlistCache.set"):
        response = client.get("/api/setlists/abc123")
    assert response.status_code == 200
    data = response.json()
    assert "tours" in data
    assert "current_leg" in data
    assert data["tours"][0]["name"] == "OK Tour"
    assert data["tours"][0]["show_count"] == 1
    assert data["current_leg"] == "OK Tour"


@pytest.mark.asyncio
@respx.mock
async def test_get_setlists_uses_cache(client):
    cached_data = {
        "OK Tour": [
            {
                "id": "set001", "event_date": "15-08-2024", "tour_name": "OK Tour",
                "venue": "O2", "city": "London", "artist_name": "Radiohead", "songs": [],
            }
        ]
    }
    with patch("backend.services.cache.SetlistCache.get", return_value=cached_data):
        response = client.get("/api/setlists/abc123")
    assert response.status_code == 200
    assert response.json()["tours"][0]["name"] == "OK Tour"


def test_generate_playlist_returns_scored_tracks(client):
    cached_data = {
        "OK Tour": [
            {
                "id": "set001",
                "event_date": "15-08-2024",
                "tour_name": "OK Tour",
                "venue": "O2",
                "city": "London",
                "artist_name": "Radiohead",
                "songs": [
                    {"name": "Airbag", "is_encore": False, "tape": False},
                    {"name": "Karma Police", "is_encore": False, "tape": False},
                    {"name": "Creep", "is_encore": False, "tape": False},
                    {"name": "Fake Plastic Trees", "is_encore": True, "tape": False},
                ],
            }
        ]
    }
    with patch("backend.services.cache.SetlistCache.get", return_value=cached_data):
        response = client.post(
            "/api/playlist/generate",
            json={"mbid": "abc123", "tour_name": "OK Tour", "artist_name": "Radiohead"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["artist"] == "Radiohead"
    assert data["tour_name"] == "OK Tour"
    assert data["total_shows"] == 1
    assert len(data["tracks"]) == 4
    assert data["tracks"][0]["slot"] == "opener"
    assert data["tracks"][-1]["slot"] == "encore"


def test_generate_playlist_404_unknown_tour(client):
    with patch("backend.services.cache.SetlistCache.get", return_value={"Other Tour": []}):
        response = client.post(
            "/api/playlist/generate",
            json={"mbid": "abc123", "tour_name": "Missing Tour", "artist_name": "Radiohead"},
        )
    assert response.status_code == 404
