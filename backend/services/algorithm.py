from collections import Counter, defaultdict
from backend.models import Setlist, ScoredTrack

_SLOT_ORDER = {"opener": 0, "mid": 1, "closer": 2, "encore": 3}


def detect_current_leg(tours: dict[str, list[Setlist]]) -> str | None:
    if not tours:
        return None

    def _max_date(setlists: list[Setlist]) -> str:
        dates = []
        for s in setlists:
            d = s.event_date  # "DD-MM-YYYY"
            if len(d) == 10:
                dates.append(f"{d[6:]}-{d[3:5]}-{d[:2]}")
        return max(dates) if dates else ""

    return max(tours, key=lambda t: _max_date(tours[t]))


def score_setlists(setlists: list[Setlist]) -> list[ScoredTrack]:
    if not setlists:
        return []

    total = len(setlists)
    song_slots: dict[str, list[str]] = defaultdict(list)

    for sl in setlists:
        live_songs = [s for s in sl.songs if not s.tape]
        main = [s for s in live_songs if not s.is_encore]
        encore = [s for s in live_songs if s.is_encore]

        for i, song in enumerate(main):
            if i == 0:
                slot = "opener"
            elif i == len(main) - 1:
                slot = "closer"
            else:
                slot = "mid"
            song_slots[song.name].append(slot)

        for song in encore:
            song_slots[song.name].append("encore")

    results = []
    for name, slots in song_slots.items():
        frequency = len(slots) / total
        consensus_slot = Counter(slots).most_common(1)[0][0]
        results.append(ScoredTrack(name=name, frequency=frequency, slot=consensus_slot))

    results.sort(key=lambda t: (_SLOT_ORDER[t.slot], -t.frequency))
    return results
