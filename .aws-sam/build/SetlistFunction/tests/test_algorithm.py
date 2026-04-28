import pytest
from models import Setlist, Song
from services.algorithm import detect_current_leg, score_setlists


def make_setlist(
    songs: list[tuple[str, bool, bool]],  # (name, is_encore, tape)
    tour: str = "Test Tour",
    date: str = "01-01-2024",
    artist: str = "Test Artist",
) -> Setlist:
    return Setlist(
        id="test",
        event_date=date,
        tour_name=tour,
        venue="Venue",
        city="City",
        artist_name=artist,
        songs=[Song(name=n, is_encore=enc, tape=tape) for n, enc, tape in songs],
    )


def test_opener_slot():
    setlists = [
        make_setlist([("A", False, False), ("B", False, False), ("C", False, False)]),
        make_setlist([("A", False, False), ("D", False, False), ("C", False, False)]),
    ]
    scored = score_setlists(setlists)
    a = next(t for t in scored if t.name == "A")
    assert a.slot == "opener"
    assert a.frequency == 1.0


def test_closer_slot():
    setlists = [
        make_setlist([("A", False, False), ("B", False, False), ("C", False, False)]),
        make_setlist([("A", False, False), ("D", False, False), ("C", False, False)]),
    ]
    scored = score_setlists(setlists)
    c = next(t for t in scored if t.name == "C")
    assert c.slot == "closer"


def test_encore_slot():
    setlists = [make_setlist([("A", False, False), ("B", True, False)])]
    scored = score_setlists(setlists)
    b = next(t for t in scored if t.name == "B")
    assert b.slot == "encore"


def test_frequency_partial():
    setlists = [
        make_setlist([("A", False, False), ("B", False, False)]),
        make_setlist([("A", False, False), ("C", False, False)]),
    ]
    scored = score_setlists(setlists)
    b = next(t for t in scored if t.name == "B")
    assert b.frequency == 0.5


def test_playlist_order():
    setlists = [
        make_setlist([
            ("Opener", False, False),
            ("Mid", False, False),
            ("Closer", False, False),
            ("Encore", True, False),
        ])
    ]
    names = [t.name for t in score_setlists(setlists)]
    assert names[0] == "Opener"
    assert names[-1] == "Encore"
    assert names[-2] == "Closer"


def test_tape_songs_excluded():
    setlists = [make_setlist([("Live Song", False, False), ("Tape Song", False, True)])]
    names = [t.name for t in score_setlists(setlists)]
    assert "Tape Song" not in names
    assert "Live Song" in names


def test_empty_setlists():
    assert score_setlists([]) == []


def test_detect_current_leg_picks_most_recent():
    tours = {
        "Old Tour": [make_setlist([], date="01-01-2023")],
        "New Tour": [make_setlist([], date="15-06-2024")],
    }
    assert detect_current_leg(tours) == "New Tour"


def test_detect_current_leg_empty():
    assert detect_current_leg({}) is None
