"use client"

import { BookDashboard } from "@/components/book-dashboard"
import { useState, useEffect } from "react"
import { BookProvider } from "@/contexts/book-context"

export default function Home() {
  // État pour suivre si la page est active et un compteur pour forcer le rafraîchissement
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Écouter les événements de visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible"
      setIsPageVisible(isVisible)

      // Si la page redevient visible, incrémenter le compteur pour forcer un rafraîchissement
      if (isVisible) {
        setRefreshKey((prev) => prev + 1)
      }
    }

    // Ajouter l'écouteur d'événement
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Nettoyer l'écouteur d'événement
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Fonction pour forcer un rafraîchissement du scanner
  const handleRefreshScanner = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <BookProvider>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Ma Bibliothèque</h1>
        <BookDashboard key={refreshKey} onScanComplete={handleRefreshScanner} />
      </main>
    </BookProvider>
  )
}

