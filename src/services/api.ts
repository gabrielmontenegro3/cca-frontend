import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import API_BASE_URL from '../config/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar x-user-id automaticamente
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obter usuário do localStorage
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      try {
        const usuarioData = JSON.parse(usuarioSalvo);
        if (usuarioData.id) {
          // Adicionar header x-user-id
          if (config.headers) {
            config.headers['x-user-id'] = usuarioData.id.toString();
          }
        }
      } catch (error) {
        console.error('Erro ao obter ID do usuário:', error);
      }
    }

    // Se for FormData, remover Content-Type para deixar o browser definir automaticamente
    // Isso é necessário porque o axios pode definir Content-Type incorretamente para FormData
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      
      // Melhorar mensagem de erro específica para problemas de banco de dados
      if (errorMessage && errorMessage.includes('table') && errorMessage.includes('schema cache')) {
        errorMessage = 'Erro de configuração do banco de dados. Verifique se as tabelas foram criadas corretamente no backend. O backend está tentando acessar uma tabela que não existe no banco de dados.';
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






