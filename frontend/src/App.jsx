
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const demoRecords = [
  {
    id: "DEMO-001",
    heartRate: 78,
    spo2: 98,
    pressure: 112,
    sugar: 92,
    distance: 4,
    accelerometer: 1.8,
    risk: "Low",
  },
  {
    id: "DEMO-002",
    heartRate: 96,
    spo2: 95,
    pressure: 138,
    sugar: 118,
    distance: 7,
    accelerometer: 2.5,
    risk: "Medium",
  },
  {
    id: "DEMO-003",
    heartRate: 108,
    spo2: 92,
    pressure: 151,
    sugar: 136,
    distance: 9,
    accelerometer: 3.2,
    risk: "High",
  },
  {
    id: "DEMO-004",
    heartRate: 82,
    spo2: 97,
    pressure: 120,
    sugar: 86,
    distance: 3,
    accelerometer: 1.4,
    risk: "Low",
  },
];

const initialForm = {
  spo2: "",
  hrv: "",
  sugar: "",
  distance: "",
  accelerometer: "",
  pressure: "",
};

const graphs = [
  {
    file: "model_accuracy_comparison.png",
    title: "Model Accuracy Comparison",
    description: "Compare the accuracy reported for the evaluated models.",
    howToRead:
      "Each bar represents a model's accuracy: the proportion of evaluated examples it classified correctly. Compare values using the chart's displayed scale.",
    lookFor:
      "A higher value means more correct predictions on this evaluation set. Consider whether the evaluation data is representative and whether the differences matter in context.",
    whyItMatters:
      "Accuracy gives a quick overall comparison, but it can hide poor performance on less common risk categories. Read it alongside the confusion matrices and class-level metrics.",
  },
  {
    file: "confusion_matrices_model_comparison.png",
    title: "Confusion Matrices",
    description: "Inspect correct and incorrect classifications for each model.",
    howToRead:
      "The axes identify actual and predicted classes; use their labels to confirm the direction. Matching classes appear on the main diagonal, while off-diagonal cells show misclassifications.",
    lookFor:
      "Notice which risk categories are confused with one another and whether errors are concentrated in a particular class. Larger counts may also reflect classes with more examples.",
    whyItMatters:
      "Different mistakes have different implications for fall-risk screening. This view reveals error patterns that a single accuracy score cannot show.",
  },
  {
    file: "input_features_correlation_heatmap.png",
    title: "Feature Correlation Heatmap",
    description: "Explore relationships between the input features.",
    howToRead:
      "Each cell shows the correlation between a pair of input features, using the chart's color scale. Values near +1 indicate a strong positive relationship, near -1 a strong negative relationship, and near 0 little linear association.",
    lookFor:
      "Look for strongly colored pairs that may carry overlapping information. The diagonal compares each feature with itself and is expected to show a strong positive relationship.",
    whyItMatters:
      "Correlated inputs can affect how model importance is interpreted. Correlation describes association, not causation, and does not by itself show that a feature predicts risk.",
  },
  {
    file: "learning_curves_model_comparison.png",
    title: "Learning Curves",
    description: "Review model learning behaviour during training.",
    howToRead:
      "The horizontal axis typically shows the amount of training data and the vertical axis shows model performance. Training and validation curves show how results change as more examples are used.",
    lookFor:
      "A large persistent gap between training and validation performance can indicate overfitting. If both remain low, the model may be underfitting; converging curves suggest the results are stabilizing.",
    whyItMatters:
      "Learning curves help assess whether a model is generalizing and whether additional training data may improve its performance.",
  },
  {
    file: "multiclass_roc_curves_comparison.png",
    title: "Multiclass ROC Curves",
    description: "Compare class-discrimination curves across models.",
    howToRead:
      "ROC curves compare the true-positive rate with the false-positive rate across decision thresholds. Use the legend and axes to compare each model and class as plotted.",
    lookFor:
      "A curve closer to the upper-left corner generally indicates stronger discrimination across thresholds. If AUC values are included, higher values indicate better separation for the evaluated data.",
    whyItMatters:
      "ROC analysis shows the trade-off between detecting a class and raising false alarms, rather than judging a model at only one threshold.",
  },
  {
    file: "multiclass_precision_recall_curves.png",
    title: "Precision–Recall Curves",
    description: "Explore precision and recall for the evaluated classes.",
    howToRead:
      "Precision measures how many predictions for a class were correct; recall measures how many actual examples of that class were found. Each curve shows their trade-off across thresholds.",
    lookFor:
      "Compare the curves for each class, paying attention to how much recall is retained as precision changes. The legend identifies the class or model represented by each line.",
    whyItMatters:
      "Precision–recall views are especially useful when class counts differ or when missed cases and false alarms have different costs.",
  },
  {
    file: "precision_recall_f1_comparison.png",
    title: "Precision, Recall and F1",
    description: "Compare classification evaluation metrics.",
    howToRead:
      "Precision reflects the reliability of positive predictions, recall reflects how many actual cases were detected, and F1 combines precision and recall using their harmonic mean.",
    lookFor:
      "Compare all three measures for each model or class shown. A high F1 indicates a more balanced precision–recall result, but can conceal which of the two is lower.",
    whyItMatters:
      "These metrics make it easier to assess whether a model's detections are both useful and sufficiently complete for each risk category.",
  },
  {
    file: "decision_tree_feature_importance.png",
    title: "Decision Tree Feature Importance",
    description: "View the feature importance reported for the decision tree.",
    howToRead:
      "Each bar ranks an input feature by the importance score reported for this decision tree. Use the chart's labels and scale to compare relative scores.",
    lookFor:
      "Features with larger scores contributed more to the tree's splits under this importance method. A low score does not prove a feature is irrelevant in other models or datasets.",
    whyItMatters:
      "Importance can help explain which inputs influenced this fitted model, but it does not establish causation or describe how a feature changes risk.",
  },
  {
    file: "random_forest_feature_importance.png",
    title: "Random Forest Feature Importance",
    description: "View the feature importance reported for the random forest.",
    howToRead:
      "Each bar ranks an input feature by the importance score reported for the random forest. The displayed scale indicates relative importance within this fitted model.",
    lookFor:
      "Compare the largest scores to see which inputs the forest relied on most. Correlated features may share or distort importance, so interpret close rankings cautiously.",
    whyItMatters:
      "This view offers a model-specific summary of influential inputs; it is not evidence that a feature causes a change in fall risk.",
  },
  {
    file: "svm_permutation_feature_importance.png.png",
    title: "SVM Feature Importance",
    description: "Explore the permutation feature importance output for SVM.",
    howToRead:
      "Permutation importance measures how much model performance changes when one feature is shuffled. A larger drop in the reported score indicates greater reliance on that feature for this evaluation.",
    lookFor:
      "Compare the size of the score changes across features and use the chart's scale. Small or negative changes may indicate little measurable contribution in this particular evaluation.",
    whyItMatters:
      "This method explains model reliance in a way that applies to SVMs, but results depend on the evaluation data and can be affected by correlated inputs.",
  },
];

function getRiskLevel({ spo2, hrv, sugar, distance, accelerometer, pressure }) {
  const spo2Value = Number(spo2 || 0);
  const pressureValue = Number(pressure || 0);
  const sugarValue = Number(sugar || 0);
  const distanceValue = Number(distance || 0);
  const accelValue = Number(accelerometer || 0);

  const riskScore =
    (100 - spo2Value) * 1.6 +
    pressureValue * 0.25 +
    sugarValue * 0.17 +
    distanceValue * 1.8 +
    accelValue * 12;

  if (riskScore >= 115 || accelValue >= 3.5) {
    return "High";
  }

  if (riskScore >= 60) {
    return "Medium";
  }

  return "Low";
}

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [selectedGraph, setSelectedGraph] = useState(null);
  const graphDialogRef = useRef(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState([]);
  const [inventoryRecords, setInventoryRecords] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState("loading");
  
const [apiError, setApiError] = useState("");
const [predictionHistory, setPredictionHistory] = useState([]);
const [selectedPrediction, setSelectedPrediction] = useState(null);
const [historyNotice, setHistoryNotice] = useState(null);

const chartData = selectedPrediction
  ? [
      { parameter: "Distance", value: Number(selectedPrediction.Distance) },
      { parameter: "Pressure", value: Number(selectedPrediction.Pressure) },
      { parameter: "HRV", value: Number(selectedPrediction.HRV) },
      { parameter: "Sugar", value: Number(selectedPrediction["Sugar level"]) },
      { parameter: "SpO₂", value: Number(selectedPrediction.SpO2) },
      { parameter: "Accelerometer", value: Number(selectedPrediction.Accelerometer) },
    ]
  : [];


const refreshPredictionHistory = useCallback(async () => {
  const response = await fetch("http://127.0.0.1:8000/prediction-history");
  if (!response.ok) {
    throw new Error("Could not load prediction history");
  }

  const data = await response.json();
  setPredictionHistory(data);
  return data;
}, []);

useEffect(() => {
  let isCurrent = true;

  fetch("http://127.0.0.1:8000/prediction-history")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load prediction history");
      }
      return response.json();
    })
    .then((data) => {
      if (isCurrent) {
        setPredictionHistory(data);
      }
    })
    .catch((error) => {
      console.error("Could not load prediction history:", error);
    });

  return () => {
    isCurrent = false;
  };
}, []);

useEffect(() => {
  if (!historyNotice) {
    return undefined;
  }

  const timeoutId = window.setTimeout(() => setHistoryNotice(null), 4500);
  return () => window.clearTimeout(timeoutId);
}, [historyNotice]);

useEffect(() => {
  fetch("http://127.0.0.1:8000/inventory")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load inventory records");
      }
      return response.json();
    })
    .then((data) => {
      const formattedRecords = data.map((record) => ({
        id: record.record_id,
        heartRate: record.HRV,
        spo2: record.SpO2,
        pressure: record.Pressure,
        sugar: record["Sugar level"],
        distance: record.Distance,
        accelerometer: record.Accelerometer,
        risk: record.Risk_Category,
      }));

      setRecords(formattedRecords);
      setInventoryRecords(formattedRecords);
      setInventoryStatus("ready");
    })
    .catch((error) => {
      console.error("Could not load inventory:", error);
      setInventoryStatus("error");
    });
}, []);

  const [demoResult, setDemoResult] = useState(false);
  const [predictionResult, setPredictionResult] = useState("");

  useEffect(() => {
    const dialog = graphDialogRef.current;
    if (selectedGraph && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!selectedGraph && dialog?.open) {
      dialog.close();
    }
  }, [selectedGraph]);

  const latestRecord = records[0] || demoRecords[0];
  const lowRiskCount = inventoryRecords.filter((record) => record.risk === "Low").length;
  const mediumRiskCount = inventoryRecords.filter((record) => record.risk === "Medium").length;
  const highRiskCount = inventoryRecords.filter((record) => record.risk === "High").length;
  const filteredRecords = records.filter(
  (record) =>
    record.id.toLowerCase().includes(search.toLowerCase()) &&
    (riskFilter === "All" || record.risk === riskFilter)
);

 const navigation = [
  { name: "Overview", icon: "⌂" },
  { name: "Analysis", icon: "▥" },
  { name: "Records", icon: "▤" },
  { name: "Prediction", icon: "⌁" },
  { name: "Prediction History", icon: "◷" },
];
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setDemoResult(false);
  }

async function handleDemoSubmit(event) {
  event.preventDefault();

  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Distance: Number(form.distance),
        Pressure: Number(form.pressure),
        HRV: Number(form.hrv),
        sugar_level: Number(form.sugar),
        SpO2: Number(form.spo2),
        Accelerometer: Number(form.accelerometer),
      }),
    });

    if (!response.ok) {
      throw new Error("Prediction request failed");
    }

    const result = await response.json();
    setPredictionResult(result.risk);

    const newRecord = {
      id: `USER-${String(records.length + 1).padStart(3, "0")}`,
      heartRate: Number(form.hrv) || 0,
      spo2: Number(form.spo2) || 0,
      pressure: Number(form.pressure) || 0,
      sugar: Number(form.sugar) || 0,
      distance: Number(form.distance) || 0,
      accelerometer: Number(form.accelerometer) || 0,
      risk: result.risk,
    };

    setRecords((prevRecords) => [newRecord, ...prevRecords]);
    setDemoResult(true);
    setHistoryNotice({
      type: "success",
      message: "Prediction added to history.",
    });
    refreshPredictionHistory().catch((error) => {
      console.error("Could not refresh prediction history:", error);
      setHistoryNotice({
        type: "error",
        message: "Prediction was saved, but history could not refresh.",
      });
    });
  } catch (error) {
    console.error("Prediction error:", error);
    alert("Could not get a prediction. Please check that the backend is running.");
  }
}

async function handleDeletePrediction(item) {
  const confirmed = window.confirm(
    `Are you sure you want to delete the prediction from ${item.timestamp}?`,
  );
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/prediction-history/${encodeURIComponent(item.history_id)}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        errorBody?.detail || "Could not delete prediction history record",
      );
    }

    setPredictionHistory((currentHistory) =>
      currentHistory.filter((record) => record.history_id !== item.history_id),
    );
    if (selectedPrediction?.history_id === item.history_id) {
      setSelectedPrediction(null);
    }
    setHistoryNotice({
      type: "success",
      message: "Prediction deleted successfully.",
    });
    refreshPredictionHistory().catch((error) => {
      console.error("Could not refresh prediction history after deletion:", error);
    });
  } catch (error) {
    console.error("Could not delete prediction history:", error);
    setHistoryNotice({
      type: "error",
      message: error.message || "Could not delete prediction.",
    });
  }
}

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <BrandMark className="brand-icon" />
          <div>
            <h2>FallSense</h2>
            <span>RISK MONITORING</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav>
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Prediction" && (
                <span className="nav-tag">DEMO</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Project workspace</strong>
            
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <BrandMark className="brand-icon brand-icon-compact" />
            <div>
              <p className="breadcrumb">Workspace / {activePage}</p>
              <h1>{activePage}</h1>
            </div>
          </div>
          <div className="demo-badge">
            <span /> FRONTEND PREVIEW
          </div>
        </header>

        <div className="page-content">
          {activePage === "Overview" && (
            <>
              <section className="welcome-panel">
                <div className="welcome-copy">
                  <p className="eyebrow">INTELLIGENT FALL RISK MONITORING</p>
                  <h2>Smarter Monitoring. Safer Movement.</h2>
                  <p className="welcome-description">
                    Turn sensor data into actionable fall-risk insights with
                    machine learning. Monitor key health and movement
                    indicators, explore risk classifications, and review
                    prediction history in one place.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => setActivePage("Records")}
                    >
                      Explore Sensor Records <span aria-hidden="true">→</span>
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setActivePage("Prediction")}
                    >
                      View Predictions <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                </div>
                <div className="welcome-art" aria-hidden="true">
                  <svg viewBox="0 0 440 310" role="presentation">
                    <defs>
                      <linearGradient id="shield-fill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#e4f0df" />
                      </linearGradient>
                    </defs>
                    <circle cx="220" cy="155" r="119" fill="#eaf3e6" />
                    <circle
                      cx="220"
                      cy="155"
                      r="100"
                      fill="none"
                      stroke="#c9dcc3"
                      strokeDasharray="3 8"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M220 57 281 80v49c0 45-25 78-61 101-36-23-61-56-61-101V80l61-23Z"
                      fill="url(#shield-fill)"
                      stroke="#5f896a"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M174 151h24l12-23 20 49 15-31 10 5h13"
                      fill="none"
                      stroke="#2d694c"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="107" cy="100" r="6" fill="#7ca782" />
                    <circle cx="328" cy="106" r="5" fill="#a0c495" />
                    <circle cx="309" cy="229" r="6" fill="#7ca782" />
                    <circle cx="125" cy="221" r="4" fill="#a0c495" />
                    <path
                      d="m107 100 34 18m187-12-27 16m8 107-24-18m-160 10 26-17"
                      fill="none"
                      stroke="#b5ceb0"
                      strokeWidth="1.5"
                      strokeDasharray="3 6"
                    />
                    <rect
                      x="44"
                      y="137"
                      width="70"
                      height="42"
                      rx="12"
                      fill="#fff"
                      stroke="#d8e6d3"
                    />
                    <path
                      d="M58 158h10l5-9 8 18 7-13 5 4h7"
                      fill="none"
                      stroke="#5f896a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="326"
                      y="157"
                      width="70"
                      height="42"
                      rx="12"
                      fill="#fff"
                      stroke="#d8e6d3"
                    />
                    <path
                      d="M344 183v-8m9 8v-16m9 16v-11m9 11v-21"
                      fill="none"
                      stroke="#5f896a"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>Inventory overview</h2>
                  <p>Risk classifications from the connected inventory dataset.</p>
                </div>
                <span className={`inventory-status ${inventoryStatus}`}>
                  <span aria-hidden="true" />
                  {inventoryStatus === "ready"
                    ? "BACKEND INVENTORY"
                    : inventoryStatus === "error"
                      ? "INVENTORY UNAVAILABLE"
                      : "LOADING INVENTORY"}
                </span>
              </div>

              <section className="stats-grid">
                <StatCard
                  label="Total records"
                  value={inventoryStatus === "ready" ? String(inventoryRecords.length) : "—"}
                  note={
                    inventoryStatus === "ready"
                      ? "Rows in the current inventory"
                      : inventoryStatus === "error"
                        ? "Could not load inventory"
                        : "Loading inventory records"
                  }
                  icon="records"
                />
                <StatCard
                  label="Low risk"
                  value={inventoryStatus === "ready" ? String(lowRiskCount) : "—"}
                  note="Inventory records in this class"
                  icon="low"
                />
                <StatCard
                  label="Medium risk"
                  value={inventoryStatus === "ready" ? String(mediumRiskCount) : "—"}
                  note="Inventory records in this class"
                  icon="medium"
                />
                <StatCard
                  label="High risk"
                  value={inventoryStatus === "ready" ? String(highRiskCount) : "—"}
                  note="Inventory records in this class"
                  icon="high"
                />
              </section>

              <section className="bottom-grid">
                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Project modules</h3>
                      <p>Navigate through the dashboard</p>
                    </div>
                  </div>
                  {navigation.slice(1).map((item, index) => (
                    <button
                      className="module-row"
                      key={item.name}
                      onClick={() => setActivePage(item.name)}
                    >
                      <span className="module-number">0{index + 1}</span>
                      <span className="module-name">{item.name}</span>
                      <span className="module-arrow">↗</span>
                    </button>
                  ))}
                </div>
                <div className="panel project-note">
                  <div className="dataset-panel-heading">
                    <div className="note-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 5.5 12 2l8 3.5v13L12 22l-8-3.5v-13Z" />
                        <path d="m4.5 6 7.5 3.2L19.5 6M12 9.5V21" />
                      </svg>
                    </div>
                    <span className={`dataset-connection ${inventoryStatus}`}>
                      {inventoryStatus === "ready"
                        ? "Connected"
                        : inventoryStatus === "error"
                          ? "Unavailable"
                          : "Connecting"}
                    </span>
                  </div>
                  <h3>Inventory dataset</h3>
                  <p>
                    Risk counts are calculated from the records returned by
                    the inventory API. Each record includes six sensor
                    indicators used by the project.
                  </p>
                  <div className="dataset-fields" aria-label="Inventory sensor fields">
                    <span>HRV</span>
                    <span>SpO₂</span>
                    <span>Pressure</span>
                    <span>Sugar</span>
                    <span>Distance</span>
                    <span>Accelerometer</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {activePage === "Analysis" && (
            <section>
              <div className="section-heading">
                <div>
                  <h2>Model Analysis</h2>
                  <p>
                    Visualizations generated by the existing ML project.
                  </p>
                </div>
                <span className="sample-label">EXISTING ML OUTPUTS</span>
              </div>

              <div className="graphs-grid">
                {graphs.map((graph) => (
                  <button
                    className="graph-card"
                    key={graph.file}
                    type="button"
                    onClick={() => setSelectedGraph(graph)}
                    aria-label={`Open explanation for ${graph.title}`}
                  >
                    <div className="graph-image">
                      <img
                        src={`/graphs/${graph.file}`}
                        alt={graph.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="graph-info">
                      <h3>{graph.title}</h3>
                      <p>{graph.description}</p>
                    </div>
                    <span className="graph-card-action">
                      View chart details <span aria-hidden="true">↗</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activePage === "Records" && (
            <section className="panel">
              <div className="section-heading records-heading">
                <div>
                  <h2>Sensor records</h2>
                  <p>Illustrative records for testing the table.</p>
                </div>
                <span className="sample-label">DEMO ONLY</span>
              </div>

              <input
                className="search-input"
                placeholder="Search record ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
  value={riskFilter}
  onChange={(event) => setRiskFilter(event.target.value)}
>
  <option value="All">All Risks</option>
  <option value="Low">Low Risk</option>
  <option value="Medium">Medium Risk</option>
  <option value="High">High Risk</option>
</select>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Heart rate</th>
                      <th>SpO₂</th>
                      <th>Pressure</th>
                      <th>Distance</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.heartRate} bpm</td>
                        <td>{record.spo2}%</td>
                        <td>{record.pressure}</td>
                        <td>{record.distance} m</td>
                        <td>
                          <span
                            className={`risk-pill ${record.risk.toLowerCase()}`}
                          >
                            {record.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRecords.length === 0 && (
                  <p className="empty-message">No matching records.</p>
                )}
              </div>
              <p className="table-footnote">
                These records are fictional UI examples, not patient data or
                validated risk classifications.
              </p>
            </section>
          )}

          {activePage === "Prediction" && (
            <section className="prediction-layout">
              <div className="panel">
                <div className="section-heading">
                  <div>
                    <h2>Sensor input</h2>
                    <p>Proposed fields — confirm with the ML teammate.</p>
                  </div>
                </div>

                <form className="sensor-form" onSubmit={handleDemoSubmit}>
                  {[
                    ["spo2", "SpO₂ (%)", "Example: 98"],
                    ["hrv", "HRV", "Enter HRV value"],
                    ["sugar", "Sugar level", "Enter sugar value"],
                    ["distance", "Distance", "Enter distance"],
                    ["accelerometer", "Accelerometer", "Enter sensor value"],
                    ["pressure", "Pressure", "Enter pressure value"],
                  ].map(([name, label, placeholder]) => (
                    <label key={name}>
                      {label}
                      <input
                        name={name}
                        type="number"
                        step="any"
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={updateField}
                        required
                      />
                    </label>
                  ))}
                  <button className="primary-button form-button" type="submit">
                    Preview demo state <span>→</span>
                  </button>
                </form>
              </div>

              
<div className="panel result-panel">
  <div className="result-symbol">⌁</div>
  <p className="eyebrow">PREDICTION RESULT</p>

  <h2>
    {predictionResult
      ? `${predictionResult} Risk`
      : "Awaiting Prediction"}
  </h2>

  <p>
    {predictionResult
      ? `The Random Forest model predicted ${predictionResult.toLowerCase()} risk for the supplied sensor values.`
      : "Enter the sensor values and submit the form to get a model prediction."}
  </p>

  <div className="result-divider" />

  <span className="pending-label">
    ● {predictionResult ? "Prediction generated" : "Waiting for input"}
  </span>

  <p className="small-note">
    This interface does not diagnose or determine a person's
    actual fall risk.
  </p>
</div>

            </section>
          )}
        


          
{activePage === "Prediction History" && (
  <section className="panel">
    <div className="section-heading">
      <div>
        <h2>Prediction History</h2>
        <p>Previously saved Random Forest predictions.</p>
      </div>
    </div>

    {predictionHistory.length === 0 ? (
      <p>No prediction history available yet.</p>
    ) : (
      <div className="table-wrap">
        <table>
         
<thead>
  <tr>
    <th>Timestamp</th>
    <th>Distance</th>
    <th>Pressure</th>
    <th>HRV</th>
    <th>Sugar Level</th>
    <th>SpO₂</th>
    <th>Accelerometer</th>
    <th>Risk</th>
    <th>Actions</th>
  </tr>
</thead>


<tbody>
  {predictionHistory.map((item) => (
    <tr
      key={item.history_id}
      onClick={() => setSelectedPrediction(item)}
      style={{
        cursor: "pointer",
        background:
          selectedPrediction?.history_id === item.history_id
            ? "#EAF4E5"
            : "transparent",
      }}
    >
      <td>{item.timestamp}</td>
      <td>{item.Distance}</td>
      <td>{item.Pressure}</td>
      <td>{item.HRV}</td>
      <td>{item["Sugar level"]}</td>
      <td>{item.SpO2}</td>
      <td>{item.Accelerometer}</td>
      <td>{item.risk}</td>
      <td>
        <button
          className="history-delete-button"
          type="button"
          aria-label={`Delete prediction from ${item.timestamp}`}
          onClick={(event) => {
            event.stopPropagation();
            handleDeletePrediction(item);
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    )}
    
       


    {selectedPrediction && (
      <div
        className="panel"
        style={{ marginTop: "24px", padding: "24px" }}
      >
        <div className="section-heading">
          <div>
            <h2>Sensor Analysis</h2>
            <p>
              Selected prediction: {selectedPrediction.timestamp}
            </p>
          </div>
        </div>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
  key={selectedPrediction?.history_id}
  data={chartData}
>
              <PolarGrid stroke="#DDE7D8" />
              <PolarAngleAxis
                dataKey="parameter"
                tick={{ fill: "#173D32", fontSize: 12 }}
              />
              <PolarRadiusAxis />
              <Radar
                dataKey="value"
                stroke="#173D32"
                fill="#B6E69C"
                fillOpacity={0.55}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <h3>Predicted Risk: {selectedPrediction.risk}</h3>

        <p className="small-note">
          This prediction is based on the saved model output
          and is not a medical diagnosis.
        </p>
      </div>
    
    )}
  </section>
)}

        </div>

        <dialog
          className="graph-dialog"
          ref={graphDialogRef}
          aria-labelledby="graph-dialog-title"
          aria-describedby="graph-dialog-description"
          onClose={() => setSelectedGraph(null)}
          onClick={(event) => {
            if (event.target === graphDialogRef.current) {
              graphDialogRef.current.close();
            }
          }}
        >
          {selectedGraph && (
            <>
              <div className="graph-dialog-header">
                <div>
                  <p className="eyebrow">MODEL ANALYSIS</p>
                  <h2 id="graph-dialog-title">{selectedGraph.title}</h2>
                  <p id="graph-dialog-description">
                    {selectedGraph.description}
                  </p>
                </div>
                <button
                  className="graph-dialog-close"
                  type="button"
                  onClick={() => graphDialogRef.current?.close()}
                  aria-label="Close chart details"
                >
                  ×
                </button>
              </div>
              <div className="graph-dialog-image">
                <img
                  src={`/graphs/${selectedGraph.file}`}
                  alt={selectedGraph.title}
                />
              </div>
              <div className="graph-explanations">
                <section>
                  <h3>How to read this chart</h3>
                  <p>{selectedGraph.howToRead}</p>
                </section>
                <section>
                  <h3>What to look for</h3>
                  <p>{selectedGraph.lookFor}</p>
                </section>
                <section>
                  <h3>Why it matters</h3>
                  <p>{selectedGraph.whyItMatters}</p>
                </section>
              </div>
              <p className="graph-dialog-note">
                Interpret these results in the context of the dataset and
                evaluation method used to generate the chart.
              </p>
            </>
          )}
        </dialog>

                {historyNotice && (
                  <div
                    className={`history-toast ${historyNotice.type}`}
                    role={historyNotice.type === "error" ? "alert" : "status"}
                  >
                    <span className="history-toast-icon" aria-hidden="true">
                      {historyNotice.type === "success" ? "✓" : "!"}
                    </span>
                    <span>{historyNotice.message}</span>
                    <button
                      type="button"
                      onClick={() => setHistoryNotice(null)}
                      aria-label="Dismiss notification"
                    >
                      ×
                    </button>
                  </div>
                )}

                <footer>
          <span>FallSense · Fall Risk Detection Using ML</span>
          <span>Frontend development preview</span>
        </footer>

</main>
</div>
);
}


function BrandMark({ className }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M24 4 40 10v12c0 10-6.5 17.5-16 22C14.5 39.5 8 32 8 22V10l16-6Z" />
        <path d="M13 24h8l3-6 5 12 3-6h4" />
      </svg>
    </span>
  );
}

function StatIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "records" && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      )}
      {name === "low" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12 2.3 2.3 4.8-5" />
        </>
      )}
      {name === "medium" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 12h7" />
        </>
      )}
      {name === "high" && (
        <>
          <path d="M12 3.5 21 20H3L12 3.5Z" />
          <path d="M12 9v5m0 3h.01" />
        </>
      )}
    </svg>
  );
}

function StatCard({ label, value, note, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <StatIcon name={icon} />
        </span>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}

export default App;







      