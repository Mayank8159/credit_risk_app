try:
	from .src.main import app
except ImportError:  # pragma: no cover
	from src.main import app
