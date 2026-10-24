# FallSense Frontend

The FallSense frontend is a responsive React dashboard built with Vite. It
provides a user interface for reviewing the sensor inventory, submitting
fall-risk predictions to the FastAPI service, viewing saved prediction
history, and exploring the machine-learning evaluation charts.

For the complete project story, model-comparison results, repository layout,
backend setup, API reference, and contributor roles, see the
[main project README](../README.md).

## Requirements

- Node.js compatible with the Vite version in `package.json` (Node.js
  20.19+ or 22.12+ recommended).
- npm.
- The FallSense FastAPI backend running locally for inventory, prediction,
  and prediction-history features.

## Run locally

From the repository root, start the backend in one terminal:

```powershell
python -m uvicorn backend:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, install frontend dependencies and start Vite:

```powershell
cd frontend
npm ci
npm run dev -- --host localhost
```

Open the local URL printed by Vite, normally
`http://localhost:5173`. The API currently allows the `localhost:5173` origin
through CORS, so use `localhost` rather than `127.0.0.1` for the frontend.

The UI calls the local API at `http://127.0.0.1:8000`. Keep the backend
running while using inventory, prediction, and history features. If the API
is unavailable, those requests cannot return current project data.

## Dashboard features

- **Overview:** Presents the FallSense project and inventory totals for all
  records and Low, Medium, and High risk categories. The totals come from
  records loaded from the backend inventory; they are not hard-coded demo
  readings.
- **Records:** Displays inventory data with record search and risk-category
  filtering.
- **Analysis:** Displays the saved model-evaluation figures from
  `public/graphs/`, including model-comparison charts, feature-importance
  charts, and decision-tree visualizations. Select a chart to open its larger
  view and a chart-specific explanation.
- **Prediction:** Accepts the six sensor values used by the model and submits
  them to `POST /predict`.
- **Prediction History:** Displays predictions saved by the backend, including
  the six sensor values. Selecting a row opens its sensor-analysis radar chart.
  A row can be deleted after confirmation; the table updates without a manual
  page refresh.

Prediction results and history are outputs of the configured Random Forest
model and dataset. The interface does not connect to live sensors, provide
real-time monitoring, or report model confidence.

## Available npm scripts

Run these commands from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production bundle in `frontend/dist/`. |
| `npm run preview` | Preview the production bundle locally. |
| `npm run lint` | Run ESLint over the frontend source. |

## Frontend structure

```text
frontend/
├── README.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.js
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── graphs/                 # Evaluation charts shown in Analysis
└── src/
    ├── App.jsx                 # Dashboard pages and API integration
    ├── App.css                 # Dashboard and responsive component styles
    ├── index.css               # Base styles
    ├── main.jsx                # React application entry point
    └── assets/
```

The frontend currently uses React, Recharts, and Vite. Dependencies are
declared in `package.json`; `npm ci` installs the exact versions recorded in
`package-lock.json`.
