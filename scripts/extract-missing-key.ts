import fs from "fs"
import path from "path"
import { glob } from "glob"
import { fileURLToPath, pathToFileURL } from "url"

// Recréer __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths to search for keys and translation files
const SEARCH_DIRS = ["app/**/*.ts", "app/**/*.tsx", "data/**/*.ts", "data/**/*.tsx", "api/**/*.ts"]
const LOCALES_DIR = path.join(__dirname, "..", "locales")
const LOCALE_FILES = ["en.ts", "fr.ts"]

interface ScanStats {
  fileName: string
  keysFound: string[]
}

interface Options {
  verbose: boolean
  addMissingKeys: boolean
}

// Function to extract keys from translation files
const loadTranslationKeys = async (filePath: string): Promise<Set<string>> => {
  const content = (await import(pathToFileURL(filePath).href)).default

  const extractKeys = (obj: Record<string, any>, prefix = ""): string[] => {
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      return typeof value === "object" ? extractKeys(value, fullKey) : fullKey
    })
  }

  return new Set(extractKeys(content))
}

// Function to search for translation keys in code files
const extractKeysFromCode = (fileContent: string): string[] => {
  // Regex modifié pour ne capturer que les clés dans t("...")
  const keyRegex = /(?<![\w])t\(\s*["']([^"']+)["']\s*[,\)]/g
  const keys: string[] = []
  let match

  while ((match = keyRegex.exec(fileContent)) !== null) {
    keys.push(match[1])
  }

  return keys
}

// Function to print statistics
const printStats = (stats: ScanStats[], totalKeys: number, foundKeys: string[]) => {
  console.log("\n=== Scan Statistics ===")
  console.log(`Total files scanned: ${stats.length}`)
  console.log(`Total unique keys found: ${totalKeys}`)

  // Afficher les clés trouvées sous forme de tableau
  console.log("\nFound keys:", JSON.stringify(foundKeys, null, 2))

  console.log("\nDetailed file breakdown:")
  stats
    .filter((stat) => stat.keysFound.length > 0)
    .forEach((stat) => {
      console.log(`\n${stat.fileName}:`)
      console.log(`  Keys found: ${stat.keysFound.length}`)
      console.log(`  Keys: ${JSON.stringify(stat.keysFound, null, 2)}`)
    })

  const filesWithoutKeys = stats.filter((stat) => stat.keysFound.length === 0).length
  if (filesWithoutKeys > 0) {
    console.log(`\nFiles without translation keys: ${filesWithoutKeys}`)
  }
}

// Main script
const run = async (options: Options = { verbose: false, addMissingKeys: true }) => {
  try {
    // Load existing keys from locale files
    const existingKeys = new Set<string>()
    for (const file of LOCALE_FILES) {
      const filePath = path.join(LOCALES_DIR, file)
      const keys = await loadTranslationKeys(filePath)
      keys.forEach((key) => existingKeys.add(key))
    }

    // Find all code files
    const codeFiles = SEARCH_DIRS.flatMap((pattern) => glob.sync(pattern))

    // Extract all keys used in code with statistics
    const usedKeys = new Set<string>()
    const scanStats: ScanStats[] = []

    codeFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8")
      const keys = extractKeysFromCode(content)
      keys.forEach((key) => usedKeys.add(key))

      scanStats.push({
        fileName: file,
        keysFound: keys
      })
    })

    // Find missing keys
    const missingKeys = Array.from(usedKeys).filter((key) => !existingKeys.has(key))

    if (options.verbose) {
      printStats(scanStats, usedKeys.size, Array.from(usedKeys))
    }

    if (missingKeys.length === 0) {
      console.log("\nNo missing keys found!")
      return
    }

    console.log("\nMissing keys:", JSON.stringify(missingKeys, null, 2))

    // Optionally add missing keys to locale files
    if (options.addMissingKeys) {
      for (const file of LOCALE_FILES) {
        const filePath = path.join(LOCALES_DIR, file)
        const content = (await import(pathToFileURL(filePath).href)).default

        missingKeys.forEach((key) => {
          const parts = key.split(".")
          let obj = content

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            if (!obj[part]) {
              obj[part] = i === parts.length - 1 ? "" : {}
            }
            obj = obj[part]
          }
        })

        // Write updated file
        const fileContent = `export default ${JSON.stringify(content, null, 2)} as const;`
        fs.writeFileSync(filePath, fileContent, "utf-8")
      }

      console.log("\nMissing keys have been added to locale files.")
    }
  } catch (error) {
    console.error("An error occurred:", error)
  }
}

// Execute with command line arguments
const args = process.argv.slice(2)
run({
  verbose: args.includes("--verbose") || args.includes("-v"),
  addMissingKeys: !args.includes("--no-add")
})
