"use client"

import { useEffect, useState } from "react"
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react"
import "survey-core/defaultV2.min.css"
import "survey-creator-core/survey-creator-core.min.css"

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: true, // Activer l'enregistrement automatique
  showDefaultLanguageInPreviewTab: true,
  showTranslationTab: true,
  showThemeTab: true,
  showHeaderInEmptySurvey: true
}

const defaultSurveyJson = {
    "title": "Satisfaction client",
    "description": "L'enquête de satisfaction client vise à recueillir des commentaires précieux de nos clients pour améliorer nos produits et services. ",
    "logoPosition": "right",
    "pages": [
     {
      "name": "Name",
      "elements": [
       {
        "type": "rating",
        "name": "question1",
        "title": "À quel point êtes-vous satisfait de notre produit/service ?",
        "isRequired": true,
        "rateType": "stars"
       },
       {
        "type": "checkbox",
        "name": "question2",
        "title": "Quels aspects de notre produit/service appréciez-vous le plus ? (sélectionnez tout ce qui s'applique)",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Qualité"
         },
         {
          "value": "Item 2",
          "text": "Prix"
         },
         {
          "value": "Item 3",
          "text": "Service client"
         },
         {
          "value": "Item 4",
          "text": "Facilité d'utilisation"
         },
         {
          "value": "Item 5",
          "text": "Design"
         }
        ],
        "showSelectAllItem": true,
        "selectAllText": "Tous"
       },
       {
        "type": "checkbox",
        "name": "question3",
        "title": "Comment évalueriez-vous notre service client ?",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Très satisfaisant"
         },
         {
          "value": "Item 2",
          "text": "Satisfaisant"
         },
         {
          "value": "Item 3",
          "text": "Neutre"
         },
         {
          "value": "Item 4",
          "text": "Insatisfaisant"
         },
         {
          "value": "Item 5",
          "text": "Très insatisfaisant"
         }
        ],
        "selectAllText": "Tous"
       },
       {
        "type": "checkbox",
        "name": "question4",
        "title": "Comment évalueriez-vous notre service client ?",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Très satisfaisant"
         },
         {
          "value": "Item 2",
          "text": "Satisfaisant"
         },
         {
          "value": "Item 3",
          "text": "Neutre"
         },
         {
          "value": "Item 4",
          "text": "Insatisfaisant"
         },
         {
          "value": "Item 5",
          "text": "Très insatisfaisant"
         }
        ],
        "selectAllText": "Tous"
       },
       {
        "type": "comment",
        "name": "question5",
        "title": "Avez-vous des suggestions pour améliorer notre produit/service ?"
       }
      ]
     }
    ],
    "sendResultOnPageNext": true,
    "showPageNumbers": true,
    "showProgressBar": "bottom",
    "pageNextText": "Suivant",
    "showTimerPanelMode": "page"
   }

const SurveyCreatorWidget = () => {
  const [creator, setCreator] = useState<SurveyCreator | null>(null)

  useEffect(() => {
    // Initialiser le SurveyCreator
    const surveyCreator = new SurveyCreator(creatorOptions)

    // Charger les données depuis le localStorage ou utiliser une structure par défaut
    const savedSurvey = localStorage.getItem("survey-json")
    surveyCreator.text = savedSurvey || JSON.stringify(defaultSurveyJson)

    // Définir la fonction de sauvegarde
    surveyCreator.saveSurveyFunc = (saveNo: any, callback: any) => {
      localStorage.setItem("survey-json", surveyCreator.text)
      callback(saveNo, true) // Informer que la sauvegarde a réussi
      alert("Enquête enregistrée avec succès !")
    }

    setCreator(surveyCreator)

    return () => {
      // Nettoyage si le composant est démonté
      setCreator(null)
    }
  }, [])

  return <>{creator && <SurveyCreatorComponent creator={creator} />}</>
}

export default SurveyCreatorWidget
