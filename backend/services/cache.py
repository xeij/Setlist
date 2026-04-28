import json
import os
import time

import boto3

_TTL = 86400  # 24 hours


class SetlistCache:
    def __init__(self):
        self._table = boto3.resource(
            "dynamodb", region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
        ).Table(os.environ["DYNAMODB_TABLE"])

    def get(self, mbid: str) -> dict | None:
        resp = self._table.get_item(Key={"mbid": mbid})
        item = resp.get("Item")
        if not item:
            return None
        if time.time() > float(item.get("ttl", 0)):
            return None
        return json.loads(item["data"])

    def set(self, mbid: str, data: dict) -> None:
        self._table.put_item(
            Item={
                "mbid": mbid,
                "data": json.dumps(data, default=str),
                "ttl": int(time.time()) + _TTL,
            }
        )
