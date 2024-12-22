"use client"

import React, { useState, useEffect } from "react"
import { Survey } from "survey-react-ui"
import { Model } from "survey-core"
import "survey-core/defaultV2.min.css"

const Note = () => {
  const [surveyJson, setSurveyJson] = useState(null)

  useEffect(() => {
    // Charger les données de l'enquête à partir du localStorage
    const savedSurvey = localStorage.getItem("survey-json")
    if (savedSurvey) {
      setSurveyJson(JSON.parse(savedSurvey))
    }
  }, [])

  const handleComplete = (sender) => {
    alert("Merci pour votre participation !")
    console.log("Résultats de l'enquête :", sender.data)
  }

  return (
    <div>
      <h2>Répondez à l'enquête</h2>
      {surveyJson ? <Survey model={new Model(surveyJson)} onComplete={handleComplete} /> : <p>Aucune enquête disponible</p>}
    </div>
  )
}

export default Note
