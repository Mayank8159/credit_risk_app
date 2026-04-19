"""Optional Gemini integration for AI Credit Coach responses.

This service is backend-only and reads API credentials from environment
variables (GOOGLE_API_KEY). It never exposes the key to frontend clients.
"""

from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self, api_key: str | None) -> None:
        self.api_key = api_key
        self.endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/"
            "models/gemini-1.5-flash:generateContent"
        )

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_credit_coach_answer(
        self,
        user_message: str,
        risk_score: int,
        risk_grade: str,
        negative_factors: list[str],
        positive_factors: list[str],
    ) -> str | None:
        if not self.is_configured:
            return None

        prompt = (
            "You are a concise credit coach. "
            "Return plain text only. No markdown. Keep under 140 words. "
            f"User question: {user_message}\n"
            f"Risk score: {risk_score}/100\n"
            f"Risk grade: {risk_grade}\n"
            f"Top negative factors: {', '.join(negative_factors[:3]) or 'None'}\n"
            f"Top positive factors: {', '.join(positive_factors[:2]) or 'None'}\n"
            "Give a clear explanation and 2-3 practical next steps."
        )

        try:
            response = httpx.post(
                f"{self.endpoint}?key={self.api_key}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 220},
                },
                timeout=10.0,
            )
            response.raise_for_status()
            body = response.json()
            candidates = body.get("candidates") or []
            if not candidates:
                return None
            parts = (candidates[0].get("content") or {}).get("parts") or []
            if not parts:
                return None
            text = (parts[0].get("text") or "").strip()
            return text or None
        except Exception as exc:  # pragma: no cover
            logger.warning("Gemini call failed, using rule fallback: %s", exc)
            return None
