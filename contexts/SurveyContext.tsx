import React, { createContext, useState, ReactNode } from "react"

interface SurveyContextProps {
  handleSaveSurvey: () => void
  setHandleSaveSurvey: (func: () => void) => void
}

interface SurveyProviderProps {
  children: ReactNode
}

export const SurveyContext = createContext<SurveyContextProps | undefined>(undefined)

export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const [handleSaveSurvey, setHandleSaveSurvey] = useState<() => void>(() => () => {})

  return (
    <SurveyContext.Provider value={{ handleSaveSurvey, setHandleSaveSurvey }}>
      {children}
    </SurveyContext.Provider>
  )
}
