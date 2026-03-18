from __future__ import annotations

from ..core.config import get_settings
from ..models.inference import CreditRiskInferenceService


def main() -> None:
    settings = get_settings()
    service = CreditRiskInferenceService(
        model_path=settings.model_path,
        dataset_path=settings.dataset_path,
    )
    service.train_and_persist_from_dataset()
    print(f"Model trained and saved to: {settings.model_path}")


if __name__ == "__main__":
    main()
