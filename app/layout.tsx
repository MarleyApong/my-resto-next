import "./globals.css"
import "@fontsource/poppins"

export const metadata = {
  title: "Gastro Link",
  description: "Your best live"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>{children}</body>
    </html>
  )
}
