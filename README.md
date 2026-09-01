# 🧠 Second Brain RAG System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A fully local **Retrieval-Augmented Generation (RAG)** application that acts as your personal "second brain." Upload PDF documents and interact with them using Google's Gemini 2.0 Flash model. The system intelligently chunks your documents, stores them in a local vector database, and generates highly accurate, cited answers based solely on your personal knowledge base.

---

## ✨ Key Features

- 📄 **Document Ingestion:** Upload any PDF. The system parses and chunks the text using an overlapping sliding window (1000 characters, 200 overlap) to ensure context is never lost mid-sentence.
- 🗄️ **Local Vector Database:** Uses [ChromaDB](https://www.trychroma.com/) locally to store document embeddings. No third-party database subscriptions required.
- 🤖 **Strict, Cited AI Generation:** Powered by **Gemini 2.0 Flash**. The system is strictly prompted to answer questions based *only* on the uploaded context and will provide inline file and page citations (e.g., `[Source: file.pdf, Page: X]`).
- 🧬 **Cross-Document Analysis:** Run a deep analysis to summarize key themes across *all* your uploaded documents at once.
- 🎨 **Modern UI:** Built with React, Vite, and Tailwind CSS. Fully supports Markdown formatting, code syntax highlighting, and provides clear loading states while the AI is thinking.
- 🐳 **Dockerized Deployment:** Easily run the entire stack (Frontend + Backend + Database) anywhere using Docker Compose.

---

## 🏗️ Architecture Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS | A fast, responsive UI for chat and document management. |
| **Backend** | Python, FastAPI | High-performance API handling AI requests and file parsing. |
| **Vector DB** | ChromaDB | Local storage and retrieval of embedded document chunks. |
| **LLM** | Google GenAI SDK | Interfaces with `gemini-2.0-flash` for intelligent generation. |
| **Deployment** | Docker Compose | Container orchestration for seamless local deployment. |

---

## 🚀 Getting Started

You can run this project using **Docker** (Recommended) or **Manually** on your local machine.

### Prerequisites
- A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/).
- [Docker Desktop](https://docs.docker.com/get-docker/) (if running via Docker).
- Python 3.11+ and Node.js 20+ (if running manually).

### Method 1: Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShreyasVavley/second-brain.git
   cd second-brain
   ```

2. **Set your API Key:**
   Set your Gemini API Key as an environment variable in your terminal.
   * **Windows (PowerShell):** `$env:GEMINI_API_KEY="your_api_key_here"`
   * **Mac/Linux:** `export GEMINI_API_KEY="your_api_key_here"`

3. **Start the application:**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the Application:**
   - **Frontend UI:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)

### Method 2: Manual Local Setup

If you prefer to run the servers directly on your machine without Docker:

**1. Start the Backend:**
```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your_api_key_here"  # On Windows use $env:GEMINI_API_KEY="..."
python main.py
```
*The backend will start on `http://localhost:8000`.*

**2. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*The frontend will start on the URL provided by Vite (usually `http://localhost:5173`).*

---

## 📂 Project Structure

```text
second-brain/
├── backend/
│   ├── main.py              # FastAPI server & endpoints
│   ├── brain_logic.py       # Core RAG logic & chunking experimentation
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend container setup
│   └── chroma_db/           # Local vector DB storage (auto-generated)
├── frontend/
│   ├── src/                 # React source code (App.jsx, etc.)
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration
│   └── Dockerfile           # Frontend multi-stage container setup
├── docker-compose.yml       # Orchestrates frontend and backend containers
└── README.md                # Project documentation
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ShreyasVavley/second-brain/issues).
