from pydantic import BaseModel, Field

from .risk import RiskAnalyzeResponse


class DemoLoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=3)


class DemoUserProfile(BaseModel):
    username: str
    full_name: str
    role: str


class DemoLoginResponse(BaseModel):
    message: str
    user: DemoUserProfile
    dashboard_preview: RiskAnalyzeResponse


class DemoUsersResponse(BaseModel):
    success: bool = True
    data: dict


class DemoLoginApiResponse(BaseModel):
    success: bool = True
    data: dict
