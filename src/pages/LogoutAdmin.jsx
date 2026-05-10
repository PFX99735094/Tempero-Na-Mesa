import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LogoutAdmin() {
  const { logoutAdmin } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    logoutAdmin()
    navigate('/admin')
  }, [])

  return null
}