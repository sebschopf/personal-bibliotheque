import type { Book } from "@/types/book"

// Clé pour le stockage local
const STORAGE_KEY = "books"

// Service pour gérer les opérations sur les livres
export const bookService = {
  // Récupérer tous les livres
  getBooks: async (): Promise<Book[]> => {
    try {
      if (typeof window === "undefined") return []

      const savedBooks = localStorage.getItem(STORAGE_KEY)
      return savedBooks ? JSON.parse(savedBooks) : []
    } catch (error) {
      console.error("Erreur lors de la récupération des livres:", error)
      return []
    }
  },

  // Ajouter un livre
  addBook: async (book: Book): Promise<Book> => {
    try {
      if (typeof window === "undefined") throw new Error("Opération non disponible")

      // S'assurer que le livre a un ID unique
      const newBook = {
        ...book,
        id: book.id || Date.now().toString(),
        readingStatus: book.readingStatus || "unread",
      }

      // Récupérer les livres existants
      const books = await bookService.getBooks()

      // Ajouter le nouveau livre
      const updatedBooks = [...books, newBook]

      // Sauvegarder dans le localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks))

      return newBook
    } catch (error) {
      console.error("Erreur lors de l'ajout du livre:", error)
      throw error
    }
  },

  // Mettre à jour un livre
  updateBook: async (updatedBook: Book): Promise<Book> => {
    try {
      if (typeof window === "undefined") throw new Error("Opération non disponible")

      // Récupérer les livres existants
      const books = await bookService.getBooks()

      // Mettre à jour le livre
      const updatedBooks = books.map((book) => (book.id === updatedBook.id ? updatedBook : book))

      // Sauvegarder dans le localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks))

      return updatedBook
    } catch (error) {
      console.error("Erreur lors de la mise à jour du livre:", error)
      throw error
    }
  },

  // Supprimer un livre
  removeBook: async (id: string): Promise<void> => {
    try {
      if (typeof window === "undefined") throw new Error("Opération non disponible")

      // Récupérer les livres existants
      const books = await bookService.getBooks()

      // Supprimer le livre
      const updatedBooks = books.filter((book) => book.id !== id)

      // Sauvegarder dans le localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks))
    } catch (error) {
      console.error("Erreur lors de la suppression du livre:", error)
      throw error
    }
  },

  // Importer des livres
  importBooks: async (importedBooks: Book[]): Promise<Book[]> => {
    try {
      if (typeof window === "undefined") throw new Error("Opération non disponible")

      // Récupérer les livres existants
      const existingBooks = await bookService.getBooks()

      // Créer un Map des livres existants pour une recherche rapide
      const booksMap = new Map(existingBooks.map((book) => [book.id, book]))

      // Ajouter ou mettre à jour chaque livre importé
      importedBooks.forEach((book) => {
        // S'assurer que le livre a un ID unique
        const bookWithId = {
          ...book,
          id: book.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          readingStatus: book.readingStatus || "unread",
        }

        booksMap.set(bookWithId.id, bookWithId)
      })

      // Convertir le Map en tableau
      const updatedBooks = Array.from(booksMap.values())

      // Sauvegarder dans le localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks))

      return updatedBooks
    } catch (error) {
      console.error("Erreur lors de l'importation des livres:", error)
      throw error
    }
  },

  // Exporter des livres
  exportBooks: (books: Book[]): string => {
    try {
      return JSON.stringify(books, null, 2)
    } catch (error) {
      console.error("Erreur lors de l'exportation des livres:", error)
      throw error
    }
  },
}

