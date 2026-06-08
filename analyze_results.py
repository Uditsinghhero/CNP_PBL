from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
LOG_FILE = BASE_DIR / "logs" / "session_metrics.csv"
RESULTS_DIR = BASE_DIR / "results"


def main() -> None:
    if not LOG_FILE.exists():
        raise SystemExit("No logs found. Run the Flask app and play the video first.")

    df = pd.read_csv(LOG_FILE)
    if df.empty:
        raise SystemExit("The log file is empty. Stream the video for at least 30 seconds.")

    RESULTS_DIR.mkdir(exist_ok=True)
    df["elapsed_sec"] = df["timestamp"] - df["timestamp"].min()

    plots = [
        ("throughput_mbps", "Bandwidth vs Time", "Throughput (Mbps)", "bandwidth_vs_time.png"),
        ("selected_bitrate_kbps", "Selected Bitrate vs Time", "Bitrate (Kbps)", "bitrate_vs_time.png"),
        ("buffer_sec", "Buffer Occupancy", "Buffer (seconds)", "buffer_occupancy.png"),
        ("latency_ms", "Latency vs Time", "RTT / Latency (ms)", "latency_vs_time.png"),
        ("confidence", "AI Prediction Confidence", "Confidence", "ai_confidence.png"),
    ]

    for column, title, ylabel, filename in plots:
        plt.figure(figsize=(10, 4))
        plt.plot(df["elapsed_sec"], df[column], marker="o", linewidth=1.8)
        plt.title(title)
        plt.xlabel("Time (seconds)")
        plt.ylabel(ylabel)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(RESULTS_DIR / filename, dpi=150)
        plt.close()

    summary = {
        "samples": len(df),
        "avg_throughput_mbps": round(df["throughput_mbps"].mean(), 3),
        "avg_buffer_sec": round(df["buffer_sec"].mean(), 3),
        "avg_latency_ms": round(df["latency_ms"].mean(), 3),
        "quality_switches": int((df["selected_quality"].diff().fillna(0) != 0).sum()),
        "low_buffer_events": int((df["buffer_sec"] < 2).sum()),
        "avg_ai_confidence": round(df["confidence"].mean(), 3),
    }

    pd.DataFrame([summary]).to_csv(RESULTS_DIR / "qos_summary.csv", index=False)
    print("Generated result graphs in:", RESULTS_DIR)
    print(summary)


if __name__ == "__main__":
    main()
