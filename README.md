# Second Brain RAG System

A Retrieval-Augmented Generation (RAG) application that acts as your personal "second brain." Upload PDF documents and interact with them using Google's Gemini 2.0 Flash model.

## Features

- **Document Ingestion:** Upload PDFs which are parsed and chunked using an overlapping sliding window (1000 characters, 200 overlap) to preserve context mid-sentence.
- **Local Vector Database:** Uses ChromaDB locally to store document embeddings.
- **Strict, Cited AI Generation:** Employs Gemini 2.0 Flash to answer questions based *strictly* on uploaded context, complete with inline file and page citations.
- **Cross-Document Analysis:** Ability to deeply analyze and summarize themes across multiple uploaded documents.
- **Modern UI:** React, Vite, and Tailwind CSS frontend that handles Markdown formatting and syntax highlighting.
- **Dockerized Deployment:** Easily run the entire stack (Frontend + Backend) using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed.
- A Google Gemini API Key.

## How to Run (Docker)

1. Set your Gemini API Key as an environment variable in your terminal. For example, in PowerShell:
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

## How to Run (Without Docker)

1. **Start the Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   export GEMINI_API_KEY="your_api_key_here"
   python main.py
   ```

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Access the application at the URL provided by Vite (usually `http://localhost:5173`).

## Architecture
- `backend/`: FastAPI application using `google-genai` and `chromadb`.
- `frontend/`: React + Vite UI using Tailwind CSS and `react-markdown`.
- `docker-compose.yml`: Orchestrates the frontend and backend services and mounts a persistent volume for the local ChromaDB database.
