"use client"

import React from "react"
import { Button } from "../ui/button"

type Table = {
  id: string
  name: string
  status: string
}

type TableSelectorProps = {
  tables: Table[]
  onSelectTable: (tableId: string) => void
}

const TableSelector: React.FC<TableSelectorProps> = ({ tables, onSelectTable }) => {
  const freeTables = tables.filter((table) => table.status === "free")

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
      {freeTables.map((table) => (
        <Button key={table.id} onClick={() => onSelectTable(table.id)} variant="outline" className="h-14 flex flex-col justify-center items-center shadow-sm border p-2">
          {table.name}
        </Button>
      ))}
    </div>
  )
}

export default TableSelector
