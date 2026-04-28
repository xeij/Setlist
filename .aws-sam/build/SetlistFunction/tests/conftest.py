import os
import sys
import pathlib
import pytest
from fastapi.testclient import TestClient

# Add backend/ to path so imports work without the `backend.` prefix
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))

os.environ.setdefault("SETLISTFM_API_KEY", "test_key")
os.environ.setdefault("DYNAMODB_TABLE", "test-setlist-cache")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "test")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test")

from main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
