import localFont from "next/font/local"
import "./globals.css"

const roboto = localFont({
  src: [
    { path: "../public/assets/fonts/roboto/Roboto-Thin.ttf", weight: "100", style: "normal" },
    { path: "../public/assets/fonts/roboto/Roboto-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../public/assets/fonts/roboto/Roboto-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/assets/fonts/roboto/Roboto-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/assets/fonts/roboto/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/assets/fonts/roboto/Roboto-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/assets/fonts/roboto/Roboto-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/assets/fonts/roboto/Roboto-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/assets/fonts/roboto/Roboto-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/assets/fonts/roboto/Roboto-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/assets/fonts/roboto/Roboto-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/assets/fonts/roboto/Roboto-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata = {
  title: "Gastro Link",
  description: "Your best live",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>{children}</body>
    </html>
  )
}
