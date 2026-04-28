import pytest
import respx
import httpx
from services.setlistfm import SetlistFMClient

ARTIST_SEARCH_RESPONSE = {
    "artist": [
        {"mbid": "abc123", "name": "Radiohead", "disambiguation": "UK rock band"}
    ]
}

SETLIST_RESPONSE = {
    "setlist": [
        {
            "id": "set001",
            "eventDate": "15-08-2024",
            "artist": {"mbid": "abc123", "name": "Radiohead"},
            "tour": {"name": "OK Computer Tour"},
            "venue": {"name": "O2 Arena", "city": {"name": "London"}},
            "sets": {
                "set": [
                    {
                        "song": [
                            {"name": "Airbag"},
                            {"name": "Karma Police"},
                            {"name": "Creep"},
                        ]
                    },
                    {
                        "name": "Encore",
                        "encore": 1,
                        "song": [{"name": "Fake Plastic Trees"}],
                    },
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
async def test_search_artists():
    respx.get("https://api.setlist.fm/rest/1.0/search/artists").mock(
        return_value=httpx.Response(200, json=ARTIST_SEARCH_RESPONSE)
    )
    client = SetlistFMClient(api_key="test")
    results = await client.search_artists("Radiohead")
    assert len(results) == 1
    assert results[0].mbid == "abc123"
    assert results[0].name == "Radiohead"
    assert results[0].disambiguation == "UK rock band"


@pytest.mark.asyncio
@respx.mock
async def test_get_setlists_parses_songs():
    respx.get("https://api.setlist.fm/rest/1.0/artist/abc123/setlists").mock(
        return_value=httpx.Response(200, json=SETLIST_RESPONSE)
    )
    client = SetlistFMClient(api_key="test")
    setlists = await client.get_setlists("abc123", pages=1)
    assert len(setlists) == 1
    sl = setlists[0]
    assert sl.tour_name == "OK Computer Tour"
    assert sl.artist_name == "Radiohead"
    assert sl.event_date == "15-08-2024"

    main_songs = [s for s in sl.songs if not s.is_encore]
    encore_songs = [s for s in sl.songs if s.is_encore]
    assert [s.name for s in main_songs] == ["Airbag", "Karma Police", "Creep"]
    assert [s.name for s in encore_songs] == ["Fake Plastic Trees"]


@pytest.mark.asyncio
@respx.mock
async def test_get_setlists_stops_on_empty_page():
    respx.get("https://api.setlist.fm/rest/1.0/artist/abc123/setlists").mock(
        return_value=httpx.Response(200, json={"setlist": [], "total": 0, "page": 1, "itemsPerPage": 20})
    )
    client = SetlistFMClient(api_key="test")
    setlists = await client.get_setlists("abc123", pages=3)
    assert setlists == []


@pytest.mark.asyncio
@respx.mock
async def test_search_artists_empty():
    respx.get("https://api.setlist.fm/rest/1.0/search/artists").mock(
        return_value=httpx.Response(200, json={"artist": []})
    )
    client = SetlistFMClient(api_key="test")
    results = await client.search_artists("zzznobody")
    assert results == []
