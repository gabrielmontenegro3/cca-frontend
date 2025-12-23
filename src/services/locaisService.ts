import api from './api';
import { Local, CriarLocalDTO, AtualizarLocalDTO } from '../types';

export const locaisService = {
  // Listar todos os locais
  listar: async (): Promise<Local[]> => {
    try {
      const response = await api.get('/api/locais');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar locais:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar locais');
    }
  },

  // Buscar local por ID
  buscarPorId: async (id: number): Promise<Local> => {
    try {
      if (!id) {
        throw new Error('ID do local é obrigatório');
      }
      const response = await api.get(`/api/locais/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar local:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar local');
    }
  },

  // Criar local
  criar: async (dados: CriarLocalDTO): Promise<Local> => {
    try {
      if (!dados.nome || !dados.nome.trim()) {
        throw new Error('nome é obrigatório');
      }

      const response = await api.post('/api/locais', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar local:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar local');
    }
  },

  // Atualizar local
  atualizar: async (id: number, dados: AtualizarLocalDTO): Promise<Local> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do local é obrigatório');
      }

      const response = await api.put(`/api/locais/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar local:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar local');
    }
  },

  // Remover local
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do local é obrigatório');
      }

      await api.delete(`/api/locais/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover local:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover local');
    }
  },
};




