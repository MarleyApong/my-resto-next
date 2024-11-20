import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Star, CreditCard, Calendar } from "lucide-react"

// Type pour définir la structure d'un client
type Client = {
  id: string
  nom: string
  email: string
  telephone: string
  restaurants: string[]
  pointsFidelite: number
  dernierVisite: string
  categorieClient: "VIP" | "Elite" | "Régulier"
  montantTotal: number
  nombreVisites: number
  moyenneDepense: number
}

// Données simulées des clients
const clientData: Client[] = [
  {
    id: "C001",
    nom: "Sophie Dupont",
    email: "sophie.dupont@email.com",
    telephone: "+33 6 12 34 56 78",
    restaurants: ["Le Bistrot Gourmet", "La Table Moderne"],
    pointsFidelite: 850,
    dernierVisite: "2024-02-15",
    categorieClient: "VIP",
    montantTotal: 2450,
    nombreVisites: 23,
    moyenneDepense: 106.5
  },
  {
    id: "C002",
    nom: "Lucas Martin",
    email: "lucas.martin@email.com",
    telephone: "+33 7 98 76 54 32",
    restaurants: ["La Table Moderne"],
    pointsFidelite: 450,
    dernierVisite: "2024-03-20",
    categorieClient: "Régulier",
    montantTotal: 1250,
    nombreVisites: 12,
    moyenneDepense: 104.2
  },
  {
    id: "C003",
    nom: "Emma Laurent",
    email: "emma.laurent@email.com",
    telephone: "+33 6 55 44 33 22",
    restaurants: ["Le Bistrot Gourmet", "Chez Marcel"],
    pointsFidelite: 1200,
    dernierVisite: "2024-04-05",
    categorieClient: "Elite",
    montantTotal: 3600,
    nombreVisites: 36,
    moyenneDepense: 100.0
  }
]

export const Overview: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const renderClientDetails = (client: Client) => (
    <Card className="w-full mt-4 rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="mr-2 text-yellow-500" />
          Détails du Client - {client.nom}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Email:</strong> {client.email}
            </p>
            <p>
              <strong>Téléphone:</strong> {client.telephone}
            </p>
            <p>
              <strong>Restaurants:</strong>
              {client.restaurants.map((resto) => (
                <Badge key={resto} variant="secondary" className="ml-2">
                  {resto}
                </Badge>
              ))}
            </p>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <TrendingUp className="mr-2 text-green-600" />
              <strong>Statistiques de Consommation</strong>
            </div>
            <p>
              <strong>Montant Total:</strong> {client.montantTotal}€
            </p>
            <p>
              <strong>Nombre de Visites:</strong> {client.nombreVisites}
            </p>
            <p>
              <strong>Moyenne par Visite:</strong> {client.moyenneDepense.toFixed(2)}€
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <CreditCard className="mr-2 text-blue-600" />
            <strong>Points Fidélité:</strong>
            <Badge variant="outline" className="ml-2 bg-yellow-100">
              {client.pointsFidelite} pts
            </Badge>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 text-purple-600" />
            <strong>Dernière Visite:</strong> {client.dernierVisite}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Gestion des Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Points Fidélité</TableHead>
                <TableHead>Restaurants</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientData.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.id}</TableCell>
                  <TableCell>{client.nom}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          client.categorieClient === "VIP"
                            ? "bg-gold text-black"
                            : client.categorieClient === "Elite"
                              ? "bg-purple-200 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      `}
                    >
                      {client.categorieClient}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.pointsFidelite}</TableCell>
                  <TableCell>
                    {client.restaurants.map((resto) => (
                      <Badge key={resto} variant="secondary" className="mr-1">
                        {resto}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => setSelectedClient(client)} className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-700">
                      Détails
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedClient && renderClientDetails(selectedClient)}
    </div>
  )
}
