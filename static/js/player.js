const config = window.APP_CONFIG || {};
const qualities = config.qualities || [];

let player = null;
let previousThroughput = 1.5;
let sampleIndex = 0;
let latestLatency = 0;
let lastAppliedQuality = 0;
const maxPoints = 40;

const profileSettings = {
    stable: { baseThroughput: 4.2, throughputFactor: 1.0, latency: 35, jitter: 8, loss: 0.4 },
    medium: { baseThroughput: 2.2, throughputFactor: 0.86, latency: 85, jitter: 24, loss: 1.6 },
    poor: { baseThroughput: 0.95, throughputFactor: 0.78, latency: 155, jitter: 46, loss: 3.6 },
    lossy: { baseThroughput: 1.45, throughputFactor: 0.82, latency: 130, jitter: 72, loss: 6.5 }
};

const elements = {
    runtimeStatus: document.getElementById("runtimeStatus"),
    throughput: document.getElementById("throughputValue"),
    buffer: document.getElementById("bufferValue"),
    latency: document.getElementById("latencyValue"),
    quality: document.getElementById("qualityValue"),
    confidence: document.getElementById("confidenceValue"),
    reason: document.getElementById("reasonValue"),
    aiToggle: document.getElementById("aiToggle"),
    networkProfile: document.getElementById("networkProfile"),
    resetCharts: document.getElementById("resetCharts")
};

function setStatus(message, isError = false) {
    if (!elements.runtimeStatus) return;
    elements.runtimeStatus.textContent = message;
    elements.runtimeStatus.classList.toggle("error", isError);
}

function createLineChart(canvasId, label, color, yTitle) {
    const canvas = document.getElementById(canvasId);
    return {
        canvas,
        context: canvas.getContext("2d"),
        label,
        color,
        yTitle,
        values: []
    };
}

const charts = {
    throughput: createLineChart("throughputChart", "Throughput", "#2563eb", "Mbps"),
    bitrate: createLineChart("bitrateChart", "Selected Bitrate", "#0f766e", "Kbps"),
    buffer: createLineChart("bufferChart", "Buffer", "#b45309", "Seconds"),
    latency: createLineChart("latencyChart", "RTT", "#7c3aed", "ms")
};

function pushChart(chart, value) {
    chart.values.push(Number(value || 0));
    if (chart.values.length > maxPoints) {
        chart.values.shift();
    }
    drawChart(chart);
}

function drawChart(chart) {
    const canvas = chart.canvas;
    const ctx = chart.context;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(220, Math.floor(rect.height));

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 28, right: 18, bottom: 34, left: 48 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const values = chart.values.length ? chart.values : [0];
    const maxValue = Math.max(...values, 1);
    const yMax = maxValue * 1.2;

    ctx.fillStyle = "#16202a";
    ctx.font = "700 14px Segoe UI, Arial";
    ctx.fillText(chart.label, padding.left, 18);

    ctx.strokeStyle = "#d8e0ea";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    ctx.stroke();

    ctx.fillStyle = "#657180";
    ctx.font = "12px Segoe UI, Arial";
    ctx.fillText("0", 14, padding.top + plotHeight + 4);
    ctx.fillText(yMax.toFixed(yMax >= 100 ? 0 : 1), 8, padding.top + 4);
    ctx.fillText(chart.yTitle, padding.left, height - 10);

    if (chart.values.length < 2) {
        ctx.fillStyle = "#657180";
        ctx.fillText("Waiting for samples...", padding.left + 12, padding.top + 34);
        return;
    }

    ctx.strokeStyle = chart.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    chart.values.forEach((item, index) => {
        const x = padding.left + (index / (maxPoints - 1)) * plotWidth;
        const y = padding.top + plotHeight - (item / yMax) * plotHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    const last = chart.values[chart.values.length - 1];
    const lastX = padding.left + ((chart.values.length - 1) / (maxPoints - 1)) * plotWidth;
    const lastY = padding.top + plotHeight - (last / yMax) * plotHeight;
    ctx.fillStyle = chart.color;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
}

function resetCharts() {
    Object.values(charts).forEach((chart) => {
        chart.values = [];
        drawChart(chart);
    });
    sampleIndex = 0;
}

function qualityLabel(index) {
    const quality = qualities.find((item) => item.index === index);
    return quality ? quality.label : `Level ${index}`;
}

function qualityBitrate(index) {
    const quality = qualities.find((item) => item.index === index);
    return quality ? quality.bitrate_kbps : 0;
}

function getVideoQuality() {
    if (!player) return lastAppliedQuality;

    try {
        if (typeof player.getQualityForType === "function") {
            return player.getQualityForType("video") || 0;
        }
        if (typeof player.getCurrentRepresentationForType === "function") {
            const representation = player.getCurrentRepresentationForType("video");
            if (representation && Number.isInteger(representation.index)) {
                return representation.index;
            }
        }
    } catch (error) {
        console.warn("Could not read current video quality", error);
    }

    return lastAppliedQuality;
}

function setVideoQuality(index) {
    if (!player) return false;
    lastAppliedQuality = index;

    try {
        if (typeof player.setQualityForType === "function") {
            player.setQualityForType("video", index, true);
            return true;
        }
        if (typeof player.setRepresentationForTypeByIndex === "function") {
            player.setRepresentationForTypeByIndex("video", index, true);
            return true;
        }
    } catch (error) {
        console.warn("Could not apply video quality", error);
    }

    return false;
}

async function measureLatency() {
    const start = performance.now();
    try {
        await fetch(`/api/ping?t=${Date.now()}`, { cache: "no-store" });
        latestLatency = Math.round(performance.now() - start);
    } catch (error) {
        latestLatency = 250;
    }
}

function getBufferLevel() {
    if (!player) return 0;
    try {
        return Math.max(0, player.getBufferLength("video") || 0);
    } catch (error) {
        return 0;
    }
}

function getMeasuredThroughputMbps() {
    if (!player) return previousThroughput;
    let throughputKbps = 0;
    try {
        throughputKbps = player.getAverageThroughput("video") || 0;
    } catch (error) {
        throughputKbps = 0;
    }

    if (throughputKbps > 0) {
        return throughputKbps / 1000;
    }

    const currentQuality = getVideoQuality();
    const fallbackMbps = Math.max(0.5, qualityBitrate(currentQuality) / 650);
    return fallbackMbps;
}

function buildMetrics() {
    const profile = profileSettings[elements.networkProfile.value] || profileSettings.stable;
    const measuredThroughput = getMeasuredThroughputMbps();
    const browserValueLooksValid = measuredThroughput > 0.35 && measuredThroughput < 30;
    const traceWave =
        profile.baseThroughput +
        Math.sin(sampleIndex / 3) * profile.baseThroughput * 0.28 +
        Math.cos(sampleIndex / 7) * profile.baseThroughput * 0.16;
    const periodicDrop = sampleIndex % 18 > 13 ? profile.baseThroughput * 0.42 : 0;
    const simulatedThroughput = Math.max(0.25, traceWave - periodicDrop);
    const sourceThroughput = browserValueLooksValid
        ? Math.max(measuredThroughput, simulatedThroughput * 0.55)
        : simulatedThroughput;
    const throughput = Math.max(0.25, sourceThroughput * profile.throughputFactor);
    const jitter = profile.jitter + Math.abs(Math.sin(sampleIndex / 3)) * profile.jitter * 0.4;
    const packetLoss = profile.loss + Math.abs(Math.cos(sampleIndex / 5)) * profile.loss * 0.25;
    const latency = Math.max(latestLatency, profile.latency + jitter * 0.5);
    const currentQuality = getVideoQuality();

    return {
        throughput_mbps: Number(throughput.toFixed(3)),
        previous_throughput_mbps: Number(previousThroughput.toFixed(3)),
        buffer_sec: Number(getBufferLevel().toFixed(3)),
        latency_ms: Number(latency.toFixed(1)),
        packet_loss_pct: Number(packetLoss.toFixed(2)),
        jitter_ms: Number(jitter.toFixed(1)),
        current_quality: currentQuality
    };
}

async function aiDecision(metrics) {
    const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metrics)
    });
    return response.json();
}

async function logDecision(metrics, decision, mode) {
    const payload = {
        ...metrics,
        mode,
        selected_quality: decision.quality_index,
        selected_bitrate_kbps: decision.bitrate_kbps,
        confidence: decision.confidence,
        reason: decision.reason
    };
    try {
        await fetch("/api/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.warn("Could not log metrics", error);
    }
}

function updateReadout(metrics, decision) {
    elements.throughput.textContent = `${metrics.throughput_mbps.toFixed(2)} Mbps`;
    elements.buffer.textContent = `${metrics.buffer_sec.toFixed(2)} s`;
    elements.latency.textContent = `${Math.round(metrics.latency_ms)} ms`;
    elements.quality.textContent = `${decision.quality_label}`;
    elements.confidence.textContent = `${Math.round(decision.confidence * 100)}%`;
    elements.reason.textContent = decision.reason;

    pushChart(charts.throughput, metrics.throughput_mbps);
    pushChart(charts.bitrate, decision.bitrate_kbps);
    pushChart(charts.buffer, metrics.buffer_sec);
    pushChart(charts.latency, metrics.latency_ms);
}

async function controlLoop() {
    if (!player) return;

    try {
        await measureLatency();
        const metrics = buildMetrics();
        const aiEnabled = elements.aiToggle.checked;
        const currentQuality = getVideoQuality();

        let decision;
        if (aiEnabled) {
            decision = await aiDecision(metrics);
            player.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } });
            setVideoQuality(decision.quality_index);
        } else {
            player.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } });
            decision = {
                quality_index: currentQuality,
                quality_label: qualityLabel(currentQuality),
                bitrate_kbps: qualityBitrate(currentQuality),
                confidence: 0,
                reason: "dash.js ABR"
            };
        }

        updateReadout(metrics, decision);
        await logDecision(metrics, decision, aiEnabled ? "ai" : "dashjs");
        setStatus(`Monitoring active: ${sampleIndex + 1} QoS samples collected`);

        previousThroughput = metrics.throughput_mbps;
        sampleIndex += 1;
    } catch (error) {
        console.error(error);
        setStatus(`Dashboard error: ${error.message}`, true);
    }
}

function initializePlayer() {
    Object.values(charts).forEach(drawChart);

    if (!config.manifestReady) {
        setStatus("DASH manifest missing. Run python generate_dash.py first.", true);
        return;
    }

    if (!window.dashjs) {
        setStatus("dash.js did not load. Check internet connection or use a local dash.js file.", true);
        return;
    }

    player = dashjs.MediaPlayer().create();
    player.updateSettings({
        streaming: {
            lowLatencyEnabled: false,
            abr: {
                autoSwitchBitrate: { video: false }
            }
        }
    });
    player.initialize(document.getElementById("videoPlayer"), config.manifestUrl, true);
    player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
        setVideoQuality(0);
        setStatus("Video stream initialized. QoS monitoring starts every 2 seconds.");
    });

    setInterval(controlLoop, 2000);
}

elements.resetCharts?.addEventListener("click", resetCharts);
initializePlayer();
