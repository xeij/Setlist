import os
from fastapi import APIRouter, Query
from models import ArtistResult
from services.setlistfm import SetlistFMClient

router = APIRouter()


@router.get("/artists/search", response_model=list[ArtistResult])
async def search_artists(q: str = Query(..., min_length=1)):
    client = SetlistFMClient(api_key=os.environ["SETLISTFM_API_KEY"])
    return await client.search_artists(q)
