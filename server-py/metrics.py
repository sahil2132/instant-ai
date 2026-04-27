import time

_start_time = time.time()
_request_count = 0
_total_response_ms = 0.0


def record_request(ms: float) -> None:
    global _request_count, _total_response_ms
    _request_count += 1
    _total_response_ms += ms


def get_metrics() -> dict:
    return {
        "uptimeSeconds": int(time.time() - _start_time),
        "requestCount": _request_count,
        "avgResponseMs": round(_total_response_ms / _request_count) if _request_count else 0,
    }
