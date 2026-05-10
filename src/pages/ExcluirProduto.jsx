import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function ExcluirProduto() {
  const { id } = useParams()
  const { adminAuth, showMessage } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!adminAuth) {
      navigate('/admin')
      return
    }
    excluir()
  }, [id, adminAuth])

  const excluir = async () => {
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    
    if (error) {
      showMessage('Erro ao excluir: ' + error.message)
    } else {
      showMessage('Produto excluído!')
    }
    
    navigate('/admin')
  }

  return null
}