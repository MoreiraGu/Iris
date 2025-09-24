import { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css";
import IrisAvatar from "../assets/Iris.jpg";
import { validarCNPJ, salvarResposta } from "../services/api";

const mensagensIniciais = [
  "Oi! Sou a Iris e estarei com você durante esta conversa.",
  "Gostaria que me contasse, de forma resumida, os desafios ou situações que você tem percebido na empresa.",
  "Assim consigo entender melhor o que acontece e como podemos refletir sobre isso juntos para gerar uma trilha totalmente personalizada dedicada ao seu problema!",
  "Antes de começarmos confirme o seu CNPJ. (Exemplo: 01.234.567/0001-89)."
];

const perguntas = [
  "Quais resultados de negócio vocês esperam alcançar ao contratar esse serviço?",
  "O que você acredita que funciona bem atualmente na empresa?",
  "Quais são as maiores urgências percebidas pela liderança?",
  "Pode compartilhar uma fala ou situação que represente como a empresa se vê hoje?",
  "Há alguma área ou aspecto que vocês não consideravam prioritário, mas que tem sido afetado por outras questões na empresa?",
  "Em uma escala de 1 a 5, qual o impacto desse problema?",
  "Pode dar um exemplo prático que mostre esse problema acontecendo?",
  "Como esse problema aparece no dia a dia?",
  "Quais comportamentos recorrentes ou estruturas estão faltando?",
  "Qual é o maior prejuízo que esses comportamentos geram?",
  "Que habilidade ou competência humana você acha que está em falta?",
  "Por fim, ao gerar as trilhas, qual tipo de conteúdo você prefere ver na maioria delas? (Ex: Vídeos, Podcasts, Cursos Curtos)",
  "Obrigado por compartilhar suas respostas! 😊\n\nSe tiver qualquer dúvida ou precisar de mais informações, você pode entrar em contato conosco pelo e-mail: entrenovaflix@gmail.com"
];

type Message = {
  text: string;
  sender: "bot" | "user";
};

// Variável fora do componente garante que só executa uma vez por sessão
let iniciaisJaEnviadas = false;

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [etapa, setEtapa] = useState<"iniciais" | "cnpj" | "confirmar" | "perguntas" | "confirmarResposta" | "fim">("iniciais");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [perguntaIndex, setPerguntaIndex] = useState(0);
  const [respostaTemp, setRespostaTemp] = useState("");
  const [respostaCNPJ, setRespostaCNPJ] = useState("");

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addBotMessage = async (text: string, ms = 1000) => {
    await delay(ms);
    setMessages(prev => [...prev, { text, sender: "bot" }]);
  };

  useEffect(() => {
    const enviarMensagensIniciais = async () => {
      if (etapa === "iniciais" && !iniciaisJaEnviadas) {
        iniciaisJaEnviadas = true; // marca que já enviou
        for (const msg of mensagensIniciais) {
          await addBotMessage(msg, 500);
        }
        setEtapa("cnpj");
      }
    };
    enviarMensagensIniciais();
  }, [etapa]);

  const sendMessage = async () => {
    if (!input.trim() || inputDisabled) return;

    const msg = input.trim();
    setMessages(prev => [...prev, { text: msg, sender: "user" }]);
    setInput("");
    setInputDisabled(true);

    if (etapa === "cnpj") {
      setRespostaCNPJ(msg);
      await addBotMessage(`Você digitou o CNPJ: ${msg}. Está correto? (sim/não)`);
      setEtapa("confirmar");
    }
    else if (etapa === "confirmar") {
      if (msg.toLowerCase() === "sim") {
        try {
          const { data } = await validarCNPJ(respostaCNPJ);
          if (data.valido) {
            setEmpresaId(data.empresaId);
            await addBotMessage("CNPJ válido! Vamos começar o questionário.");
            await addBotMessage(perguntas[0]);
            setEtapa("perguntas");
          } else {
            await addBotMessage("CNPJ não cadastrado. Procure o suporte.");
            setEtapa("fim");
          }
        } catch {
          await addBotMessage("Erro ao validar CNPJ. Tente novamente.");
        }
      } else {
        await addBotMessage("Digite o CNPJ novamente.");
        setEtapa("cnpj");
      }
    }
    else if (etapa === "perguntas" && empresaId !== null) {
      setRespostaTemp(msg);
      await addBotMessage(`Sua resposta foi: "${msg}". Está correto ou deseja editar?`);
      setEtapa("confirmarResposta");
    }
    else if (etapa === "confirmarResposta" && empresaId !== null) {
      if (msg.toLowerCase() === "correto") {
        try {
          await salvarResposta(empresaId, perguntas[perguntaIndex], respostaTemp);
          if (perguntaIndex + 1 < perguntas.length) {
            setPerguntaIndex(perguntaIndex + 1);
            await addBotMessage(perguntas[perguntaIndex + 1]);
            setEtapa("perguntas");
          } else {
            await addBotMessage("Fim do questionário! Obrigado.");
            setEtapa("fim");
          }
        } catch {
          await addBotMessage("Erro ao salvar resposta. Tente novamente.");
        }
      } else {
        await addBotMessage(perguntas[perguntaIndex]);
        setEtapa("perguntas");
      }
    }

    setInputDisabled(false);
  };

  return (
    <div className="chat-container">
      {/* ===== HEADER COM AVATAR ===== */}
      <div className="chat-header">
        <div className="chat-title-container">
          <img src={IrisAvatar} alt="Iris Avatar" className="chat-title-avatar" />
          <span className="chat-title">Iris - Assistente Virtual</span>
        </div>
        <div className="chat-status">Online</div>
      </div>

      {/* ===== MENSAGENS ===== */}
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

      {/* ===== INPUT ===== */}
      {etapa !== "fim" && (
        <div className="chat-footer">
          <div className="chat-input-container">
            <input
              placeholder="Digite sua mensagem."
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={inputDisabled}
            />
            <button className="chat-button" onClick={sendMessage} disabled={inputDisabled}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}
