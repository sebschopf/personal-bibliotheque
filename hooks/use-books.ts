"use client"

import { useState, useEffect, useCallback } from "react"
import type { Book } from "@/types/book"
import { bookService } from "@/services/book-service"

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les livres au démarrage
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true)
        const loadedBooks = await bookService.getBooks()
        setBooks(loadedBooks)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des livres:", err)
        setError("Impossible de charger les livres. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }

    loadBooks()
  }, [])

  // Ajouter un livre
  const addBook = useCallback(async (book: Book) => {
    try {
      const newBook = await bookService.addBook(book)
      setBooks((prevBooks) => [...prevBooks, newBook])
      return newBook
    } catch (err) {
      console.error("Erreur lors de l'ajout du livre:", err)
      setError("Impossible d'ajouter le livre. Veuillez réessayer.")
      throw err
    }
  }, [])

  // Mettre à jour un livre
  const updateBook = useCallback(async (updatedBook: Book) => {
    try {
      const result = await bookService.updateBook(updatedBook)
      setBooks((prevBooks) => prevBooks.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
      return result
    } catch (err) {
      console.error("Erreur lors de la mise à jour du livre:", err)
      setError("Impossible de mettre à jour le livre. Veuillez réessayer.")
      throw err
    }
  }, [])

  // Supprimer un livre
  const removeBook = useCallback(async (id: string) => {
    try {
      await bookService.removeBook(id)
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id))
    } catch (err) {
      console.error("Erreur lors de la suppression du livre:", err)
      setError("Impossible de supprimer le livre. Veuillez réessayer.")
      throw err
    }
  }, [])

  // Importer des livres
  const importBooks = useCallback(async (importedBooks: Book[]) => {
    try {
      const result = await bookService.importBooks(importedBooks)
      setBooks((prevBooks) => {
        // Créer un Map des livres existants pour une recherche rapide
        const existingBooksMap = new Map(prevBooks.map((book) => [book.id, book]))

        // Ajouter ou mettre à jour chaque livre importé
        importedBooks.forEach((book) => {
          existingBooksMap.set(book.id, book)
        })

        // Convertir le Map en tableau
        return Array.from(existingBooksMap.values())
      })
      return result
    } catch (err) {
      console.error("Erreur lors de l'importation des livres:", err)
      setError("Impossible d'importer les livres. Veuillez réessayer.")
      throw err
    }
  }, [])

  // Exporter des livres
  const exportBooks = useCallback(() => {
    try {
      return bookService.exportBooks(books)
    } catch (err) {
      console.error("Erreur lors de l'exportation des livres:", err)
      setError("Impossible d'exporter les livres. Veuillez réessayer.")
      throw err
    }
  }, [books])

  return {
    books,
    isLoading,
    error,
    addBook,
    updateBook,
    removeBook,
    importBooks,
    exportBooks,
  }
}

