from __future__ import annotations

import os
import socket
import sys
import time
import urllib.error
import urllib.request


def _get_timeout_seconds() -> float:
    raw = (os.getenv("KEEP_WARM_TIMEOUT_SECONDS") or "10").strip()
    try:
        parsed = float(raw)
    except ValueError:
        return 10.0
    return max(1.0, parsed)


def _get_retry_attempts() -> int:
    raw = (os.getenv("KEEP_WARM_RETRY_ATTEMPTS") or "3").strip()
    try:
        parsed = int(raw)
    except ValueError:
        return 3
    return max(1, parsed)


def _get_retry_delay_seconds() -> float:
    raw = (os.getenv("KEEP_WARM_RETRY_DELAY_SECONDS") or "5").strip()
    try:
        parsed = float(raw)
    except ValueError:
        return 5.0
    return max(0.0, parsed)


def _get_fail_on_error() -> bool:
    raw = (os.getenv("KEEP_WARM_FAIL_ON_ERROR") or "false").strip().lower()
    return raw in {"1", "true", "yes", "on"}


def _ping_once(url: str, timeout: float) -> tuple[bool, str]:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            status = int(getattr(response, "status", 200) or 200)
            if 200 <= status < 300:
                return True, f"{status}"

            return False, f"HTTP {status}"
    except urllib.error.HTTPError as exc:
        return False, f"HTTP {exc.code} {exc.reason}"
    except (urllib.error.URLError, socket.timeout) as exc:
        reason = getattr(exc, "reason", None) or str(exc)
        return False, f"URL error: {reason}"
    except Exception as exc:  # pragma: no cover
        return False, f"unexpected error: {exc}"


def main() -> int:
    url = (os.getenv("KEEP_WARM_URL") or "").strip()
    if not url:
        print("KEEP_WARM_URL is not set; skipping keep-warm ping.")
        return 0

    timeout = _get_timeout_seconds()
    retry_attempts = _get_retry_attempts()
    retry_delay_seconds = _get_retry_delay_seconds()
    fail_on_error = _get_fail_on_error()

    for attempt in range(1, retry_attempts + 1):
        success, detail = _ping_once(url=url, timeout=timeout)
        if success:
            print(
                f"Keep-warm ping succeeded: {url} -> {detail} "
                f"(attempt {attempt}/{retry_attempts})"
            )
            return 0

        print(
            f"Keep-warm ping attempt failed: {url} -> {detail} "
            f"(attempt {attempt}/{retry_attempts})",
            file=sys.stderr,
        )

        if attempt < retry_attempts and retry_delay_seconds > 0:
            time.sleep(retry_delay_seconds)

    if fail_on_error:
        print("Keep-warm ping exhausted retries and is configured to fail.", file=sys.stderr)
        return 1

    print("Keep-warm ping exhausted retries; exiting successfully to avoid cron flapping.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
