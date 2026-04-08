import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from time import perf_counter

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import auth, credit_coach, loan, risk
from .core.config import get_settings
from .models.inference import CreditRiskInferenceService
from .services.credit_coach_service import CreditCoachService
from .services.counterfactual_service import CounterfactualService
from .services.loan_repository import LoanApplicationRepository


logger = logging.getLogger(__name__)


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


def _extract_error_message(detail: object) -> str:
    if isinstance(detail, str) and detail.strip():
        return detail
    if isinstance(detail, dict):
        message = detail.get("message") or detail.get("detail")
        if isinstance(message, str) and message.strip():
            return message
    return "Request failed"

def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()

    inference_service = CreditRiskInferenceService(
        model_path=settings.model_path,
        dataset_path=settings.dataset_path,
    )

    # Initialize AI Credit Coach services
    coach_service = CreditCoachService()
    counterfactual_service = CounterfactualService()
    loan_repository = LoanApplicationRepository(db_path=settings.loan_db_path)

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

        loan_repository.initialize()
        risk.configure_inference_service(inference_service)
        loan.configure_dependencies(
            inference_service=inference_service,
            loan_repository=loan_repository,
        )

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

    @app.middleware("http")
    async def request_logging_middleware(request: Request, call_next):
        start = perf_counter()
        logger.info("Request started: %s %s", request.method, request.url.path)
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("Unhandled exception in request: %s %s", request.method, request.url.path)
            raise

        duration_ms = round((perf_counter() - start) * 1000, 2)
        logger.info(
            "Request completed: %s %s -> %s (%sms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
        message = _extract_error_message(exc.detail)
        logger.error("HTTP exception (%s): %s", exc.status_code, message)
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": message},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        first_error = exc.errors()[0] if exc.errors() else {}
        message = first_error.get("msg", "Invalid request payload")
        logger.error("Validation error: %s", message)
        return JSONResponse(
            status_code=422,
            content={"success": False, "error": message},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server exception")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(exc) or "Internal server error"},
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
    app.include_router(loan.router, prefix=settings.api_v1_prefix)

    # Configure and include credit coach router
    credit_coach.configure_services(coach_service, counterfactual_service)
    app.include_router(credit_coach.router, prefix=settings.api_v1_prefix)

    @app.get("/health")
    def health() -> dict[str, str]:
        try:
            return {
                "status": "ok",
                "environment": settings.app_env,
                "keep_warm_timer_enabled": str(settings.enable_keep_warm_timer).lower(),
            }
        except Exception as exc:  # pragma: no cover
            logger.exception("Health endpoint failed")
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    return app


app = create_app()
