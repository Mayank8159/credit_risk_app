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


def _resolve_project_path(raw_value: str, *, base_dir: Path) -> Path:
	raw_path = Path(raw_value)
	if raw_path.is_absolute():
		return raw_path

	# Support both "backend/..." and "..." forms across Render rootDir setups.
	if raw_path.parts and raw_path.parts[0] == "backend":
		raw_path = Path(*raw_path.parts[1:]) if len(raw_path.parts) > 1 else Path(".")

	return (base_dir / raw_path).resolve()


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
	enable_keep_warm_timer: bool
	keep_warm_interval_seconds: int
	keep_warm_url: str | None


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
		dataset_path=_resolve_project_path(dataset_path_raw, base_dir=base_dir),
		model_path=_resolve_project_path(model_path_raw, base_dir=base_dir),
		model_autoload=_as_bool(os.getenv("MODEL_AUTOLOAD", "true"), default=True),
		cors_allow_origins=origins if origins else ["*"],
		cors_allow_credentials=_as_bool(
			os.getenv("CORS_ALLOW_CREDENTIALS", "true"), default=True
		),
		cors_allow_methods=methods if methods else ["*"],
		cors_allow_headers=headers if headers else ["*"],
		enable_keep_warm_timer=_as_bool(
			os.getenv("ENABLE_KEEP_WARM_TIMER", "false"), default=False
		),
		keep_warm_interval_seconds=max(
			10, int(os.getenv("KEEP_WARM_INTERVAL_SECONDS", "50"))
		),
		keep_warm_url=(os.getenv("KEEP_WARM_URL") or "").strip() or None,
	)
