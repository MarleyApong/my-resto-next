import i18n from "i18next"
import Backend from "i18next-http-backend"
import { initReactI18next } from "react-i18next"

const isServer = typeof window === "undefined"

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: "en", // default
    preload: ["en", "fr"],
    ns: ["common", "backend"],
    defaultNS: "common",
    debug: true,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false, // Désactive le suspense pour éviter les problèmes avec SSR
    },
    detection: {
      order: ["cookie", "querystring", "header"],
      caches: ["cookie"]
    }
  })

export default i18n
