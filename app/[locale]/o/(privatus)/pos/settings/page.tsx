"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Package, ChartColumnBig, UserRoundCog, Save, Upload } from "lucide-react"
import {Level2} from "@/components/features/Level2"

interface POSSettingsProps {
  // Vous pouvez ajouter des props initiales si nécessaire
}

const POSSettings: React.FC<POSSettingsProps> = () => {
  // États pour les paramètres de vente
  const [orderFormat, setOrderFormat] = useState("")
  const [vatRate, setVatRate] = useState("")
  const [localTaxRate, setLocalTaxRate] = useState("")
  const [tipManagement, setTipManagement] = useState(false)

  // États pour les modes de paiement
  const [cashPayment, setCashPayment] = useState(true)
  const [cardPayment, setCardPayment] = useState(true)
  const [mobileMoneyPayment, setMobileMoneyPayment] = useState(false)
  const [localAccountPayment, setLocalAccountPayment] = useState(false)

  // États pour les paramètres de stock
  const [lowStockAlert, setLowStockAlert] = useState(true)
  const [autoStockManagement, setAutoStockManagement] = useState(false)
  const [lowStockThreshold, setLowStockThreshold] = useState("")

  // États pour la configuration d'impression
  const [customReceiptLogo, setCustomReceiptLogo] = useState("")
  const [customReceiptMessage, setCustomReceiptMessage] = useState("")
  const [receiptFormat, setReceiptFormat] = useState("standard")

  // Gestionnaire pour le téléchargement de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCustomReceiptLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Gestionnaires de mise à jour pour chaque section
  const handleSaleSettingsUpdate = () => {
    console.log("Paramètres de vente mis à jour", {
      orderFormat,
      vatRate,
      localTaxRate,
      tipManagement
    })
  }

  const handlePaymentMethodsUpdate = () => {
    console.log("Modes de paiement mis à jour", {
      cashPayment,
      cardPayment,
      mobileMoneyPayment,
      localAccountPayment
    })
  }

  const handleStockSettingsUpdate = () => {
    console.log("Paramètres de stock mis à jour", {
      lowStockAlert,
      autoStockManagement,
      lowStockThreshold
    })
  }

  const handlePrintConfigUpdate = () => {
    console.log("Configuration d'impression mise à jour", {
      customReceiptLogo,
      customReceiptMessage,
      receiptFormat
    })
  }

  return (
    <div className="space-y-2 px-2">
      <Level2 title="Paramètres POS" />
      {/* Paramètres de vente */}
      <Card>
        <CardHeader>
          <CardTitle>1. Paramètres de vente</CardTitle>
          <CardDescription>Configurez les paramètres généraux de vente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols- lg:grid-cols-2 sm:grid-cols-1 gap-2">
            <div className="col-span-2">
              <Label>Format de numéro de commande</Label>
              <Input placeholder="Ex: POS-{YYYY}-{NNNN}" value={orderFormat} onChange={(e) => setOrderFormat(e.target.value)} />
            </div>
            <div>
              <Label>Taux de TVA (%)</Label>
              <Input type="number" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
            </div>
            <div>
              <Label>Taux de taxe locale (%)</Label>
              <Input type="number" value={localTaxRate} onChange={(e) => setLocalTaxRate(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="tip-management" checked={tipManagement} onCheckedChange={(checked) => setTipManagement(!!checked)} />
            <Label htmlFor="tip-management">Activer la gestion des pourboires</Label>
          </div>

          <Button onClick={handleSaleSettingsUpdate}>
            <Save className="mr-2 h-4 w-4" /> Mettre à jour
          </Button>
        </CardContent>
      </Card>

      {/* Modes de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>2. Modes de paiement</CardTitle>
          <CardDescription>Sélectionnez les modes de paiement disponibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="cash-payment" checked={cashPayment} onCheckedChange={(checked) => setCashPayment(!!checked)} />
            <Label htmlFor="cash-payment">Espèces</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="card-payment" checked={cardPayment} onCheckedChange={(checked) => setCardPayment(!!checked)} />
            <Label htmlFor="card-payment">Carte bancaire</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="mobile-money" checked={mobileMoneyPayment} onCheckedChange={(checked) => setMobileMoneyPayment(!!checked)} />
            <Label htmlFor="mobile-money">Mobile money</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="local-account" checked={localAccountPayment} onCheckedChange={(checked) => setLocalAccountPayment(!!checked)} />
            <Label htmlFor="local-account">Compte local</Label>
          </div>

          <Button onClick={handlePaymentMethodsUpdate}>
            <Save className="mr-2 h-4 w-4" /> Mettre à jour
          </Button>
        </CardContent>
      </Card>

      {/* Paramètres de stock */}
      <Card>
        <CardHeader>
          <CardTitle>3. Paramètres de stock</CardTitle>
          <CardDescription>Configurez la gestion de votre stock</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="low-stock-alert" checked={lowStockAlert} onCheckedChange={(checked) => setLowStockAlert(!!checked)} />
            <Label htmlFor="low-stock-alert">Alertes de stock bas</Label>
          </div>

          <div>
            <Label>Seuil d'alerte de stock bas</Label>
            <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="auto-stock-management" checked={autoStockManagement} onCheckedChange={(checked) => setAutoStockManagement(!!checked)} />
            <Label htmlFor="auto-stock-management">Gestion automatique des entrées/sorties de stock après chaque vente</Label>
          </div>

          <Button onClick={handleStockSettingsUpdate}>
            <Save className="mr-2 h-4 w-4" /> Mettre à jour
          </Button>
        </CardContent>
      </Card>

      {/* Configuration de l'impression */}
      <Card>
        <CardHeader>
          <CardTitle>4. Configuration de l'impression</CardTitle>
          <CardDescription>Personnalisez vos reçus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Format des reçus</Label>
            <Select value={receiptFormat} onValueChange={setReceiptFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="detailed">Détaillé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Logo personnalisé</Label>
            {customReceiptLogo && (
              <div className="mt-1">
                <div className="border border-dashed border-gray-300 p-1 w-52 h-48">
                  <img src={customReceiptLogo} alt="Logo personnalisé" className="h-full w-full object-cover" />
                </div>
              </div>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <Button variant="outline" className="relative">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} />
                <Upload className="mr-2 h-4 w-4" /> Choisir un logo
              </Button>
            </div>
          </div>

          <div>
            <Label>Message personnalisé sur les reçus</Label>
            <Input placeholder="Ex: Merci de votre visite !" value={customReceiptMessage} onChange={(e) => setCustomReceiptMessage(e.target.value)} />
          </div>

          <Button onClick={handlePrintConfigUpdate}>
            <Save className="mr-2 h-4 w-4" /> Mettre à jour
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default POSSettings
