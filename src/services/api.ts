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

      // Mensagens específicas baseadas no status HTTP
      const status = error.response.status;
      let errorMessage = error.response.data?.error;

      if (!errorMessage) {
        switch (status) {
          case 401:
            errorMessage = 'Credenciais inválidas';
            break;
          case 400:
            errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
          default:
            errorMessage = 'Erro ao processar requisição';
        }
      }
      throw new Error(errorMessage);
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






