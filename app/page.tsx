"use client"

import { useMemo, useState } from "react"
import { Search, X, Maximize2 } from "lucide-react"
import channelsData from "@/data/db.json"

type Channel = { id: number; nome?: string; name?: string; img?: string; image?: string; url?: string; categoria?: string }

export default function Home() {
  const channels = (channelsData as Channel[]).map((channel, index) => ({
    ...channel,
    id: channel.id ?? index,
    nome: channel.nome || channel.name || "Canal",
    img: channel.img || channel.image,
  }))
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Channel | null>(null)
  const filtered = useMemo(() => channels.filter((channel) =>
    String(channel.nome).toLowerCase().includes(query.toLowerCase())
  ), [channels, query])

  return (
    <main className="tv-page">
      <div className="tv-container">
        <header className="brand-panel">
          <a href="#canais" className="brand-mark" aria-label="TV Online HD">
            <span>TV ONLINE</span><b>HD</b>
          </a>
        </header>

        <section id="canais" className="channels-section" aria-labelledby="channels-title">
          <div className="channels-heading"><h2 id="channels-title">CANAIS DISPONÍVEIS</h2><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar canal" aria-label="Buscar canal" /></label></div>
          <div className="channel-grid">
            {filtered.map((channel) => (
              <button className="channel-card" key={channel.id} onClick={() => setSelected(channel)}>
                <span className="channel-logo">{channel.img && <img src={channel.img} alt="" onError={(event) => { event.currentTarget.style.display = "none" }} />}<em>{channel.nome?.slice(0, 2).toUpperCase()}</em></span>
                <strong>{channel.nome}</strong>
              </button>
            ))}
          </div>
          {!filtered.length && <p className="empty">Nenhum canal encontrado.</p>}
        </section>
      </div>
      <footer>© TV Online HD - Este site não hospeda nenhum conteúdo de vídeo, apenas incorpora players de fontes públicas disponíveis na internet.</footer>
      {selected && <div className="player-modal"><button className="player-back" onClick={() => setSelected(null)} aria-label="Voltar"><X size={22} /></button><div className="player-title"><span /> {selected.nome}</div><iframe src={selected.url} title={`Player ${selected.nome}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><button className="player-full" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Tela cheia"><Maximize2 size={18} /></button></div>}
    </main>
  )
}
