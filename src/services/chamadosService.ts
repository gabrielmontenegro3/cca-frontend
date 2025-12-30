import api from './api';
import { Chamado, FiltrosChamados, MensagemChamado } from '../types';

export interface CriarChamadoDTO {
  titulo: string;
  usuario: number;
  status?: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  descricao?: string;
  anexos?: File[]; // Arquivos anexos para a mensagem inicial
}

export interface AtualizarChamadoDTO {
  titulo?: string;
  status?: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  descricao?: string;
}

export interface EnviarMensagemDTO {
  mensagem: string;
  anexos?: File[]; // Arquivos anexos para a mensagem
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

  // Criar chamado (com suporte a anexos)
  criar: async (chamado: CriarChamadoDTO): Promise<Chamado> => {
    const formData = new FormData();
    
    // Campos obrigatórios
    formData.append('titulo', chamado.titulo);
    
    // Campos opcionais
    if (chamado.descricao) {
      formData.append('descricao', chamado.descricao);
    }
    
    if (chamado.status) {
      formData.append('status', chamado.status);
    }

    // Adicionar anexos se houver
    // IMPORTANTE: Use o mesmo nome 'anexos' para todos os arquivos (sem colchetes)
    if (chamado.anexos && chamado.anexos.length > 0) {
      chamado.anexos.forEach((arquivo) => {
        formData.append('anexos', arquivo);
      });
    }

    // NÃO definir Content-Type manualmente - o axios detecta automaticamente FormData
    // O header x-user-id é adicionado automaticamente pelo interceptor
    const response = await api.post('/api/chamados', formData);
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

  // Enviar mensagem no chat do chamado
  enviarMensagem: async (chamadoId: number, dados: EnviarMensagemDTO): Promise<MensagemChamado> => {
    const formData = new FormData();
    formData.append('mensagem', dados.mensagem);

    // Adicionar anexos se houver
    // IMPORTANTE: Use o mesmo nome 'anexos' para todos os arquivos
    if (dados.anexos && dados.anexos.length > 0) {
      dados.anexos.forEach((arquivo) => {
        formData.append('anexos', arquivo);
      });
    }

    // NÃO definir Content-Type manualmente - o axios detecta automaticamente FormData
    const response = await api.post(`/api/chamados/${chamadoId}/mensagens`, formData);
    return response.data;
  },
};






