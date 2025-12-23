import api from './api';
import { Chamado, FiltrosChamados } from '../types';

export interface CriarChamadoDTO {
  titulo: string;
  usuario: number;
  status?: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  descricao?: string;
}

export interface AtualizarChamadoDTO {
  titulo?: string;
  status?: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  descricao?: string;
}

export const chamadosService = {
  // Listar chamados (com filtros opcionais)
  listar: async (filtros?: FiltrosChamados): Promise<Chamado[]> => {
    const params = new URLSearchParams();
    if (filtros?.status) {
      params.append('status', filtros.status);
    }
    if (filtros?.usuario) {
      params.append('usuario', filtros.usuario.toString());
    }
    // Campos legados para compatibilidade
    if (filtros?.id_unidade) {
      params.append('id_unidade', filtros.id_unidade.toString());
    }
    if (filtros?.tipo_chamado) {
      params.append('tipo_chamado', filtros.tipo_chamado);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/chamados?${queryString}` : '/api/chamados';
    const response = await api.get(url);
    return response.data;
  },

  // Buscar chamado por ID
  buscarPorId: async (id: number): Promise<Chamado> => {
    const response = await api.get(`/api/chamados/${id}`);
    return response.data;
  },

  // Criar chamado
  criar: async (chamado: CriarChamadoDTO): Promise<Chamado> => {
    const response = await api.post('/api/chamados', {
      titulo: chamado.titulo,
      usuario: chamado.usuario,
      status: chamado.status || 'aberto',
      descricao: chamado.descricao || null
    });
    return response.data;
  },

  // Atualizar chamado
  atualizar: async (id: number, chamado: AtualizarChamadoDTO): Promise<Chamado> => {
    const response = await api.put(`/api/chamados/${id}`, chamado);
    return response.data;
  },

  // Atualizar apenas o status do chamado
  atualizarStatus: async (id: number, status: Chamado['status']): Promise<Chamado> => {
    const response = await api.patch(`/api/chamados/${id}/status`, { status });
    return response.data;
  },

  // Deletar chamado
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/chamados/${id}`);
  },
};






