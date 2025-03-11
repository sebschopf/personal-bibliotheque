export interface Book {
  id: string
  title: string
  author: string
  genre: string
  publisher?: string
  publishedDate?: string
  isbn?: string
  coverUrl?: string
  description?: string
  pageCount?: number
  readingStatus?: "unread" | "reading" | "read"
  // Ajout de champs supplémentaires pour une future évolution
  language?: string
  rating?: number
  notes?: string
  tags?: string[]
  dateAdded?: string
  dateModified?: string
}

export interface BookFilter {
  searchTerm?: string
  genre?: string
  readingStatus?: "unread" | "reading" | "read"
  author?: string
  sortBy?: keyof Book
  sortOrder?: "asc" | "desc"
}

export interface BookStats {
  total: number
  read: number
  reading: number
  unread: number
  byGenre: Record<string, number>
  byAuthor: Record<string, number>
}

