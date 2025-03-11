"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useBooks } from "@/hooks/use-books"
import type { Book } from "@/types/book"

// Définir le type du contexte
interface BookContextType {
  books: Book[]
  isLoading: boolean
  error: string | null
  addBook: (book: Book) => Promise<Book>
  updateBook: (book: Book) => Promise<Book>
  removeBook: (id: string) => Promise<void>
  importBooks: (books: Book[]) => Promise<Book[]>
  exportBooks: () => string
}

// Créer le contexte
const BookContext = createContext<BookContextType | undefined>(undefined)

// Hook personnalisé pour utiliser le contexte
export function useBookContext() {
  const context = useContext(BookContext)
  if (context === undefined) {
    throw new Error("useBookContext doit être utilisé à l'intérieur d'un BookProvider")
  }
  return context
}

// Composant Provider
export function BookProvider({ children }: { children: ReactNode }) {
  const booksData = useBooks()

  return <BookContext.Provider value={booksData}>{children}</BookContext.Provider>
}

