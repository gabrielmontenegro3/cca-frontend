import api from './api';
import { Chamado, FiltrosChamados } from '../types';

export const chamadosService = {
  // Listar chamados (com filtros opcionais)
  listar: async (filtros?: FiltrosChamados): Promise<Chamado[]> => {
    const params = new URLSearchParams();
    if (filtros?.id_unidade) {
      params.append('id_unidade', filtros.id_unidade.toString());
    }
    if (filtros?.tipo_chamado) {
      params.append('tipo_chamado', filtros.tipo_chamado);
    }
    if (filtros?.status) {
      params.append('status', filtros.status);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/chamados?${queryString}` : '/chamados';
    const response = await api.get(url);
    return response.data;
  },

  // Buscar chamado por ID
  buscarPorId: async (id: number): Promise<Chamado> => {
    const response = await api.get(`/chamados/${id}`);
    return response.data;
  },

  // Criar chamado (validação automática de garantia)
  criar: async (chamado: Omit<Chamado, 'id' | 'validacao_garantia' | 'data_criacao' | 'data_atualizacao'>): Promise<Chamado> => {
    const response = await api.post('/chamados', chamado);
    return response.data;
  },

  // Atualizar chamado
  atualizar: async (id: number, chamado: Partial<Chamado>): Promise<Chamado> => {
    const response = await api.put(`/chamados/${id}`, chamado);
    return response.data;
  },

  // Atualizar apenas o status do chamado
  atualizarStatus: async (id: number, status: Chamado['status']): Promise<Chamado> => {
    const response = await api.patch(`/chamados/${id}/status`, { status });
    return response.data;
  },
};






