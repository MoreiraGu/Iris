import { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css";
import IrisAvatar from "../assets/Iris.jpg";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", sender: "bot" },
    { text: "Hello! I need a Chatbot!", sender: "user" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { text: "I'm here to help you!", sender: "bot" }]);
    }, 800);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2 className="chat-title">Chatbot Assistant</h2>
        <div className="chat-status">Online</div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message-row ${msg.sender}`}>
            {msg.sender === "bot" && (
              <img src={IrisAvatar} alt="Iris Avatar" className="chatbot-avatar" />
            )}
            <div className={`chat-message ${msg.sender}`}>{msg.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-footer">
        <div className="chat-input-container">
          <input
            placeholder="Type your message..."
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="chat-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
