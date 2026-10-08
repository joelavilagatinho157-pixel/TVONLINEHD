"use client"

import { useEffect, useRef, useState } from "react"
import { X, Maximize2, ChevronUp, ChevronDown } from "lucide-react"
import channelsData from "@/data/db.json"

type Channel = { id: number; nome?: string; name?: string; img?: string; image?: string; url?: string; categoria?: string; epg?: string; epg_url?: string }
type EpgProgram = { title: string; desc?: string; start_date: string }
type EpgChannel = { id: string; data: EpgProgram[] }

function getEpgId(channel: Channel) {
  const source = channel.epg || channel.epg_url || ""
  const fromUrl = source.match(/[?&]id=([^&]+)/)?.[1]
  return fromUrl || channel.nome?.toLowerCase().replace(/[^a-z0-9]+/g, "") || ""
}

function formatProgramTime(value?: string) {
  if (!value) return "--:--"
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}

export default function Home() {
  const channels = (channelsData as Channel[]).map((channel, index) => ({
    ...channel,
    id: channel.id ?? index,
    nome: channel.nome || channel.name || "Canal",
    img: channel.img || channel.image,
  }))
  const [selected, setSelected] = useState<Channel | null>(null)
  const [epg, setEpg] = useState<EpgProgram[]>([])
  const playerRef = useRef<HTMLDivElement>(null)
  const selectedIndex = selected ? channels.findIndex((channel) => channel.id === selected.id) : -1

  useEffect(() => {
    if (!selected) {
      setEpg([])
      return
    }

    const controller = new AbortController()
    const epgId = getEpgId(selected)

    fetch("https://embedtv.lat/api/epg_all", { signal: controller.signal })
      .then((response) => response.json() as Promise<EpgChannel[]>)
      .then((items) => {
        const match = items.find((item) => item.id.toLowerCase() === epgId.toLowerCase())
        setEpg((match?.data || []).sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date)))
      })
      .catch(() => setEpg([]))

    return () => controller.abort()
  }, [selected])

  const now = Date.now()
  const currentProgram = epg.filter((program) => Date.parse(program.start_date) <= now).at(-1)
  const nextProgram = epg.find((program) => Date.parse(program.start_date) > now)

  useEffect(() => {
    if (!selected) return
    playerRef.current?.focus()

    const handleRemoteKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ChannelUp" || event.key === "PageUp" || event.key === "MediaTrackNext") {
        event.preventDefault()
        const nextIndex = (selectedIndex - 1 + channels.length) % channels.length
        setSelected(channels[nextIndex])
      } else if (event.key === "ArrowDown" || event.key === "ChannelDown" || event.key === "PageDown" || event.key === "MediaTrackPrevious") {
        event.preventDefault()
        const nextIndex = (selectedIndex + 1) % channels.length
        setSelected(channels[nextIndex])
      } else if (event.key === "Escape" || event.key === "Backspace") {
        event.preventDefault()
        setSelected(null)
      }
    }

    window.addEventListener("keydown", handleRemoteKey)
    return () => window.removeEventListener("keydown", handleRemoteKey)
  }, [selected])

  const changeChannel = (direction: -1 | 1) => {
    if (selectedIndex < 0 || channels.length < 2) return
    const nextIndex = (selectedIndex + direction + channels.length) % channels.length
    setSelected(channels[nextIndex])
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      document.querySelector(".player-modal")?.requestFullscreen?.()
    }
  }

  const openMenuAd = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest(".channel-card")) {
      window.open("https://omg10.com/4/9732098", "_blank", "noopener,noreferrer")
    }
  }

  return (
    <main className="tv-page">
      <div className="tv-container">
        <header className="brand-panel">
          <a href="#canais" className="brand-mark" aria-label="TV Online HD">
            <span>TV ONLINE</span><b>HD</b>
          </a>
        </header>

        <section id="telaMenu" className="channels-section" aria-labelledby="channels-title" onClick={openMenuAd}>
          <div className="channels-heading"><h2 id="channels-title">CANAIS DISPONÍVEIS</h2></div>
          <div className="channel-grid">
            {channels.map((channel) => (
              <button className="channel-card" key={channel.id} onClick={() => setSelected(channel)}>
                <span className="channel-logo">{channel.img && <img src={channel.img} alt={`${channel.nome} logo`} onError={(event) => { event.currentTarget.style.display = "none" }} />}</span>
                <strong>{channel.nome}</strong>
              </button>
            ))}
          </div>
        </section>
      </div>
      <footer>© TV Online HD - Este site não hospeda nenhum conteúdo de vídeo, apenas incorpora players de fontes públicas disponíveis na internet.</footer>
      {selected && (
        <div
          ref={playerRef}
          className="player-modal"
          role="dialog"
          aria-label={`Player ${selected.nome}`}
          tabIndex={-1}
        >
          <button className="player-back" onClick={() => setSelected(null)} aria-label="Voltar">
            <X size={22} />
          </button>
          <div className="player-title"><span /> {selected.nome}</div>
          <iframe
            key={selected.id}
            src={selected.url}
            title={`Player ${selected.nome}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
          <div className="player-epg" aria-live="polite">
            <div><small>NO AR</small><strong>{currentProgram?.title || "Programação indisponível"}</strong><span>{currentProgram ? formatProgramTime(currentProgram.start_date) : ""}</span></div>
            <div><small>A SEGUIR</small><strong>{nextProgram?.title || "Aguardando programação"}</strong><span>{nextProgram ? formatProgramTime(nextProgram.start_date) : ""}</span></div>
          </div>
          <div className="player-controls" aria-label="Controles do player">
            <button onClick={() => changeChannel(-1)} aria-label="Canal anterior" title="Canal anterior">
              <ChevronUp size={18} />
            </button>
            <button onClick={toggleFullscreen} aria-label="Tela cheia" title="Tela cheia">
              <Maximize2 size={17} />
            </button>
            <button onClick={() => changeChannel(1)} aria-label="Próximo canal" title="Próximo canal">
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
