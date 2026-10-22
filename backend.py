import json

import csv
from datetime import datetime
from uuid import uuid4

import joblib
from pathlib import Path 

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from inventory.inventory_manager import InventoryManager

app = FastAPI(title="Smart Fall Detection API")

MODEL_PATH = Path(__file__).parent / "random_forest_model.pkl"
rf_model = joblib.load(MODEL_PATH)

IMPUTER_PATH = Path(__file__).parent / "imputer.pkl"
imputer = joblib.load(IMPUTER_PATH)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inventory = InventoryManager()

PREDICTION_HISTORY_FILE = Path(__file__).parent / "prediction_history.csv"


def load_prediction_history():
    if not PREDICTION_HISTORY_FILE.exists():
        return [], []

    with open(PREDICTION_HISTORY_FILE, "r", newline="") as file:
        reader = csv.DictReader(file)
        fieldnames = reader.fieldnames or []
        records = list(reader)

    if not fieldnames:
        return [], []

    if "history_id" not in fieldnames:
        fieldnames.append("history_id")
        for record in records:
            record["history_id"] = str(uuid4())

        with open(PREDICTION_HISTORY_FILE, "w", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)

    return records, fieldnames


def save_prediction(record):
    _, fieldnames = load_prediction_history()
    if not fieldnames:
        fieldnames = list(record.keys())

    if "history_id" not in fieldnames:
        fieldnames.append("history_id")

    record["history_id"] = str(uuid4())
    file_exists = PREDICTION_HISTORY_FILE.exists()

    with open(PREDICTION_HISTORY_FILE, "a", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)

        if not file_exists or PREDICTION_HISTORY_FILE.stat().st_size == 0:
            writer.writeheader()

        writer.writerow(record)


@app.get("/")
def home():
    return {"message": "Smart Fall Detection API is running"}


@app.get("/inventory")
def get_inventory():
    records = inventory.get_all_records()
    return json.loads(records.to_json(orient="records"))


@app.get("/inventory/summary")
def get_inventory_summary():
    return inventory.get_summary()


@app.get("/inventory/{record_id}")
def get_record(record_id: str):
    record = inventory.get_record(record_id)
    if record is None:
        return {"error": "Record not found"}
    return record

from pydantic import BaseModel


class SensorInput(BaseModel):
    Distance: float
    Pressure: float
    HRV: float
    sugar_level: float
    SpO2: float
    Accelerometer: float


@app.post("/predict")
def predict_risk(data: SensorInput):
    features = [[
        data.Distance,
        data.Pressure,
        data.HRV,
        data.sugar_level,
        data.SpO2,
        data.Accelerometer
    ]]

    processed_features = imputer.transform(features)
    prediction = int(rf_model.predict(processed_features)[0])

    risk_labels = {
        0: "Low",
        1: "Medium",
        2: "High"
    }

    risk = risk_labels.get(prediction, "Unknown")

    record = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "Distance": data.Distance,
        "Pressure": data.Pressure,
        "HRV": data.HRV,
        "Sugar level": data.sugar_level,
        "SpO2": data.SpO2,
        "Accelerometer": data.Accelerometer,
        "prediction": prediction,
        "risk": risk
    }

    save_prediction(record)

    return {
        "prediction": prediction,
        "risk": risk,
        "timestamp": record["timestamp"]
    }


@app.get("/prediction-history")
def get_prediction_history():
    records, _ = load_prediction_history()
    return records


@app.delete("/prediction-history/{history_id}")
def delete_prediction_history(history_id: str):
    records, fieldnames = load_prediction_history()
    remaining_records = [
        record for record in records if record.get("history_id") != history_id
    ]

    if len(remaining_records) == len(records):
        raise HTTPException(status_code=404, detail="Prediction history record not found")

    with open(PREDICTION_HISTORY_FILE, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(remaining_records)

    return {"message": "Prediction deleted successfully", "history_id": history_id}