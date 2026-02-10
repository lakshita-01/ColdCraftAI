# AI Cold Email Optimizer 🚀

A high-performance SaaS platform for optimizing cold sales outreach using AI and vector-based analysis. Built with a vibrant obsidian-glassmorphism UI and powered by Puter.js for zero-configuration AI intelligence.

## ✨ Features
- **AI Email Optimization**: Generation of hyper-personalized emails via Puter.js.
- **Vibrant UI/UX**: Deep dark mode, glassmorphism, and Framer Motion animations.
- **Performant Analytics**: Real-time dashboard with visualization for 1,200+ database entries.
- **Predictive Scoring**: ML-mocked probability scores based on historical data.

## 🛠️ Tech Stack
- **Frontend**: Vite, React, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express.
- **Database**: SQLite (initialized with 1,200 samples automatically).
- **AI**: Puter.js (Browser-based LLM, no API keys required).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Run
Follow these exact steps to launch the application:

1. **Clone and Install All Dependencies**
    
    npm run install-all

2. **Run Application**
    
    npm run dev

Once running:
- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:5000`

## 📁 Project Structure
- `client/`: React frontend with logic for AI generation and animated UI.
- `server/`: Express API for managing historical data and analytics.
- `server/db.js`: Handles SQLite initialization and automatic seeding of 1,200+ records.

## 💡 Troubleshooting
- **Puter.js not loading**: Ensure you have an active internet connection as it pulls the LLM engine from puter.com.
- **CORS Errors**: Ensure the server is running on port 5000 and the client on 5173.
#
