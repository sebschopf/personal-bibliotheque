"use client"

import { useState } from "react"
import BookList from "./book-list"
import { AddBookForm } from "./add-book-form"
import { BarcodeScanner } from "./barcode-scanner"
import type { Book } from "@/types/book"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useBooks } from "@/hooks/use-books"
import { Loader2 } from "lucide-react"

interface BookDashboardProps {
  onScanComplete?: () => void
}

export function BookDashboard({ onScanComplete }: BookDashboardProps) {
  const [activeTab, setActiveTab] = useState("list")
  const [tabResetKey, setTabResetKey] = useState(0)

  const { books, isLoading, error, addBook, updateBook, removeBook, exportBooks } = useBooks()

  // Gérer l'ajout d'un livre
  const handleAddBook = async (book: Book) => {
    try {
      await addBook(book)

      // Retourner à la liste après l'ajout d'un livre
      setActiveTab("list")

      // Réinitialiser le scanner après avoir ajouté un livre
      setTabResetKey((prev) => prev + 1)

      // Notifier le parent que le scan est terminé
      if (onScanComplete) {
        onScanComplete()
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du livre:", err)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Si on passe à l'onglet de scan, réinitialiser le scanner
    if (value === "scan") {
      setTabResetKey((prev) => prev + 1)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">Mes Livres</TabsTrigger>
          <TabsTrigger value="add">Ajouter un Livre</TabsTrigger>
          <TabsTrigger value="scan">Scanner un Code-barres</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ma Collection ({books.length})</h2>
            {books.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Livres actuels:", books)
                }}
              >
                Vérifier les données
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement de votre bibliothèque...</span>
            </div>
          ) : books.length === 0 ? (
            <div className="p-8 text-center bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">Votre bibliothèque est vide.</p>
              <p className="text-sm">
                Utilisez l'onglet "Ajouter un Livre" ou "Scanner un Code-barres" pour commencer à construire votre
                collection.
              </p>
            </div>
          ) : (
            <BookList books={books} onRemoveBook={removeBook} onUpdateBook={updateBook} />
          )}
        </TabsContent>

        <TabsContent value="add">
          <AddBookForm onAddBook={handleAddBook} />
        </TabsContent>

        <TabsContent value="scan">
          <BarcodeScanner key={tabResetKey} onBookFound={handleAddBook} isActive={activeTab === "scan"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

