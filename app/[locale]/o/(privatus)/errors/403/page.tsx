import React from "react"

const Error403 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <img src="/assets/img/illustrations/403.svg" width="40%" alt="403" />
      <div className="text-center">
        <p className="text-xs mb-1 p-1 bg-primary text-white rounded-sm">Vous n'avez pas suffisamment d'accès pour voir cette page.</p>
        <p className="text-xs">Accédez au panneau à gauche pour naviguer.</p>
      </div>
    </div>
  )
}

export default Error403
