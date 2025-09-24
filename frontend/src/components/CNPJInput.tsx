import { useState, FormEvent } from 'react';

interface Props {
  onValidar: (cnpj: string) => void;
}

export default function CNPJInput({ onValidar }: Props) {
  const [cnpj, setCnpj] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (cnpj) onValidar(cnpj);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Digite o CNPJ da empresa:</h2>
      <input
        value={cnpj}
        onChange={e => setCnpj(e.target.value)}
        placeholder="Ex: 05.967.919/0001-72"
      />
      <button type="submit">Validar</button>
    </form>
  );
}
