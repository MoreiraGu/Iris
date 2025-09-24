import React, { useState, useRef, useEffect } from 'react';
import '../styles/Chatbot.css';
import Iris from '../assets/Iris.jpg';
import CNPJInput from './CNPJInput';
import PerguntaForm from './PerguntaForm';
import { validarCNPJ, salvarResposta } from '../services/api';

const perguntas: string[] = [
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
  "Por fim, ao gerar as trilhas, qual tipo de conteúdo você prefere ver na maioria delas? (Ex: Vídeos, Podcasts, Cursos Curtos)"
];

type Mensagem = { text: string; from: 'bot' | 'user' };

export default function ChatBot() {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [cnpjValido, setCnpjValido] = useState<boolean | null>(null);
  const [perguntaIndex, setPerguntaIndex] = useState<number>(0);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const handleValidarCNPJ = async (cnpj: string) => {
    try {
      const res = await validarCNPJ(cnpj);
      if (res.data.valido) {
        setEmpresaId(res.data.empresaId);
        setCnpjValido(true);
        setMensagens([{ text: "CNPJ validado! Vamos começar.", from: "bot" }]);
      } else {
        setCnpjValido(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarResposta = async (resposta: string) => {
    if (empresaId === null) return;

    setMensagens(prev => [...prev, { text: resposta, from: 'user' }]);

    try {
      await salvarResposta(empresaId, perguntas[perguntaIndex], resposta);

      if (perguntaIndex + 1 < perguntas.length) {
        setPerguntaIndex(prev => prev + 1);
        setTimeout(() => {
          setMensagens(prev => [
            ...prev,
            { text: perguntas[perguntaIndex + 1], from: 'bot' }
          ]);
        }, 500);
      } else {
        setTimeout(() => {
          setMensagens(prev => [
            ...prev,
            { text: "Obrigado! Todas as respostas foram enviadas.", from: 'bot' }
          ]);
        }, 500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [mensagens]);

  return (
    <div className="chatbot-center">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h2>Iris</h2>
        </div>

        <div className="chatbot-body" ref={chatBoxRef}>
          {cnpjValido === null && <CNPJInput onValidar={handleValidarCNPJ} />}
          {cnpjValido === false && <p style={{ color: 'red' }}>CNPJ não encontrado!</p>}
          {mensagens.map((msg, idx) => (
            <div key={idx} className={`message-group ${msg.from}`}>
              {msg.from === 'bot' && <img src={Iris} alt="Iris" className="Iris" />}
              <div className={`message ${msg.from}`}>{msg.text}</div>
            </div>
          ))}
        </div>

        {cnpjValido && perguntaIndex < perguntas.length && (
          <PerguntaForm pergunta={perguntas[perguntaIndex]} onEnviar={handleEnviarResposta} />
        )}
      </div>
    </div>
  );
}
