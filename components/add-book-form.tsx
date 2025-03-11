"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Book } from "@/types/book"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddBookFormProps {
  onAddBook: (book: Book) => void
}

export function AddBookForm({ onAddBook }: AddBookFormProps) {
  // Ajouter le statut de lecture dans le formulaire d'ajout
  const [book, setBook] = useState<Partial<Book>>({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publishedDate: "",
    coverUrl: "",
    description: "",
    pageCount: 0,
    genre: "",
    readingStatus: "unread",
  })

  const genres = [
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
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBook((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBook((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleGenreChange = (value: string) => {
    setBook((prev) => ({ ...prev, genre: value }))
  }

  // Ajouter un gestionnaire pour le changement de statut de lecture
  const handleReadingStatusChange = (value: string) => {
    setBook((prev) => ({ ...prev, readingStatus: value as "unread" | "reading" | "read" }))
  }

  // Ajouter le statut de lecture dans l'objet livre lors de la soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!book.title || !book.author) {
      alert("Veuillez remplir au moins le titre et l'auteur.")
      return
    }

    onAddBook({
      id: Date.now().toString(),
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      publishedDate: book.publishedDate || "",
      coverUrl: book.coverUrl || "",
      description: book.description || "",
      pageCount: book.pageCount || 0,
      genre: book.genre || "Non spécifié",
      readingStatus: book.readingStatus || "unread",
    })

    // Réinitialiser le formulaire
    setBook({
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publishedDate: "",
      coverUrl: "",
      description: "",
      pageCount: 0,
      genre: "",
      readingStatus: "unread",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              value={book.title}
              onChange={handleChange}
              placeholder="Titre du livre"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Auteur *</Label>
            <Input
              id="author"
              name="author"
              value={book.author}
              onChange={handleChange}
              placeholder="Nom de l'auteur"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              name="isbn"
              value={book.isbn}
              onChange={handleChange}
              placeholder="ISBN (ex: 9782070368228)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher">Éditeur</Label>
            <Input
              id="publisher"
              name="publisher"
              value={book.publisher}
              onChange={handleChange}
              placeholder="Nom de l'éditeur"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="publishedDate">Date de publication</Label>
            <Input
              id="publishedDate"
              name="publishedDate"
              value={book.publishedDate}
              onChange={handleChange}
              placeholder="Année ou date complète"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageCount">Nombre de pages</Label>
            <Input
              id="pageCount"
              name="pageCount"
              type="number"
              value={book.pageCount || ""}
              onChange={handleNumberChange}
              placeholder="Nombre de pages"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coverUrl">URL de la couverture</Label>
            <Input
              id="coverUrl"
              name="coverUrl"
              value={book.coverUrl}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select value={book.genre} onValueChange={handleGenreChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={book.description}
            onChange={handleChange}
            placeholder="Description du livre"
            rows={4}
          />
        </div>
      </div>

      {/* Ajouter le champ de statut de lecture dans le formulaire (à ajouter avant le bouton de soumission) */}
      <div className="space-y-2">
        <Label htmlFor="readingStatus">Statut de lecture</Label>
        <Select value={book.readingStatus} onValueChange={handleReadingStatusChange}>
          <SelectTrigger id="readingStatus">
            <SelectValue placeholder="Sélectionnez un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unread">Pas lu</SelectItem>
            <SelectItem value="reading">En cours de lecture</SelectItem>
            <SelectItem value="read">Lu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Ajouter à ma bibliothèque
      </Button>
    </form>
  )
}

