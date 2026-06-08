from __future__ import annotations

import csv
import time
from pathlib import Path
from typing import Any, Dict

from flask import Flask, jsonify, render_template, request, send_from_directory

from ai_model import QUALITY_LEVELS, predictor


BASE_DIR = Path(__file__).resolve().parent
DASH_DIR = BASE_DIR / "media" / "dash"
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "session_metrics.csv"

app = Flask(__name__)


def ensure_log_file() -> None:
    LOG_DIR.mkdir(exist_ok=True)
    if not LOG_FILE.exists():
        with LOG_FILE.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "timestamp",
                    "mode",
                    "throughput_mbps",
                    "previous_throughput_mbps",
                    "buffer_sec",
                    "latency_ms",
                    "packet_loss_pct",
                    "jitter_ms",
                    "current_quality",
                    "selected_quality",
                    "selected_bitrate_kbps",
                    "confidence",
                    "reason",
                ]
            )


@app.route("/")
def index() -> str:
    manifest_ready = (DASH_DIR / "manifest.mpd").exists()
    return render_template(
        "index.html",
        manifest_ready=manifest_ready,
        qualities=QUALITY_LEVELS,
    )


@app.route("/dash/<path:filename>")
def dash_file(filename: str):
    return send_from_directory(DASH_DIR, filename)


@app.route("/api/ping")
def ping():
    return jsonify({"server_time": time.time()})


@app.route("/api/qualities")
def qualities():
    return jsonify({"qualities": QUALITY_LEVELS})


@app.route("/api/predict", methods=["POST"])
def predict():
    metrics: Dict[str, Any] = request.get_json(force=True, silent=True) or {}
    result = predictor.predict(metrics)
    return jsonify(result.__dict__)


@app.route("/api/log", methods=["POST"])
def log_metrics():
    ensure_log_file()
    payload: Dict[str, Any] = request.get_json(force=True, silent=True) or {}
    with LOG_FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                round(time.time(), 3),
                payload.get("mode", "ai"),
                payload.get("throughput_mbps", 0),
                payload.get("previous_throughput_mbps", 0),
                payload.get("buffer_sec", 0),
                payload.get("latency_ms", 0),
                payload.get("packet_loss_pct", 0),
                payload.get("jitter_ms", 0),
                payload.get("current_quality", 0),
                payload.get("selected_quality", 0),
                payload.get("selected_bitrate_kbps", 0),
                payload.get("confidence", 0),
                payload.get("reason", ""),
            ]
        )
    return jsonify({"ok": True, "log_file": str(LOG_FILE)})


if __name__ == "__main__":
    ensure_log_file()
    app.run(host="127.0.0.1", port=5000, debug=True)
