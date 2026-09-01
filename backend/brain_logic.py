import chromadb
from google import genai
from pypdf import PdfReader

# Local Vector DB setup
db_client = chromadb.PersistentClient(path="./chroma_db")
collection = db_client.get_or_create_collection("my_notes")
ai_client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

def process_pdf(file_path):
    reader = PdfReader(file_path)
    text = " ".join([page.extract_text() for page in reader.pages])
    # Simple chunking: split by paragraphs
    chunks = text.split('\n\n')
    collection.add(documents=chunks, ids=[f"id_{i}" for i in range(len(chunks))])

def query_brain(user_query):
    # Search DB for top 3 matching chunks
    results = collection.query(query_texts=[user_query], n_results=3)
    context = " ".join(results['documents'][0])

    prompt = f"Using these notes: {context}\n\nQuestion: {user_query}"
    response = ai_client.models.generate_content(model="gemini-3.6-flash", contents=prompt)
    return response.text