import React from "react"

interface Level2Props {
  title: string,
  children: React.ReactNode
}

const Level2 = ({title,children}: Level2Props) => {
  return (
    <div className="mb-2 flex justify-between">
      <h1 className="text-xl font-bold">{title}</h1>
     {children}
    </div>
  )
}

export default Level2
