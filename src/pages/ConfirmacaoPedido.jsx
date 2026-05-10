import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

export default function ConfirmacaoPedido() {
  const { vendaConfirmada } = useApp()
  const [venda, setVenda] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!vendaConfirmada) {
      navigate('/produtos')
      return
    }
    carregarVenda()
  }, [vendaConfirmada])

  const carregarVenda = async () => {
    if (vendaConfirmada && vendaConfirmada.id) {
      const { data } = await supabase
        .from('vendas')
        .select('*, clientes(nome, telefone)')
        .eq('id', vendaConfirmada.id)
        .single()
      if (data) setVenda(data)
    }
  }

  if (!vendaConfirmada) {
    navigate('/produtos')
    return null
  }

  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <span style={{fontSize: '4rem'}}>✅</span>
      </div>
      <h2 className="text-success mb-3">Pedido Confirmado!</h2>
      <p className="lead">Seu pedido foi realizado com sucesso.</p>
      
      <div className="card d-inline-block text-start px-4 py-3 mt-3">
        <p><strong>Pedido:</strong> #{venda?.id || vendaConfirmada.id}</p>
        <p><strong>Cliente:</strong> {venda?.clientes?.nome || vendaConfirmada.cliente_id}</p>
        <p><strong>Total:</strong> R$ {parseFloat(venda?.valor_total || 0).toFixed(2)}</p>
        <p><strong>Endereço:</strong> {venda?.endereco_entrega}</p>
      </div>
      
      <div className="mt-4">
        <Link to="/produtos" className="btn btn-custom">Continuar Comprando</Link>
      </div>
    </div>
  )
}