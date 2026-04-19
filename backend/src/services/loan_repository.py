from __future__ import annotations

import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path

from ..models.loan_application import LoanApplication
from ..schemas.loan import LoanCategory


class LoanApplicationRepository:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()

    def initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS loan_applications (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    loan_amount REAL NOT NULL,
                    loan_category TEXT NOT NULL,
                    selected_bank TEXT NOT NULL,
                    salary REAL NOT NULL,
                    cibil_score INTEGER NOT NULL,
                    risk_score REAL NOT NULL,
                    credit_score REAL NOT NULL,
                    emi REAL NOT NULL,
                    tenure INTEGER NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.commit()

    def create(self, application: LoanApplication) -> LoanApplication:
        with self._lock, self._connect() as connection:
            connection.execute(
                """
                INSERT INTO loan_applications (
                    id, user_id, loan_amount, loan_category, selected_bank,
                    salary, cibil_score, risk_score, credit_score, emi,
                    tenure, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    application.id,
                    application.user_id,
                    application.loan_amount,
                    application.loan_category.value,
                    application.selected_bank,
                    application.salary,
                    application.cibil_score,
                    application.risk_score,
                    application.credit_score,
                    application.emi,
                    application.tenure,
                    application.created_at.isoformat(),
                ),
            )
            connection.commit()

        return application

    def list_all(self) -> list[LoanApplication]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    id, user_id, loan_amount, loan_category, selected_bank,
                    salary, cibil_score, risk_score, credit_score, emi,
                    tenure, created_at
                FROM loan_applications
                ORDER BY datetime(created_at) DESC
                """
            ).fetchall()

        applications: list[LoanApplication] = []
        for row in rows:
            created_at = datetime.fromisoformat(row[11])
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            applications.append(
                LoanApplication(
                    id=row[0],
                    user_id=row[1],
                    loan_amount=float(row[2]),
                    loan_category=LoanCategory(row[3]),
                    selected_bank=row[4],
                    salary=float(row[5]),
                    cibil_score=int(row[6]),
                    risk_score=float(row[7]),
                    credit_score=float(row[8]),
                    emi=float(row[9]),
                    tenure=int(row[10]),
                    created_at=created_at,
                )
            )

        return applications

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path, timeout=10, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        return connection
