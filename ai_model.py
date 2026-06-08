from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


QUALITY_LEVELS = [
    {"index": 0, "label": "240p", "bitrate_kbps": 400, "height": 240},
    {"index": 1, "label": "360p", "bitrate_kbps": 1000, "height": 360},
    {"index": 2, "label": "720p", "bitrate_kbps": 2500, "height": 720},
    {"index": 3, "label": "1080p", "bitrate_kbps": 6000, "height": 1080},
]


@dataclass
class PredictionResult:
    quality_index: int
    quality_label: str
    bitrate_kbps: int
    confidence: float
    accuracy: float
    reason: str


class AIBitratePredictor:
    """Small Random Forest model trained on synthetic network traces."""

    def __init__(self) -> None:
        self.model = RandomForestClassifier(
            n_estimators=180,
            max_depth=8,
            random_state=42,
            class_weight="balanced",
        )
        self.accuracy = 0.0
        self._train()

    def _train(self) -> None:
        rng = np.random.default_rng(42)
        rows: List[List[float]] = []
        labels: List[int] = []

        for _ in range(3500):
            throughput = float(rng.uniform(0.25, 15.0))
            previous = max(0.1, throughput + float(rng.normal(0, 0.75)))
            buffer = float(rng.uniform(0.2, 18.0))
            latency = float(rng.uniform(15, 260))
            packet_loss = float(rng.uniform(0, 9))
            jitter = float(rng.uniform(1, 90))
            current_quality = int(rng.integers(0, len(QUALITY_LEVELS)))

            safety_factor = 0.82
            if buffer < 3:
                safety_factor -= 0.2
            if latency > 140:
                safety_factor -= 0.1
            if packet_loss > 4:
                safety_factor -= 0.12
            if jitter > 55:
                safety_factor -= 0.08

            predicted_capacity_kbps = max(
                150,
                throughput * 1000 * safety_factor - packet_loss * 55 - jitter * 3,
            )

            if predicted_capacity_kbps >= 7000 and buffer >= 8:
                label = 3
            elif predicted_capacity_kbps >= 3000 and buffer >= 5:
                label = 2
            elif predicted_capacity_kbps >= 1250 and buffer >= 2:
                label = 1
            else:
                label = 0

            rows.append(
                [
                    throughput,
                    previous,
                    buffer,
                    latency,
                    packet_loss,
                    jitter,
                    current_quality,
                ]
            )
            labels.append(label)

        x_train, x_test, y_train, y_test = train_test_split(
            np.array(rows),
            np.array(labels),
            test_size=0.2,
            random_state=42,
            stratify=np.array(labels),
        )
        self.model.fit(x_train, y_train)
        self.accuracy = float(accuracy_score(y_test, self.model.predict(x_test)))

    def predict(self, metrics: Dict[str, float]) -> PredictionResult:
        features = np.array(
            [
                [
                    float(metrics.get("throughput_mbps", 1.0)),
                    float(metrics.get("previous_throughput_mbps", 1.0)),
                    float(metrics.get("buffer_sec", 0.0)),
                    float(metrics.get("latency_ms", 100.0)),
                    float(metrics.get("packet_loss_pct", 0.0)),
                    float(metrics.get("jitter_ms", 10.0)),
                    int(metrics.get("current_quality", 0)),
                ]
            ]
        )
        predicted = int(self.model.predict(features)[0])
        probabilities = self.model.predict_proba(features)[0]
        confidence = float(probabilities[predicted])
        quality = QUALITY_LEVELS[predicted]

        reasons = []
        if features[0][2] < 3:
            reasons.append("low buffer")
        if features[0][0] * 1000 < quality["bitrate_kbps"] * 1.3:
            reasons.append("limited throughput")
        if features[0][4] > 3:
            reasons.append("packet loss")
        if not reasons:
            reasons.append("stable network")

        return PredictionResult(
            quality_index=predicted,
            quality_label=quality["label"],
            bitrate_kbps=quality["bitrate_kbps"],
            confidence=round(confidence, 3),
            accuracy=round(self.accuracy, 3),
            reason=", ".join(reasons),
        )


predictor = AIBitratePredictor()
