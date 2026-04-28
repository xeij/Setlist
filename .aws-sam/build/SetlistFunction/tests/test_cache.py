import os
import json
import time
import pytest
import boto3
from moto import mock_aws
from services.cache import SetlistCache


@pytest.fixture
def aws_env(monkeypatch):
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test")
    monkeypatch.setenv("DYNAMODB_TABLE", "test-setlist-cache")


@pytest.fixture
def table(aws_env):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName="test-setlist-cache",
            KeySchema=[{"AttributeName": "mbid", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "mbid", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        table.meta.client.get_waiter("table_exists").wait(TableName="test-setlist-cache")
        yield table


def test_cache_miss_returns_none(table):
    with mock_aws():
        cache = SetlistCache()
        assert cache.get("nonexistent") is None


def test_cache_set_and_get(table):
    with mock_aws():
        cache = SetlistCache()
        data = {"Tour A": [{"id": "1", "songs": []}]}
        cache.set("abc123", data)
        result = cache.get("abc123")
        assert result == data


def test_cache_overwrite(table):
    with mock_aws():
        cache = SetlistCache()
        cache.set("abc123", {"v": 1})
        cache.set("abc123", {"v": 2})
        assert cache.get("abc123") == {"v": 2}
