import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from dotenv import load_dotenv
from routers import artists, setlists, playlist

load_dotenv()

app = FastAPI(title="Setlist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(artists.router, prefix="/api")
app.include_router(setlists.router, prefix="/api")
app.include_router(playlist.router, prefix="/api")

handler = Mangum(app, lifespan="off")
