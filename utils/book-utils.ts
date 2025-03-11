import type { Book } from "@/types/book"

// Fonction pour générer un ID unique
export function generateUniqueId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Fonction pour valider un ISBN
export function isValidIsbn(isbn: string): boolean {
  // Supprimer les tirets et les espaces
  const cleanIsbn = isbn.replace(/[-\s]/g, "")

  // Vérifier la longueur (ISBN-10 ou ISBN-13)
  if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
    return false
  }

  // Vérifier que tous les caractères sont des chiffres (sauf le dernier caractère d'un ISBN-10 qui peut être 'X')
  if (cleanIsbn.length === 10) {
    if (!/^[\dX]{10}$/.test(cleanIsbn)) {
      return false
    }
  } else {
    if (!/^\d{13}$/.test(cleanIsbn)) {
      return false
    }
  }

  return true
}

// Fonction pour formater un ISBN
export function formatIsbn(isbn: string): string {
  // Supprimer les tirets et les espaces
  const cleanIsbn = isbn.replace(/[-\s]/g, "")

  // Formater selon la longueur
  if (cleanIsbn.length === 10) {
    return `${cleanIsbn.substring(0, 1)}-${cleanIsbn.substring(1, 4)}-${cleanIsbn.substring(4, 9)}-${cleanIsbn.substring(9)}`
  } else if (cleanIsbn.length === 13) {
    return `${cleanIsbn.substring(0, 3)}-${cleanIsbn.substring(3, 4)}-${cleanIsbn.substring(4, 7)}-${cleanIsbn.substring(7, 12)}-${cleanIsbn.substring(12)}`
  }

  return isbn
}

// Fonction pour trier les livres
export function sortBooks(books: Book[], sortBy: keyof Book = "title", sortOrder: "asc" | "desc" = "asc"): Book[] {
  return [...books].sort((a, b) => {
    const valueA = a[sortBy] || ""
    const valueB = b[sortBy] || ""

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB, "fr", { sensitivity: "base" })
        : valueB.localeCompare(valueA, "fr", { sensitivity: "base" })
    }

    return 0
  })
}

// Fonction pour filtrer les livres
export function filterBooks(books: Book[], filters: Partial<Book>): Book[] {
  return books.filter((book) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return true
      }

      const bookValue = book[key as keyof Book]

      if (typeof bookValue === "string" && typeof value === "string") {
        return bookValue.toLowerCase().includes(value.toLowerCase())
      }

      return bookValue === value
    })
  })
}

// Fonction pour grouper les livres
export function groupBooksByField(books: Book[], field: keyof Book): Record<string, Book[]> {
  return books.reduce(
    (groups, book) => {
      const value = book[field]
      const key = (value || "Non spécifié").toString()

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(book)
      return groups
    },
    {} as Record<string, Book[]>,
  )
}

