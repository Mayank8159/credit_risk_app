from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


class CreditRiskInferenceService:
    """Loads a pre-trained model from disk and performs probability inference."""

    feature_columns = [
        "person_age",
        "person_income",
        "person_home_ownership",
        "person_emp_length",
        "loan_intent",
        "loan_grade",
        "loan_amnt",
        "loan_int_rate",
        "loan_percent_income",
        "cb_person_default_on_file",
        "cb_person_cred_hist_length",
    ]

    categorical_features = [
        "person_home_ownership",
        "loan_intent",
        "loan_grade",
        "cb_person_default_on_file",
    ]

    numeric_features = [
        "person_age",
        "person_income",
        "person_emp_length",
        "loan_amnt",
        "loan_int_rate",
        "loan_percent_income",
        "cb_person_cred_hist_length",
    ]

    def __init__(self, model_path: Path, dataset_path: Path) -> None:
        self.model_path = model_path
        self.dataset_path = dataset_path
        self.pipeline: Pipeline | None = None

    def load_model(self) -> None:
        """Load a pre-trained model from joblib artifact."""
        if not self.model_path.exists():
            raise FileNotFoundError(
                "Model artifact not found. Train first with the training script: "
                f"{self.model_path}"
            )

        self.pipeline = joblib.load(self.model_path)

    def train_and_persist_from_dataset(self) -> Pipeline:
        """Train from the configured dataset and persist model artifact."""
        self.pipeline = self._train_and_persist_from_dataset()
        return self.pipeline

    def _train_and_persist_from_dataset(self) -> Pipeline:
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Dataset not found at: {self.dataset_path}")

        data = pd.read_csv(self.dataset_path)
        if "loan_status" not in data.columns:
            raise ValueError("Dataset must contain 'loan_status' target column.")

        x_train = data[self.feature_columns].copy()
        y_train = data["loan_status"].astype(int)

        numeric_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )

        categorical_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore")),
            ]
        )

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_pipeline, self.numeric_features),
                ("cat", categorical_pipeline, self.categorical_features),
            ]
        )

        pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                (
                    "classifier",
                    LogisticRegression(max_iter=1000, class_weight="balanced"),
                ),
            ]
        )

        pipeline.fit(x_train, y_train)

        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, self.model_path)
        return pipeline

    def predict_default_probability(self, feature_payload: dict[str, Any]) -> float:
        if self.pipeline is None:
            raise RuntimeError("Model is not loaded. Call load_model() first.")

        row = pd.DataFrame([feature_payload], columns=self.feature_columns)
        probability = float(self.pipeline.predict_proba(row)[0][1])
        return max(0.0, min(1.0, probability))
