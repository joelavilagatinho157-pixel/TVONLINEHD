"use client"

import { useState, useMemo } from "react"
import channelsData from "@/data/db.json"
import type { Channel } from "@/types/channel"
import { Header } from "@/components/header"
import { CategorySidebar } from "@/components/category-sidebar"
import { ChannelCard } from "@/components/channel-card"
import { VideoPlayer } from "@/components/video-player"

export default function Home() {
  const channels = useMemo<Channel[]>(
    () =>
      (channelsData as { name: string; url: string; image: string }[]).map(
        (channel, index) => ({
          id: index + 1,
          nome: channel.name,
          categoria: "Canais",
          img: channel.image,
          url: channel.url,
        })
      ),
    []
  )

  const categories = useMemo(
    () => [{ id: "Canais", name: "Canais", count: channels.length }],
    [channels]
  )

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)

  const filteredChannels = useMemo(() => {
    let filtered = channels.filter(
      (channel) => channel.categoria.toLowerCase() === activeCategory.toLowerCase()
    )

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((channel) =>
        channel.nome.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [activeCategory, searchQuery, channels])

  const currentCategory = categories.find(
    (c) => c.id.toLowerCase() === activeCategory.toLowerCase()
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1">
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {currentCategory?.name || "Canais"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredChannels.length}{" "}
              {filteredChannels.length === 1 ? "canal" : "canais"} disponíveis
            </p>
          </div>

          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum canal encontrado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente buscar por outro termo ou selecione outra categoria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onSelect={setSelectedChannel}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </div>
  )
}
