
from pathlib import Path

import pandas as pd


# Locate the project and approved dataset.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATASET_PATH = PROJECT_ROOT / "data" / "cStick_realistic.csv"

SENSOR_COLUMNS = [
    "Distance",
    "Pressure",
    "HRV",
    "Sugar level",
    "SpO2",
    "Accelerometer",
]

REQUIRED_COLUMNS = SENSOR_COLUMNS + ["Decision"]


class InventoryManager:
    """Manage and search records from the approved sensor dataset."""

    def __init__(self, dataset_path=DATASET_PATH):
        self.dataset_path = Path(dataset_path)
        self.records = self._load_records()

    def _load_records(self):
        if not self.dataset_path.exists():
            raise FileNotFoundError(
                f"Dataset not found: {self.dataset_path}"
            )

        data = pd.read_csv(self.dataset_path)

        missing_columns = [
            column
            for column in REQUIRED_COLUMNS
            if column not in data.columns
        ]

        if missing_columns:
            raise ValueError(
                f"Dataset is missing columns: {missing_columns}"
            )

        # Preserve source data; don't silently fill missing sensor readings.
        data = data[REQUIRED_COLUMNS].copy()

        # IDs identify rows in this dataset, not real-world people.
        data.insert(
            0,
            "record_id",
            [f"REC-{i:05d}" for i in range(1, len(data) + 1)],
        )

        return data

    def get_all_records(self):
        """Return a copy of all inventory records."""
        return self.records.copy()

    def get_record(self, record_id):
        """Find one record by its inventory ID."""
        matches = self.records[
            self.records["record_id"].str.upper()
            == str(record_id).strip().upper()
        ]

        if matches.empty:
            return None

        return matches.iloc[0].to_dict()

    def search_records(self, search_text=""):
        """Search by record ID or sensor values."""
        if not str(search_text).strip():
            return self.get_all_records()

        query = str(search_text).strip().lower()

        mask = self.records.astype(str).apply(
            lambda column: column.str.lower().str.contains(
                query, regex=False, na=False
            )
        ).any(axis=1)

        return self.records[mask].copy()

    def filter_by_decision(self, decision):
        """Filter by the actual Decision value in the dataset."""
        if decision is None or str(decision).strip() == "":
            return self.get_all_records()

        return self.records[
            self.records["Decision"].astype(str)
            == str(decision).strip()
        ].copy()

    def get_summary(self):
        """Return basic inventory statistics."""
        return {
            "total_records": len(self.records),
            "unique_decisions": sorted(
                self.records["Decision"].dropna().unique().tolist()
            ),
            "missing_values": self.records[
                SENSOR_COLUMNS
            ].isna().sum().to_dict(),
        }
