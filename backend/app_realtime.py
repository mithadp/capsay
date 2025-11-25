from __future__ import annotations
import sys, time, threading
from typing import Dict, Any, List
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from flask import Flask, jsonify, request, Response
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, db

# --- Konfigurasi ---
NAMA_FILE_KUNCI = "dhtbaru-fef85-00dee1ec9d78.json"
DATABASE_URL = "https://dhtbaru-fef85-default-rtdb.asia-southeast1.firebasedatabase.app/"

READINGS_NODE = "readings"
HISTORY_NODE  = "history"
MYTIME_NODE   = "Mytime"

KEYS_TO_IGNORE = [
    "timestamp",
    "Timestamp",
    "LightDisplay",
    "temperature",
]

# --- Flask & CORS ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Firebase ---
try:
    cred = credentials.Certificate(NAMA_FILE_KUNCI)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})
except FileNotFoundError:
    print(f"File '{NAMA_FILE_KUNCI}' tidak ditemukan.")
    sys.exit(1)
except Exception as e:
    print(f"Gagal inisialisasi Firebase: {e}")
    sys.exit(1)

# --- Global state for SSE ---
latest_data = None
data_lock = threading.Lock()

# --- Util Functions ---

def _filter_sensor_keys(readings: Dict[str, Any]) -> List[str]:
    return [k for k in readings.keys() if k not in KEYS_TO_IGNORE]

def _clean_latest(readings: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    return {k: readings.get(k) for k in keys}

def _push_history(clean: Dict[str, Any]) -> None:
    item = dict(clean)
    item["timestamp"] = int(time.time() * 1000)
    db.reference(HISTORY_NODE).push(item)

def _get_history(limit: int = 60) -> Dict[str, Dict[str, Any]]:
    snap = db.reference(HISTORY_NODE).order_by_key().limit_to_last(limit).get()
    return snap or {}

def train_and_predict(history_data: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    predictions: Dict[str, Dict[str, Any]] = {}
    sensor_keys_terdeteksi: List[str] = []
    try:
        if not history_data or len(history_data) < 2:
            return {}
        df = pd.DataFrame.from_dict(history_data, orient="index")
        sensor_keys = [col for col in df.columns if col.lower() != "timestamp"]
        sensor_keys_terdeteksi = sensor_keys
        if not sensor_keys:
            return {}
        for key in sensor_keys:
            df[key] = pd.to_numeric(df[key], errors="coerce")
        for key in sensor_keys:
            df_sensor = df[[key]].dropna()
            if len(df_sensor) < 2:
                predictions[key] = {"trend": "Stabil", "10": None, "30": None}
                continue
            X = np.arange(len(df_sensor)).reshape(-1, 1)
            y = df_sensor[key]
            model = LinearRegression().fit(X, y)
            n = len(df_sensor)
            pred_10 = float(model.predict(np.array([[n - 1 + 10]]))[0])
            pred_30 = float(model.predict(np.array([[n - 1 + 30]]))[0])
            slope = float(model.coef_[0])
            trend = "Naik" if slope > 0.01 else "Turun" if slope < -0.01 else "Stabil"
            predictions[key] = {"trend": trend, "10": pred_10, "30": pred_30}
        return predictions
    except Exception:
        return {k: {"trend": "Error", "10": None, "30": None} for k in sensor_keys_terdeteksi}

def _get_summary() -> Dict[str, Any]:
    """Fetch current summary from Firebase"""
    try:
        readings = db.reference(READINGS_NODE).get()
        mytime = db.reference(MYTIME_NODE).get()
        if not readings or not isinstance(readings, dict):
            return {"error": "Node /readings kosong atau tidak valid"}
        sensor_keys = _filter_sensor_keys(readings)
        latest_clean = _clean_latest(readings, sensor_keys)
        _push_history(latest_clean)
        history_data = _get_history(60)
        predictions = train_and_predict(history_data)
        return {
            "mytime": mytime,
            "sensor_keys": sensor_keys,
            "latest": latest_clean,
            "history": history_data,
            "prediction": predictions,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

def _monitor_firebase():
    """Background thread to monitor Firebase changes"""
    global latest_data
    last_update = {}
    while True:
        try:
            data = _get_summary()
            readings = data.get("latest", {})
            
            # Check if anything changed
            changed = False
            for key, value in readings.items():
                if key not in last_update or last_update[key] != value:
                    changed = True
                    last_update[key] = value
            
            if changed or latest_data is None:
                with data_lock:
                    latest_data = data
            
            time.sleep(2)  # Check every 2 seconds
        except Exception as e:
            print(f"Error in monitor: {e}")
            time.sleep(5)

# --- Start background monitor ---
monitor_thread = threading.Thread(target=_monitor_firebase, daemon=True)
monitor_thread.start()

# --- Routes ---

@app.get("/")
def root():
    return jsonify({
        "service": "CAPSAI API (Real-time)",
        "health": "/api/health",
        "latest": "/api/latest",
        "history": "/api/history?limit=60",
        "summary": "/api/summary",
        "stream": "/api/stream (Server-Sent Events)"
    })

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "ts": int(time.time())})

@app.get("/api/latest")
def latest():
    readings = db.reference(READINGS_NODE).get()
    if not readings or not isinstance(readings, dict):
        return jsonify({"error": "Node /readings kosong atau tidak valid"}), 404
    sensor_keys = _filter_sensor_keys(readings)
    latest_clean = _clean_latest(readings, sensor_keys)
    return jsonify({"sensor_keys": sensor_keys, "latest": latest_clean})

@app.get("/api/history")
def history():
    try:
        limit = max(1, min(int(request.args.get("limit", "60")), 500))
    except Exception:
        limit = 60
    hist = _get_history(limit)
    return jsonify({"count": len(hist), "history": hist})

@app.get("/api/summary")
def summary():
    data = _get_summary()
    if "error" in data:
        return jsonify(data), 500
    return jsonify(data)

@app.get("/api/stream")
def stream():
    """Real-time Server-Sent Events endpoint"""
    def generate():
        last_data = None
        while True:
            try:
                with data_lock:
                    current_data = latest_data
                
                if current_data and current_data != last_data:
                    import json
                    yield f"data: {json.dumps(current_data)}\n\n"
                    last_data = current_data
                
                time.sleep(1)
            except Exception as e:
                yield f"data: {{'error': '{str(e)}'}}\n\n"
                time.sleep(2)
    
    return Response(generate(), mimetype="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no"
    })

# Legacy endpoint
@app.get("/get_data")
def get_data_legacy():
    return summary()

# --- Main ---
if __name__ == "__main__":
    print("Real-time CAPSAI API di http://127.0.0.1:5000/api")
    print("WebSocket Stream: /api/stream")
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)
