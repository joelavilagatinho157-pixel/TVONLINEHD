import { X, ArrowLeft, Info, Calendar, Play, Tv, Maximize, Volume2, Pause, SkipForward, FolderPlus, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Channel } from '../constants';
import { User, Folder } from '../types';

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onPreviousChannel: () => void;
  onNextChannel: () => void;
}

export default function VideoPlayer({ channel, onClose, user, onUpdateUser }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const toggleChannelInFolder = async (folderId: string) => {
    if (!user || !channel) return;

    const updatedFolders = user.folders.map(folder => {
      if (folder.id === folderId) {
        const hasChannel = folder.channelIds.includes(channel.id);
        return {
          ...folder,
          channelIds: hasChannel 
            ? folder.channelIds.filter(id => id !== channel.id)
            : [...folder.channelIds, channel.id]
        };
      }
      return folder;
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ folders: updatedFolders }),
      });
      const updated = await response.json();
      onUpdateUser(updated);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (channel) {
      setIsLoading(true);
      setProgress(0);
      
      // Simulate progress bar filling
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 400);

      return () => clearInterval(interval);
    }
  }, [channel]);

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen();
      }
    }
  };

  if (!channel) return null;

  return (
    <AnimatePresence>
      {channel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-[#0f172a] overflow-y-auto"
        >
          {/* Header Bar */}
          <header className="h-16 bg-[#1e293b] border-b border-white/5 flex items-center px-6 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                TV Online <span className="text-red-500">HD</span>
              </h1>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {/* Back and Title Area */}
            <div className="flex items-center gap-6 mb-8">
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {channel.title}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-slate-400 text-sm md:text-base font-medium">
                      AO VIVO • {channel.subtitle}
                    </p>
                  </div>
                  
                  {user && (
                    <div className="relative">
                      <button 
                        onClick={() => setIsFolderMenuOpen(!isFolderMenuOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold text-slate-300 transition-all border border-white/5"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        Salvar em Pasta
                      </button>

                      <AnimatePresence>
                        {isFolderMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              {user.folders.length === 0 ? (
                                <p className="text-[10px] text-slate-500 p-3 text-center">Crie pastas no seu perfil</p>
                              ) : (
                                user.folders.map(folder => {
                                  const isInFolder = folder.channelIds.includes(channel.id);
                                  return (
                                    <button
                                      key={folder.id}
                                      onClick={() => toggleChannelInFolder(folder.id)}
                                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-xl text-xs text-slate-300 transition-colors"
                                    >
                                      <span>{folder.name}</span>
                                      {isInFolder && <Check className="w-3 h-3 text-red-500" />}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Player Area */}
              <div className="lg:col-span-2 space-y-6">
                <div 
                  ref={playerRef}
                  className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group"
                >
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center text-center p-6"
                      >
                        <div className="relative mb-8">
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center"
                          >
                            <Tv className="w-10 h-10 text-red-500" />
                          </motion.div>
                        </div>
                        
                        <div className="space-y-6 w-full max-w-xs">
                          <div>
                            <h4 className="text-xl font-bold text-white mb-1">Sintonizando...</h4>
                            <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">
                              {channel.title}
                            </p>
                          </div>

                          {/* Animated Progress Bar */}
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                            />
                          </div>
                          
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter animate-pulse">
                            Otimizando stream para sua conexão
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <iframe
                    src={channel.url}
                    className="w-full h-full border-none"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={channel.title}
                    onLoad={() => {
                      setProgress(100);
                      setTimeout(() => setIsLoading(false), 500);
                    }}
                  />

                  <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/75 p-2 shadow-2xl backdrop-blur-md">
                    <button onClick={onPreviousChannel} aria-label="Canal anterior" className="rounded-xl p-3 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <button onClick={onNextChannel} aria-label="Próximo canal" className="rounded-xl p-3 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>
                  <button onClick={handleFullscreen} aria-label="Tela cheia" className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/75 p-4 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                    <Maximize className="h-5 w-5" />
                  </button>

                  {/* Custom Controls Overlay (Visual Only for Embeds) */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors">
                          <Pause className="w-5 h-5 fill-current" />
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors">
                          <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                        <div className="flex items-center gap-3 ml-2">
                          <Volume2 className="w-5 h-5 text-white" />
                          <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-red-500" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="px-2 py-1 bg-red-500 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                          HD 1080p
                        </div>
                        <button 
                          onClick={handleFullscreen}
                          className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                          <Maximize className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Area */}
                <div className="bg-[#1e293b] rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl">
                  <div className="flex items-center gap-3 mb-4 text-red-500">
                    <Info className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Sobre o Canal</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                    {channel.description || "Nenhuma descrição disponível para este canal no momento."}
                  </p>
                </div>
              </div>

              {/* EPG Area */}
              <div className="space-y-6">
                <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 shadow-xl h-full">
                  <div className="flex items-center gap-3 mb-6 text-red-500">
                    <Calendar className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Programação (EPG)</h3>
                  </div>

                  <div className="space-y-4">
                    {channel.epg && channel.epg.length > 0 ? (
                      channel.epg.map((program, index) => (
                        <div 
                          key={index}
                          className={`group flex gap-4 p-4 rounded-2xl transition-all ${
                            index === 0 ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className={`text-sm font-bold ${index === 0 ? 'text-red-500' : 'text-slate-400'}`}>
                              {program.time}
                            </span>
                            {index === 0 && (
                              <div className="mt-1 w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-bold ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                              {program.title}
                            </h4>
                            {index === 0 && (
                              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                                <Play className="w-3 h-3 fill-current" />
                                Agora
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
                        <Calendar className="w-10 h-10 opacity-20 mb-3" />
                        <p className="text-sm">Programação não disponível.</p>
                      </div>
                    )}
                  </div>

                  <button className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/5">
                    Ver programação completa
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button (Floating for mobile) */}
          <button 
            onClick={onClose}
            className="fixed bottom-8 right-8 p-4 bg-red-500 text-white rounded-full shadow-2xl shadow-red-500/40 md:hidden z-[210]"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
