export interface Channel {
  id: number
  nome: string
  categoria: string
  img: string
  url: string
  stream2?: string
  stream3?: string
  stream4?: string
  epg?: string
  epg_url?: string
}

export interface CategoryInfo {
  id: string
  name: string
  icon: string
}
