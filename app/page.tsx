"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Search, X, Maximize2 } from "lucide-react"
import channelsData from "@/data/db.json"

type Channel = { id: number; nome?: string; name?: string; img?: string; image?: string; url?: string; categoria?: string }

const games = [
  ["Xangai - Primeira jornada", "03:00", "Luca Van Assche", "Bu Yunchaokete"],
  ["Xangai - Primeira jornada", "04:10", "Cameron Norrie", "Dalibor Svrcina"],
  ["Euroliga", "09:00", "BC Dubai", "Crvena Zvezda"],
  ["Euroliga", "11:45", "Real Madrid", "KK Partizan"],
]

export default function Home() {
  const channels = (channelsData as Channel[]).map((channel, index) => ({
    ...channel,
    id: channel.id ?? index,
    nome: channel.nome || channel.name || "Canal",
    img: channel.img || channel.image,
  }))
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Channel | null>(null)
  const [gameOffset, setGameOffset] = useState(0)
  const filtered = useMemo(() => channels.filter((channel) =>
    String(channel.nome).toLowerCase().includes(query.toLowerCase())
  ), [channels, query])
  const visibleGames = games.slice(gameOffset, gameOffset + 4)

  return (
    <main className="tv-page">
      <div className="tv-container">
        <header className="brand-panel">
          <a href="#canais" className="brand-mark" aria-label="TV Online HD">
            <span>TV ONLINE</span><b>HD</b>
          </a>
        </header>

        <section className="games-section" aria-labelledby="games-title">
          <div className="simple-heading"><h2 id="games-title">JOGOS AO VIVO</h2></div>
          <div className="games-wrap">
            <button className="round-arrow left" onClick={() => setGameOffset(Math.max(0, gameOffset - 1))} aria-label="Jogos anteriores"><ChevronLeft size={20} /></button>
            <div className="games-grid">
              {visibleGames.map(([league, time, home, away]) => (
                <article className="live-game" key={`${home}-${away}`}>
                  <div className="game-line"><span>{league}</span><strong>Hoje · {time}</strong></div>
                  <div className="matchup"><div><i>{home.slice(0, 1)}</i><b>{home}</b></div><small>VS</small><div><i className="away">{away.slice(0, 1)}</i><b>{away}</b></div></div>
                  <button className="watch-button"><Play size={13} fill="currentColor" /> ASSISTIR</button>
                </article>
              ))}
            </div>
            <button className="round-arrow right" onClick={() => setGameOffset(Math.min(0, gameOffset + 1))} aria-label="Próximos jogos"><ChevronRight size={20} /></button>
          </div>
        </section>

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
