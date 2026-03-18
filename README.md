<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0F1A,100:A3FF12&height=200&section=header&text=PRISM-CREDIT&fontSize=50&fontColor=ffffff&animation=fadeIn" />
</p>
<p align="center">
<b>Glassmorphic UI • Real-time Risk Analytics • Behavioral FinTech Engine</b>
</p>

<p align="center">
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=2000&pause=1000&color=A3FF12&center=true&vCenter=true&width=700&lines=XGBoost+Driven+Risk+Scoring;Glassmorphic+Mobile+Experience;Real-time+Portfolio+Monitoring;FastAPI+%E2%9C%95+React+Native+Expo" />
</p

## 🧠 What is PRISM-CREDIT?

PRISM-CREDIT is a **High-Fidelity AI Credit Risk Management System**. It moves beyond stagnant credit bureau scores by analyzing live transactional behavior and portfolio exposure, wrapped in a premium **Glassmorphic** interface.

### ⚡ The PRISM Edge:

  - **Visual Risk Gauges:** Real-time needle movement based on financial health.
  - **Explainable AI:** Uses Feature Contribution to tell users *why* their score changed.
  - **Deep-Entity Tracking:** Monitors counterparty risk and industry volatility.

-----

## 🔥 Key Highlights

  - 🧪 **Advanced ML Engine:** Leveraging XGBoost/Random Forest for high-precision default prediction.
  - 💎 **Liquid Glass UI:** Modern React Native design with high-intensity blur and neon accents.
  - 📊 **Dynamic Portfolio:** Live tracking of "Risk-Weighted Assets" and "Total Exposure."
  - 🚨 **Automated Alerts:** Real-time flagging of "Critical Risk Entities" and "Income Shocks."
  - 🔐 **Secure Backend:** FastAPI with JWT-based Auth and Pydantic validation.

-----

## 🏗️ System Architecture

```mermaid
graph TD
    A[Mobile App - React Native] -->|POST /api/v1/risk/analyze| B[FastAPI Gateway]
    B --> C[Auth & Validation Layer]
    C --> D[Kaggle-Trained Preprocessor]
    D --> E[Inference Service - XGBoost]
    E --> F[Risk Score Output]
    E --> G[XAI - Feature Importance]
    F --> H[Dashboard Formatter]
    G --> H
    H --> A
```

-----

## 🧠 Machine Learning Model

The engine is trained on the **Kaggle Credit Risk Dataset**, utilizing 12+ critical financial features.

| Component  | Tech                |
| ---------- | ------------------- |
| **Algorithm** | XGBoost / Random Forest |
| **Data Source**| Kaggle Credit Risk CSV |
| **Framework** | scikit-learn, joblib  |
| **Metrics** | AUC-ROC, F1-Score    |

### 🧾 Explainability Indicators (XAI):

  * **Loan Percent Income:** High ratio → Drastic negative impact.
  * **Credit History Length:** Longevity → Stability boost.
  * **Default History:** Prior defaults → Critical risk flag.

-----

## 🛠️ Tech Stack

### 📱 Frontend

  * **React Native (Expo)**
  * **Expo Blur** (Glassmorphism)
  * **React Navigation** (Custom Floating Tab Bar)

### ⚙️ Backend

  * **FastAPI** (Python)
  * **SQLAlchemy** (ORM)
  * **PostgreSQL** (Database)

### 🤖 ML & Data

  * **XGBoost / scikit-learn**
  * **Pandas/Numpy** (Pre-processing)

-----

## 📡 API Reference

### POST `/api/v1/risk/analyze`

**Request Body:**

```json
{
  "person_age": 24,
  "person_income": 85000,
  "loan_amnt": 15000,
  "loan_intent": "VENTURE",
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 5
}
```

**Response:**

```json
{
  "risk_score": 72,
  "risk_grade": "Moderate-High",
  "status": "Manual Review Required",
  "analysis": {
    "utilization_rate": 0.28,
    "primary_risk_factor": "Loan to Income Ratio",
    "xai_explanation": "Your loan amount exceeds 20% of annual income."
  }
}
```
---

## 🚀 Experience the App

Experience the **PRISM-CREDIT** high-fidelity glassmorphic UI directly on your device via Expo.

<p align="left">
  <a href="https://expo.dev/accounts/mayank8159/projects/credit-risk-app/builds/86da35ea-be49-4928-9386-ab99874653a7">
    <img src="https://img.shields.io/badge/Download_Build-A3FF12?style=for-the-badge&logo=expo&logoColor=0B0F1A" alt="Download Build" />
  </a>
  <a href="https://expo.dev/@mayank8159/credit-risk-app">
    <img src="https://img.shields.io/badge/Expo_Go-000000?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Go" />
  </a>
</p>

### 📲 How to Run:
1. **Download the Build:** Click the green button above to access the specific artifact (Build ID: `86da35ea`).
2. **Android/iOS:** Follow the Expo instructions to install the development build or open via **Expo Go**.
3. **Scan & Analyze:** Use the central "Analyze" button to trigger the XGBoost risk engine simulation.

-----

## 👨‍💻 Team 7SENSITIVE

  * **Mayank Kumar Sharma** 
  * **Pawan Agrahari**
  * **Shreyan Mitra**
  * **Rajat Kumar Chandak**
  * **Parnatosh Mukherjee**

-----
<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:A3FF12,100:0B0F1A&height=120&section=footer"/>
</p>
