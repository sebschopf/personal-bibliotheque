"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Book } from "@/types/book"
import { bookSearchService } from "@/services/book-search-service"

export function useBarcodeScanner(onBookFound: (book: Book) => void) {
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [searchSource, setSearchSource] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const quaggaLoadedRef = useRef(false)
  const scannerContainerRef = useRef<HTMLDivElement | null>(null)

  // Vérifier si Quagga est déjà chargé
  useEffect(() => {
    if (typeof window !== "undefined" && window.Quagga) {
      console.log("Quagga déjà chargé au montage du composant")
      setScriptLoaded(true)
      quaggaLoadedRef.current = true
    }
  }, [])

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      stopCamera()
      setIsLoading(false)
      setError(null)
    }
  }, [])

  // Initialiser Quagga
  useEffect(() => {
    if (typeof window !== "undefined" && window.Quagga && scannerContainerRef.current && isScanning && scriptLoaded) {
      try {
        // Nettoyer le conteneur avant d'initialiser
        if (scannerContainerRef.current) {
          scannerContainerRef.current.innerHTML = ""
        }

        window.Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerContainerRef.current,
              constraints: {
                width: 640,
                height: 480,
                facingMode: "environment",
              },
            },
            locator: {
              patchSize: "medium",
              halfSample: true,
            },
            numOfWorkers: 2,
            decoder: {
              readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "code_128_reader"],
            },
            locate: true,
          },
          (err: any) => {
            if (err) {
              console.error("Erreur d'initialisation Quagga:", err)
              setError("Erreur d'initialisation de la caméra. Veuillez réessayer.")
              setIsScanning(false)
              return
            }

            console.log("Quagga initialisé avec succès, démarrage du scanner...")
            window.Quagga.start()

            // Ajouter un gestionnaire d'événements pour les codes détectés
            window.Quagga.onDetected((result: any) => {
              console.log("Code détecté:", result)
              if (result && result.codeResult && result.codeResult.code) {
                const code = result.codeResult.code
                console.log("Code-barres détecté:", code)

                if (code.length >= 10) {
                  // Jouer un son de succès
                  const audio = new Audio("/beep.mp3")
                  audio.play().catch((e) => console.error("Erreur lors de la lecture du son:", e))

                  // Arrêter le scanner
                  stopCamera()

                  // Mettre à jour l'état
                  setLastScannedCode(code)

                  // Rechercher le livre avec un délai pour s'assurer que l'état est mis à jour
                  setTimeout(() => {
                    console.log("Recherche du livre avec le code:", code)
                    fetchBookData(code)
                  }, 100)
                }
              }
            })
          },
        )
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Quagga:", error)
        setError("Erreur lors de l'initialisation du scanner. Veuillez réessayer.")
        setIsScanning(false)
      }

      return () => {
        stopCamera()
      }
    }
  }, [isScanning, scriptLoaded])

  // Fonction pour démarrer la caméra
  const startCamera = useCallback(() => {
    // Réinitialiser les erreurs
    setError(null)

    // Arrêter la caméra d'abord pour éviter les conflits
    stopCamera()

    // Vérifier si Quagga est chargé
    if (!window.Quagga || !quaggaLoadedRef.current) {
      setError("La bibliothèque de scan n'est pas chargée. Veuillez rafraîchir la page.")
      return
    }

    console.log("Démarrage de la caméra...")
    // Petit délai pour s'assurer que la caméra précédente est bien arrêtée
    setTimeout(() => {
      // Activer le scanner
      setIsScanning(true)
      console.log("État isScanning mis à true")
    }, 300)
  }, [])

  // Fonction pour arrêter la caméra
  const stopCamera = useCallback(() => {
    try {
      if (window.Quagga) {
        // Vérifier si Quagga est dans un état valide avant d'appeler stop()
        if (window.Quagga._isInitialized === true) {
          window.Quagga.stop()
          console.log("Caméra arrêtée manuellement")
        } else {
          console.log("Quagga n'est pas initialisé, pas besoin de l'arrêter")
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'arrêt de Quagga:", error)
      // Ne pas propager l'erreur, juste la logger
    } finally {
      // Toujours mettre à jour l'état, même en cas d'erreur
      setIsScanning(false)
    }
  }, [])

  // Fonction pour récupérer les données du livre
  const fetchBookData = useCallback(
    async (isbn: string) => {
      try {
        console.log("Début de fetchBookData pour ISBN:", isbn)
        setIsLoading(true)
        setSearchSource(null)
        setError(null)

        const book = await bookSearchService.searchByIsbn(isbn)

        console.log("Livre trouvé:", book)

        // Appeler onBookFound
        onBookFound(book)

        // Réinitialiser les états
        setLastScannedCode(null)
      } catch (error) {
        console.error("Erreur lors de la recherche du livre:", error)
        setError(`Aucun livre trouvé avec l'ISBN ${isbn}. Vérifiez le numéro ou essayez un autre ISBN.`)
      } finally {
        setIsLoading(false)
      }
    },
    [onBookFound],
  )

  // Fonction pour traiter une image
  const processImage = useCallback(
    (file: File) => {
      console.log("Traitement du fichier image:", file.name)
      const reader = new FileReader()
      reader.onload = async (event) => {
        if (!event.target?.result) return

        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) return

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0, img.width, img.height)

          if (window.Quagga) {
            console.log("Décodage de l'image avec Quagga...")
            window.Quagga.decodeSingle(
              {
                src: canvas.toDataURL(),
                numOfWorkers: 0,
                inputStream: {
                  size: Math.max(img.width, img.height),
                },
                decoder: {
                  readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "code_128_reader"],
                },
              },
              (result: any) => {
                if (result && result.codeResult) {
                  console.log("Code-barres détecté dans l'image:", result.codeResult.code)
                  fetchBookData(result.codeResult.code)
                } else {
                  console.log("Aucun code-barres détecté dans l'image")
                  setError(
                    "Aucun code-barres détecté dans l'image. Essayez une autre image ou entrez l'ISBN manuellement.",
                  )
                }
              },
            )
          }
        }
        img.src = event.target.result as string
      }
      reader.readAsDataURL(file)
    },
    [fetchBookData],
  )

  // Fonction pour la recherche manuelle par ISBN
  const searchByIsbn = useCallback(
    (isbn: string) => {
      if (isbn.trim().length >= 10) {
        console.log("Recherche manuelle avec ISBN:", isbn.trim())
        fetchBookData(isbn.trim())
        return true
      } else {
        setError("Veuillez entrer un ISBN valide (10 ou 13 chiffres)")
        return false
      }
    },
    [fetchBookData],
  )

  // Fonction pour simuler un scan (pour les tests)
  const simulateScan = useCallback(() => {
    // ISBN de test : "9782253093008" (un livre réel)
    console.log("Simulation d'un scan avec ISBN: 9782253093008")
    fetchBookData("9782253093008")
  }, [fetchBookData])

  // Fonction pour gérer le chargement du script
  const handleScriptLoad = useCallback(() => {
    console.log("Script Quagga chargé avec succès")
    setScriptLoaded(true)
    quaggaLoadedRef.current = true
  }, [])

  // Fonction pour gérer l'erreur de chargement du script
  const handleScriptError = useCallback(() => {
    console.error("Erreur lors du chargement du script Quagga")
    setScriptError(true)
    setScriptLoaded(false)
  }, [])

  return {
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
  }
}

