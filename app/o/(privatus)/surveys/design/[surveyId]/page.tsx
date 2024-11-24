"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react"
import "survey-core/defaultV2.min.css"
import "survey-creator-core/survey-creator-core.min.css"
import { StatusSurveyEnum } from "@/enums/statusEnum"
import { useSurvey } from "@/hooks/useSurvey"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
// import { fetchSurveyById, saveSurveyData } from "@/lib/db" // Exemple de fonctions pour interagir avec votre BD

interface SurveyDataType {
  id: string
  name: string
  surveyCreationData?: string
  surveyCreationDataDate?: Date
}

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: false, // Désactiver l'enregistrement automatique
  showDefaultLanguageInPreviewTab: true,
  showTranslationTab: true,
  showThemeTab: true,
  showHeaderInEmptySurvey: true
}

const DesignMode: React.FC = () => {
  const params = useParams()
  const surveyId = params.surveyId
  const { setHandleSaveSurvey } = useSurvey() // Utilisation du contexte pour définir la fonction de sauvegarde

  const [surveyData, setSurveyData] = useState<SurveyDataType | null>(null)
  const [creator, setCreator] = useState<SurveyCreator | null>(null) // Utilisation du state pour gérer le SurveyCreator
  const [alertDialog, setAlertDialog] = useState<{ message: string; isOpen: boolean }>({
    message: "",
    isOpen: false
  })

  useEffect(() => {
    if (!surveyId || typeof surveyId !== "string") {
      // router.push("/surveys") // Rediriger si surveyId est invalide
    } else {
      //   fetchSurveyById(surveyId) // Fonction pour récupérer les données depuis la BD
      //     .then((survey) => {
      //       setSurveyData(survey)
      //       // Initialiser le SurveyCreator après avoir récupéré les données
      //       const newCreator = new SurveyCreator(creatorOptions)
      //       // Récupérer les données du sessionStorage si elles existent
      //       const savedSurvey = sessionStorage.getItem(`survey-${surveyId}`)
      //       if (savedSurvey) {
      //         newCreator.text = savedSurvey // Charger les données du sessionStorage si présentes
      //       } else {
      //         newCreator.text = survey.surveyCreationData || ""
      //       }
      //       // Stocker le creator dans le state
      //       setCreator(newCreator)
      //     })
      //     .catch(() => {
      //       setAlertDialog({
      //         message: "L'ID de l'enquête n'existe pas ou une erreur est survenue.",
      //         isOpen: true
      //       })
      //       router.push("/surveys") // Rediriger si erreur
      //     })
    }
  }, [surveyId])

  // Fonction pour enregistrer manuellement l'enquête
  const handleSaveSurvey = async () => {
    if (!creator || typeof surveyId !== "string") return // Vérifier que le creator est initialisé
    try {
      const payload = {
        surveyCreationData: creator.text,
        status: StatusSurveyEnum.INACTIVE
      }

      // Appel à la fonction pour enregistrer les données dans la BD
      // await saveSurveyData(surveyId, payload)

      // Stocker temporairement dans sessionStorage
      sessionStorage.setItem(`survey-${surveyId}`, creator.text)

      setAlertDialog({ message: "Enquête enregistrée avec succès !", isOpen: true })
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'enquête:", error)
      setAlertDialog({ message: "Échec de l'enregistrement de l'enquête.", isOpen: true })
    }
  }

  // Définir la fonction de sauvegarde dans le contexte
  useEffect(() => {
    setHandleSaveSurvey(() => handleSaveSurvey)
  }, [setHandleSaveSurvey, handleSaveSurvey])

  // Supprimer les données du sessionStorage lors du changement de page
  useEffect(() => {
    return () => {
      if (surveyId && typeof surveyId === "string") {
        sessionStorage.removeItem(`survey-${surveyId}`)
      }
    }
  }, [surveyId])

  return (
    <>
      {creator && <SurveyCreatorComponent creator={creator} />}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={(isOpen) => setAlertDialog((prev) => ({ ...prev, isOpen }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <p>{alertDialog.message}</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog((prev) => ({ ...prev, isOpen: false }))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DesignMode
