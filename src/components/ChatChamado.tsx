import React, { useEffect, useState, useRef } from 'react';
import { chamadosService } from '../services/chamadosService';
import { Chamado, MensagemChamado, Usuario } from '../types';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { AnexoImagem } from './AnexoImagem';
import { usuariosService } from '../services/usuariosService';
import { SeletorAnexo } from './SeletorAnexo';

interface ChatChamadoProps {
  chamadoId: number;
  onClose?: () => void;
  refreshKey?: number; // Chave para forçar recarregamento
  onSelecionarChamado?: (chamadoId: number) => void; // Callback para selecionar outro chamado
}

export const ChatChamado: React.FC<ChatChamadoProps> = ({ chamadoId, onClose, refreshKey, onSelecionarChamado }) => {
  const { usuario } = useAuth();
  const { setIsChatOpen } = useChat();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [usuarioCompleto, setUsuarioCompleto] = useState<Usuario | null>(null);
  const [chamadosUsuario, setChamadosUsuario] = useState<Chamado[]>([]);
  const [loadingChamados, setLoadingChamados] = useState(false);
  const [showSeletorAnexo, setShowSeletorAnexo] = useState(false);

  // Verificar se o usuário pode enviar mensagens no chat
  const podeEnviarMensagem = () => {
    if (!usuario) return false;
    const tipoNormalizado = String(usuario.tipo).trim().toLowerCase();
    
    // Construtora: apenas leitura (não pode enviar mensagens)
    if (tipoNormalizado === 'construtora') {
      return false;
    }
    
    // Gestão Técnica: pode enviar mensagens em qualquer chamado
    if (tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica') {
      return true;
    }
    
    // Administrador: pode enviar mensagens
    if (tipoNormalizado === 'administrador') {
      return true;
    }
    
    // Morador: pode enviar mensagens apenas em seus próprios chamados
    if (tipoNormalizado === 'morador') {
      return chamado ? chamado.usuario === usuario.id : false;
    }
    
    return false;
  };
  const [novaMensagem, setNovaMensagem] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosPreview, setAnexosPreview] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<number, string>>({});
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMensagensLengthRef = useRef<number>(0);
  const prevLoadingRef = useRef<boolean>(true);

  const carregarChamado = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await chamadosService.buscarPorId(chamadoId);
      
      // Validar permissão de acesso ao chamado
      if (usuario) {
        const tipoNormalizado = String(usuario.tipo).trim().toLowerCase();
        
        // Morador só pode ver seus próprios chamados
        if (tipoNormalizado === 'morador' && dados.usuario !== usuario.id) {
          setError('Você não tem permissão para visualizar este chamado.');
          setChamado(null);
          return;
        }
        
        // Gestão Técnica e Construtora podem ver todos os chamados
        // (não precisa validar)
      }
      
      setChamado(dados);
      
      // Carregar dados completos do usuário que criou o chamado
      if (dados.usuario) {
        // Se já tiver os dados completos com telefone/unidade, usar eles
        if (dados.usuario_dados && dados.usuario_dados.telefone !== undefined) {
          setUsuarioCompleto({
            id: dados.usuario_dados.id,
            nome: dados.usuario_dados.nome,
            tipo: dados.usuario_dados.tipo,
            telefone: dados.usuario_dados.telefone || null,
            telefone2: dados.usuario_dados.telefone2 || null,
            unidade: dados.usuario_dados.unidade || null
          });
        } else {
          // Buscar dados completos do usuário
          try {
            const usuarioData = await usuariosService.buscarPorId(dados.usuario);
            setUsuarioCompleto(usuarioData);
          } catch (err) {
            console.error('Erro ao buscar dados completos do usuário:', err);
            // Se falhar, usar os dados básicos que temos
            if (dados.usuario_dados) {
              setUsuarioCompleto({
                id: dados.usuario_dados.id,
                nome: dados.usuario_dados.nome,
                tipo: dados.usuario_dados.tipo,
                telefone: null,
                telefone2: null,
                unidade: null
              });
            }
          }
        }
      }
      
      // Carregar nomes dos usuários das mensagens
      if (dados.mensagens && dados.mensagens.length > 0) {
        const idsUnicos = new Set<number>();
        dados.mensagens.forEach(msg => {
          if (!msg.autor_dados) {
            idsUnicos.add(msg.autor_id);
          }
        });
        
        // Buscar nomes dos usuários que não vieram nos dados
        if (idsUnicos.size > 0) {
          const nomes: Record<number, string> = {};
          await Promise.all(
            Array.from(idsUnicos).map(async (id) => {
              try {
                const usuarioData = await usuariosService.buscarPorId(id);
                nomes[id] = usuarioData.nome;
              } catch (err) {
                console.error(`Erro ao buscar usuário ${id}:`, err);
                nomes[id] = `Usuário ${id}`;
              }
            })
          );
          setNomesUsuarios(prev => ({ ...prev, ...nomes }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar chat');
      console.error('Erro ao carregar chamado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chamadoId) {
      carregarChamado();
      setIsChatOpen(true);
    }
    return () => {
      setIsChatOpen(false);
    };
  }, [chamadoId, refreshKey, setIsChatOpen]);

  // Renovação automática de URLs a cada 6 dias (antes de expirar em 7 dias)
  useEffect(() => {
    if (!chamadoId) return;

    const interval = setInterval(() => {
      carregarChamado();
    }, 6 * 24 * 60 * 60 * 1000); // 6 dias

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamadoId]);

  // Função para renovar URLs quando necessário
  const renovarUrls = async () => {
    try {
      const dados = await chamadosService.buscarPorId(chamadoId);
      setChamado(dados);
    } catch (err: any) {
      console.error('Erro ao renovar URLs:', err);
      throw err;
    }
  };

  // Scroll para última mensagem apenas ao carregar o chat ou quando chegar mensagem nova (não ao renovar URLs/imagens)
  useEffect(() => {
    const mensagensLength = chamado?.mensagens?.length ?? 0;
    const acabouDeCarregar = prevLoadingRef.current && !loading;
    const temNovaMensagem = mensagensLength > prevMensagensLengthRef.current;
    prevLoadingRef.current = loading;
    prevMensagensLengthRef.current = mensagensLength;

    if (!loading && chamado && (acabouDeCarregar || temNovaMensagem)) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [chamado?.mensagens?.length, loading, chamado]);

  // Carregar chamados do usuário quando o modal for aberto
  useEffect(() => {
    const carregarChamadosUsuario = async () => {
      if (showUsuarioModal && chamado?.usuario) {
        try {
          setLoadingChamados(true);
          const chamadosData = await chamadosService.listar({ usuario: chamado.usuario });
          
          // Ordenar por data de criação (mais recentes primeiro)
          const chamadosOrdenados = chamadosData.sort((a, b) => {
            const dataA = a.created_at || a.data_criacao || '';
            const dataB = b.created_at || b.data_criacao || '';
            if (!dataA && !dataB) return 0;
            if (!dataA) return 1;
            if (!dataB) return -1;
            return new Date(dataB).getTime() - new Date(dataA).getTime();
          });
          
          setChamadosUsuario(chamadosOrdenados);
        } catch (err) {
          console.error('Erro ao carregar chamados do usuário:', err);
          setChamadosUsuario([]);
        } finally {
          setLoadingChamados(false);
        }
      } else {
        setChamadosUsuario([]);
      }
    };

    carregarChamadosUsuario();
  }, [showUsuarioModal, chamado?.usuario]);

  const handleFileSelect = (files: File[]) => {
    const validFiles: File[] = [];

    files.forEach((file) => {
      validFiles.push(file);

      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAnexosPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setAnexosPreview(prev => [...prev, '']);
      }
    });

    setAnexos(prev => [...prev, ...validFiles].slice(0, 10)); // Máximo 10 arquivos
  };

  const removerAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
    setAnexosPreview(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEnviar = async () => {
    // Validar permissão antes de enviar
    if (!podeEnviarMensagem()) {
      alert('Você não tem permissão para enviar mensagens neste chamado.');
      return;
    }

    if (!novaMensagem.trim() && anexos.length === 0) {
      alert('Digite uma mensagem ou anexe um arquivo');
      return;
    }

    try {
      setEnviando(true);
      const mensagemEnviada = await chamadosService.enviarMensagem(chamadoId, {
        mensagem: novaMensagem.trim() || '',
        anexos: anexos && anexos.length > 0 ? anexos : undefined
      });

      // Adicionar mensagem à lista local
      if (chamado) {
        setChamado({
          ...chamado,
          mensagens: [...(chamado.mensagens || []), mensagemEnviada],
          updated_at: new Date().toISOString()
        });
      }

      // Limpar formulário
      setNovaMensagem('');
      setAnexos([]);
      setAnexosPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      alert(`Erro ao enviar mensagem: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    const statusMap: Record<string, { label: string; className: string }> = {
      resolvido: { label: 'RESOLVIDO', className: 'bg-emerald-500 text-white' },
      aberto: { label: 'ABERTO', className: 'bg-red-500/90 text-white' },
      em_andamento: { label: 'EM ANDAMENTO', className: 'bg-amber-500/90 text-white' },
      cancelado: { label: 'CANCELADO', className: 'bg-gray-500 text-white' }
    };
    const s = statusMap[chamado?.status || ''] || { label: String(chamado?.status || '').toUpperCase(), className: 'bg-gray-500 text-white' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
        {s.label}
      </span>
    );
  };

  const isMinhaMensagem = (mensagem: MensagemChamado) => {
    return mensagem.autor_id === usuario?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Carregando chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400">Erro: {error}</p>
        <button
          onClick={carregarChamado}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!chamado) {
    return (
      <div className="p-4 text-gray-400">Chamado não encontrado</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-white/10 shadow-xl">
      {/* Header do Chat */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <div 
            className="cursor-pointer group"
            onClick={() => setShowUsuarioModal(true)}
            title="Clique para ver informações do usuário"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-white truncate">{chamado.titulo}</h3>
              {getStatusBadge()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Mais opções"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            {showHeaderMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHeaderMenu(false)} />
                <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-20">
                  <button
                    type="button"
                    onClick={() => { setShowUsuarioModal(true); setShowHeaderMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10"
                  >
                    Informações do usuário
                  </button>
                  {onClose && (
                    <button
                      type="button"
                      onClick={() => { onClose(); setShowHeaderMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10"
                    >
                      Fechar chat
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Informações do Usuário */}
      {showUsuarioModal && (usuarioCompleto || chamado.usuario_dados) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUsuarioModal(false)}>
          <div className="bg-gray-700 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-600" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Informações do Usuário</h3>
              <button
                onClick={() => setShowUsuarioModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informações do Usuário */}
              <div className="space-y-3 pb-4 border-b border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                  <p className="text-white font-medium">
                    {usuarioCompleto?.nome || chamado.usuario_dados?.nome || '-'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Unidade</label>
                  <p className="text-white">{usuarioCompleto?.unidade || chamado.usuario_dados?.unidade || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                  <p className="text-white">{usuarioCompleto?.telefone || chamado.usuario_dados?.telefone || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone 2</label>
                  <p className="text-white">{usuarioCompleto?.telefone2 || chamado.usuario_dados?.telefone2 || '-'}</p>
                </div>
              </div>

              {/* Lista de Chamados do Usuário */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Chamados Criados</h4>
                {loadingChamados ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Carregando chamados...</p>
                  </div>
                ) : chamadosUsuario.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Nenhum chamado encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {chamadosUsuario.map((chamadoItem) => {
                      const formatarData = (data?: string) => {
                        if (!data) return '-';
                        try {
                          return new Date(data).toLocaleDateString('pt-BR', {
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

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'aberto':
                            return 'bg-red-600 text-white';
                          case 'em_andamento':
                            return 'bg-yellow-600 text-white';
                          case 'resolvido':
                            return 'bg-green-600 text-white';
                          case 'cancelado':
                            return 'bg-gray-600 text-white';
                          default:
                            return 'bg-gray-600 text-white';
                        }
                      };

                      const getStatusLabel = (status: string) => {
                        const labels: Record<string, string> = {
                          aberto: 'Aberto',
                          em_andamento: 'Em Andamento',
                          resolvido: 'Resolvido',
                          cancelado: 'Cancelado'
                        };
                        return labels[status] || status;
                      };

                      return (
                        <div
                          key={chamadoItem.id}
                          onClick={() => {
                            if (onSelecionarChamado && chamadoItem.id !== chamadoId) {
                              setShowUsuarioModal(false);
                              onSelecionarChamado(chamadoItem.id);
                            }
                          }}
                          className={`p-3 bg-gray-800 rounded-lg border ${
                            chamadoItem.id === chamadoId
                              ? 'border-blue-500 bg-gray-750'
                              : 'border-gray-600 hover:border-gray-500 cursor-pointer'
                          } transition-colors`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-white">
                                  {chamadoItem.id === chamadoId && (
                                    <span className="text-blue-400 mr-2">●</span>
                                  )}
                                  {chamadoItem.titulo}
                                </h5>
                              </div>
                              {chamadoItem.descricao && (
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                  {chamadoItem.descricao}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{formatarData(chamadoItem.created_at || chamadoItem.data_criacao)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chamadoItem.status)}`}>
                                  {getStatusLabel(chamadoItem.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área de Mensagens - estilo referência */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 bg-gray-900">
        {chamado.mensagens && chamado.mensagens.length > 0 ? (
          chamado.mensagens.map((mensagem) => {
            const isEventoSistema = mensagem.mensagem && mensagem.mensagem.startsWith('Status alterado');
            if (isEventoSistema) {
              return (
                <div key={mensagem.id} className="flex justify-center">
                  <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl px-4 py-2 max-w-[85%]">
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-amber-400">Sistema</span>
                      <span className="text-xs text-amber-500/70">{formatarData(mensagem.created_at)}</span>
                    </div>
                    <p className="text-sm text-amber-200 text-center whitespace-pre-wrap break-words">{mensagem.mensagem}</p>
                  </div>
                </div>
              );
            }
            const minhaMensagem = isMinhaMensagem(mensagem);
            const nomeRemetente = mensagem.autor_dados?.nome || nomesUsuarios[mensagem.autor_id] || `Usuário ${mensagem.autor_id}`;
            const dataHora = formatarData(mensagem.created_at);
            return (
              <div
                key={mensagem.id}
                className={`flex ${minhaMensagem ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] flex flex-col ${minhaMensagem ? 'items-end' : 'items-start'}`}>
                  {/* Nome e data: esquerda = nome + data acima; direita = data à esquerda, Você à direita */}
                  <div className={`flex items-center gap-2 mb-1.5 w-full ${minhaMensagem ? 'justify-end' : 'justify-start'}`}>
                    {minhaMensagem ? (
                      <>
                        <span className="text-xs text-gray-500">{dataHora}</span>
                        <span className="text-sm font-medium text-gray-400">Você</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-white">{nomeRemetente}</span>
                        <span className="text-xs text-gray-500">{dataHora}</span>
                      </>
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 w-full ${
                      minhaMensagem
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-md'
                        : 'bg-gray-700/90 text-gray-100 rounded-tl-md'
                    }`}
                  >
                    {mensagem.mensagem && (
                      <p className="text-sm whitespace-pre-wrap break-words">{mensagem.mensagem}</p>
                    )}
                    {mensagem.anexos && mensagem.anexos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {mensagem.anexos.map((anexo) => (
                          <AnexoImagem
                            key={anexo.id}
                            anexo={anexo}
                            onRenovarUrls={renovarUrls}
                            variant="chat"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">
              {podeEnviarMensagem()
                ? 'Nenhuma mensagem ainda. Inicie a conversa!'
                : 'Nenhuma mensagem neste chamado.'}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview de Anexos */}
      {anexos.length > 0 && (
        <div className="px-4 py-2 border-t border-white/10 bg-gray-800/50">
          <div className="flex flex-wrap gap-2">
            {anexos.map((arquivo, index) => (
              <div
                key={index}
                className="relative bg-gray-700/80 rounded-xl p-2 border border-white/10"
              >
                {anexosPreview[index] ? (
                  <img
                    src={anexosPreview[index]}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-600/50 rounded-lg">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removerAnexo(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
                <p className="text-xs text-gray-400 mt-1 truncate max-w-[64px]">{arquivo.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input de Mensagem - estilo referência */}
      <div className="p-4 border-t border-white/10 bg-gray-900 rounded-b-xl">
        {!podeEnviarMensagem() ? (
          <div className="bg-gray-800/80 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">
                {usuario?.tipo === 'construtora'
                  ? 'Você tem permissão apenas para visualizar este chat. Não é possível enviar mensagens.'
                  : 'Você não tem permissão para enviar mensagens neste chamado.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setShowSeletorAnexo(true)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                title="Anexar arquivo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8h-16" />
                </svg>
              </button>
              <textarea
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEnviar();
                  }
                }}
                placeholder="Escreva sua mensagem..."
                rows={1}
                className="flex-1 min-h-[44px] max-h-32 bg-gray-700/90 text-white placeholder-gray-500 px-4 py-3 rounded-2xl border border-white/10 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none text-sm"
              />
              <button
                type="button"
                onClick={handleEnviar}
                disabled={enviando || (!novaMensagem.trim() && anexos.length === 0)}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span>{enviando ? 'Enviando...' : 'Enviar'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">PDF, JPG, PNG até 10MB</p>
              <div className="flex items-center gap-1">
                <button type="button" className="p-1.5 text-gray-500 hover:text-gray-400 rounded" title="Configurações">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 2.31.501 2.31 1.066 0 1.724-1.174 2.166-2.54 2.166-1.366 0-2.54-.442-2.54-2.166 0-.565.767-2.006 2.31-1.066 1.171.715 2.573.69 2.573-1.066 0-1.756-2.924-1.756-3.35 0a1.724 1.724 0 01-2.573-1.066c-.94 1.543-2.31.501-2.31-1.066 0-1.724 1.174-2.166 2.54-2.166 1.366 0 2.54.442 2.54 2.166 0 .565-.767 2.006-2.31 1.066-1.171-.715-2.573-.69-2.573 1.066z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 text-gray-500 hover:text-gray-400 rounded" title="Ações">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Seletor de Anexo */}
      {showSeletorAnexo && (
        <SeletorAnexo
          onFileSelect={handleFileSelect}
          onClose={() => setShowSeletorAnexo(false)}
          maxFiles={10}
          accept="image/*,application/pdf"
        />
      )}
    </div>
  );
};

