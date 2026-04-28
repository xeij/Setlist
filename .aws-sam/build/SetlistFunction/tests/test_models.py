from models import Song, Setlist, ArtistResult, TourSummary, SetlistsResponse, ScoredTrack, GenerateRequest, GenerateResponse

def test_song_defaults():
    s = Song(name="Karma Police")
    assert s.is_encore is False
    assert s.tape is False

def test_setlist_model():
    sl = Setlist(
        id="abc",
        event_date="01-01-2024",
        tour_name="OK Tour",
        venue="O2",
        city="London",
        artist_name="Radiohead",
        songs=[Song(name="Creep")],
    )
    assert sl.artist_name == "Radiohead"

def test_generate_request():
    req = GenerateRequest(mbid="abc123", tour_name="OK Tour", artist_name="Radiohead")
    assert req.mbid == "abc123"

def test_scored_track():
    t = ScoredTrack(name="Creep", frequency=0.9, slot="mid")
    assert t.frequency == 0.9
    assert t.slot == "mid"
