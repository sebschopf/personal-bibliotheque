"use client"

import type React from "react"

import type { Book } from "@/types/book"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Trash2,
  BookIcon,
  Calendar,
  User,
  Building,
  Hash,
  Pencil,
  Search,
  BookOpen,
  BookX,
  BookMarked,
  Download,
  Upload,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { bookSearchService } from "@/services/book-search-service"

interface BookListProps {
  books: Book[]
  onRemoveBook: (id: string) => void
  onUpdateBook: (book: Book) => void
}

export default function BookList({ books, onRemoveBook, onUpdateBook }: BookListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGenre, setFilterGenre] = useState<string | null>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isSearchingCover, setIsSearchingCover] = useState(false)
  const [coverSearchResults, setCoverSearchResults] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Extraire tous les genres uniques des livres
  const uniqueGenres = Array.from(new Set(books.map((book) => book.genre)))
    .filter(Boolean)
    .sort()

  // Filtrer les livres en fonction de la recherche et du genre
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.publisher && book.publisher.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesGenre = !filterGenre || book.genre === filterGenre

    return matchesSearch && matchesGenre
  })

  // Fonction pour mettre à jour le livre en cours d'édition
  const handleEditBookChange = (field: string, value: any) => {
    if (editingBook) {
      setEditingBook({
        ...editingBook,
        [field]: value,
      })
    }
  }

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = () => {
    if (editingBook) {
      onUpdateBook(editingBook)
      setEditingBook(null)
    }
  }

  // Fonction pour rechercher une image de couverture
  const searchBookCover = async () => {
    if (!editingBook) return

    setIsSearchingCover(true)
    setCoverSearchResults([])

    try {
      const covers = await bookSearchService.searchBookCovers(editingBook.title, editingBook.author)
      setCoverSearchResults(covers)
    } catch (error) {
      console.error("Erreur lors de la recherche de couvertures:", error)
    } finally {
      setIsSearchingCover(false)
    }
  }

  // Fonction pour sélectionner une couverture
  const selectCover = (url: string) => {
    if (editingBook) {
      setEditingBook({
        ...editingBook,
        coverUrl: url,
      })
      setCoverSearchResults([])
    }
  }

  // Fonction pour exporter les livres
  const handleExportBooks = () => {
    try {
      setIsExporting(true)

      // Créer un fichier JSON avec les données des livres
      const dataStr = JSON.stringify(filteredBooks, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      // Créer un élément d'ancrage pour télécharger le fichier
      const exportFileDefaultName = `ma-bibliotheque-${new Date().toISOString().slice(0, 10)}.json`
      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error)
      alert("Erreur lors de l'exportation. Veuillez réessayer.")
    } finally {
      setIsExporting(false)
    }
  }

  // Fonction pour importer des livres
  const handleImportBooks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedBooks = JSON.parse(event.target?.result as string)
        if (Array.isArray(importedBooks) && importedBooks.length > 0) {
          if (confirm(`Voulez-vous importer ${importedBooks.length} livres ?`)) {
            // Appeler la fonction onUpdateBook pour chaque livre importé
            importedBooks.forEach((book) => {
              // S'assurer que chaque livre a un ID unique
              const bookWithId = {
                ...book,
                id: book.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
              }
              onUpdateBook(bookWithId)
            })
          }
        } else {
          alert("Le fichier ne contient pas de données de livres valides.")
        }
      } catch (error) {
        console.error("Erreur lors de l'importation:", error)
        alert("Erreur lors de l'importation du fichier. Vérifiez que le format est correct.")
      } finally {
        setIsImporting(false)
        // Réinitialiser l'input file
        e.target.value = ""
      }
    }
    reader.readAsText(file)
  }

  // Liste des statuts de lecture possibles
  const readingStatuses = [
    { value: "unread", label: "Pas lu", icon: BookX },
    { value: "reading", label: "En cours de lecture", icon: BookMarked },
    { value: "read", label: "Lu", icon: BookOpen },
  ]

  // Fonction pour obtenir l'icône du statut de lecture
  const getReadingStatusIcon = (status: string | undefined) => {
    const statusItem = readingStatuses.find((s) => s.value === status)
    const Icon = statusItem?.icon || BookX
    return <Icon className="h-4 w-4" />
  }

  // Fonction pour obtenir le label du statut de lecture
  const getReadingStatusLabel = (status: string | undefined) => {
    return readingStatuses.find((s) => s.value === status)?.label || "Pas lu"
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Rechercher un livre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filterGenre === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterGenre(null)}
          >
            Tous
          </Badge>

          {uniqueGenres.map((genre) => (
            <Badge
              key={genre}
              variant={filterGenre === genre ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterGenre(genre === filterGenre ? null : genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {books.length === 0 ? (
            <p>Votre bibliothèque est vide. Ajoutez des livres pour les voir ici.</p>
          ) : (
            <p>Aucun livre ne correspond à votre recherche.</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBooks}
              disabled={isExporting}
              className="flex items-center gap-1"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exporter ma bibliothèque
            </Button>

            <input type="file" id="import-books" className="hidden" accept=".json" onChange={handleImportBooks} />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                document.getElementById("import-books")?.click()
              }}
              disabled={isImporting}
              className="flex items-center gap-1"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Importer des livres
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setEditingBook(book)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex h-full">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl || "/placeholder.svg"}
                        alt={`Couverture de ${book.title}`}
                        className="w-24 h-36 object-cover rounded-md mr-4"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=144&width=96"
                        }}
                      />
                    ) : (
                      <div className="w-24 h-36 bg-muted flex items-center justify-center rounded-md mr-4">
                        <BookIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-start gap-1">
                        <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm line-clamp-1">{book.author}</p>
                      </div>

                      {book.publisher && (
                        <div className="flex items-start gap-1">
                          <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm line-clamp-1">{book.publisher}</p>
                        </div>
                      )}

                      {book.publishedDate && (
                        <div className="flex items-start gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm">{book.publishedDate}</p>
                        </div>
                      )}

                      {book.isbn && (
                        <div className="flex items-start gap-1">
                          <Hash className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm">{book.isbn}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {book.genre && book.genre !== "Non spécifié" && <Badge variant="secondary">{book.genre}</Badge>}

                        <Badge variant="outline" className="flex items-center gap-1">
                          {getReadingStatusIcon(book.readingStatus)}
                          <span>{getReadingStatusLabel(book.readingStatus)}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" size="sm" onClick={() => onRemoveBook(book.id)} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal d'édition */}
      <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le livre</DialogTitle>
          </DialogHeader>

          {editingBook && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input
                  id="title"
                  value={editingBook.title}
                  onChange={(e) => handleEditBookChange("title", e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="author" className="text-right">
                  Auteur
                </Label>
                <Input
                  id="author"
                  value={editingBook.author}
                  onChange={(e) => handleEditBookChange("author", e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="genre" className="text-right">
                  Genre
                </Label>
                <Input
                  id="genre"
                  value={editingBook.genre}
                  onChange={(e) => handleEditBookChange("genre", e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="readingStatus" className="text-right">
                  Statut
                </Label>
                <Select
                  value={editingBook.readingStatus || "unread"}
                  onValueChange={(value) => handleEditBookChange("readingStatus", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Statut de lecture" />
                  </SelectTrigger>
                  <SelectContent>
                    {readingStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <status.icon className="h-4 w-4" />
                          <span>{status.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coverUrl" className="text-right">
                  Image
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="coverUrl"
                    value={editingBook.coverUrl || ""}
                    onChange={(e) => handleEditBookChange("coverUrl", e.target.value)}
                    className="flex-1"
                    placeholder="URL de l'image"
                  />
                  <Button variant="outline" size="icon" onClick={searchBookCover} disabled={isSearchingCover}>
                    {isSearchingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Résultats de recherche d'images */}
              {coverSearchResults.length > 0 && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className="text-right pt-2">
                    <Label>Résultats</Label>
                  </div>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    {coverSearchResults.map((url, index) => (
                      <img
                        key={index}
                        src={url || "/placeholder.svg"}
                        alt="Couverture suggérée"
                        className="w-16 h-24 object-cover rounded-md cursor-pointer border-2 hover:border-primary"
                        onClick={() => selectCover(url)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Prévisualisation de l'image */}
              {editingBook.coverUrl && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className="text-right pt-2">
                    <Label>Aperçu</Label>
                  </div>
                  <div className="col-span-3">
                    <img
                      src={editingBook.coverUrl || "/placeholder.svg"}
                      alt="Aperçu de la couverture"
                      className="h-40 object-contain rounded-md"
                      onError={(e) => {
                        alert("L'URL de l'image semble invalide.")
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=160&width=120"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

