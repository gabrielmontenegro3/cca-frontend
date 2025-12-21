import axios, { AxiosInstance } from 'axios';
import API_BASE_URL from '../config/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro com resposta do servidor
      console.error('Erro da API:', error.response.data);
      throw new Error(error.response.data.error || 'Erro ao processar requisição');
    } else if (error.request) {
      // Erro de rede
      console.error('Erro de rede:', error.request);
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    } else {
      // Outro erro
      console.error('Erro:', error.message);
      throw error;
    }
  }
);

export default api;






