import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function Vendas() {
  const { adminAuth } = useApp()
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
      .order('data_venda', { ascending: false })
    if (data) setVendas(data)
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
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4">🧾 Histórico de Vendas</h2>
        </div>
        <div className="col-auto">
          <Link to="/admin" className="btn btn-outline-secondary">← Voltar</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Valor Total</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(venda => (
                <tr key={venda.id}>
                  <td>#{venda.id}</td>
                  <td>{venda.clientes?.nome}</td>
                  <td><strong>R$ {parseFloat(venda.valor_total).toFixed(2)}</strong></td>
                  <td>{new Date(venda.data_venda).toLocaleString('pt-BR')}</td>
                  <td>
                    <Link to={`/admin/venda/${venda.id}`} className="btn btn-sm btn-outline-primary me-1">Ver</Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(venda.id)}>✕</button>
                  </td>
                </tr>
              ))}
              {vendas.length === 0 && (
                <tr>
                  <td colspan="5" className="text-center text-muted">Nenhuma venda realizada</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}