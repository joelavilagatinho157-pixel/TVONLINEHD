import { useState, useEffect, MouseEvent } from 'react';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ChannelCard from './components/ChannelCard';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import { Channel, SiteConfig } from './constants';
import { User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Heart, Clock, Tv, Settings } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ title: "TV Online HD", subtitle: "Os melhores canais ao vivo" });
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'all' | 'favorites' | 'recent'>('all');
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent_channels');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setChannels(data.channels || []);
      // Add "Favoritos" and "Recentes" as virtual categories at the beginning and filter out duplicates
      const cats = data.categories || ["Todos"];
      setCategories([
        "Todos", 
        "Favoritos", 
        "Recentes",
        ...cats.filter((c: string) => c !== "Todos" && c !== "Favoritos" && c !== "Recentes")
      ]);
      setSiteConfig(data.siteConfig || { title: "TV Online HD", subtitle: "Os melhores canais ao vivo" });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setFavorites(userData.favorites);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  useEffect(() => {
    localStorage.setItem('recent_channels', JSON.stringify(recentIds));
  }, [recentIds]);

  const syncFavorites = async (newFavorites: string[]) => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ favorites: newFavorites }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async (e: MouseEvent, channel: Channel) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(channel.id) 
      ? favorites.filter(id => id !== channel.id) 
      : [...favorites, channel.id];
    
    setFavorites(newFavorites);
    if (user) {
      syncFavorites(newFavorites);
    }
  };

  const handleAuthSuccess = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setFavorites(userData.favorites);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setFavorites([]);
    setIsProfileOpen(false);
  };

  const handleSaveAdmin = async (newData: any) => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (response.ok) {
        setChannels(newData.channels);
        setCategories(newData.categories);
        setSiteConfig(newData.siteConfig);
        setIsAdminOpen(false);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Erro ao salvar dados");
    }
  };

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    setRecentIds(prev => {
      const filtered = prev.filter(id => id !== channel.id);
      return [channel.id, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const filteredChannels = channels.filter(c => {
    const matchesCategory = activeCategory === "Todos" || 
                            (activeCategory === "Favoritos" && favorites.includes(c.id)) ||
                            (activeCategory === "Recentes" && recentIds.includes(c.id)) ||
                            c.category === activeCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesView = view === 'all' || 
                        (view === 'favorites' && favorites.includes(c.id)) ||
                        (view === 'recent' && recentIds.includes(c.id));
    return matchesCategory && matchesSearch && matchesView;
  });

  if (currentPath === '/admin' || currentPath === '/login') {
    return <AdminPanel />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-red-500/30">
      <Navbar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        user={user}
        onUserClick={() => user ? setIsProfileOpen(true) : setIsAuthOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto pb-20">
        <div className="px-6 py-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
            {siteConfig.title.split(' ')[0]} <span className="text-red-500">{siteConfig.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl mx-auto">
            {siteConfig.subtitle}
          </p>
        </div>

        <CategoryBar 
          categories={categories}
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        <div className="px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-red-500 rounded-full" />
              <h2 className="text-2xl font-bold tracking-tight">
                {activeCategory === 'Favoritos' || view === 'favorites' 
                  ? 'Meus Favoritos' 
                  : activeCategory === 'Recentes' || view === 'recent'
                  ? 'Canais Recentes'
                  : activeCategory}
              </h2>
              <span className="text-slate-500 text-sm font-medium ml-2">
                ({filteredChannels.length} {
                  activeCategory === 'Favoritos' || view === 'favorites' 
                    ? 'favoritos' 
                    : activeCategory === 'Recentes' || view === 'recent'
                    ? 'recentes'
                    : 'canais'
                })
              </span>
            </div>

            <button 
              onClick={() => navigate('/admin')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
              title="Administração"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <AnimatePresence mode='popLayout'>
              {filteredChannels.map((channel) => (
                <motion.div
                  key={channel.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChannelCard 
                    channel={channel} 
                    onClick={handleChannelClick}
                    isFavorite={favorites.includes(channel.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredChannels.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Tv className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-lg font-medium">Nenhum canal encontrado nesta categoria.</p>
              <button 
                onClick={() => setActiveCategory("Todos")}
                className="mt-4 text-red-500 hover:underline"
              >
                Ver todos os canais
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Mobile Nav Simulation */}
      <div className="fixed bottom-0 inset-x-0 h-16 bg-slate-900/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-6 md:hidden z-50">
        <button 
          onClick={() => setView('all')}
          className={`flex flex-col items-center gap-1 ${view === 'all' ? 'text-red-500' : 'text-slate-500'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Canais</span>
        </button>
        <button 
          onClick={() => setView('favorites')}
          className={`flex flex-col items-center gap-1 ${view === 'favorites' ? 'text-red-500' : 'text-slate-500'}`}
        >
          <Heart className={`w-5 h-5 ${view === 'favorites' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold uppercase">Favoritos</span>
        </button>
        <button 
          onClick={() => setView('recent')}
          className={`flex flex-col items-center gap-1 ${view === 'recent' ? 'text-red-500' : 'text-slate-500'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Recentes</span>
        </button>
      </div>

      <VideoPlayer 
        channel={selectedChannel} 
        onClose={() => setSelectedChannel(null)} 
        user={user}
        onUpdateUser={setUser}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdate={setUser}
        onLogout={handleLogout}
        channels={channels}
      />
    </div>
  );
}
