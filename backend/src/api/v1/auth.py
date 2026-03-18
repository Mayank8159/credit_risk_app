from fastapi import APIRouter, Depends

from ...schemas.auth import DemoLoginRequest, DemoLoginResponse
from ...services.demo_auth import DemoAuthService

router = APIRouter(prefix="/auth", tags=["demo-auth"])


def get_demo_auth_service() -> DemoAuthService:
    return DemoAuthService()


@router.get("/demo-users")
def get_demo_users(
    service: DemoAuthService = Depends(get_demo_auth_service),
) -> dict[str, list[dict[str, str]]]:
    return {"users": service.list_demo_users()}


@router.post("/login", response_model=DemoLoginResponse)
def demo_login(
    payload: DemoLoginRequest,
    service: DemoAuthService = Depends(get_demo_auth_service),
) -> DemoLoginResponse:
    return service.login_demo_user(payload)
