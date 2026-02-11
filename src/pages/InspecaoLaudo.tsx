import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vistoriaLaudoService } from '../services/vistoriaLaudoService';
import { chamadosService } from '../services/chamadosService';
import { Laudo, Chamado } from '../types';
import { ChatLaudo } from '../components/ChatLaudo';
import { AnexoImagem } from '../components/AnexoImagem';

const InspecaoLaudo = () => {
  const { usuario, hasPermission } = useAuth();
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [laudoSelecionado, setLaudoSelecionado] = useState<string | null>(null);
  const [chatRefreshKey, setChatRefreshKey] = useState(0);
  const [filtroChamado, setFiltroChamado] = useState<number | ''>('');
  
  // Modal de criação
  const [showModalCriar, setShowModalCriar] = useState(false);
  const [showModalVisualizar, setShowModalVisualizar] = useState(false);
  const [laudoVisualizar, setLaudoVisualizar] = useState<Laudo | null>(null);
  const [loadingLaudo, setLoadingLaudo] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    chamado_id: ''
  });
  const [arquivosCriacao, setArquivosCriacao] = useState<File[]>([]);
  const [arquivosPreview, setArquivosPreview] = useState<string[]>([]);

  // Verificar se usuário é morador e bloquear acesso
  useEffect(() => {
    if (usuario?.tipo === 'morador') {
      setError('Acesso negado. Esta página não está disponível para seu tipo de usuário.');
      setLoading(false);
      return;
    }
  }, [usuario]);

  useEffect(() => {
    // Não carregar dados se for morador
    if (usuario?.tipo === 'morador') {
      return;
    }
    carregarDados();
  }, [filtroChamado, usuario]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar chamados para o select
      const filtrosChamados: any = {};
      if (usuario) {
        const tipoNormalizado = String(usuario.tipo).trim().toLowerCase();
        const podeVerTodos = tipoNormalizado === 'construtora' || 
                             tipoNormalizado === 'gestão tecnica' || 
                             tipoNormalizado === 'gestao tecnica' ||
                             tipoNormalizado === 'administrador';
        if (!podeVerTodos) {
          filtrosChamados.usuario = usuario.id;
        }
      }
      const chamadosData = await chamadosService.listar(Object.keys(filtrosChamados).length > 0 ? filtrosChamados : undefined);
      setChamados(chamadosData);

      // Carregar laudos
      const filtrosLaudos: any = {};
      if (filtroChamado) {
        filtrosLaudos.chamado_id = Number(filtroChamado);
      }
      const laudosData = await vistoriaLaudoService.listar(Object.keys(filtrosLaudos).length > 0 ? filtrosLaudos : undefined);
      
      // Ordenar por data de atualização (mais recentes primeiro)
      const laudosOrdenados = laudosData.sort((a, b) => {
        const dataA = a.updated_at || a.created_at || '';
        const dataB = b.updated_at || b.created_at || '';
        if (!dataA && !dataB) return 0;
        if (!dataA) return 1;
        if (!dataB) return -1;
        return new Date(dataB).getTime() - new Date(dataA).getTime();
      });
      
      setLaudos(laudosOrdenados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarLaudo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      alert('O título é obrigatório');
      return;
    }

    if (!formData.chamado_id) {
      alert('Selecione um chamado');
      return;
    }

    try {
      setSubmitting(true);
      const novoLaudo = await vistoriaLaudoService.criar({
        titulo: formData.titulo.trim(),
        chamado_id: Number(formData.chamado_id)
      });

      // Se houver arquivos, fazer upload deles
      if (arquivosCriacao.length > 0) {
        try {
          await vistoriaLaudoService.uploadArquivos(novoLaudo.id, arquivosCriacao);
        } catch (err: any) {
          console.error('Erro ao fazer upload dos arquivos:', err);
          alert(`Laudo criado, mas houve erro ao anexar arquivos: ${err.message || 'Erro desconhecido'}`);
        }
      }

      // Abrir o chat do novo laudo
      setLaudoSelecionado(novoLaudo.id);
      setChatRefreshKey(prev => prev + 1);
      
      // Fechar modal e limpar formulário
      setShowModalCriar(false);
      setFormData({ titulo: '', chamado_id: '' });
      setArquivosCriacao([]);
      setArquivosPreview([]);
      
      // Recarregar lista
      await carregarDados();
    } catch (err: any) {
      alert(`Erro ao criar laudo: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao criar laudo:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChangeCriacao = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`O arquivo ${file.name} excede 10MB e será ignorado`);
        return;
      }

      validFiles.push(file);

      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setArquivosPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setArquivosPreview(prev => [...prev, '']);
      }
    });

    setArquivosCriacao(prev => [...prev, ...validFiles].slice(0, 10)); // Máximo 10 arquivos
  };

  const removerArquivoCriacao = (index: number) => {
    setArquivosCriacao(prev => prev.filter((_, i) => i !== index));
    setArquivosPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeletarLaudo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este laudo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await vistoriaLaudoService.deletar(id);
      
      // Se o laudo deletado estava selecionado, fechar o chat
      if (laudoSelecionado === id) {
        setLaudoSelecionado(null);
      }
      
      // Recarregar lista
      await carregarDados();
    } catch (err: any) {
      alert(`Erro ao deletar laudo: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao deletar laudo:', err);
    }
  };

  const formatarData = (data?: string) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return data;
    }
  };

  const podeCriarLaudo = () => {
    if (!usuario) return false;
    return hasPermission('criar') || hasPermission('editar');
  };

  const podeDeletarLaudo = () => {
    if (!usuario) return false;
    return hasPermission('deletar');
  };

  const handleVisualizarLaudo = async (laudo: Laudo) => {
    try {
      setLoadingLaudo(true);
      const laudoCompleto = await vistoriaLaudoService.buscarPorId(laudo.id);
      setLaudoVisualizar(laudoCompleto);
      setShowModalVisualizar(true);
    } catch (err: any) {
      alert(`Erro ao carregar detalhes do laudo: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao carregar laudo:', err);
    } finally {
      setLoadingLaudo(false);
    }
  };

  const handleNovoLaudo = () => {
    setFormData({ titulo: '', chamado_id: '' });
    setArquivosCriacao([]);
    setArquivosPreview([]);
    setShowModalCriar(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  // Bloquear acesso para moradores
  if (usuario?.tipo === 'morador') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Governança técnica</h1>
        <p className="text-gray-400 mb-6">Gerenciamento de vistorias e laudos técnicos</p>
        <div className="bg-red-900/50 border border-red-700 rounded-lg shadow-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-300">
            Esta página não está disponível para seu tipo de usuário.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Governança técnica</h1>
      <p className="text-gray-400 mb-6">Gerenciamento de vistorias e laudos técnicos</p>
      
      <div>
        {/* Filtros e Ações */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filtrar por Chamado
              </label>
              <select
                value={filtroChamado}
                onChange={(e) => setFiltroChamado(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos os chamados</option>
                {chamados.map((chamado) => (
                  <option key={chamado.id} value={chamado.id}>
                    #{chamado.id} - {chamado.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {podeCriarLaudo() && (
            <button
              onClick={handleNovoLaudo}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Laudo
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400">Erro: {error}</p>
            <button
              onClick={carregarDados}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista de Laudos */}
        {laudos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">Nenhum laudo encontrado</p>
            {podeCriarLaudo() && (
              <p className="text-sm">Clique em "Novo Laudo" para criar o primeiro laudo</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {laudos.map((laudo) => (
              <div
                key={laudo.id}
                onClick={() => handleVisualizarLaudo(laudo)}
                className="bg-gray-800 border border-gray-600 rounded-lg p-4 transition-all hover:bg-gray-750 hover:border-blue-500 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate mb-2">
                      {laudo.titulo}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>
                        Chamado: <span className="text-gray-300">#{laudo.chamado_id}</span>
                      </span>
                      <span>•</span>
                      <span>{formatarData(laudo.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {podeDeletarLaudo() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletarLaudo(laudo.id);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Excluir laudo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      {showModalCriar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Novo Laudo</h3>
                    <p className="text-gray-400 text-sm mt-1">Preencha os dados para criar um novo laudo</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModalCriar(false);
                    setFormData({ titulo: '', chamado_id: '' });
                    setArquivosCriacao([]);
                    setArquivosPreview([]);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Fechar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6">
            <form id="form-laudo" onSubmit={handleCriarLaudo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Ex: Laudo de Vistoria - Apartamento 101"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chamado <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.chamado_id}
                  onChange={(e) => setFormData({ ...formData, chamado_id: e.target.value })}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                >
                  <option value="">Selecione um chamado</option>
                  {chamados.map((chamado) => (
                    <option key={chamado.id} value={chamado.id}>
                      #{chamado.id} - {chamado.titulo} ({chamado.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Anexar Arquivos (Opcional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChangeCriacao}
                  accept="image/*,application/pdf"
                  disabled={submitting}
                  className="
                    block w-full text-sm text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    file:hover:bg-blue-700
                    file:cursor-pointer
                    file:disabled:opacity-50 file:disabled:cursor-not-allowed
                    disabled:opacity-50 disabled:cursor-not-allowed
                    bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50
                  "
                />
                <p className="text-xs text-gray-400 mt-1">
                  Máximo 10 arquivos, 10MB cada. Formatos: imagens e PDF
                </p>
              </div>

              {/* Preview dos arquivos selecionados */}
              {arquivosCriacao.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Arquivos Selecionados ({arquivosCriacao.length})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {arquivosCriacao.map((arquivo, index) => (
                      <div
                        key={index}
                        className="relative bg-gray-800 rounded-lg p-2 border border-gray-600"
                      >
                        {arquivosPreview[index] ? (
                          <img
                            src={arquivosPreview[index]}
                            alt="Preview"
                            className="w-full h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removerArquivoCriacao(index)}
                          disabled={submitting}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-400 mt-1 truncate">{arquivo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
            </div>

            {/* Footer do Modal */}
            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModalCriar(false);
                    setFormData({ titulo: '', chamado_id: '' });
                    setArquivosCriacao([]);
                    setArquivosPreview([]);
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="form-laudo"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                >
                  {submitting ? 'Criando...' : 'Criar Laudo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualizar Laudo */}
      {showModalVisualizar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
            {loadingLaudo ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-gray-400">Carregando...</div>
              </div>
            ) : laudoVisualizar ? (
              <>
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-white truncate">
                      {laudoVisualizar.titulo}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-gray-400 text-sm">
                        Chamado: <span className="text-gray-300">#{laudoVisualizar.chamado_id}</span>
                      </span>
                      {laudoVisualizar.created_at && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 text-sm">{formatarData(laudoVisualizar.created_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => {
                      setShowModalVisualizar(false);
                      setLaudoSelecionado(laudoVisualizar.id);
                      setChatRefreshKey(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    title="Abrir chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </button>
                  <button
                    onClick={() => {
                      setShowModalVisualizar(false);
                      setLaudoVisualizar(null);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Fechar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Informações do Laudo */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Informações</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chamado:</span>
                    <span className="text-white font-medium">#{laudoVisualizar.chamado_id}</span>
                  </div>
                  {laudoVisualizar.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Criado em:</span>
                      <span className="text-white">{formatarData(laudoVisualizar.created_at)}</span>
                    </div>
                  )}
                  {laudoVisualizar.updated_at && laudoVisualizar.updated_at !== laudoVisualizar.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Atualizado em:</span>
                      <span className="text-white">{formatarData(laudoVisualizar.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arquivos do Laudo */}
              {laudoVisualizar.arquivos && laudoVisualizar.arquivos.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-400 mb-4">Anexos ({laudoVisualizar.arquivos.length})</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {laudoVisualizar.arquivos.map((arquivo) => {
                      const anexo = {
                        id: parseInt(arquivo.id.replace(/-/g, '').substring(0, 10)) || 0,
                        url: arquivo.url || '',
                        tipo: arquivo.file_type
                      };
                      return (
                        <div
                          key={arquivo.id}
                          className="relative rounded-lg"
                        >
                          <AnexoImagem
                            anexo={anexo}
                            onRenovarUrls={async () => {
                              if (!arquivo.url) {
                                try {
                                  const novaUrl = await vistoriaLaudoService.obterUrlDownload(arquivo.id);
                                  arquivo.url = novaUrl;
                                  setLaudoVisualizar({ ...laudoVisualizar });
                                } catch (err) {
                                  console.error('Erro ao obter URL:', err);
                                }
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {podeDeletarLaudo() && (
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja deletar este laudo?')) {
                        handleDeletarLaudo(laudoVisualizar.id);
                        setShowModalVisualizar(false);
                        setLaudoVisualizar(null);
                      }
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Deletar
                  </button>
                )}
              </div>
            </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Chat do Laudo Selecionado */}
      {laudoSelecionado && (
        <div className="mt-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Chat do Laudo</h2>
            <button
              onClick={() => {
                setLaudoSelecionado(null);
                carregarDados();
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              title="Fechar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[600px]">
            <ChatLaudo 
              laudoId={laudoSelecionado}
              refreshKey={chatRefreshKey}
              onSelecionarLaudo={(novoLaudoId) => {
                setLaudoSelecionado(novoLaudoId);
                setChatRefreshKey(prev => prev + 1);
              }}
              onClose={() => {
                setLaudoSelecionado(null);
                carregarDados();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InspecaoLaudo;
