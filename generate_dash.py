from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import urllib.request
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MEDIA_DIR = BASE_DIR / "media"
INPUT_DIR = MEDIA_DIR / "input"
DASH_DIR = MEDIA_DIR / "dash"
SAMPLE_VIDEO = INPUT_DIR / "sample.mp4"
DEFAULT_DATASET_DIR = BASE_DIR / "Videos"


def find_ffmpeg() -> str:
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        return ffmpeg

    local = Path.home() / "AppData" / "Local" / "Programs" / "ffmpeg" / "bin" / "ffmpeg.exe"
    if local.exists():
        return str(local)

    raise FileNotFoundError(
        "FFmpeg was not found. Install FFmpeg or add its bin folder to PATH."
    )


def run(command: list[str], cwd: Path | None = None) -> None:
    print(" ".join(command))
    subprocess.run(command, check=True, cwd=cwd)


def create_sample_video(ffmpeg: str) -> Path:
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    if SAMPLE_VIDEO.exists():
        return SAMPLE_VIDEO

    run(
        [
            ffmpeg,
            "-y",
            "-f",
            "lavfi",
            "-i",
            "testsrc2=size=1920x1080:rate=30",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=1000:sample_rate=48000",
            "-t",
            "75",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-shortest",
            str(SAMPLE_VIDEO),
        ]
    )
    return SAMPLE_VIDEO


def download_hq_video() -> Path:
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    hq_video_path = INPUT_DIR / "big_buck_bunny_1080p.mp4"
    if hq_video_path.exists():
        return hq_video_path
    
    print("Downloading high-quality 1080p sample video (Big Buck Bunny)...")
    url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    urllib.request.urlretrieve(url, hq_video_path)
    return hq_video_path


def find_dataset_video() -> Path | None:
    if not DEFAULT_DATASET_DIR.exists():
        return None

    extensions = {".mp4", ".mkv", ".mov", ".avi", ".webm"}
    videos = [
        path
        for path in DEFAULT_DATASET_DIR.rglob("*")
        if path.is_file() and path.suffix.lower() in extensions
    ]
    if not videos:
        return None

    return max(videos, key=lambda path: path.stat().st_size)


def create_dash(ffmpeg: str, input_video: Path) -> None:
    DASH_DIR.mkdir(parents=True, exist_ok=True)
    for item in DASH_DIR.glob("*"):
        if item.is_file():
            os.chmod(item, 0o666)
            item.unlink()

    run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(input_video),
            "-map",
            "0:v:0",
            "-map",
            "0:v:0",
            "-map",
            "0:v:0",
            "-map",
            "0:v:0",
            "-c:v",
            "libx264",
            "-b:v:0",
            "400k",
            "-s:v:0",
            "426x240",
            "-b:v:1",
            "1000k",
            "-s:v:1",
            "640x360",
            "-b:v:2",
            "2500k",
            "-s:v:2",
            "1280x720",
            "-b:v:3",
            "6000k",
            "-s:v:3",
            "1920x1080",
            "-preset",
            "veryfast",
            "-g",
            "60",
            "-keyint_min",
            "60",
            "-sc_threshold",
            "0",
            "-seg_duration",
            "4",
            "-use_timeline",
            "1",
            "-use_template",
            "1",
            "-adaptation_sets",
            "id=0,streams=v",
            "-init_seg_name",
            "init-stream$RepresentationID$.m4s",
            "-media_seg_name",
            "chunk-stream$RepresentationID$-$Number%05d$.m4s",
            "-f",
            "dash",
            "manifest.mpd",
        ],
        cwd=DASH_DIR,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a video file into multi-bitrate MPEG-DASH segments."
    )
    parser.add_argument(
        "--input",
        type=Path,
        help="Path to a dataset video. If omitted, the largest video under Videos/ is used.",
    )
    parser.add_argument(
        "--sample",
        action="store_true",
        help="Use the generated sample test video instead of the Videos dataset.",
    )
    parser.add_argument(
        "--download-hq",
        action="store_true",
        help="Download and use a high-quality 1080p sample video (Big Buck Bunny).",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    ffmpeg_path = find_ffmpeg()
    print(f"Using FFmpeg: {ffmpeg_path}")
    if args.download_hq:
        source_video = download_hq_video()
    elif args.sample:
        source_video = create_sample_video(ffmpeg_path)
    elif args.input:
        source_video = args.input.resolve()
    else:
        source_video = find_dataset_video()
        if source_video is None:
            source_video = create_sample_video(ffmpeg_path)

    if not source_video.exists():
        raise FileNotFoundError(f"Input video not found: {source_video}")

    print(f"Packaging video: {source_video}")
    create_dash(ffmpeg_path, source_video)
    print(f"DASH manifest created: {DASH_DIR / 'manifest.mpd'}")
