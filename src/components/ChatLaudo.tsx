import React, { useEffect, useState, useRef } from 'react';
import { vistoriaLaudoService } from '../services/vistoriaLaudoService';
import { Laudo, MensagemLaudo } from '../types';
import { useAuth } from '../context/AuthContext';
import { AnexoImagem } from './AnexoImagem';
import { usuariosService } from '../services/usuariosService';

interface ChatLaudoProps {
  laudoId: string;
  onClose?: () => void;
  refreshKey?: number; // Chave para forçar recarregamento
  onSelecionarLaudo?: (laudoId: string) => void; // Callback para selecionar outro laudo
}

export const ChatLaudo: React.FC<ChatLaudoProps> = ({ laudoId, onClose, refreshKey }) => {
  const { usuario } = useAuth();
  const [laudo, setLaudo] = useState<Laudo | null>(null);
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

  const carregarLaudo = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await vistoriaLaudoService.buscarPorId(laudoId);
      setLaudo(dados);
      
      // Carregar nomes dos usuários das mensagens
      if (dados.mensagens && dados.mensagens.length > 0) {
        const idsUnicos = new Set<number>();
        dados.mensagens.forEach(msg => {
          idsUnicos.add(msg.usuario_id);
        });
        
        // Buscar nomes dos usuários
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
      setError(err.message || 'Erro ao carregar laudo');
      console.error('Erro ao carregar laudo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (laudoId) {
      carregarLaudo();
    }
  }, [laudoId, refreshKey]);

  // Renovação automática de URLs a cada 6 dias (antes de expirar em 7 dias)
  useEffect(() => {
    if (!laudoId) return;

    const interval = setInterval(() => {
      carregarLaudo();
    }, 6 * 24 * 60 * 60 * 1000); // 6 dias

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laudoId]);

  // Função para renovar URLs quando necessário
  const renovarUrls = async () => {
    try {
      const dados = await vistoriaLaudoService.buscarPorId(laudoId);
      setLaudo(dados);
    } catch (err: any) {
      console.error('Erro ao renovar URLs:', err);
      throw err;
    }
  };

  // Scroll para última mensagem quando carregar ou quando mensagens mudarem
  useEffect(() => {
    if (!loading && laudo) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [laudo?.mensagens, loading, laudo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!novaMensagem.trim() && anexos.length === 0) {
      alert('Digite uma mensagem ou anexe um arquivo');
      return;
    }

    try {
      setEnviando(true);
      await vistoriaLaudoService.enviarMensagem(laudoId, {
        mensagem: novaMensagem.trim() || '',
        arquivos: anexos.length > 0 ? anexos : undefined
      });

      // Recarregar laudo para mostrar a nova mensagem
      await carregarLaudo();

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

  const handleUploadArquivoLaudo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`O arquivo ${file.name} excede 10MB e será ignorado`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    try {
      setEnviando(true);
      await vistoriaLaudoService.uploadArquivos(laudoId, validFiles);
      await carregarLaudo();
      alert('Arquivos enviados com sucesso!');
    } catch (err: any) {
      alert(`Erro ao enviar arquivos: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao enviar arquivos:', err);
    } finally {
      setEnviando(false);
      if (e.target) {
        e.target.value = '';
      }
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

  const isMinhaMensagem = (mensagem: MensagemLaudo) => {
    return mensagem.usuario_id === usuario?.id;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Carregando laudo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400">Erro: {error}</p>
        <button
          onClick={carregarLaudo}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!laudo) {
    return (
      <div className="p-4 text-gray-400">Laudo não encontrado</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-white/10 shadow-xl">
      {/* Header do Chat - mesmo estilo da Assistência Técnica */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">{laudo.titulo}</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Chamado #{laudo.chamado_id}
            {laudo.created_at && ` • ${formatarData(laudo.created_at)}`}
          </p>
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

      {/* Área de Mensagens - mesmo estilo da Assistência Técnica */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 bg-gray-900">
        {/* Arquivos iniciais do laudo */}
        {laudo.arquivos && laudo.arquivos.length > 0 && (
          <div className="mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-sm font-semibold text-gray-400">Arquivos Iniciais do Laudo</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {laudo.arquivos.map((arquivo) => {
                const anexo = {
                  id: parseInt(arquivo.id.replace(/-/g, '').substring(0, 10)) || 0,
                  url: arquivo.url || '',
                  tipo: arquivo.file_type
                };
                return (
                  <div key={arquivo.id} className="relative rounded-xl overflow-hidden">
                    <AnexoImagem
                      anexo={anexo}
                      onRenovarUrls={renovarUrls}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {laudo.mensagens && laudo.mensagens.length > 0 ? (
          laudo.mensagens.map((mensagem, index) => {
            const minhaMensagem = isMinhaMensagem(mensagem);
            const nomeRemetente = nomesUsuarios[mensagem.usuario_id] || `Usuário ${mensagem.usuario_id}`;
            const dataHora = formatarData(mensagem.created_at);
            const isPrimeiraMensagem = index === 0;
            return (
              <div
                key={mensagem.id}
                className={`flex ${minhaMensagem ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] flex flex-col ${minhaMensagem ? 'items-end' : 'items-start'}`}>
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
                    {isPrimeiraMensagem && (
                      <div className="flex items-center gap-1 mb-2 pb-2 border-b border-white/10">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-400">Primeira Mensagem</span>
                      </div>
                    )}
                    {mensagem.mensagem?.trim() && (
                      <p className="text-sm whitespace-pre-wrap break-words">{mensagem.mensagem}</p>
                    )}
                    {mensagem.arquivos && mensagem.arquivos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {mensagem.arquivos.map((arquivo) => {
                          const anexo = {
                            id: parseInt(arquivo.id.replace(/-/g, '').substring(0, 10)) || 0,
                            url: arquivo.url || '',
                            tipo: arquivo.file_type
                          };
                          return (
                            <AnexoImagem
                              key={arquivo.id}
                              anexo={anexo}
                              onRenovarUrls={renovarUrls}
                              variant="chat"
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preview de Anexos - mesmo estilo da Assistência */}
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

      {/* Input de Mensagem - mesmo estilo da Assistência Técnica */}
      <div className="p-4 border-t border-white/10 bg-gray-900 rounded-b-xl">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Anexar arquivo à mensagem"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8h-16" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
            id="chat-laudo-file-input"
          />
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
          <input
            type="file"
            multiple
            onChange={handleUploadArquivoLaudo}
            accept="image/*,application/pdf"
            className="hidden"
            id="laudo-file-input"
            disabled={enviando}
          />
          <label
            htmlFor="laudo-file-input"
            className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer"
            title="Anexar arquivo ao laudo (sem mensagem)"
          >
            Anexar ao laudo
          </label>
        </div>
      </div>
    </div>
  );
};

