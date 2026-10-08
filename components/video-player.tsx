"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Maximize, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Channel } from "@/types/channel"

type EpgItem = {
  title?: string
  desc?: string
  start_date?: string
}

type EpgResponse = Record<string, EpgItem[]> | Array<{ id: string; data: EpgItem[] }>

interface VideoPlayerProps {
  channel: Channel
  channels?: Channel[]
  onClose: () => void
  onChannelChange?: (channel: Channel) => void
}

const EPG_URL = "https://embedtv.lat/api/epg_all"

export function VideoPlayer({ channel, channels = [], onClose, onChannelChange }: VideoPlayerProps) {
  const streams = useMemo(
    () => [channel.url, channel.stream2, channel.stream3, channel.stream4].filter(Boolean),
    [channel],
  )
  const [streamIndex, setStreamIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<EpgItem[]>([])
  const [showEpg, setShowEpg] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setStreamIndex(0)
    setIsLoading(true)
    setPrograms([])
    setShowEpg(true)

    let hideTimer: number | undefined

    const loadEpg = async () => {
      try {
        const response = await fetch(EPG_URL, { cache: "force-cache" })
        if (!response.ok) return
        const payload = (await response.json()) as EpgResponse
        const key = channel.nome.toLowerCase().replace(/[^a-z0-9]+/g, "")
        const data = Array.isArray(payload)
          ? payload.find((item) => item.id.toLowerCase().replace(/[^a-z0-9]+/g, "") === key)?.data
          : Object.entries(payload).find(([id]) => id.toLowerCase().replace(/[^a-z0-9]+/g, "") === key)?.[1]
        setPrograms(data ?? [])
        setShowEpg(Boolean(data?.length))
        if (data?.length) hideTimer = window.setTimeout(() => setShowEpg(false), 5_000)
      } catch {
        setPrograms([])
      }
    }

    const epgTimer = window.setTimeout(() => void loadEpg(), 350)
    return () => {
      window.clearTimeout(epgTimer)
      if (hideTimer) window.clearTimeout(hideTimer)
    }
  }, [channel])

  const now = Date.now()
  const current = [...programs]
    .filter((program) => program.start_date && new Date(program.start_date).getTime() <= now)
    .sort((a, b) => new Date(b.start_date!).getTime() - new Date(a.start_date!).getTime())[0]
  const orderedPrograms = [...programs]
    .filter((program) => program.start_date)
    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())
  const currentIndex = orderedPrograms.findIndex((program, index) => {
    const start = new Date(program.start_date!).getTime()
    const end = orderedPrograms[index + 1]?.start_date
      ? new Date(orderedPrograms[index + 1].start_date!).getTime()
      : Number.POSITIVE_INFINITY
    return start <= now && now < end
  })
  const current = currentIndex >= 0 ? orderedPrograms[currentIndex] : undefined
  const upcoming = orderedPrograms.slice(currentIndex + 1, currentIndex + 4)
  const formatTime = (value?: string) =>
    value ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "--:--"

  const channelIndex = channels.findIndex((item) => item.id === channel.id)
  const changeChannel = (offset: number) => {
    if (!onChannelChange || !channels.length || channelIndex < 0) return
    onChannelChange(channels[(channelIndex + offset + channels.length) % channels.length])
  }

  const toggleFullscreen = async () => {
    const player = document.querySelector(".player-shell")
    if (!document.fullscreenElement) await player?.requestFullscreen?.()
    else await document.exitFullscreen()
    setIsFullscreen(Boolean(document.fullscreenElement))
  }

  return (
    <div className="player-shell fixed inset-0 z-50 flex flex-col bg-black">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/75 via-black/35 to-transparent px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <img src={channel.img} alt="" className="h-9 w-9 rounded-md object-contain" />
          <div><h2 className="text-sm font-semibold text-white">{channel.nome}</h2><span className="text-[11px] text-white/60">AO VIVO</span></div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10"><X /><span className="sr-only">Fechar player</span></Button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        {isLoading && <div className="absolute z-[1] text-sm text-white/60">Carregando canal...</div>}
        <iframe key={streams[streamIndex]} src={streams[streamIndex]} title={`Player ao vivo: ${channel.nome}`} className="relative z-[2] h-full w-full border-0" loading="eager" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen onLoad={() => setIsLoading(false)} />

        {showEpg && (current || upcoming.length > 0) && <section className="absolute bottom-5 left-5 z-10 w-[min(390px,calc(100%-80px))] overflow-hidden rounded-2xl border border-white/15 bg-[#071019]/95 text-white shadow-2xl backdrop-blur-md" aria-label="Grade de programação do canal">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Grade de programação</p><p className="mt-0.5 text-[11px] text-white/50">{channel.nome}</p></div>
            <button onClick={() => setShowEpg(false)} className="rounded-md px-2 py-1 text-[11px] text-white/50 transition hover:bg-white/10 hover:text-white">Ocultar</button>
          </div>
          <div className="px-4 py-3">
            {current && <div className="relative mb-3 overflow-hidden rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-3">
              <div className="mb-1 flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />No ar agora</span><span className="text-[11px] text-white/55">{formatTime(current.start_date)}</span></div>
              <p className="truncate text-sm font-semibold">{current.title || "Programação atual"}</p>
              {current.desc && <p className="mt-1 truncate text-[11px] text-white/55">{current.desc}</p>}
            </div>}
            {upcoming.length > 0 && <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">A seguir</p><div className="space-y-1">{upcoming.map((program, index) => <div key={`${program.start_date}-${index}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5"><span className="w-10 shrink-0 text-[11px] font-medium text-white/45">{formatTime(program.start_date)}</span><span className="truncate text-xs text-white/80">{program.title || "Próximo programa"}</span></div>)}</div></div>}
          </div>
        </section>}

        <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur-md player-controls">
          <Button variant="ghost" size="icon" aria-label="Canal anterior" onClick={() => changeChannel(-1)} className="text-white hover:bg-white/15"><ChevronUp /></Button>
          <Button variant="ghost" size="icon" aria-label="Tela cheia" onClick={toggleFullscreen} className="text-white hover:bg-white/15"><Maximize /></Button>
          <Button variant="ghost" size="icon" aria-label="Próximo canal" onClick={() => changeChannel(1)} className="text-white hover:bg-white/15"><ChevronDown /></Button>
        </div>
      </div>
    </div>
  )
}
