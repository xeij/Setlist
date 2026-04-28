from __future__ import annotations
from typing import Literal
from pydantic import BaseModel


class Song(BaseModel):
    name: str
    is_encore: bool = False
    tape: bool = False


class Setlist(BaseModel):
    id: str
    event_date: str        # "DD-MM-YYYY"
    tour_name: str | None
    venue: str
    city: str
    artist_name: str
    songs: list[Song]


class ArtistResult(BaseModel):
    mbid: str
    name: str
    disambiguation: str | None = None


class TourSummary(BaseModel):
    name: str
    show_count: int


class SetlistsResponse(BaseModel):
    tours: list[TourSummary]
    current_leg: str | None


class ScoredTrack(BaseModel):
    name: str
    frequency: float
    slot: Literal["opener", "mid", "closer", "encore"]


class GenerateRequest(BaseModel):
    mbid: str
    tour_name: str
    artist_name: str


class GenerateResponse(BaseModel):
    artist: str
    tour_name: str
    tracks: list[ScoredTrack]
    total_shows: int
