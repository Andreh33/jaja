"""
Transcripción local de los vídeos del curso (comerciales Latech).

Uso:
    python transcribe.py --model large-v3 0 1 2 3 4 5
    python transcribe.py --model medium 1          # sólo el vídeo 1 en medium

- Modelo por defecto: large-v3, compute_type=int8 en CPU (decisión del proyecto).
- Si un vídeo concreto va lentísimo (candidato: el de 193 MB / vídeo 1),
  re-ejecutar SOLO ese con --model medium.
- NADA de API externa: todo local.

Salida por vídeo N:
    transcripciones/video-N.json  -> { model, language, duration, segments:[{id,start,end,text}] }
    transcripciones/video-N.txt   -> texto plano concatenado
"""

import argparse
import json
import os
import sys
import time

# Windows sin Developer Mode/admin no puede crear symlinks (WinError 1314).
# Forzar a huggingface_hub a COPIAR los blobs en vez de enlazarlos.
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS", "1")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(HERE, "audio")
OUT_DIR = os.path.join(HERE, "transcripciones")


def transcribe_one(model: WhisperModel, n: int, model_name: str) -> None:
    wav = os.path.join(AUDIO_DIR, f"video-{n}.wav")
    if not os.path.exists(wav):
        print(f"[video-{n}] SKIP: no existe {wav}", flush=True)
        return

    print(f"[video-{n}] transcribiendo ({model_name})...", flush=True)
    t0 = time.time()
    segments, info = model.transcribe(
        wav,
        language="es",
        word_timestamps=True,
        vad_filter=True,
        beam_size=5,
    )

    seg_list = []
    plain_parts = []
    for i, seg in enumerate(segments):
        text = seg.text.strip()
        seg_list.append({
            "id": i,
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "text": text,
        })
        plain_parts.append(text)
        # progreso en vivo cada ~20 segmentos
        if i % 20 == 0:
            print(f"  [video-{n}] seg {i} @ {seg.end:.0f}s", flush=True)

    elapsed = time.time() - t0
    payload = {
        "model": model_name,
        "language": info.language,
        "language_probability": round(info.language_probability, 3),
        "duration": round(info.duration, 2),
        "transcribe_seconds": round(elapsed, 1),
        "segments": seg_list,
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, f"video-{n}.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT_DIR, f"video-{n}.txt"), "w", encoding="utf-8") as f:
        f.write(" ".join(plain_parts).strip() + "\n")

    rtf = elapsed / info.duration if info.duration else 0
    print(
        f"[video-{n}] OK · {len(seg_list)} segs · audio {info.duration:.0f}s · "
        f"transcrito en {elapsed:.0f}s (x{rtf:.2f} RT)",
        flush=True,
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="large-v3")
    ap.add_argument("videos", nargs="+", type=int)
    args = ap.parse_args()

    print(f"Cargando modelo {args.model} (compute_type=int8, CPU)...", flush=True)
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    print("Modelo cargado.", flush=True)

    for n in args.videos:
        transcribe_one(model, n, args.model)


if __name__ == "__main__":
    main()
