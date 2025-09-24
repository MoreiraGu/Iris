import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const validarCNPJ = (cnpj: string) => api.post('/validar-cnpj', { cnpj });
export const salvarResposta = (empresaId: number, pergunta: string, resposta: string) =>
  api.post('/salvar-resposta', { empresaId, pergunta, resposta });
