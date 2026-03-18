from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


def _as_bool(value: str, *, default: bool) -> bool:
	normalized = value.strip().lower()
	if normalized in {"1", "true", "yes", "y", "on"}:
		return True
	if normalized in {"0", "false", "no", "n", "off"}:
		return False
	return default


@dataclass(frozen=True)
class Settings:
	base_dir: Path
	app_env: str
	api_v1_prefix: str
	dataset_path: Path
	model_path: Path
	model_autoload: bool
	cors_allow_origins: list[str]
	cors_allow_credentials: bool
	cors_allow_methods: list[str]
	cors_allow_headers: list[str]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
	base_dir = Path(__file__).resolve().parents[2]

	dataset_path_raw = os.getenv(
		"DATASET_PATH", str(base_dir / "datasets" / "credit_risk_dataset.csv")
	)
	model_path_raw = os.getenv(
		"MODEL_PATH", str(base_dir / "models" / "credit_risk_model.joblib")
	)

	origins_raw = os.getenv(
		"CORS_ALLOW_ORIGINS",
		"http://localhost:19006,http://127.0.0.1:19006,http://localhost:8081,http://127.0.0.1:8081,exp://127.0.0.1:19000,exp://localhost:19000",
	)
	methods_raw = os.getenv("CORS_ALLOW_METHODS", "*")
	headers_raw = os.getenv("CORS_ALLOW_HEADERS", "*")

	origins = [item.strip() for item in origins_raw.split(",") if item.strip()]
	methods = [item.strip() for item in methods_raw.split(",") if item.strip()]
	headers = [item.strip() for item in headers_raw.split(",") if item.strip()]

	return Settings(
		base_dir=base_dir,
		app_env=os.getenv("APP_ENV", "development"),
		api_v1_prefix=os.getenv("API_V1_PREFIX", "/api/v1"),
		dataset_path=Path(dataset_path_raw),
		model_path=Path(model_path_raw),
		model_autoload=_as_bool(os.getenv("MODEL_AUTOLOAD", "true"), default=True),
		cors_allow_origins=origins if origins else ["*"],
		cors_allow_credentials=_as_bool(
			os.getenv("CORS_ALLOW_CREDENTIALS", "true"), default=True
		),
		cors_allow_methods=methods if methods else ["*"],
		cors_allow_headers=headers if headers else ["*"],
	)
