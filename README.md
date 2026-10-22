# FallSense — Fall Risk Detection Using Machine Learning

FallSense is an educational machine-learning project that explores how six
physiological and movement-related sensor values can be used to classify
observations into three dataset categories: Low, Medium, and High risk. The
project brings together notebook-based experimentation, a reusable inventory
API, a saved Random Forest model, and a React dashboard for reviewing records,
predictions, and model-analysis charts.

> **Important:** This project is a prototype for learning and demonstration.
> Its output is not a medical diagnosis or a clinically validated assessment.
> The model has been evaluated on the available project dataset; it has not
> been established as safe for real-world clinical use.

## Project journey

### 1. Explore and prepare the data

The experiments use the CSV datasets in `data/`. The realistic dataset,
`cStick_realistic.csv`, contains six model input features:

- Distance
- Pressure
- HRV
- Sugar level
- SpO2
- Accelerometer

The target is `Decision`, represented in the application as Low (`0`), Medium
(`1`), and High (`2`). The realistic-dataset notebook handles missing input
values with median imputation and uses a stratified 80/20 train/test split.

### 2. Compare three candidate algorithms

The primary model comparison is in
[`notebooks/smart_fall_risk_detection_realistic_dataset.ipynb`](./notebooks/smart_fall_risk_detection_realistic_dataset.ipynb).
It trains and evaluates a Decision Tree, Random Forest, and Support Vector
Machine (SVM), and examines accuracy, precision, recall, F1-score, confusion
matrices, ROC and precision–recall curves, learning curves, and feature
importance.

On that notebook's recorded test split, the results are:

| Model | Test accuracy |
| --- | ---: |
| Decision Tree | 93.38% |
| Random Forest | 96.81% |
| SVM | 96.32% |

Random Forest achieved the highest test accuracy in this comparison, so it was
selected for the subsequent prediction/API work. These are notebook results for
one split of this dataset, not a guarantee of performance on new or real-world
data. The earlier
[`notebooks/smart_fall_risk_detection (1).ipynb`](./notebooks/smart_fall_risk_detection%20(1).ipynb)
contains initial experiments on the original dataset; its results are separate
from the realistic-dataset comparison above.

### 3. Serve the inventory and predictions

[`backend.py`](./backend.py) exposes a FastAPI service. It loads
`cStick_realistic.csv` through the inventory manager and uses the saved
`random_forest_model.pkl` and `imputer.pkl` artifacts in the repository root
for predictions. The inventory and prediction-history data are kept separate:
inventory records come from the dataset, while predictions submitted through
the API are saved in `prediction_history.csv`.

### 4. Review the project in the dashboard

The React + Vite frontend in [`frontend/`](./frontend/README.md) provides:

- An overview of backend inventory totals and risk-category counts.
- Searchable/filterable inventory records.
- A form that sends the six sensor inputs to the Random Forest prediction API.
- Prediction history that updates after a prediction, with per-record deletion.
- Model-analysis charts with chart-specific explanations.

The frontend is a project dashboard, not a real-time sensor monitor. It displays
data returned by the available APIs and does not invent live readings or model
confidence scores.

## Repository structure

```text
Smart_Fall_Detection/
├── README.md
├── backend.py                    # Required API source (local runtime file)
├── random_forest_model.pkl       # Required API model (local runtime artifact)
├── imputer.pkl                   # Required API imputer (local runtime artifact)
├── prediction_history.csv        # Created/updated by prediction requests
├── data/
│   ├── cStick.csv
│   └── cStick_realistic.csv
├── docs/
├── frontend/
│   ├── README.md
│   ├── package.json
│   ├── index.html
│   ├── public/
│   │   └── graphs/               # Charts displayed in the Analysis page
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       └── assets/
├── inventory/
│   ├── __init__.py
│   └── inventory_manager.py
├── notebooks/
│   ├── smart_fall_risk_detection (1).ipynb
│   ├── smart_fall_risk_detection_realistic_dataset.ipynb
│   ├── random_forest_model.pkl   # Notebook-generated artifact
│   └── imputer.pkl               # Notebook-generated artifact
├── results/
│   ├── graphs/                   # Analysis visualizations
│   └── models/                   # Decision Tree, Random Forest, and SVM
└── test_inventory.py
```

The chart images are published under `frontend/public/graphs/` for the web app
and retained under `results/graphs/` with the analysis outputs. The three
comparison models in `results/models/` are notebook artifacts; the running API
loads the two pickle files at the repository root.

**Clone/setup note:** In the current working copy, `backend.py` and the
repository-root `random_forest_model.pkl` and `imputer.pkl` are local,
untracked runtime files. A fresh Git clone at the current revision will not
contain these files unless they are added to the repository or supplied
separately. The API cannot start without them. The notebook can generate the
model and imputer artifacts; the API source must also be made available in the
repository root. Do not commit or distribute model/data artifacts unless
permitted by their provenance and project policy.

## Run the project locally

Run the API and frontend in separate terminals. The commands below assume
Windows PowerShell and that Python, Node.js, and npm are installed. The Vite
version in this project requires a supported modern Node.js release.

### 1. Clone the repository

```powershell
git clone https://github.com/knAshvita/Smart_Fall_Detection.git
cd Smart_Fall_Detection
```

### 2. Install Python dependencies

Create and activate a virtual environment from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]" pandas numpy scikit-learn joblib
```

The notebooks additionally use Jupyter, Matplotlib, and Seaborn:

```powershell
python -m pip install jupyter matplotlib seaborn
```

### 3. Start the backend API

From the repository root, start FastAPI on the address expected by the
frontend:

```powershell
python -m uvicorn backend:app --reload --host 127.0.0.1 --port 8000
```

The API expects `random_forest_model.pkl` and `imputer.pkl` at the repository
root, and `backend.py` must be present to start the service. Check the
clone/setup note above before running this command. If regenerating the model
and imputer from the notebook, place the resulting files at the repository
root before starting the API; the notebook also contains machine-specific
artifact-export cells that may need adjustment for your environment.

### 4. Start the frontend

In a second terminal, from the repository root:

```powershell
cd frontend
npm ci
npm run dev -- --host localhost
```

Open the local URL printed by Vite (normally
`http://localhost:5173`). Use `localhost` rather than `127.0.0.1` for the
frontend because the API's current CORS configuration allows the localhost
Vite origin.

### 5. Reproduce the model experiments (optional)

From the repository root, install the notebook dependencies, then launch
Jupyter:

```powershell
python -m pip install jupyter matplotlib seaborn
python -m jupyter notebook
```

Open the realistic-dataset notebook and run its cells in order. Training and
test results may differ if the data, preprocessing, split, library versions,
or model parameters change. The original-dataset notebook is provided for
earlier exploration and should not be confused with the realistic-dataset
model selection used by the API.

### 6. Run the inventory checks (optional)

With the Python virtual environment active, from the repository root:

```powershell
python test_inventory.py
```

## API reference

The local API is served at `http://127.0.0.1:8000`; interactive FastAPI
documentation is available at `http://127.0.0.1:8000/docs` while the backend
is running.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Check that the API is running. |
| `GET` | `/inventory` | Return dataset inventory records and their risk categories. |
| `GET` | `/inventory/summary` | Return inventory total, observed decisions, and missing-value counts. |
| `GET` | `/inventory/{record_id}` | Return one inventory record. |
| `POST` | `/predict` | Predict a risk category and append the result to prediction history. |
| `GET` | `/prediction-history` | Return saved prediction-history records. |
| `DELETE` | `/prediction-history/{history_id}` | Delete one saved prediction-history record. |

`POST /predict` accepts JSON with numeric `Distance`, `Pressure`, `HRV`,
`sugar_level`, `SpO2`, and `Accelerometer` fields. Its response includes the
predicted class, risk label, and timestamp. The full submitted sensor values
and prediction are stored in the CSV history file.

## Contributors

- **N. Ashvita P. Kini** — Model testing and comparison, notebook-based
  evaluation and visualizations, and frontend development.
- **Niharika Shetty** — Inventory component and dataset-record management.
- **Prajna K.** — Frontend development and dashboard experience.

## Limitations and responsible use

- Results reflect the available datasets and the evaluation procedures in the
  notebooks. Independent validation is needed before making claims about
  generalization.
- Confirm the dataset's class definitions and data provenance before
  interpreting categories as real-world clinical fall-risk levels.
- Inventory row identifiers identify dataset records, not people.
- Do not use the model or dashboard to make medical decisions or as a
  substitute for professional assessment.
- The API loads trusted, local Joblib pickle artifacts. Do not load model
  pickle files from untrusted sources.
