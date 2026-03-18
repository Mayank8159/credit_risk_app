from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import risk
from .core.config import get_settings
from .models.inference import CreditRiskInferenceService

def create_app() -> FastAPI:
    settings = get_settings()

    inference_service = CreditRiskInferenceService(
        model_path=settings.model_path,
        dataset_path=settings.dataset_path,
    )

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        if settings.model_autoload:
            inference_service.load_model()
        risk.configure_inference_service(inference_service)
        yield

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

    app.include_router(risk.router, prefix=settings.api_v1_prefix)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "environment": settings.app_env}

    return app


app = create_app()
