from __future__ import annotations

import os
import sys
import urllib.error
import urllib.request


def _get_timeout_seconds() -> float:
    raw = (os.getenv("KEEP_WARM_TIMEOUT_SECONDS") or "10").strip()
    try:
        parsed = float(raw)
    except ValueError:
        return 10.0
    return max(1.0, parsed)


def main() -> int:
    url = (os.getenv("KEEP_WARM_URL") or "").strip()
    if not url:
        print("KEEP_WARM_URL is not set; skipping keep-warm ping.")
        return 0

    timeout = _get_timeout_seconds()

    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            status = int(getattr(response, "status", 200) or 200)
            if 200 <= status < 300:
                print(f"Keep-warm ping succeeded: {url} -> {status}")
                return 0

            print(f"Keep-warm ping failed: {url} -> {status}", file=sys.stderr)
            return 1
    except urllib.error.HTTPError as exc:
        print(
            f"Keep-warm ping failed with HTTP error: {exc.code} {exc.reason}",
            file=sys.stderr,
        )
        return 1
    except urllib.error.URLError as exc:
        print(f"Keep-warm ping failed with URL error: {exc.reason}", file=sys.stderr)
        return 1
    except Exception as exc:  # pragma: no cover
        print(f"Keep-warm ping failed with unexpected error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
