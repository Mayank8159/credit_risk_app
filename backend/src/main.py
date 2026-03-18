import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import auth, risk
from .core.config import get_settings
from .models.inference import CreditRiskInferenceService

def create_app() -> FastAPI:
    settings = get_settings()

    inference_service = CreditRiskInferenceService(
        model_path=settings.model_path,
        dataset_path=settings.dataset_path,
    )

    async def keep_warm_loop(url: str, interval_seconds: int) -> None:
        timeout = httpx.Timeout(10.0, connect=5.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            while True:
                try:
                    await client.get(url)
                except Exception:
                    # Keep this best-effort and never block API serving.
                    pass
                await asyncio.sleep(interval_seconds)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        keep_warm_task: asyncio.Task[None] | None = None

        if settings.model_autoload:
            try:
                inference_service.load_model()
            except FileNotFoundError:
                # Fresh deployments may not include the model artifact; train it once.
                inference_service.train_and_persist_from_dataset()
        risk.configure_inference_service(inference_service)

        if settings.enable_keep_warm_timer and settings.keep_warm_url:
            keep_warm_task = asyncio.create_task(
                keep_warm_loop(
                    url=settings.keep_warm_url,
                    interval_seconds=settings.keep_warm_interval_seconds,
                )
            )

        yield

        if keep_warm_task is not None:
            keep_warm_task.cancel()
            try:
                await keep_warm_task
            except asyncio.CancelledError:
                pass

    app = FastAPI(
        title="Credit Risk Detection Backend",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )

    app.include_router(auth.router, prefix=settings.api_v1_prefix)
    app.include_router(risk.router, prefix=settings.api_v1_prefix)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {
            "status": "ok",
            "environment": settings.app_env,
            "keep_warm_timer_enabled": str(settings.enable_keep_warm_timer).lower(),
        }

    return app


app = create_app()
