import type { Book } from "@/types/book"

// Service pour la recherche de livres
export const bookSearchService = {
  // Rechercher un livre par ISBN
  searchByIsbn: async (isbn: string): Promise<Book> => {
    try {
      // Essayer d'abord l'API Google Books
      const googleBook = await bookSearchService.searchGoogleBooks(isbn)
      if (googleBook) return googleBook

      // Ensuite, essayer l'API Open Library
      const openLibraryBook = await bookSearchService.searchOpenLibrary(isbn)
      if (openLibraryBook) return openLibraryBook

      // Ensuite, essayer l'API BNF
      const bnfBook = await bookSearchService.searchBNF(isbn)
      if (bnfBook) return bnfBook

      // Enfin, essayer WorldCat
      const worldCatBook = await bookSearchService.searchWorldCat(isbn)
      if (worldCatBook) return worldCatBook

      throw new Error(`Aucun livre trouvé avec l'ISBN ${isbn}`)
    } catch (error) {
      console.error("Erreur lors de la recherche du livre:", error)
      throw error
    }
  },

  // Rechercher un livre sur Google Books
  searchGoogleBooks: async (isbn: string): Promise<Book | null> => {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      const data = await response.json()

      if (data.items && data.items[0]) {
        const bookInfo = data.items[0].volumeInfo

        return {
          id: Date.now().toString(),
          title: bookInfo.title || "Titre inconnu",
          author: bookInfo.authors ? bookInfo.authors.join(", ") : "Auteur inconnu",
          isbn: isbn,
          publisher: bookInfo.publisher || "Éditeur inconnu",
          publishedDate: bookInfo.publishedDate || "Date inconnue",
          coverUrl: bookInfo.imageLinks?.thumbnail || "",
          description: bookInfo.description || "",
          pageCount: bookInfo.pageCount || 0,
          genre:
            bookInfo.categories && bookInfo.categories.length > 0
              ? bookInfo.categories.join(", ")
              : "Genre non spécifié",
          readingStatus: "unread",
        }
      }

      return null
    } catch (error) {
      console.error("Erreur lors de la recherche sur Google Books:", error)
      return null
    }
  },

  // Rechercher un livre sur Open Library
  searchOpenLibrary: async (isbn: string): Promise<Book | null> => {
    try {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)
      const data = await response.json()

      if (data[`ISBN:${isbn}`]) {
        const bookInfo = data[`ISBN:${isbn}`]

        return {
          id: Date.now().toString(),
          title: bookInfo.title || "Titre inconnu",
          author:
            bookInfo.authors && bookInfo.authors.length > 0
              ? bookInfo.authors.map((a: any) => a.name).join(", ")
              : "Auteur inconnu",
          isbn: isbn,
          publisher:
            bookInfo.publishers && bookInfo.publishers.length > 0
              ? bookInfo.publishers.map((p: any) => p.name).join(", ")
              : "Éditeur inconnu",
          publishedDate: bookInfo.publish_date || "Date inconnue",
          coverUrl: bookInfo.cover?.medium || bookInfo.cover?.large || bookInfo.cover?.small || "",
          description: bookInfo.notes || bookInfo.excerpts?.[0]?.text || "",
          pageCount: bookInfo.number_of_pages || 0,
          genre:
            bookInfo.subjects && bookInfo.subjects.length > 0
              ? bookInfo.subjects
                  .slice(0, 3)
                  .map((s: any) => s.name || s)
                  .join(", ")
              : "Genre non spécifié",
          readingStatus: "unread",
        }
      }

      return null
    } catch (error) {
      console.error("Erreur lors de la recherche sur Open Library:", error)
      return null
    }
  },

  // Rechercher un livre sur la BNF
  searchBNF: async (isbn: string): Promise<Book | null> => {
    try {
      const response = await fetch(
        `https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=bib.isbn%20adj%20%22${isbn}%22&recordSchema=dublincore`,
      )
      const text = await response.text()

      // Vérifier si la réponse contient des données de livre
      if (text.includes("<dc:title>") && !text.includes("numberOfRecords>0<")) {
        // Extraire les informations du livre à partir du XML
        const getXmlValue = (xml: string, tag: string) => {
          const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s")
          const match = xml.match(regex)
          return match ? match[1] : ""
        }

        const title = getXmlValue(text, "dc:title") || "Titre inconnu"
        const author = getXmlValue(text, "dc:creator") || "Auteur inconnu"
        const publisher = getXmlValue(text, "dc:publisher") || "Éditeur inconnu"
        const date = getXmlValue(text, "dc:date") || "Date inconnue"
        const description = getXmlValue(text, "dc:description") || ""
        const subject = getXmlValue(text, "dc:subject") || "Genre non spécifié"

        return {
          id: Date.now().toString(),
          title,
          author,
          isbn,
          publisher,
          publishedDate: date,
          coverUrl: "",
          description,
          pageCount: 0,
          genre: subject,
          readingStatus: "unread",
        }
      }

      return null
    } catch (error) {
      console.error("Erreur lors de la recherche sur la BNF:", error)
      return null
    }
  },

  // Rechercher un livre sur WorldCat
  searchWorldCat: async (isbn: string): Promise<Book | null> => {
    try {
      const response = await fetch(`https://www.worldcat.org/search?q=bn:${isbn}&qt=advanced`)

      if (response.ok) {
        return {
          id: Date.now().toString(),
          title: "Livre trouvé sur WorldCat",
          author: "Voir détails sur WorldCat",
          isbn: isbn,
          publisher: "Voir détails sur WorldCat",
          publishedDate: "",
          coverUrl: "",
          description: `Ce livre a été trouvé sur WorldCat. Pour plus d'informations, consultez: https://www.worldcat.org/search?q=bn:${isbn}`,
          pageCount: 0,
          genre: "Non spécifié",
          readingStatus: "unread",
        }
      }

      return null
    } catch (error) {
      console.error("Erreur lors de la recherche sur WorldCat:", error)
      return null
    }
  },

  // Rechercher des couvertures de livres
  searchBookCovers: async (title: string, author: string): Promise<string[]> => {
    try {
      const query = `${title} ${author}`.replace(/ /g, "+")
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`)
      const data = await response.json()

      if (data.items && data.items.length > 0) {
        return data.items.map((item: any) => item.volumeInfo.imageLinks?.thumbnail || null).filter(Boolean)
      }

      return []
    } catch (error) {
      console.error("Erreur lors de la recherche de couvertures:", error)
      return []
    }
  },
}

