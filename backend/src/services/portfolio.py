from ..schemas.risk import PortfolioRiskSnapshot


class MockPortfolioRiskRepository:
    """Simple in-memory provider for portfolio-level metrics used by the UI."""

    def get_portfolio_risk_snapshot(self) -> PortfolioRiskSnapshot:
        return PortfolioRiskSnapshot(
            total_assets_usd=890000,
            npc_rate_percent=4.2,
            label="Portfolio Risk",
        )
