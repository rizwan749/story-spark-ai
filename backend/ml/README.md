# 🧠 ML Pipeline — Writer's Block Detector

This directory contains the writer's block detection pipeline using an LSTM Autoencoder.

---

## 📋 Prerequisites

- Python 3.9+
- pip

---

## 📦 Installation

```bash
cd story-spark-ai/ml
pip install -r requirements.txt
```

---

## 🚀 Usage

### Step 1 — Train the model

Run this first. It generates the model, scaler, and threshold files.

```bash
python train.py
```

**Output files generated in `saved/`:**
- `saved/model.keras` — trained LSTM Autoencoder
- `saved/scaler.pkl` — fitted MinMaxScaler
- `saved/threshold.json` — anomaly detection threshold

---

### Step 2 — Run detection

After training, run detection interactively:

```bash
python detect.py
```

You will be prompted to enter 10 timesteps of session data.

---

## 📊 Output Format

`detect.py` returns:

```json
{
  "is_stuck": true,
  "confidence": "High",
  "anomaly_score": 0.042381,
  "threshold": 0.018754,
  "suggestion": "Try writing the scene from a different character's point of view."
}
```

| Field | Description |
|---|---|
| `is_stuck` | `true` if writer's block is detected |
| `confidence` | `High`, `Medium`, `Low`, or `N/A` |
| `anomaly_score` | Reconstruction error from the autoencoder |
| `threshold` | Cutoff value — scores above this indicate being stuck |
| `suggestion` | Targeted writing tip based on the most anomalous feature |

---

## 🔌 Flask Integration

Import `detect` in your Flask server:

```python
from detect import detect

result = detect(session_data)
if result["is_stuck"]:
    print(result["suggestion"])
```

`session_data` is a list of at least 10 dicts, each with these keys:

| Key | Description |
|---|---|
| `prompt_length` | Words typed before submitting |
| `time_to_submit` | Seconds before submitting |
| `regeneration_count` | Times user hit regenerate |
| `session_duration` | Seconds spent on current block |
| `backspace_ratio` | Backspaces / total keystrokes × 100 |
| `pause_duration` | Longest pause in seconds |
| `confidence_score` | Self-rated score 1–10 |
| `blocked_word_count` | Count of frustration-signal words |

---

## 📁 File Structure

```
ml/
├── detect.py          # Core detection function + interactive mode
├── train.py           # Train the LSTM Autoencoder
├── model.py           # Model architecture definition
├── requirements.txt   # Python dependencies
└── saved/             # Generated after running train.py
    ├── model.keras
    ├── scaler.pkl
    └── threshold.json
```