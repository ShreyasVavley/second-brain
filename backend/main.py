import os
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
import chromadb
from pypdf import PdfReader

app = FastAPI()

# 1. Fix CORS (Ensures React on :3000 can talk to Python on :8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize Gemini 2026 Client
# Replace with your actual key or set it in your environment variables
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE" 
client = genai.Client(api_key=GEMINI_API_KEY)

# 3. Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="user_documents")

# --- ENDPOINTS ---

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        pdf = PdfReader(file.file)
        text_chunks = []
        metadatas = []
        ids = []

        chunk_size = 1000
        overlap = 200

        for i, page in enumerate(pdf.pages):
            content = page.extract_text()
            if content:
                content = content.strip()
                start = 0
                chunk_index = 0
                while start < len(content):
                    end = start + chunk_size
                    chunk = content[start:end]
                    
                    chunk_id = f"{file.filename}_p{i}_c{chunk_index}"
                    text_chunks.append(chunk)
                    metadatas.append({"source": file.filename, "page": i + 1})
                    ids.append(chunk_id)
                    
                    start += (chunk_size - overlap)
                    chunk_index += 1

        # Add to vector store
        collection.add(documents=text_chunks, metadatas=metadatas, ids=ids)
        return {"message": f"Successfully indexed {len(text_chunks)} pages from {file.filename}"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/ask")
async def ask_question(q: str = Query(...)):
    try:
        # 1. Retrieve relevant context from ChromaDB
        results = collection.query(query_texts=[q], n_results=5)
        context = "\n".join(results['documents'][0])
        # 2. Generate response using the new SDK
        prompt = f"""You are an AI assistant connected to a user's Second Brain.
Answer the user's question using ONLY the provided context. If the answer is not contained in the context, say "I cannot answer this based on the provided documents."
When you use information from the context, always include an inline citation to the source file and page (e.g., [Source: file.pdf, Page: 2]).

Context:
{context}

Question: {q}
Answer:"""
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        return {
            "answer": response.text,
            "citations": results['metadatas'][0]
        }
    except Exception as e:
        return {"answer": f"Error: {str(e)}", "citations": []}

@app.get("/analyze-all")
async def analyze_all_docs(task: str = "Summarize the key themes across all documents"):
    try:
        results = collection.query(query_texts=[task], n_results=15)
        if not results['documents'] or not results['documents'][0]:
            return {"answer": "No documents found."}

        full_context = "\n---\n".join(results['documents'][0])
        prompt = f"SYSTEM: Perform cross-document analysis.\nCONTEXT:\n{full_context}\n\nTASK: {task}"

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.3)
        )
        return {"answer": response.text}
    except Exception as e:
        return {"answer": f"Analysis Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    # Render provides a PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)