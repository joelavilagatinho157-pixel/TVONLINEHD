"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Search, Tv, X, Maximize2, Radio } from "lucide-react"
import channelsData from "@/data/db.json"

type Channel = { id: number; nome: string; img?: string; url?: string; categoria?: string }

const games = [
  ["Campeonato Brasileiro", "19:00", "Flamengo", "Palmeiras", "Premiere"],
  ["UEFA Champions League", "21:30", "Barcelona", "Inter de Milão", "Sportv"],
  ["Copa do Brasil", "20:00", "Corinthians", "Grêmio", "Globo"],
  ["Premier League", "16:00", "Liverpool", "Arsenal", "ESPN"],
]

export default function Home() {
  const channels = (channelsData as Array<Channel & { name?: string; image?: string }>).map((channel, index) => ({
    ...channel,
    id: channel.id ?? index,
    nome: channel.nome || channel.name || "Canal",
    img: channel.img || channel.image,
  }))
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Todos")
  const [selected, setSelected] = useState<Channel | null>(null)
  const [offset, setOffset] = useState(0)
  const categories = ["Todos", ...Array.from(new Set(channels.map((c) => c.categoria || "Outros")))]
  const filtered = useMemo(() => channels.filter((c) => {
    const matchesCategory = category === "Todos" || (c.categoria || "Outros") === category
    return matchesCategory && String(c.nome || "Canal").toLowerCase().includes(query.toLowerCase())
  }), [channels, category, query])
  const visibleGames = games.slice(offset, offset + 4)

  return <main className="tv-shell">
    <header className="topbar">
      <a className="logo" href="#top"><span className="logo-icon"><Tv size={22} /></span><span>TV Online <b>HD</b></span></a>
      <nav className="main-nav" aria-label="Navegação principal"><a className="active" href="#canais">Início</a><a href="#canais">Canais ao vivo</a><a href="#agenda">Programação</a></nav>
      <label className="top-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar canais..." aria-label="Buscar canais" /></label>
    </header>

    <div className="page-content" id="top">
      <section className="welcome"><div><span className="eyebrow"><Radio size={14} /> AO VIVO AGORA</span><h1>Assista TV online<br /><em>onde estiver.</em></h1><p>Encontre seus canais favoritos em um só lugar.</p></div><div className="welcome-stat"><strong>{channels.length}+</strong><span>canais disponíveis</span></div></section>

      <section id="agenda" className="section-block"><div className="section-title"><div><span className="eyebrow">AGENDA ESPORTIVA</span><h2>Jogos ao vivo</h2></div><div className="slider-actions"><button onClick={() => setOffset(Math.max(0, offset - 1))} aria-label="Jogos anteriores"><ChevronLeft size={18} /></button><button onClick={() => setOffset(Math.min(games.length - 4, offset + 1))} aria-label="Próximos jogos"><ChevronRight size={18} /></button></div></div><div className="games-grid">{visibleGames.map(([league, time, home, away, channel]) => <article className="game-card" key={home}><div className="game-meta"><span>{league}</span><b>Hoje · {time}</b></div><div className="teams"><div><span className="team-logo">{home.slice(0, 2).toUpperCase()}</span><strong>{home}</strong></div><small>VS</small><div><span className="team-logo alt">{away.slice(0, 2).toUpperCase()}</span><strong>{away}</strong></div></div><button className="watch-game" onClick={() => setQuery(channel)}><Play size={13} fill="currentColor" /> Assistir em {channel}</button></article>)}</div></section>

      <section id="canais" className="section-block"><div className="section-title channels-title"><div><span className="eyebrow">GRADE DE PROGRAMAÇÃO</span><h2>Canais disponíveis</h2></div><span className="channel-count">{filtered.length} canais</span></div><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="channel-grid">{filtered.map((channel) => <button className="channel-card" key={channel.id} onClick={() => setSelected(channel)}><span className="live-badge"><i /> AO VIVO</span><span className="channel-image">{channel.img ? <img src={channel.img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none" }} /> : null}<span>{channel.nome.slice(0, 2).toUpperCase()}</span></span><strong>{channel.nome}</strong><small>{channel.categoria || "TV"}</small><span className="card-play"><Play size={14} fill="currentColor" /></span></button>)}</div>{!filtered.length && <div className="empty">Nenhum canal encontrado.</div>}</section>
    </div>
    <footer>TV Online HD <span>•</span> Feito para assistir seus canais favoritos em qualquer dispositivo.</footer>
    {selected && <div className="player-modal"><button className="close-player" onClick={() => setSelected(null)} aria-label="Fechar player"><X /></button><div className="player-label"><span className="live-dot" /> {selected.nome}</div><iframe src={selected.url} title={`Player ${selected.nome}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><button className="full-player" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Tela cheia"><Maximize2 size={18} /></button></div>}
  </main>
}
