import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Maximize, Play, Radio } from "lucide-react"
import channelDatabase from "../db.json"

type Channel = {
  id: string
  title: string
  subtitle?: string
  thumbnail?: string
  category?: string
  url: string
}

type Match = {
  id: string
  league?: string
  time_start?: string
  channel?: string
  player?: string
  players?: { name?: string }[]
  teams?: { home?: { name?: string; image?: string }; away?: { name?: string; image?: string } }
}

const channels = (channelDatabase as { name: string; url: string; image?: string }[]).map((channel, index) => ({
  id: `channel-${index}`,
  title: channel.name,
  thumbnail: channel.image,
  url: channel.url,
})) as Channel[]

function formatTime(value?: string) {
  if (!value) return "Ao Vivo"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Ao Vivo" : `Hoje · ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
}

export default function App() {
  const [selected, setSelected] = useState<Channel | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState(true)

  useEffect(() => {
    fetch("https://apisinalpublico.vercel.app/agenda.json")
      .then((response) => response.json())
      .then((data) => setMatches(Array.isArray(data) ? data : data.jogos ?? data.agenda ?? []))
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false))
  }, [])

  const agenda = useMemo(() => matches.map((match, index) => {
    const home = match.teams?.home?.name ?? "Casa"
    const away = match.teams?.away?.name ?? "Fora"
    return {
      ...match,
      id: `match-${index}`,
      home,
      away,
      channel: typeof match.channel === "string" ? match.channel : match.players?.[0]?.name ?? "ASSISTIR",
      league: typeof match.league === "string" ? match.league : (match.league as { name?: string } | undefined)?.name ?? "Futebol ao vivo",
      url: typeof match.player === "string" ? match.player : "",
    }
  }), [matches])

  if (selected) {
    return (
      <main className="player-screen">
        <div className="player-video">
          {selected.url ? <iframe src={selected.url} title={selected.title} allow="autoplay; fullscreen" allowFullScreen /> : <div className="player-empty"><Radio size={42} /><span>Player indisponível</span></div>}
        </div>
        <div className="player-header">
          <button className="icon-button" onClick={() => setSelected(null)} aria-label="Voltar ao menu"><ArrowLeft size={21} /></button>
          <div className="live-label"><span /> <strong>{selected.title}</strong></div>
        </div>
        <div className="player-controls">
          <button className="icon-button" onClick={() => setSelected(channels[(channels.indexOf(selected) - 1 + channels.length) % channels.length])} aria-label="Canal anterior"><ChevronLeft /></button>
          <button className="icon-button" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Tela cheia"><Maximize size={19} /></button>
          <button className="icon-button" onClick={() => setSelected(channels[(channels.indexOf(selected) + 1) % channels.length])} aria-label="Próximo canal"><ChevronRight /></button>
        </div>
      </main>
    )
  }

  return (
    <main className="menu-screen">
      <div className="menu-content">
        <header className="brand-card">
          <div className="brand-mark"><Radio size={22} /><span>TV ONLINE <b>HD</b></span></div>
        </header>

        <section className="agenda-section" aria-labelledby="agenda-title">
          <h2 id="agenda-title">Jogos ao vivo</h2>
          <div className="agenda-wrap">
            <button className="slider-button left" onClick={() => document.getElementById("agenda")?.scrollBy({ left: -310, behavior: "smooth" })} aria-label="Jogos anteriores"><ChevronLeft /></button>
            <div className="agenda" id="agenda">
              {loadingMatches && <span className="muted">Carregando jogos...</span>}
              {!loadingMatches && agenda.length === 0 && <span className="muted">Nenhum jogo na agenda no momento.</span>}
              {agenda.map((match) => (
                <button className="match-card" key={match.id} onClick={() => match.url && setSelected({ id: match.id, title: `${match.home} x ${match.away}`, url: match.url })}>
                  <div className="match-top"><span>{match.league ?? "Futebol ao vivo"}</span><b>{formatTime(match.time_start)}</b></div>
                  <div className="teams"><div><img src={match.teams?.home?.image} alt="" /><strong>{match.home}</strong></div><em>vs</em><div><img src={match.teams?.away?.image} alt="" /><strong>{match.away}</strong></div></div>
                  <span className="watch"><Play size={13} fill="currentColor" /> {match.channel}</span>
                </button>
              ))}
            </div>
            <button className="slider-button right" onClick={() => document.getElementById("agenda")?.scrollBy({ left: 310, behavior: "smooth" })} aria-label="Próximos jogos"><ChevronRight /></button>
          </div>
        </section>

        <section aria-labelledby="channels-title">
          <h2 id="channels-title">Canais disponíveis</h2>
          <div className="channel-grid">
            {channels.map((channel) => (
              <button className="channel-card" key={channel.id} onClick={() => setSelected(channel)}>
                <span className="channel-logo">{channel.thumbnail ? <img src={channel.thumbnail} alt="" loading="lazy" /> : <b>{channel.title.slice(0, 2).toUpperCase()}</b>}</span>
                <span>{channel.title}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <footer>© TV Online HD — Este site não hospeda conteúdo de vídeo, apenas incorpora players de fontes públicas disponíveis na internet.</footer>
    </main>
  )
}
