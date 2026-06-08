# AI-Driven Adaptive DASH Streaming for Video QoS

This project implements a real MPEG-DASH video streaming demo with an AI-based adaptive bitrate controller.

## What It Shows

- FFmpeg video encoding into DASH chunks and `manifest.mpd`
- Flask server for MPD and segment delivery
- Browser DASH playback using `dash.js`
- Live QoS monitoring: throughput, buffer, RTT, jitter, packet loss
- Random Forest-based bitrate prediction using Scikit-learn
- AI-controlled quality switching
- Session logging and graph generation for project results

## Folder Structure

```text
CNP PBL/
├── app.py
├── ai_model.py
├── generate_dash.py
├── analyze_results.py
├── requirements.txt
├── media/
│   ├── input/sample.mp4
│   └── dash/manifest.mpd + .m4s chunks
├── templates/index.html
├── static/css/styles.css
├── static/js/player.js
├── logs/session_metrics.csv
└── results/*.png
```

## Setup

Install dependencies:

```powershell
pip install -r requirements.txt
```

Generate the sample video and DASH segments:

```powershell
python generate_dash.py
```

Run the server:

```powershell
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

## Generate Result Graphs

After streaming for 30-60 seconds:

```powershell
python analyze_results.py
```

Graphs are saved in `results/`.

## Demo Script

1. Start the Flask server.
2. Open the dashboard in a browser.
3. Play the video with AI control enabled.
4. Change the network profile from Stable 4G to Congested 3G or Packet loss demo.
5. Show how the AI lowers bitrate before the buffer collapses.
6. Disable AI control to compare with normal dash.js ABR.
7. Run `python analyze_results.py` and show QoS graphs.

## Project Title

AI-Driven Adaptive DASH Streaming for Enhanced Video QoS using Machine Learning-Based Bandwidth Prediction
