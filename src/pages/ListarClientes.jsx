import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function ListarClientes() {
  const { adminAuth, showMessage } = useApp()
  const [clientes, setClientes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminAuth) {
      navigate('/admin')
      return
    }
    carregarClientes()
  }, [adminAuth])

  const carregarClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
    if (data) setClientes(data)
  }

  const handleExcluir = async (clienteId) => {
    if (!confirm('Excluir cliente?')) return

    const { error } = await supabase.from('clientes').delete().eq('id', clienteId)
    if (!error) {
      showMessage('Cliente excluído!')
      carregarClientes()
    }
  }

  if (!adminAuth) return null

  return (
    <div>
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4">👥 Clientes Cadastrados</h2>
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
                <th>Nome</th>
                <th>Telefone</th>
                <th>CPF/CNPJ</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.cpf_cnpj || '-'}</td>
                  <td>{new Date(cliente.created_at).toLocaleString('pt-BR')}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(cliente.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colspan="6" className="text-center text-muted">Nenhum cliente cadastrado</td>
                </tr>
              )}
            </tbody>
          </table>
          <Link to="/admin/cadastrar-cliente" className="btn btn-primary mt-3">+ Novo Cliente</Link>
        </div>
      </div>
    </div>
  )
}