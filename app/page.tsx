"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import channelsData from "@/data/db.json"
import { ChannelCard } from "@/components/channel-card"
import { VideoPlayer } from "@/components/video-player"
import type { Channel } from "@/types/channel"

export default function Home() {
  const channels = useMemo(() => (channelsData as Array<{ name: string; url: string; image: string }>).map((channel, index) => ({
    id: index,
    nome: channel.name,
    img: channel.image,
    url: channel.url,
  })), [])
  const [selected, setSelected] = useState<Channel | null>(null)
  const [query, setQuery] = useState("")

  const filteredChannels = channels.filter((channel) =>
    channel.nome.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <main className="tv-page">
      <div className="tv-container">
        <header className="brand-panel">
          <a href="#canais" className="brand-mark" aria-label="TV Online HD"><span>TV ONLINE</span><b>HD</b></a>
          <span className="status-pill"><i /> transmissão ao vivo</span>
        </header>

        <section id="canais" className="channels-section" aria-labelledby="channels-title">
          <div className="channels-heading">
            <div><p className="eyebrow">biblioteca ao vivo</p><h1 id="channels-title">Canais disponíveis</h1></div>
            <label className="search-box"><Search size={15} aria-hidden="true" /><span className="sr-only">Pesquisar canais</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar canal" /></label>
          </div>
          <p className="section-note">Escolha um canal para abrir o player. A reprodução é otimizada para carregar apenas quando necessário.</p>
          <div className="channel-grid">
            {filteredChannels.map((channel) => <ChannelCard key={channel.id} channel={channel} onSelect={setSelected} />)}
          </div>
          {!filteredChannels.length && <p className="empty">Nenhum canal encontrado.</p>}
        </section>
      </div>
      <footer>© TV Online HD · Conteúdo incorporado de fontes públicas disponíveis na internet.</footer>
      {selected && <VideoPlayer channel={selected} channels={channels} onClose={() => setSelected(null)} onChannelChange={setSelected} />}
    </main>
  )
}
