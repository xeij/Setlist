import os
from fastapi import APIRouter, HTTPException
from backend.models import GenerateRequest, GenerateResponse, Setlist
from backend.services.cache import SetlistCache
from backend.services.setlistfm import SetlistFMClient
from backend.services.algorithm import score_setlists
from backend.services.spotify import SpotifyClient

router = APIRouter()


@router.post("/playlist/generate", response_model=GenerateResponse)
async def generate_playlist(request: GenerateRequest):
    cache = SetlistCache()
    cached = cache.get(request.mbid)

    if not cached:
        sf = SetlistFMClient(api_key=os.environ["SETLISTFM_API_KEY"])
        raw_setlists = await sf.get_setlists(request.mbid)
        cached = {}
        for s in raw_setlists:
            key = s.tour_name or "Unknown Tour"
            cached.setdefault(key, [])
            cached[key].append(s.model_dump())
        cache.set(request.mbid, cached)

    tour_raw = cached.get(request.tour_name)
    if not tour_raw:
        raise HTTPException(status_code=404, detail="No setlists found for this tour")

    setlists = [Setlist(**s) for s in tour_raw]
    scored = score_setlists(setlists)

    spotify = SpotifyClient(
        client_id=os.environ["SPOTIFY_CLIENT_ID"],
        client_secret=os.environ["SPOTIFY_CLIENT_SECRET"],
    )
    for track in scored:
        track.spotify_match = await spotify.search_track(track.name, request.artist_name)

    return GenerateResponse(
        artist=request.artist_name,
        tour_name=request.tour_name,
        tracks=scored,
        total_shows=len(setlists),
    )
