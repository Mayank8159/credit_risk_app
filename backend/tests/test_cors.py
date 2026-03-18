import os

os.environ["MODEL_AUTOLOAD"] = "false"

from fastapi.testclient import TestClient

from src.main import app


def test_cors_preflight_allows_known_origin() -> None:
    origin = "http://localhost:19006"

    with TestClient(app) as client:
        response = client.options(
            "/health",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code in {200, 204}
    assert response.headers.get("access-control-allow-origin") == origin
