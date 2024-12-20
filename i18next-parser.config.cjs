module.exports = {
  // Path vers les fichiers source
  input: ['**/pages/**/*.{js,ts,jsx,tsx}', '**/components/**/*.{js,ts,jsx,tsx}'],
  
  // Fichiers de sortie (les fichiers de traduction)
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  
  // Noms des namespaces, ici on utilise "common" et "backend"
  locales: ['en', 'fr'],
  
  // Détecter automatiquement les namespaces
  namespaces: ['common', 'backend'],
  
  // Format du fichier de sortie
  keySeparator: false, // Pour éviter d'utiliser le séparateur de clé par défaut (ex: "common.welcome")
  interpolation: {
    prefix: '{{',
    suffix: '}}',
  },
  
  // Ne pas écraser les clés existantes
  overwrite: false,
  
  // Détecter les clés manquantes
  sort: true,
  
  // Ajout des commentaires pour aider à la traduction
  useKeysAsDefaultValue: true,
};
