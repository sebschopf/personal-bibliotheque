"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { Book } from "@/types/book"
import { Camera, X, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import Script from "next/script"
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner"

interface BarcodeScannerProps {
  onBookFound: (book: Book) => void
  isActive?: boolean
}

export function BarcodeScanner({ onBookFound, isActive = false }: BarcodeScannerProps) {
  const [manualIsbn, setManualIsbn] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    isScanning,
    isLoading,
    error,
    lastScannedCode,
    searchSource,
    scriptLoaded,
    scriptError,
    scannerContainerRef,
    startCamera,
    stopCamera,
    searchByIsbn,
    processImage,
    simulateScan,
    handleScriptLoad,
    handleScriptError,
  } = useBarcodeScanner(onBookFound)

  // Recherche manuelle par ISBN
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchByIsbn(manualIsbn)
  }

  // Traitement d'image depuis un fichier
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processImage(file)
  }

  // Déclencher le sélecteur de fichier
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <Script
        src="https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Saisie manuelle de l'ISBN</h3>
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Entrez l'ISBN (ex: 9782253093008)"
            value={manualIsbn}
            onChange={(e) => setManualIsbn(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          L'ISBN se trouve généralement au dos du livre, près du code-barres.
        </p>
      </div>

      <div className="space-y-4">
        <div
          ref={scannerContainerRef}
          className={`relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-black ${isScanning ? "block" : "hidden"}`}
          style={{ height: isScanning ? "300px" : "0" }}
        >
          {/* Quagga injectera la vidéo ici */}
          {isScanning && !scriptLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Chargement de la caméra...
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {/* Bouton de scan */}
          <Button
            onClick={isScanning ? stopCamera : startCamera}
            variant={isScanning ? "destructive" : "default"}
            className="w-48"
            disabled={!scriptLoaded || isLoading}
          >
            {isScanning ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Arrêter le scanner
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                {!scriptLoaded ? "Chargement..." : isLoading ? "Recherche..." : "Scanner un code-barres"}
              </>
            )}
          </Button>

          <Button
            onClick={triggerFileInput}
            variant="outline"
            className="w-48"
            disabled={!scriptLoaded || isScanning || isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer une image
          </Button>

          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />

          <Button onClick={simulateScan} variant="secondary" className="w-48" disabled={isScanning || isLoading}>
            Simuler un scan
          </Button>
        </div>
      </div>

      {lastScannedCode && !error && (
        <Alert className={`mt-4 ${isLoading ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Code-barres détecté :</strong> {lastScannedCode}
              </p>
              {isLoading ? (
                <p>Recherche du livre en cours...</p>
              ) : searchSource ? (
                <p>
                  Livre trouvé via <strong>{searchSource}</strong>
                </p>
              ) : null}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Problème détecté :</strong> {error}
              </p>
              <p>
                <strong>Solutions :</strong>
              </p>
              <ul className="list-disc pl-5 text-sm">
                <li>Utilisez la saisie manuelle de l'ISBN ci-dessus</li>
                <li>Essayez d'importer une photo du code-barres</li>
                <li>Assurez-vous que le code-barres est bien visible et éclairé</li>
                <li>Utilisez le bouton "Simuler un scan" pour tester avec un ISBN prédéfini</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          Cette version utilise QuaggaJS, une bibliothèque spécialisée dans la détection de codes-barres qui offre une
          meilleure compatibilité entre navigateurs.
        </p>
        <p>
          Vous pouvez scanner directement avec la caméra ou importer une image contenant un code-barres. L'application
          recherche maintenant dans plusieurs sources : Google Books, Open Library, Bibliothèque Nationale de France et
          WorldCat.
        </p>
      </div>
    </div>
  )
}

