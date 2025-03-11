// Configuration de l'application
export const appConfig = {
  // Clé pour le stockage local
  storageKey: "books",

  // Configuration des API
  apis: {
    googleBooks: "https://www.googleapis.com/books/v1/volumes",
    openLibrary: "https://openlibrary.org/api/books",
    bnf: "https://catalogue.bnf.fr/api/SRU",
    worldCat: "https://www.worldcat.org/search",
  },

  // Genres de livres prédéfinis
  genres: [
    "Roman",
    "Science-Fiction",
    "Fantastique",
    "Policier",
    "Thriller",
    "Biographie",
    "Histoire",
    "Philosophie",
    "Science",
    "Art",
    "Cuisine",
    "Voyage",
    "Jeunesse",
    "Bande dessinée",
    "Poésie",
    "Économie",
    "Politique",
    "Psychologie",
    "Développement personnel",
    "Autre",
  ],

  // Statuts de lecture
  readingStatuses: [
    { value: "unread", label: "Pas lu" },
    { value: "reading", label: "En cours de lecture" },
    { value: "read", label: "Lu" },
  ],
}

