# Smart Fall Risk Detection Using Machine Learning

## 📌 Project Overview

Smart Fall Risk Detection is a machine learning project that explores the classification of fall-risk-related data using supervised learning algorithms. The project compares multiple machine learning models and evaluates their performance using classification metrics and visualization techniques.

The goal is to investigate how physiological and movement-related features can be used to classify observations into the dataset's predefined classes.

## 🎯 Objectives

- Analyze and preprocess the fall-risk dataset.
- Handle missing values and prepare data for model training.
- Train and compare multiple machine learning classifiers.
- Evaluate model performance using accuracy, precision, recall, and F1-score.
- Visualize model performance through confusion matrices, feature importance, ROC curves, precision-recall curves, and learning curves.
- Save trained models for potential future use.

## 🧰 Tech Stack

- **Programming Language:** Python
- **Environment:** Jupyter Notebook
- **Libraries:** Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn
- **Model Persistence:** Joblib
- **Version Control:** Git and GitHub

## 🤖 Machine Learning Models

The project includes the following classifiers:

1. **Decision Tree Classifier** — learns decision rules from input features.
2. **Random Forest Classifier** — combines multiple decision trees to make predictions.
3. **Support Vector Machine (SVM)** — learns decision boundaries to distinguish between classes.

The models are evaluated and compared to understand their relative performance on the available dataset.

## 📂 Project Structure

```text
Smart_Fall_Detection/
│
├── data/
│   ├── cStick.csv
│   └── cStick_realistic.csv
│
├── notebooks/
│   ├── smart_fall_risk_detection (1).ipynb
│   └── smart_fall_risk_detection_realistic_dataset.ipynb
│
├── results/
│   ├── graphs/
│   │   ├── confusion_matrices_model_comparison.png
│   │   ├── decision_tree_feature_importance.png
│   │   ├── input_features_correlation_heatmap.png
│   │   ├── learning_curves_model_comparison.png
│   │   ├── model_accuracy_comparison.png
│   │   ├── multiclass_precision_recall_curves.png
│   │   ├── multiclass_roc_curves_comparison.png
│   │   ├── precision_recall_f1_comparison.png
│   │   ├── random_forest_feature_importance.png
│   │   └── svm_permutation_feature_importance.png.png
│   │
│   └── models/
│       ├── Decision_Tree.joblib
│       ├── Random_Forest.joblib
│       └── SVM.joblib
│
└── .gitignore
```

## 📊 Evaluation and Visualizations

The project includes visualizations for analyzing and comparing model performance:

- **Model Accuracy Comparison:** Compares classification accuracy across models.
- **Confusion Matrices:** Shows correct and incorrect predictions for each class.
- **Precision, Recall, and F1-score:** Supports a broader evaluation beyond accuracy.
- **Feature Importance:** Examines influential features for the tree-based models and permutation-based feature importance for SVM.
- **ROC Curves:** Visualizes classification performance across decision thresholds.
- **Precision-Recall Curves:** Examines the trade-off between precision and recall.
- **Learning Curves:** Helps assess model learning behavior and potential overfitting.
- **Correlation Heatmap:** Shows relationships between input features.

## ⚙️ Dataset and Preprocessing

The repository contains two CSV datasets:

- `cStick.csv` — the original dataset.
- `cStick_realistic.csv` — a modified dataset used for further experimentation.

The datasets contain input features such as distance, pressure, heart rate variability (HRV), sugar level, SpO₂, and accelerometer measurements, along with a target decision label.

The realistic dataset contains missing values in several input features. Preprocessing and imputation are performed as part of the model-training workflow.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/knAshvita/Smart_Fall_Detection.git
```

### 2. Navigate to the project directory

```bash
cd Smart_Fall_Detection
```

### 3. Install the required libraries

```bash
pip install pandas numpy matplotlib seaborn scikit-learn joblib jupyter
```

### 4. Launch Jupyter Notebook

```bash
jupyter notebook
```

### 5. Run the notebooks

Open the `notebooks/` directory and select the notebook you want to explore. Run the cells in sequence to reproduce the analysis and model evaluation.

## 💾 Saved Models

The `results/models/` directory contains serialized model files:

- `Decision_Tree.joblib`
- `Random_Forest.joblib`
- `SVM.joblib`

These files can be loaded using Joblib. For reliable predictions on new data, the input must use the same feature order and preprocessing applied during training. The saved artifacts should be checked to ensure that any required imputation and scaling steps are included.

## 🔮 Future Improvements

- Implement and evaluate additional classifiers, such as Gradient Boosting.
- Apply stratified cross-validation and hyperparameter tuning.
- Improve reproducibility by saving complete preprocessing and model pipelines.
- Develop a simple interface for entering input features and viewing predictions.
- Evaluate performance on independent, representative datasets.
- Investigate class-specific recall and the consequences of false-negative predictions.
- Validate the approach before considering any real-world fall-prevention application.

## ⚠️ Disclaimer

This project is intended for educational and experimental purposes. Model predictions are based on the available dataset and should not be treated as medical advice or as a clinically validated fall-risk assessment.

## 👩‍💻 Author

GitHub: [@knAshvita](https://github.com/knAshvita)

## 📌 Repository

[Smart Fall Detection on GitHub](https://github.com/knAshvita/Smart_Fall_Detection)
