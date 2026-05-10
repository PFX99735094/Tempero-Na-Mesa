import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function Entregas() {
  const { adminAuth, showMessage } = useApp()
  const [vendas, setVendas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminAuth) {
      navigate('/admin')
      return
    }
    carregarVendas()
  }, [adminAuth])

  const carregarVendas = async () => {
    const { data } = await supabase
      .from('vendas')
      .select('*, clientes(nome, telefone)')
      .eq('entregue', false)
      .order('data_venda', { ascending: false })
    if (data) setVendas(data)
  }

  const handleConfirmarEntrega = async (vendaId) => {
    if (!confirm('Confirmar entrega?')) return

    const { error } = await supabase
      .from('vendas')
      .update({ entregue: true })
      .eq('id', vendaId)

    if (!error) {
      showMessage(`Entrega da venda #${vendaId} confirmada!`)
      carregarVendas()
    }
  }

  const handleExcluir = async (vendaId) => {
    if (!confirm('Excluir venda?')) return

    const { error } = await supabase.from('vendas').delete().eq('id', vendaId)
    if (!error) {
      carregarVendas()
    }
  }

  if (!adminAuth) return null

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📦 Entregas Pendentes</h2>
        <Link to="/admin" className="btn btn-outline-secondary">← Voltar</Link>
      </div>

      {vendas.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>Nenhuma entrega pendente!</h4>
          <p>Todas as entregas foram finalizadas.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Total</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(venda => (
                <tr key={venda.id}>
                  <td>#{venda.id}</td>
                  <td>{venda.clientes?.nome}</td>
                  <td>{venda.clientes?.telefone}</td>
                  <td>{venda.endereco_entrega}</td>
                  <td>R$ {parseFloat(venda.valor_total).toFixed(2)}</td>
                  <td>{new Date(venda.data_venda).toLocaleString('pt-BR')}</td>
                  <td>
                    <button className="btn btn-success btn-sm me-1" onClick={() => handleConfirmarEntrega(venda.id)}>✓ Entregue</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleExcluir(venda.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}