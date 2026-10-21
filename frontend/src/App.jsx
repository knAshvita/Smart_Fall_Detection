
import { useState } from "react";
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
  },
  {
    file: "confusion_matrices_model_comparison.png",
    title: "Confusion Matrices",
    description: "Inspect correct and incorrect classifications for each model.",
  },
  {
    file: "input_features_correlation_heatmap.png",
    title: "Feature Correlation Heatmap",
    description: "Explore relationships between the input features.",
  },
  {
    file: "learning_curves_model_comparison.png",
    title: "Learning Curves",
    description: "Review model learning behaviour during training.",
  },
  {
    file: "multiclass_roc_curves_comparison.png",
    title: "Multiclass ROC Curves",
    description: "Compare class-discrimination curves across models.",
  },
  {
    file: "multiclass_precision_recall_curves.png",
    title: "Precision–Recall Curves",
    description: "Explore precision and recall for the evaluated classes.",
  },
  {
    file: "precision_recall_f1_comparison.png",
    title: "Precision, Recall and F1",
    description: "Compare classification evaluation metrics.",
  },
  {
    file: "decision_tree_feature_importance.png",
    title: "Decision Tree Feature Importance",
    description: "View the feature importance reported for the decision tree.",
  },
  {
    file: "random_forest_feature_importance.png",
    title: "Random Forest Feature Importance",
    description: "View the feature importance reported for the random forest.",
  },
  {
    file: "svm_permutation_feature_importance.png.png",
    title: "SVM Feature Importance",
    description: "Explore the permutation feature importance output for SVM.",
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
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState(demoRecords);
  const [demoResult, setDemoResult] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");

  const latestRecord = records[0] || demoRecords[0];
  const filteredRecords = records.filter((record) =>
    record.id.toLowerCase().includes(search.toLowerCase())
  );

  const navigation = [
    { name: "Overview", icon: "⌂" },
    { name: "Analysis", icon: "▥" },
    { name: "Records", icon: "▤" },
    { name: "Prediction", icon: "⌁" },
  ];

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setDemoResult(false);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setUploadedImage(loadEvent.target?.result || "");
    };
    reader.readAsDataURL(file);
  }

  function handleDemoSubmit(event) {
    event.preventDefault();

    const newRecord = {
      id: `USER-${String(records.length + 1).padStart(3, "0")}`,
      heartRate: Number(form.hrv) || 0,
      spo2: Number(form.spo2) || 0,
      pressure: Number(form.pressure) || 0,
      sugar: Number(form.sugar) || 0,
      distance: Number(form.distance) || 0,
      accelerometer: Number(form.accelerometer) || 0,
      risk: getRiskLevel(form),
    };

    setRecords((prevRecords) => [newRecord, ...prevRecords]);
    setDemoResult(true);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">F</div>
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
            <span>ML integration pending</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {activePage}</p>
            <h1>{activePage}</h1>
          </div>
          <div className="demo-badge">
            <span /> FRONTEND PREVIEW
          </div>
        </header>

        <div className="page-content">
          {activePage === "Overview" && (
            <>
              <section className="welcome-panel">
                <div>
                  <p className="eyebrow">FALL RISK DETECTION USING ML</p>
                  <h2>Understand risk. Support safer movement.</h2>
                  <p>
                    Review the live sensor data, upload a local source image,
                    and track the latest prediction updates in one place.
                  </p>
                  <div className="image-upload-box">
                    <label className="image-upload-button">
                      <input type="file" accept="image/*" onChange={handleImageUpload} />
                      <span>Insert image</span>
                    </label>
                  </div>
                </div>
                <div className="welcome-art" aria-hidden="true">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="uploaded-image"
                    />
                  ) : (
                    <div className="art-circle">
                      <span>+</span>
                      <div className="art-person">●</div>
                      <div className="art-line" />
                      <div className="art-base" />
                    </div>
                  )}
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>Project overview</h2>
                  <p>Illustrative interface metrics, not verified results.</p>
                </div>
                <span className="sample-label">SAMPLE DATA</span>
              </div>

              <section className="stats-grid">
                <StatCard
                  label="Example records"
                  value={String(records.length).padStart(2, "0")}
                  note="Live sensor entries"
                  icon="▤"
                />
                <StatCard
                  label="Sensor features"
                  value={String(Object.keys(form).length).padStart(2, "0")}
                  note="Fields in live input"
                  icon="⌁"
                />
                <StatCard
                  label="Latest risk"
                  value={latestRecord.risk}
                  note={`${latestRecord.spo2}% SpO₂ • ${latestRecord.pressure} pressure`}
                  icon="▥"
                />
                <StatCard
                  label="ML connection"
                  value={demoResult ? "Live" : "Sync"}
                  note={demoResult ? "Latest values connected" : "Waiting for input"}
                  icon="↗"
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
                  <div className="note-icon">i</div>
                  <h3>About this dashboard</h3>
                  <p>
                    This is the initial frontend. Example records and form
                    values are for interface testing only. Actual risk
                    predictions require the trained ML model.
                  </p>
                  <span className="pending-label">
                    ● Prediction integration pending
                  </span>
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
                  <article className="graph-card" key={graph.file}>
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
                  </article>
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
                placeholder="Search demo record ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

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
                  <p className="empty-message">No matching demo records.</p>
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
                  {demoResult
                    ? "Demo input received"
                    : "Awaiting ML integration"}
                </h2>
                <p>
                  {demoResult
                    ? "Your form was submitted successfully. No risk prediction was calculated."
                    : "The trained model will provide the actual result once the Python API is connected."}
                </p>
                <div className="result-divider" />
                <span className="pending-label">
                  ●{" "}
                  {demoResult
                    ? "No prediction generated"
                    : "Backend not connected"}
                </span>
                <p className="small-note">
                  This interface does not diagnose or determine a person's
                  actual fall risk.
                </p>
              </div>
            </section>
          )}
        </div>

        <footer>
          <span>FallSense · Fall Risk Detection Using ML</span>
          <span>Frontend development preview</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, note, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}

export default App;
