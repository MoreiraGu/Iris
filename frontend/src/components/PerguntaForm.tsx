import { useState, FormEvent } from 'react';

interface Props {
  pergunta: string;
  onEnviar: (resposta: string) => void;
}

export default function PerguntaForm({ pergunta, onEnviar }: Props) {
  const [resposta, setResposta] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (resposta) {
      onEnviar(resposta);
      setResposta('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{pergunta}</h3>
      <textarea
        rows={4}
        cols={50}
        value={resposta}
        onChange={e => setResposta(e.target.value)}
      />
      <br />
      <button type="submit" disabled={!resposta}>Enviar</button>
    </form>
  );
}
