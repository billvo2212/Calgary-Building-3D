# 🏙️ Calgary Urban Design 3D City Dashboard

A sophisticated web-based 3D visualization dashboard for Calgary city data with natural language querying powered by LLM integration.

## Watch Demo on Youtube
https://youtu.be/gc8eMPmicE0
<img width="1905" height="1042" alt="Screenshot 2025-07-21 at 4 10 01 PM" src="https://github.com/user-attachments/assets/47076314-c69f-4b79-98c0-a6664ca6eabc" />


## 🎯 Features

#### Current Features
- **3D City Visualization**: Interactive Three.js rendering of Calgary buildings
- **Natural Language Queries**: Ask questions like "buildings over 100 feet" or "commercial buildings"
- **Real-time Data**: Integration with Calgary Open Data API

#### Comming Features
- **Mobile Responsive**: Touch-friendly controls for mobile devices
- **Project Persistence**: Save and load your analysis projects
- **Advanced Analytics**: Building statistics and distribution charts
- **Export Capabilities**: CSV, JSON, and report generation

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React, Three.js, React Three Fiber, Tailwind CSS
- **Backend**: Python Flask, SQLAlchemy, SQLite
- **LLM**: Hugging Face Inference API with rule-based fallback
- **Data**: Calgary Open Data API
- **Deployment**: Render.com for both (Frontend) and (Backend)

### System Architecture (intented)
<img width="1149" height="636" alt="Screenshot 2025-07-21 at 3 29 10 PM" src="https://github.com/user-attachments/assets/49ccebf3-c9b1-4d32-9c11-5b2aaf7d1733" />


## 🚀 Quick Start for Development

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/billvo2212/Calgary-Building-3D.git
cd Calgary-Building-3D
```

### 2. Start backend services
```bash
cd backend
pip install -r requirement.txt
python3 app.py
```

### 3. Start frontend pages
```bash
cd frontend
npm i
npm run dev
```
