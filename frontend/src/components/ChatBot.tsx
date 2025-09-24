import { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css";
import IrisAvatar from "../assets/Iris.jpg";
import { validarCNPJ, salvarResposta } from "../services/api"; // import do api.ts

const perguntas = [
  "Qual é o nome do responsável pela empresa?",
  "Qual é o email de contato?",
  "Qual é o telefone da empresa?",
];

type Message = {
  text: string;
  sender: "bot" | "user";
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Olá! Eu sou a Iris. Digite o CNPJ da sua empresa para começarmos.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [etapa, setEtapa] = useState<"cnpj" | "confirmar" | "perguntas" | "confirmarResposta" | "fim">("cnpj");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [perguntaIndex, setPerguntaIndex] = useState(0);
  const [respostaTemp, setRespostaTemp] = useState("");
  const [respostaCNPJ, setRespostaCNPJ] = useState("");

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = input.trim();
    setMessages(prev => [...prev, { text: msg, sender: "user" }]);
    setInput("");

    // === Etapa CNPJ ===
    if (etapa === "cnpj") {
      setRespostaCNPJ(msg);
      setMessages(prev => [...prev, { text: `Você digitou o CNPJ: ${msg}. Está correto? (sim/não)`, sender: "bot" }]);
      setEtapa("confirmar");
    }

    // === Confirmação CNPJ ===
    else if (etapa === "confirmar") {
      if (msg.toLowerCase() === "sim") {
        try {
          const { data } = await validarCNPJ(respostaCNPJ);
          if (data.valido) {
            setEmpresaId(data.empresaId);
            setMessages(prev => [...prev, { text: "CNPJ válido! Vamos começar o questionário.", sender: "bot" }]);
            setMessages(prev => [...prev, { text: perguntas[0], sender: "bot" }]);
            setEtapa("perguntas");
          } else {
            setMessages(prev => [...prev, { text: "CNPJ não cadastrado. Procure o suporte.", sender: "bot" }]);
            setEtapa("fim");
          }
        } catch {
          setMessages(prev => [...prev, { text: "Erro ao validar CNPJ. Tente novamente.", sender: "bot" }]);
        }
      } else {
        setMessages(prev => [...prev, { text: "Digite o CNPJ novamente.", sender: "bot" }]);
        setEtapa("cnpj");
      }
    }

    // === Etapa Perguntas ===
    else if (etapa === "perguntas" && empresaId) {
      setRespostaTemp(msg);
      setMessages(prev => [...prev, { text: `Sua resposta foi: "${msg}". Está correto ou deseja editar?`, sender: "bot" }]);
      setEtapa("confirmarResposta");
    }

    // === Confirmação da resposta ===
    else if (etapa === "confirmarResposta" && empresaId) {
      if (msg.toLowerCase() === "correto") {
        try {
          await salvarResposta(empresaId, perguntas[perguntaIndex], respostaTemp);

          if (perguntaIndex + 1 < perguntas.length) {
            setPerguntaIndex(perguntaIndex + 1);
            setMessages(prev => [...prev, { text: perguntas[perguntaIndex + 1], sender: "bot" }]);
            setEtapa("perguntas");
          } else {
            setMessages(prev => [...prev, { text: "Fim do questionário! Obrigado.", sender: "bot" }]);
            setEtapa("fim");
          }
        } catch {
          setMessages(prev => [...prev, { text: "Erro ao salvar resposta. Tente novamente.", sender: "bot" }]);
        }
      } else {
        setMessages(prev => [...prev, { text: perguntas[perguntaIndex], sender: "bot" }]);
        setEtapa("perguntas");
      }
    }
  };

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

      {etapa !== "fim" && (
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
      )}
    </div>
  );
}
