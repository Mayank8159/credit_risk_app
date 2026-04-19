import logging

from fastapi import APIRouter, Depends, HTTPException

from ...schemas.auth import (
    DemoLoginApiResponse,
    DemoLoginRequest,
    DemoLoginResponse,
    DemoUsersResponse,
)
from ...services.demo_auth import DemoAuthService

router = APIRouter(prefix="/auth", tags=["demo-auth"])
logger = logging.getLogger(__name__)


def get_demo_auth_service() -> DemoAuthService:
    return DemoAuthService()


@router.get("/demo-users")
def get_demo_users(
    service: DemoAuthService = Depends(get_demo_auth_service),
) -> DemoUsersResponse:
    try:
        return DemoUsersResponse(success=True, data={"users": service.list_demo_users()})
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        logger.exception("Failed to fetch demo users")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/login", response_model=DemoLoginApiResponse)
def demo_login(
    payload: DemoLoginRequest,
    service: DemoAuthService = Depends(get_demo_auth_service),
) -> DemoLoginApiResponse:
    try:
        login_response: DemoLoginResponse = service.login_demo_user(payload)
        return DemoLoginApiResponse(success=True, data=login_response.model_dump())
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        logger.exception("Demo login failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
