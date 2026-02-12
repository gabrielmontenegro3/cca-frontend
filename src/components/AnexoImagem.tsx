import React, { useState, useEffect } from 'react';
import { AnexoMensagem } from '../types';

interface AnexoImagemProps {
  anexo: AnexoMensagem;
  onRenovarUrls?: () => Promise<void>;
  /** Variante "chat": bloco compacto com ícone, nome, tipo e ícone de download (estilo referência) */
  variant?: 'default' | 'chat';
}

const IMAGE_MIN_HEIGHT = 192; // 12rem = max-h-64, reserva espaço fixo para evitar layout shift

export const AnexoImagem: React.FC<AnexoImagemProps> = ({ anexo, onRenovarUrls, variant = 'default' }) => {
  const [url, setUrl] = useState(anexo.url);
  const [erro, setErro] = useState(false);
  const [tentandoRenovar, setTentandoRenovar] = useState(false);
  const [renovando, setRenovando] = useState(false);
  const [imagemCarregada, setImagemCarregada] = useState(false);

  useEffect(() => {
    setImagemCarregada(false);
  }, [url]);

  const handleError = async () => {
    if (erro || tentandoRenovar || renovando) return;
    
    setErro(true);
    setTentandoRenovar(true);

    // Tentar renovar URLs se a função estiver disponível
    if (onRenovarUrls) {
      try {
        setRenovando(true);
        await onRenovarUrls();
        // Aguardar um pouco e tentar recarregar a imagem
        setTimeout(() => {
          // Forçar reload adicionando timestamp
          setUrl(anexo.url + (anexo.url.includes('?') ? '&' : '?') + 't=' + Date.now());
          setErro(false);
          setTentandoRenovar(false);
          setRenovando(false);
        }, 500);
      } catch (err) {
        console.error('Erro ao renovar URLs:', err);
        setTentandoRenovar(false);
        setRenovando(false);
      }
    } else {
      setTentandoRenovar(false);
    }
  };

  const handleRetry = () => {
    setErro(false);
    setUrl(anexo.url + (anexo.url.includes('?') ? '&' : '?') + 't=' + Date.now());
  };

  if (anexo.tipo.startsWith('image/')) {
    const containerMinHeight = IMAGE_MIN_HEIGHT;
    return (
      <div
        className={`relative overflow-hidden ${variant === 'chat' ? 'rounded-xl' : 'rounded-lg'}`}
        style={{ minHeight: containerMinHeight }}
      >
        {/* Placeholder com altura fixa enquanto carrega ou em renovando/erro - evita layout shift */}
        {(!imagemCarregada || renovando || (erro && !renovando)) && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-700/50 z-[1]"
            style={{ minHeight: containerMinHeight }}
            aria-hidden
          >
            {renovando && (
              <span className="text-xs text-gray-400">Renovando...</span>
            )}
            {erro && !renovando && (
              <div className="flex flex-col items-center justify-center p-4">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-400 text-center mb-2">Imagem não disponível</p>
                {onRenovarUrls ? (
                  <button
                    type="button"
                    onClick={handleError}
                    disabled={renovando}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Renovar URL
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}
            {!erro && !renovando && !imagemCarregada && (
              <div className="w-10 h-10 border-2 border-gray-500 border-t-gray-400 rounded-full animate-spin" aria-hidden />
            )}
          </div>
        )}
        <img
          src={url}
          alt="Anexo"
          onLoad={() => setImagemCarregada(true)}
          onError={handleError}
          className={`max-w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity ${variant === 'chat' ? 'rounded-xl' : 'rounded-lg'}`}
          style={{
            maxHeight: containerMinHeight,
            display: erro && !renovando ? 'none' : 'block',
            visibility: imagemCarregada && !renovando ? 'visible' : 'hidden'
          }}
          onClick={() => window.open(url, '_blank')}
        />
      </div>
    );
  }

  // Extrair nome do arquivo da URL
  const extrairNomeArquivo = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const nome = pathname.split('/').pop() || 'arquivo';
      // Remover parâmetros de query se houver
      return nome.split('?')[0] || 'arquivo';
    } catch {
      // Se não conseguir parsear, tentar extrair do final da URL
      const partes = url.split('/');
      const ultimaParte = partes[partes.length - 1];
      return ultimaParte.split('?')[0] || 'arquivo.pdf';
    }
  };

  const nomeArquivo = extrairNomeArquivo(anexo.url);
  const isPDF = anexo.tipo === 'application/pdf' || anexo.tipo.includes('pdf');

  // Função para fazer download
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // Verificar se a URL está válida
      const response = await fetch(url);
      if (!response.ok && onRenovarUrls) {
        await handleError();
        // Tentar novamente após renovar
        setTimeout(async () => {
          const newResponse = await fetch(anexo.url);
          if (newResponse.ok) {
            const blob = await newResponse.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = nomeArquivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
          }
        }, 1000);
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      if (onRenovarUrls) {
        await handleError();
      }
    }
  };

  // Para PDFs
  if (isPDF) {
    if (variant === 'chat') {
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-600/60 border border-white/5 rounded-xl w-full">
          <div className="flex-shrink-0 text-indigo-400">
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" title={nomeArquivo}>
              {nomeArquivo}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">PDF</p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-shrink-0 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Baixar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700/70 transition-colors w-full">
        <div className="flex-shrink-0">
          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-sm font-medium text-white truncate" title={nomeArquivo}>
            {nomeArquivo}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Documento PDF</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="flex-shrink-0 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          title="Baixar PDF"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    );
  }

  // Para outros arquivos não-imagem
  if (variant === 'chat') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-600/60 border border-white/5 rounded-xl w-full">
        <div className="flex-shrink-0 text-indigo-400">
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate" title={nomeArquivo}>{nomeArquivo}</p>
          <p className="text-xs text-gray-400 mt-0.5">Arquivo</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download={nomeArquivo}
          className="flex-shrink-0 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Baixar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={nomeArquivo}
      onClick={async (e) => {
        try {
          const testResponse = await fetch(url, { method: 'HEAD' });
          if (!testResponse.ok && onRenovarUrls) {
            e.preventDefault();
            await handleError();
            setTimeout(() => window.open(url, '_blank'), 1000);
          }
        } catch {
          if (onRenovarUrls) {
            e.preventDefault();
            await handleError();
          }
        }
      }}
      className="flex items-center gap-2 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span className="text-sm">Arquivo ({anexo.tipo})</span>
    </a>
  );
};

