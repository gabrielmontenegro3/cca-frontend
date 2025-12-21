import api from './api';
import { Empreendimento } from '../types';

export const empreendimentosService = {
  // Listar todos os empreendimentos
  listar: async (): Promise<Empreendimento[]> => {
    const response = await api.get('/empreendimentos');
    return response.data;
  },

  // Buscar empreendimento por ID (com unidades e contato do síndico)
  buscarPorId: async (id: number): Promise<Empreendimento> => {
    const response = await api.get(`/empreendimentos/${id}`);
    return response.data;
  },

  // Criar empreendimento
  criar: async (empreendimento: Omit<Empreendimento, 'id' | 'unidades' | 'contato_sindico'>): Promise<Empreendimento> => {
    const response = await api.post('/empreendimentos', empreendimento);
    return response.data;
  },

  // Atualizar empreendimento
  atualizar: async (id: number, empreendimento: Partial<Empreendimento>): Promise<Empreendimento> => {
    const response = await api.put(`/empreendimentos/${id}`, empreendimento);
    return response.data;
  },
};






