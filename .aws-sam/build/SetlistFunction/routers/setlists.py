import os
from fastapi import APIRouter
from models import SetlistsResponse, TourSummary, Setlist
from services.setlistfm import SetlistFMClient
from services.cache import SetlistCache
from services.algorithm import detect_current_leg

router = APIRouter()


@router.get("/setlists/{mbid}", response_model=SetlistsResponse)
async def get_setlists(mbid: str):
    cache = SetlistCache()
    cached = cache.get(mbid)

    if cached:
        tours_raw = cached
    else:
        sf = SetlistFMClient(api_key=os.environ["SETLISTFM_API_KEY"])
        setlists = await sf.get_setlists(mbid)
        tours_raw: dict[str, list[dict]] = {}
        for s in setlists:
            key = s.tour_name or "Unknown Tour"
            tours_raw.setdefault(key, [])
            tours_raw[key].append(s.model_dump())
        cache.set(mbid, tours_raw)

    tours: dict[str, list[Setlist]] = {
        k: [Setlist(**s) for s in v] for k, v in tours_raw.items()
    }
    current_leg = detect_current_leg(tours)

    return SetlistsResponse(
        tours=[
            TourSummary(name=name, show_count=len(setlists))
            for name, setlists in tours.items()
        ],
        current_leg=current_leg,
    )
