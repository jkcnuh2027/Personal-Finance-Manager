import React, { useEffect, useState } from 'react'
import { plaidAPI } from '../../services/api'

declare global {
  interface Window {
    Plaid?: any
  }
}

const ConnectBankButton: React.FC = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null)

  useEffect(() => {
    plaidAPI.createLinkToken().then(({ data }) => setLinkToken(data.link_token)).catch(() => setLinkToken(null))
  }, [])

  const openLink = async () => {
    if (!linkToken || !window.Plaid) return
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token: string) => {
        await plaidAPI.exchangePublicToken(public_token)
        await plaidAPI.syncTransactions()
      },
    })
    handler.open()
  }

  return (
    <button
      onClick={openLink}
      disabled={!linkToken}
      className="bg-white text-primary-700 px-4 py-2 rounded shadow hover:shadow-md"
    >
      {linkToken ? 'Connect a bank' : 'Loading...'}
    </button>
  )
}

export default ConnectBankButton


