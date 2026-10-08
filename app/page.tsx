"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Maximize2, Search, X } from "lucide-react"
import channelsData from "@/data/db.json"

type Channel = {
  id: number
  nome?: string
  name?: string
  img?: string
  image?: string
  url?: string
  stream2?: string
  stream3?: string
  stream4?: string
  categoria?: string
}

const categories = ["Todos", "TV Aberta", "Esportes", "Notícias", "Infantil", "Documentários"]

export default function Home() {
  const channels = (channelsData as Channel[]).map((channel, index) => ({
    ...channel,
    id: channel.id ?? index,
    nome: channel.nome || channel.name || "Canal",
    img: channel.img || channel.image,
  }))
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Todos")
  const [selected, setSelected] = useState<Channel | null>(null)
  const selectedIndex = selected ? channels.findIndex((channel) => channel.id === selected.id) : -1
  const filtered = useMemo(() => channels.filter((channel) => {
    const matchesSearch = channel.nome?.toLowerCase().includes(query.toLowerCase())
    const normalized = channel.categoria?.toLowerCase() || ""
    const matchesCategory = category === "Todos" || normalized.includes(category.toLowerCase().replace("í", "i").replace("ó", "o"))
    return matchesSearch && matchesCategory
  }), [channels, query, category])

  const changeChannel = (direction: -1 | 1) => {
    if (selectedIndex < 0) return
    setSelected(channels[(selectedIndex + direction + channels.length) % channels.length])
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.querySelector(".player-modal")?.requestFullscreen?.()
  }

  return (
    <main className="tv-page">
      <div className="tv-container">
        <header className="site-header">
          <a href="#canais" className="brand-mark" aria-label="TV Online HD"><span>TV ONLINE</span><b>HD</b></a>
          <p>Assista seus canais favoritos online</p>
        </header>

        <section id="canais" className="channels-section" aria-labelledby="channels-title">
          <div className="section-topline">
            <div><span className="eyebrow">TV AO VIVO</span><h1 id="channels-title">Canais disponíveis</h1></div>
            <label className="search-box"><Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar canal" aria-label="Buscar canal" /></label>
          </div>
          <nav className="category-tabs" aria-label="Categorias">
            {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </nav>
          <p className="result-count">{filtered.length} canais encontrados</p>
          <div className="channel-grid">
            {filtered.map((channel) => <button className="channel-card" key={channel.id} onClick={() => setSelected(channel)} aria-label={`Assistir ${channel.nome}`}>
              <span className="channel-logo">{channel.img && <img src={channel.img} alt="" onError={(event) => { event.currentTarget.style.display = "none" }} />}<em>{channel.nome?.slice(0, 2).toUpperCase()}</em></span>
              <strong>{channel.nome}</strong><span className="watch-label">Assistir agora</span>
            </button>)}
          </div>
          {!filtered.length && <p className="empty">Nenhum canal encontrado.</p>}
        </section>
      </div>
      <footer>© TV Online HD · Este site apenas incorpora players de fontes públicas disponíveis na internet.</footer>
      {selected && <div className="player-modal" role="dialog" aria-modal="true" aria-label={`Player ${selected.nome}`}>
        <button className="player-back" onClick={() => setSelected(null)} aria-label="Fechar player"><X size={21} /></button>
        <div className="player-title"><span />{selected.nome}</div>
        <iframe key={selected.id} src={selected.url} title={`Player ${selected.nome}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        <div className="player-controls" aria-label="Controles do player">
          <button onClick={() => changeChannel(-1)} aria-label="Canal anterior" title="Canal anterior"><ChevronUp size={18} /></button>
          <button onClick={toggleFullscreen} aria-label="Tela cheia" title="Tela cheia"><Maximize2 size={17} /></button>
          <button onClick={() => changeChannel(1)} aria-label="Próximo canal" title="Próximo canal"><ChevronDown size={18} /></button>
        </div>
      </div>}
    </main>
  )
}
