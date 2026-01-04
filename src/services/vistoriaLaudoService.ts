import api from './api';
import { Laudo, CriarLaudoDTO, AtualizarLaudoDTO, EnviarMensagemLaudoDTO, FiltrosLaudos, MensagemLaudo, ArquivoLaudo } from '../types';

export const vistoriaLaudoService = {
  // Listar laudos (com filtros opcionais)
  listar: async (filtros?: FiltrosLaudos): Promise<Laudo[]> => {
    const params = new URLSearchParams();
    if (filtros?.chamado_id) {
      params.append('chamado_id', filtros.chamado_id.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/vistoria-laudos?${queryString}` : '/api/vistoria-laudos';
    const response = await api.get(url);
    return response.data;
  },

  // Buscar laudo por ID (com mensagens e arquivos)
  buscarPorId: async (id: string): Promise<Laudo> => {
    const response = await api.get(`/api/vistoria-laudos/${id}`);
    return response.data;
  },

  // Criar laudo
  criar: async (laudo: CriarLaudoDTO): Promise<Laudo> => {
    const response = await api.post('/api/vistoria-laudos', {
      titulo: laudo.titulo,
      chamado_id: laudo.chamado_id
    });
    return response.data;
  },

  // Atualizar laudo
  atualizar: async (id: string, laudo: AtualizarLaudoDTO): Promise<Laudo> => {
    const response = await api.put(`/api/vistoria-laudos/${id}`, laudo);
    return response.data;
  },

  // Deletar laudo
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/vistoria-laudos/${id}`);
  },

  // Enviar mensagem no chat do laudo
  enviarMensagem: async (laudoId: string, dados: EnviarMensagemLaudoDTO): Promise<MensagemLaudo> => {
    const formData = new FormData();
    formData.append('mensagem', dados.mensagem);

    // Adicionar arquivos se houver
    if (dados.arquivos && dados.arquivos.length > 0) {
      dados.arquivos.forEach((arquivo) => {
        formData.append('arquivos', arquivo);
      });
    }

    const response = await api.post(`/api/vistoria-laudos/${laudoId}/mensagens`, formData);
    return response.data;
  },

  // Listar mensagens de um laudo
  listarMensagens: async (laudoId: string): Promise<MensagemLaudo[]> => {
    const response = await api.get(`/api/vistoria-laudos/${laudoId}/mensagens`);
    return response.data;
  },

  // Upload de arquivos diretamente ao laudo
  uploadArquivos: async (laudoId: string, arquivos: File[]): Promise<{ arquivos: ArquivoLaudo[]; erros?: string[] }> => {
    const formData = new FormData();
    arquivos.forEach((arquivo) => {
      formData.append('arquivos', arquivo);
    });

    const response = await api.post(`/api/vistoria-laudos/${laudoId}/arquivos`, formData);
    return response.data;
  },

  // Listar arquivos de um laudo
  listarArquivos: async (laudoId: string, mensagemId?: string): Promise<ArquivoLaudo[]> => {
    const params = new URLSearchParams();
    if (mensagemId) {
      params.append('mensagem_id', mensagemId);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/vistoria-laudos/${laudoId}/arquivos?${queryString}` : `/api/vistoria-laudos/${laudoId}/arquivos`;
    const response = await api.get(url);
    return response.data;
  },

  // Obter URL de download de um arquivo
  obterUrlDownload: async (arquivoId: string, expiresIn: number = 3600): Promise<string> => {
    const response = await api.get(`/api/vistoria-laudos/arquivos/${arquivoId}/download?expires_in=${expiresIn}`);
    return response.data.url;
  },

  // Deletar arquivo
  deletarArquivo: async (arquivoId: string): Promise<void> => {
    await api.delete(`/api/vistoria-laudos/arquivos/${arquivoId}`);
  },
};

