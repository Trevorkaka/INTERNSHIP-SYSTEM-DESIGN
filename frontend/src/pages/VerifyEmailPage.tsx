import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import client from '../api/client'

export default function VerifyEmailPage() {

  const { uid, token } = useParams()

  const navigate = useNavigate()

  const [message, setMessage] = useState(
    'Verifying email...'
  )

  useEffect(() => {

    const verify = async () => {

      try {

        await client.get(
          `/auth/verify-email/${uid}/${token}/`
        )

        setMessage(
          'Email verified successfully. Redirecting to login...'
        )

        setTimeout(() => {
          navigate('/login')
        }, 2000)

      } catch {

        setMessage(
          'Invalid or expired verification link'
        )
      }
    }

    verify()

  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-xl font-bold">
          {message}
        </h1>

      </div>

    </div>
  )
}