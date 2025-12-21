import api from './api';
import { Contato, FiltrosContatos } from '../types';

export const contatosService = {
  // Listar contatos (com filtros opcionais)
  listar: async (filtros?: FiltrosContatos): Promise<Contato[]> => {
    const params = new URLSearchParams();
    if (filtros?.id_fornecedor) {
      params.append('id_fornecedor', filtros.id_fornecedor.toString());
    }
    if (filtros?.id_empreendimento) {
      params.append('id_empreendimento', filtros.id_empreendimento.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/contatos?${queryString}` : '/contatos';
    const response = await api.get(url);
    return response.data;
  },

  // Buscar contato por ID
  buscarPorId: async (id: number): Promise<Contato> => {
    const response = await api.get(`/contatos/${id}`);
    return response.data;
  },

  // Criar contato
  criar: async (contato: Omit<Contato, 'id'>): Promise<Contato> => {
    const response = await api.post('/contatos', contato);
    return response.data;
  },

  // Atualizar contato
  atualizar: async (id: number, contato: Partial<Contato>): Promise<Contato> => {
    const response = await api.put(`/contatos/${id}`, contato);
    return response.data;
  },

  // Remover contato
  remover: async (id: number): Promise<void> => {
    await api.delete(`/contatos/${id}`);
  },
};






