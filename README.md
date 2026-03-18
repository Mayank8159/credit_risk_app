
<!-- HERO -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0F1A,100:00D4FF&height=200&section=header&text=PRISM-CREDIT&fontSize=50&fontColor=ffffff&animation=fadeIn" />
</p>
<p align="center">
<b>Behavioral Risk Intelligence • Explainable AI • FinTech Engine</b>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=2000&pause=1000&color=00D4FF&center=true&vCenter=true&width=700&lines=AI+Driven+Credit+Scoring;Explainable+Risk+Engine;Mobile+First+FinTech;React+Native+%E2%9C%95+FastAPI" />
</p>

---

## 🧠 What is PRISM-CREDIT?

PRISM-CREDIT is a **next-generation AI-powered credit risk system** that evaluates users using **behavioral financial intelligence** instead of outdated demographic scoring.

### ⚡ Why it matters:
- ❌ Traditional systems = biased + opaque  
- ✅ PRISM = explainable + fair + real-time  

---

## 🔥 Key Highlights

- 🧠 Behavioral Credit Scoring  
- 📊 Explainable AI (XAI)  
- 🔐 JWT Authentication System  
- ⚙️ FastAPI + PostgreSQL Backend  
- 📱 React Native Mobile App  
- 🐳 Dockerized Infrastructure  
- 📜 Audit-ready architecture  

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Mobile App] -->|POST /risk/predict| B[FastAPI Backend]
    B --> C[Validation Layer]
    C --> D[Feature Engineering]
    D --> E[Risk Engine]
    E --> F[ML Model]
    F --> G[Risk Score]
    F --> H[Explainability Engine]
    G --> I[Response Formatter]
    H --> I
    I --> A
````

---

## 🧠 Machine Learning

| Component  | Tech                |
| ---------- | ------------------- |
| Algorithm  | Logistic Regression |
| Processing | pandas, numpy       |
| Framework  | scikit-learn        |
| Output     | Risk Score + XAI    |

### 🧾 Explainability Output Example:

* Savings Ratio → Positive impact
* Expense Load → Negative impact
* Transaction Behavior → Stability indicator

---

## 🛠️ Tech Stack

### 📱 Frontend

* React Native (Expo)
* Glassmorphism UI

### ⚙️ Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication

### 🤖 ML

* scikit-learn
* pandas
* numpy

### 🐳 DevOps

* Docker
* Nginx

---

## ⚡ Quick Start

### 1️⃣ Clone

```bash
git clone https://github.com/yourusername/prism-credit.git
cd prism-credit
```

---

### 2️⃣ Backend

```bash
cd apps/backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

### 3️⃣ Mobile

```bash
cd apps/mobile

npm install
npx expo start
```

---

## 📡 API Example

### POST `/risk/predict`

```json
{
  "income": 7500,
  "expenses": 2000,
  "savings": 15000,
  "transaction_count": 45
}
```

### Response

```json
{
  "score": 780,
  "risk_level": "Low",
  "explanations": [
    {
      "factor": "Savings Ratio",
      "impact": "+",
      "weight": 0.30,
      "description": "Strong savings improves your risk profile"
    }
  ],
  "compliance": {
    "demographic_data_used": false,
    "model_type": "Logistic Regression",
    "explainability": "Feature Contribution Based"
  }
}
```

---

## 🔐 Security

* JWT Authentication
* Password hashing (bcrypt)
* Protected endpoints
* No demographic bias usage

---

## 🚀 Future Scope

* SHAP Explainability
* Banking API integration
* Model retraining pipeline
* PDF report generation
* RBI-aligned compliance

---

## 👨‍💻 Team

* Mayank Kumar Sharma
* Pawan Agrahari
* Shreyan Mitra
* Rajat Kumar Chandak
* Parnatosh Mukherjee

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00D4FF,100:0B0F1A&height=120&section=footer"/>
</p>
