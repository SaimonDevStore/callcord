"use client";

import { useUser } from "@clerk/nextjs";
import { LiveKitRoom, RoomAudioRenderer, useParticipants, useLocalParticipant, useTracks, GridLayout, ParticipantTile } from "@livekit/components-react";
import { RoomEvent, ParticipantEvent, type Room, Track } from "livekit-client";
import { Loader2, Mic, MicOff, Video, VideoOff, Monitor, Phone, Settings, Gamepad2, Lightbulb, MoreHorizontal, Volume2, VolumeX, Mic2, Sliders } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { playCallJoinSound, playCallLeaveSound, playMuteSound, playUnmuteSound } from "@/lib/sounds";
import { useVoiceStore } from "@/hooks/use-voice-store";
import { useCall } from "@/components/providers/call-provider";
import { useEffect as ReactUseEffect } from "react";
import { MemberList } from "@/components/chat/member-list";

import "@livekit/components-styles";

type MediaRoomProps = {
  chatId: string;
  video: boolean;
  audio: boolean;
  // Somente quando esta sala é a "Call" (voz principal)
  isCallRoom?: boolean;
};

// Componente para os controles da call
const CallControls = ({ onDisconnect, isCallRoom, chatId }: { onDisconnect: () => void; isCallRoom: boolean; chatId: string }) => {
  const { localParticipant } = useLocalParticipant();
  const { leaveCall } = useCall();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showScreenShareMenu, setShowScreenShareMenu] = useState(false);
  const [volume, setVolume] = useState(100);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState(50);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [screenShareQuality, setScreenShareQuality] = useState<'720p' | '1080p' | '4K'>('720p');
  const menuRef = useRef<HTMLDivElement>(null);
  const screenShareMenuRef = useRef<HTMLDivElement>(null);

  // Atualizar estado inicial baseado no estado atual do participante
  useEffect(() => {
    if (localParticipant) {
      // Usar uma abordagem mais simples para evitar erros de tipo
      const updateTrackStates = () => {
        // Por enquanto, manter os estados como estão
        // TODO: Implementar lógica correta de tracks quando resolver os tipos
        setIsInitialized(true);
      };

      updateTrackStates();
    }
  }, [localParticipant]);

  // Monitorar mudanças nas tracks quando elas são criadas/destruídas
  useEffect(() => {
    if (localParticipant) {
      const updateTrackStates = () => {
        // Por enquanto, manter os estados como estão
        // TODO: Implementar lógica correta de tracks quando resolver os tipos
        setIsInitialized(true);
      };

      // Atualizar estado inicial
      updateTrackStates();

      // Listener para quando tracks são publicadas
      const handleTrackPublished = () => {
        setTimeout(updateTrackStates, 100); // Pequeno delay para garantir que as tracks foram criadas
      };

      // Listener para quando tracks são unpublishadas
      const handleTrackUnpublished = () => {
        setTimeout(updateTrackStates, 100);
      };

      localParticipant.on('trackPublished', handleTrackPublished);
      localParticipant.on('trackUnpublished', handleTrackUnpublished);

      return () => {
        localParticipant.off('trackPublished', handleTrackPublished);
        localParticipant.off('trackUnpublished', handleTrackUnpublished);
      };
    }
  }, [localParticipant]);

  const toggleMic = async () => {
    if (!localParticipant) return;
    try {
      const nextEnabled = isMicMuted; // se está mutado, habilita; se não, desabilita
      await localParticipant.setMicrophoneEnabled(nextEnabled);
      setIsMicMuted(!nextEnabled);
    } catch (e) {
      console.error("toggleMic error", e);
    }
  };

  const toggleVideo = async () => {
    if (!localParticipant) return;
    try {
      const nextEnabled = isVideoOff; // se está off, liga; se está on, desliga
      await localParticipant.setCameraEnabled(nextEnabled);
      setIsVideoOff(!nextEnabled);
    } catch (e) {
      console.error("toggleVideo error", e);
    }
  };

  const toggleScreenShare = async () => {
    if (!localParticipant) return;
    
    if (isScreenSharing) {
      // Parar compartilhamento
      try {
        await localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
        setShowScreenShareMenu(false);
      } catch (e) {
        console.error("stopScreenShare error", e);
      }
    } else {
      // Mostrar menu de opções
      setShowScreenShareMenu(true);
    }
  };

  const startScreenShare = async (source: 'screen' | 'window' | 'tab', quality: '720p' | '1080p' | '4K') => {
    if (!localParticipant) return;
    
    try {
      // Verificar se usuário tem Nitro para 4K
      if (quality === '4K') {
        // TODO: Implementar verificação de Nitro
        console.log('4K quality selected - requires Nitro verification');
      }
      
      // Configurar qualidade baseada na seleção
      await localParticipant.setScreenShareEnabled(true);
      setIsScreenSharing(true);
      setScreenShareQuality(quality);
      setShowScreenShareMenu(false);
    } catch (e) {
      console.error("startScreenShare error", e);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
      {/* Mutar/Desmutar Microfone */}
      <button
        onClick={toggleMic}
        className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
          isMicMuted 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
        }`}
        title={isMicMuted ? 'Desmutar microfone' : 'Mutar microfone'}
      >
        {isMicMuted ? <MicOff className="h-4 w-4 md:h-5 md:w-5" /> : <Mic className="h-4 w-4 md:h-5 md:w-5" />}
      </button>

      {/* Ativar/Desativar Câmera */}
      <button
        onClick={toggleVideo}
        className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
          isVideoOff 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
        }`}
        title={isVideoOff ? 'Ativar câmera' : 'Desativar câmera'}
      >
        {isVideoOff ? <VideoOff className="h-4 w-4 md:h-5 md:w-5" /> : <Video className="h-4 w-4 md:h-5 md:w-5" />}
      </button>

      {/* Compartilhar Tela */}
      <div className="relative">
        <button
          onClick={toggleScreenShare}
          className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
            isScreenSharing 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
          }`}
          title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
        >
          <Monitor className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        
        {/* Menu de opções de compartilhamento */}
        {showScreenShareMenu && (
          <div ref={screenShareMenuRef} className="absolute bottom-full right-0 mb-2 w-72 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl z-50 p-3">
            <div className="space-y-3">
              {/* Título */}
              <div className="text-center pb-2 border-b border-zinc-600">
                <h3 className="text-sm font-semibold text-white">Compartilhar Tela</h3>
              </div>
              
              {/* Seleção de fonte */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-300">O que compartilhar:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => startScreenShare('screen', screenShareQuality)}
                    className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                  >
                    🖥️ Tela Inteira
                  </button>
                  <button
                    onClick={() => startScreenShare('window', screenShareQuality)}
                    className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                  >
                    🪟 Janela
                  </button>
                  <button
                    onClick={() => startScreenShare('tab', screenShareQuality)}
                    className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                  >
                    📑 Aba
                  </button>
                </div>
              </div>
              
              {/* Seleção de qualidade */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-300">Qualidade:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setScreenShareQuality('720p')}
                    className={`p-2 text-xs rounded transition-colors ${
                      screenShareQuality === '720p' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    }`}
                  >
                    720p
                  </button>
                  <button
                    onClick={() => startScreenShare('screen', '1080p')}
                    className={`p-2 text-xs rounded transition-colors ${
                      screenShareQuality === '1080p' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    }`}
                  >
                    1080p
                  </button>
                  <button
                    onClick={() => startScreenShare('screen', '4K')}
                    className={`p-2 text-xs rounded transition-colors ${
                      screenShareQuality === '4K' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    }`}
                  >
                    4K
                  </button>
                </div>
              </div>
              
              {/* Botão fechar */}
              <button
                onClick={() => setShowScreenShareMenu(false)}
                className="w-full mt-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Atividades */}
      <button
        className="p-2 md:p-3 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-all duration-200"
        title="Atividades"
      >
        <Gamepad2 className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      {/* Outras opções */}
      <div className="relative">
        <button
          onClick={() => setShowAudioMenu(!showAudioMenu)}
          className="p-2 md:p-3 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-all duration-200"
          title="Configurações de áudio"
        >
          <MoreHorizontal className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        
        {/* Menu de configurações de áudio */}
        {showAudioMenu && (
          <div ref={menuRef} className="absolute bottom-full right-0 mb-2 w-64 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl z-50 p-3">
            <div className="space-y-3">
              {/* Título */}
              <div className="text-center pb-2 border-b border-zinc-600">
                <h3 className="text-sm font-semibold text-white">Configurações de Áudio</h3>
              </div>

              {/* Supressão de Ruído */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">🔇 Supressão de Ruído</span>
                <button
                  onClick={() => setNoiseSuppression(!noiseSuppression)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    noiseSuppression ? 'bg-blue-600' : 'bg-zinc-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    noiseSuppression ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Controle Automático de Ganho */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">📈 Controle Automático de Ganho</span>
                <button
                  onClick={() => setAutoGainControl(!autoGainControl)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    autoGainControl ? 'bg-blue-600' : 'bg-zinc-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    autoGainControl ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Cancelamento de Eco */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">🔄 Cancelamento de Eco</span>
                <button
                  onClick={() => setEchoCancellation(!echoCancellation)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    echoCancellation ? 'bg-blue-600' : 'bg-zinc-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    echoCancellation ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Sensibilidade do Microfone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">🎤 Sensibilidade do Mic</span>
                  <span className="text-xs text-zinc-400">{micSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={micSensitivity}
                  onChange={(e) => setMicSensitivity(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Volume</span>
                  <span className="text-xs text-zinc-400">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              {/* Supressão de ruído */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">Supressão de ruído</span>
                <button
                  onClick={() => setNoiseSuppression(!noiseSuppression)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    noiseSuppression ? 'bg-green-500' : 'bg-zinc-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    noiseSuppression ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              
              {/* Sensibilidade do microfone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Sensibilidade do microfone</span>
                  <span className="text-xs text-zinc-400">{micSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={micSensitivity}
                  onChange={(e) => setMicSensitivity(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              {/* Botão fechar */}
              <button
                onClick={() => setShowAudioMenu(false)}
                className="w-full mt-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Encerrar Chamada */}
      <button
        onClick={async () => {
          try {
            // Rewards: encerrar sessão ANTES de sair da call
            if (isCallRoom) {
              console.log(`[CALL_CONTROLS] Ending rewards session before disconnect: ${chatId}`);
              await fetch('/api/rewards', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ action: 'endSession' }) 
              });
              
              // Consolidar progresso
              await fetch('/api/rewards/cron', { method: 'POST' });
              
              // Disparar evento para atualizar modal
              window.dispatchEvent(new CustomEvent('rewardsProgressUpdated'));
            }
            
            // Primeiro, sair da call no contexto
            leaveCall();
            
            // Depois, desconectar da sala LiveKit
            onDisconnect();
            
          } catch (error) {
            console.error('[CALL_CONTROLS] Error ending session:', error);
            // Mesmo com erro, continuar desconectando
            leaveCall();
            onDisconnect();
          }
        }}
        className="p-2 md:p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
        title="Encerrar chamada"
      >
        <Phone className="h-4 w-4 md:h-5 md:w-5 rotate-90" />
      </button>
    </div>
  );
};
// Área para exibir compartilhamento de tela ativo
const ScreenShareArea = () => {
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Se não há tracks de compartilhamento, não renderiza nada
  if (screenShareTracks.length === 0) return null;
  
  // Encontrar a primeira track de compartilhamento
  const screenTrack = screenShareTracks[0];
  if (!screenTrack) return null;
  
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full'} transition-all duration-300`}>
      <div className={`${isFullscreen ? 'h-full' : 'h-48'} overflow-hidden rounded-lg border border-zinc-700 bg-black relative`}>
        <div className="h-full w-full">
          <ParticipantTile 
            key={screenTrack.publication?.trackSid || screenTrack.participant.identity + "-ss"} 
            trackRef={screenTrack}
            className="h-full w-full"
          />
        </div>
        
        {/* Botão de tela cheia */}
        <button
          onClick={handleFullscreen}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
        
        {/* Indicador de compartilhamento */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
          <span>🖥️</span>
          <span>{(() => { try { const meta = screenTrack.participant.metadata ? JSON.parse(screenTrack.participant.metadata as string) : null; return meta?.displayName || screenTrack.participant.name || screenTrack.participant.identity; } catch { return screenTrack.participant.name || screenTrack.participant.identity; } })()} está compartilhando</span>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar participantes da call
const CallParticipants = () => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());

  // Detectar participantes falando
  useEffect(() => {
    const allParticipants = [localParticipant, ...participants].filter(Boolean);

    const handleSpeakingChange = (participant: any, speaking: boolean) => {
      setSpeakingParticipants(prev => {
        const newSet = new Set(prev);
        if (speaking) {
          newSet.add(participant.identity);
        } else {
          newSet.delete(participant.identity);
        }
        return newSet;
      });
    };

    // Guardar handlers para remover corretamente no cleanup
    const handlerMap = new Map<any, (speaking: boolean) => void>();

    // Adicionar listeners para todos os participantes
    allParticipants.forEach(participant => {
      if (participant) {
        const handler = (speaking: boolean) => {
          handleSpeakingChange(participant, speaking);
        };
        handlerMap.set(participant, handler);
        participant.on(ParticipantEvent.IsSpeakingChanged, handler);
      }
    });

    // Cleanup
    return () => {
      handlerMap.forEach((handler, p) => {
        try {
          p.off(ParticipantEvent.IsSpeakingChanged, handler);
        } catch {}
      });
    };
  }, [localParticipant, participants]);

  // Filtrar participantes únicos por identity para evitar duplicatas
  const uniqueParticipants = new Map();
  if (localParticipant) {
    uniqueParticipants.set(localParticipant.identity, localParticipant);
  }
  participants.forEach(participant => {
    if (!uniqueParticipants.has(participant.identity)) {
      uniqueParticipants.set(participant.identity, participant);
    }
  });

  const allParticipants = Array.from(uniqueParticipants.values());

  if (allParticipants.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 bg-zinc-900/30 rounded-lg border border-zinc-700">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
            U
          </div>
          <span className="text-xs text-zinc-300 font-medium">
            Conectando...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 p-3 bg-zinc-700 rounded-lg border border-zinc-600">
      {allParticipants.map((participant) => {
        if (!participant) return null;
        
        // Tentar extrair avatar da metadata do LiveKit
        let avatarUrl: string | null = null;
        try {
          if (participant.metadata) {
            const meta = JSON.parse(participant.metadata as string);
            avatarUrl = meta?.avatarUrl || null;
          }
        } catch {}

        // Nome amigável: metadata.displayName > participant.name > identity
        let displayName = participant.name || participant.identity || 'Usuário';
        try {
          if (participant.metadata) {
            const meta = JSON.parse(participant.metadata as string);
            if (meta?.displayName) displayName = meta.displayName;
          }
        } catch {}

        const isSpeaking = speakingParticipants.has(participant.identity);

        return (
          <div key={participant.identity} className="flex flex-col items-center gap-1 relative">
            {/* Efeito circular verde quando falando */}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-pulse" 
                   style={{ 
                     animation: 'speaking-pulse 1.5s ease-in-out infinite',
                     boxShadow: '0 0 15px rgba(34, 197, 94, 0.6)'
                   }} />
            )}
            
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover transition-all duration-300 ${
                  isSpeaking ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`} 
              />
            ) : (
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                isSpeaking ? 'ring-2 ring-green-500 ring-opacity-50' : ''
              }`}>
                {(displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            
            <span className="text-xs text-zinc-300 font-medium text-center max-w-[60px] truncate">
              {displayName}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Layout principal da aba de chamada
const CallLayout = ({ onDisconnect, isCallRoom, chatId }: { onDisconnect: () => void; isCallRoom: boolean; chatId: string }) => {
  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Área Superior - Call */}
      <div className="flex-shrink-0 p-3 md:p-4 space-y-3 bg-gradient-to-b from-zinc-800 to-zinc-900 border-b border-zinc-700">
        {/* Título da Call */}
        <div className="text-center">
          <h1 className="text-lg md:text-xl font-bold text-white mb-1">🎤 Call Ativa</h1>
          <p className="text-zinc-400 text-xs">Conectado ao canal de voz</p>
        </div>

        {/* Compartilhamento de tela quando ativo */}
        <ScreenShareArea />

        {/* Participantes da Call */}
        <CallParticipants />

        {/* Controles da Call */}
        <CallControls onDisconnect={onDisconnect} isCallRoom={isCallRoom} chatId={chatId} />
      </div>

      {/* Área Principal - sem lista de membros */}
      <div className="w-full" />
    </div>
  );
};

export const MediaRoom = ({ chatId, audio, video, isCallRoom = false }: MediaRoomProps) => {
  const { user } = useUser();
  const { resolvedTheme } = useTheme();

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const roomRef = useRef<Room | null>(null);
  const voice = useVoiceStore();
  
  // Estado para contagem de tempo em tempo real
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [currentCallTime, setCurrentCallTime] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Usar username ou email se firstName/lastName não estiverem disponíveis
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.username || user.emailAddresses[0].emailAddress.split('@')[0];

    (async () => {
      try {
        const avatar = user.imageUrl || "";
        const res = await fetch(`/api/livekit?room=${chatId}&username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setToken(data.token);
        }
      } catch (error: unknown) {
        console.error(error);
        setError("Erro ao conectar ao canal de voz");
      }
    })();
  }, [user, chatId]);

  // Atualizar tempo da call a cada segundo
  useEffect(() => {
    if (!callStartTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
      setCurrentCallTime(elapsed);
      
      // Atualizar o modal de progresso em tempo real
      window.dispatchEvent(new CustomEvent('rewardsProgressUpdated', { 
        detail: { currentCallTime: elapsed } 
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [callStartTime]);

  // Cleanup quando componente for desmontado
  useEffect(() => {
    return () => {
      // Se o componente for desmontado e ainda estiver em call, limpar estado
      if (callStartTime && isCallRoom) {
        console.log(`[MEDIA_ROOM] Component unmounted, cleaning up call state`);
        voice.setConnected(false);
        voice.setRoomId(null);
        setCallStartTime(null);
        setCurrentCallTime(0);
        
        // Disparar evento para parar progresso
        window.dispatchEvent(new CustomEvent('rewardsProgressUpdated', { 
          detail: { isInCall: false, currentCallTime: 0, roomId: null } 
        }));
      }
    };
  }, [callStartTime, isCallRoom, voice]);

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-xs text-red-500 dark:text-red-400 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (token === "")
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Conectando ao canal...</p>
      </div>
    );

  return (
    <div className="h-full flex flex-col">
    <LiveKitRoom
      data-lk-theme={resolvedTheme === "dark" ? "default" : "light"}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect
      video={video}
      audio={audio}
      onConnected={() => {
        try {
          // roomRef.current será definido pelo LiveKitRoom
          playCallJoinSound();
          voice.setConnected(true);
          voice.setRoomId(chatId);
          
          // Iniciar contagem de tempo em tempo real
          setCallStartTime(new Date());
          setCurrentCallTime(0);
          
          // Rewards: iniciar sessão apenas na sala "Call"
          console.log(`[MEDIA_ROOM] Connected to room: ${chatId}, isCallRoom: ${isCallRoom}, channel name check: ${chatId}`);
          if (isCallRoom) {
            console.log(`[MEDIA_ROOM] Starting rewards session for Call room: ${chatId}`);
            fetch('/api/rewards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'startSession', roomId: chatId }) })
              .then(res => res.json())
              .then(data => console.log(`[MEDIA_ROOM] Session started:`, data))
              .catch(err => console.error(`[MEDIA_ROOM] Session error:`, err));
          } else {
            console.log(`[MEDIA_ROOM] Not a Call room, skipping rewards session`);
          }
          
          // Configurar eventos quando a sala estiver disponível
          if (roomRef.current) {
            // Participant join/leave
            roomRef.current.on(RoomEvent.ParticipantConnected, () => {
              try { playCallJoinSound(); } catch {}
            });
            roomRef.current.on(RoomEvent.ParticipantDisconnected, () => {
              try { playCallLeaveSound(); } catch {}
            });
            // Local mute/unmute
            roomRef.current.localParticipant.on("trackMuted", (pub) => {
              if (pub.kind === "audio") {
                try { playMuteSound(); } catch {}
                voice.setMicMuted(true);
              }
            });
            roomRef.current.localParticipant.on("trackUnmuted", (pub) => {
              if (pub.kind === "audio") {
                try { playUnmuteSound(); } catch {}
                voice.setMicMuted(false);
              }
            });
          }
        } catch {}
      }}
      onDisconnected={() => {
        try {
          console.log(`[MEDIA_ROOM] onDisconnected called for room: ${chatId}`);
          playCallLeaveSound();
        } catch {}
        
        // Limpar estado da call
        voice.setConnected(false);
        voice.setRoomId(null);
        roomRef.current = null;
        
        // Parar contagem de tempo
        console.log(`[MEDIA_ROOM] Stopping call timer, clearing callStartTime`);
        setCallStartTime(null);
        setCurrentCallTime(0);
        
        // Rewards: fechar sessão e salvar progresso ao sair da call (somente se for a "Call")
        if (isCallRoom) {
          console.log(`[MEDIA_ROOM] Disconnected from Call room: ${chatId}, ending session and saving progress`);
          
          // Primeiro, fechar a sessão
          fetch('/api/rewards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'endSession' }) })
            .then(res => res.json())
            .then(data => {
              console.log(`[MEDIA_ROOM] Session ended:`, data);
              
              // Depois, consolidar o progresso do dia
              return fetch('/api/rewards/cron', { method: 'POST' });
            })
            .then(res => res.json())
            .then(data => {
              console.log(`[MEDIA_ROOM] Progress consolidated:`, data);
              
              // Disparar evento para atualizar o modal de progresso
              window.dispatchEvent(new CustomEvent('rewardsProgressUpdated', { 
                detail: { isInCall: false, currentCallTime: 0, roomId: null } 
              }));
            })
            .catch(err => console.error(`[MEDIA_ROOM] Error:`, err));
        } else {
          console.log(`[MEDIA_ROOM] Disconnected from non-Call room: ${chatId}, no rewards session to end`);
        }
      }}
    >
      {/* Renderizador de áudio remoto da sala */}
      <RoomAudioRenderer />
      <CallLayout onDisconnect={async () => {
        try {
          // Rewards: encerrar sessão ANTES de desconectar
          if (isCallRoom) {
            console.log(`[CALL_LAYOUT] Ending rewards session before disconnect: ${chatId}`);
            await fetch('/api/rewards', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ action: 'endSession' }) 
            });
            
            // Consolidar progresso
            await fetch('/api/rewards/cron', { method: 'POST' });
            
            // Disparar evento para atualizar modal
            window.dispatchEvent(new CustomEvent('rewardsProgressUpdated', { 
              detail: { isInCall: false, currentCallTime: 0, roomId: null } 
            }));
          }
          
          // Desconectar da sala LiveKit
          if (roomRef.current) {
            roomRef.current.disconnect();
          }
        } catch (error) {
          console.error('[CALL_LAYOUT] Error ending session:', error);
        } finally {
          // garantir limpeza mesmo se não houver sala
          voice.setConnected(false);
          voice.setRoomId(null);
          
          // Parar contagem de tempo
          setCallStartTime(null);
          setCurrentCallTime(0);
        }
      }} isCallRoom={isCallRoom} chatId={chatId} />
    </LiveKitRoom>
    </div>
  );
};
