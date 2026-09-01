import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { Mic, MicOff, Download, Layers, Send, Trash2, FileText } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Speech Recognition Setup
  const SpeechRecognition = typeof window !== "undefined" 
  ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
  : null;
  const recognition = useRef(SpeechRecognition ? new SpeechRecognition() : null);

  useEffect(() => {
    setMessages([{ role: 'ai', text: "# VK Second Brain Pro\nUpload PDFs to begin. You can now use voice commands and deep analysis." }]);
    
    if (recognition.current) {
      recognition.current.continuous = false;
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.current.onerror = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoice = () => {
    if (!recognition.current) return alert("Speech recognition not supported in this browser.");
    if (isListening) recognition.current.stop();
    else recognition.current.start();
    setIsListening(!isListening);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('http://localhost:8000/upload', { method: 'POST', body: formData });
      setMessages(prev => [...prev, { role: 'ai', text: `✅ **Indexed:** ${file.name}. Ready for questions.` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "❌ Upload Failed." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/ask?q=${encodeURIComponent(input)}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer, citations: data.citations }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Server connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const runDeepAnalysis = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'ai', text: "⏳ Running Cross-Document Analysis..." }]);
    try {
      const res = await fetch(`http://localhost:8000/analyze-all`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: `## 🧬 Cross-Doc Summary\n${data.answer}` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "❌ Deep Analysis failed." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadChat = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("VK Second Brain Study Export", 10, 20);
    doc.setFontSize(10);
    let y = 30;
    messages.forEach(m => {
      const text = `${m.role.toUpperCase()}: ${m.text}`;
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 10, y);
      y += (splitText.length * 7);
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("Brain_Notes.pdf");
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F1ECE6', color: '#2E2E2E' }}>
      {/* SIDEBAR */}
      <div style={{ width: '280px', borderRight: '1px solid #DDD5CD', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#2E2E2E' }}>
        <h2 className="cursive-font" style={{ color: '#F1ECE6', fontSize: '2.5rem', marginBottom: '20px', textAlign: 'center' }}>Suster Selly Brain</h2>
        
        <button onClick={runDeepAnalysis} style={btnStyle}><Layers size={18}/> Deep Analysis</button>
        <button onClick={downloadChat} style={btnStyle}><Download size={18}/> Export PDF</button>
        
        <div style={{ padding: '20px', border: '2px dashed #7D4047', borderRadius: '12px', textAlign: 'center', background: '#3A3A3A', marginTop: '10px' }}>
          <p style={{ fontSize: '0.8rem', color: '#DDD5CD', marginBottom: '10px' }}>{isUploading ? "Uploading..." : "Add Notes"}</p>
          <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} id="up" />
          <label htmlFor="up" style={{ backgroundColor: '#7D4047', color: '#F1ECE6', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Select PDF</label>
        </div>

        <button onClick={() => setMessages([])} style={{ ...btnStyle, marginTop: 'auto', backgroundColor: '#7D4047', color: '#F1ECE6', border: 'none' }}>
          <Trash2 size={18}/> Clear Chat
        </button>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '80px', paddingRight: '10px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '20px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{ 
                display: 'inline-block', padding: '15px', borderRadius: '12px', 
                backgroundColor: msg.role === 'user' ? '#7D4047' : '#FFFFFF',
                color: msg.role === 'user' ? '#FFFFFF' : '#2E2E2E',
                maxWidth: '85%', textAlign: 'left', border: msg.role === 'ai' ? '1px solid #DDD5CD' : 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <ReactMarkdown components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                    ) : <code className={className} {...props}>{children}</code>
                  }
                }}>{msg.text}</ReactMarkdown>
                
                {msg.citations?.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                    {Array.from(new Set(msg.citations.map(c => c.page))).map(p => (
                      <span key={p} style={{ fontSize: '0.65rem', color: '#7D4047', background: '#F1ECE6', padding: '2px 8px', borderRadius: '10px', border: '1px solid #DDD5CD' }}>📄 Page {p}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ 
                display: 'inline-block', padding: '15px', borderRadius: '12px', 
                backgroundColor: '#FFFFFF', border: '1px solid #DDD5CD', color: '#7D4047', fontStyle: 'italic',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                Brain is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={toggleVoice} style={{ ...circleBtn, backgroundColor: isListening ? '#7D4047' : '#2E2E2E' }}>
            {isListening ? <MicOff size={20}/> : <Mic size={20}/>}
          </button>
          <input 
            style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #DDD5CD', backgroundColor: '#FFFFFF', color: '#2E2E2E', outline: 'none' }}
            value={input} onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your brain..."
          />
          <button onClick={handleSend} style={{ padding: '0 25px', backgroundColor: '#7D4047', color: '#F1ECE6', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F1ECE6', border: '1px solid #DDD5CD', color: '#2E2E2E', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' };
const circleBtn = { width: '50px', height: '50px', borderRadius: '50%', border: 'none', color: '#F1ECE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

export default App;