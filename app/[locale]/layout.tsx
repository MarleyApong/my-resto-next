import "./globals.css"
import "@fontsource/poppins"
import { Providers } from "./providers"

export const metadata = {
  title: "Gastro Link",
  description: "Your best live"
}

export default function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: {
    locale: string
  }
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <Providers local={params.locale}>{children}</Providers>
      </body>
    </html>
  )
}
