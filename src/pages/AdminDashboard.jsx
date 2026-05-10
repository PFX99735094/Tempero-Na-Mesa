import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

export default function AdminDashboard() {
  const { adminAuth } = useApp()
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminAuth) {
      navigate('/admin')
      return
    }
    carregarDados()
  }, [adminAuth])

  const carregarDados = async () => {
    setLoading(true)
    setErro(null)
    try {
      const { error: prodError } = await supabase.from('produtos').select('*').limit(1)
      
      if (prodError) {
        throw new Error('Erro ao conectar com banco de dados')
      }
      
      const { data: produtosData } = await supabase.from('produtos').select('*').order('created_at', { ascending: false })
      if (produtosData) setProdutos(produtosData)

      const { data: clientesData } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
      if (clientesData) setClientes(clientesData)
    } catch (err) {
      console.error('Erro:', err)
      setErro(err.message)
    }
    setLoading(false)
  }

  if (!adminAuth) return null

  if (loading) {
    return (
      <div>
        <div className="row mb-3">
          <div className="col d-flex justify-content-between align-items-center">
            <h2 className="mb-0">📊 Painel Admin</h2>
            <Link to="/admin/logout" className="btn btn-outline-danger btn-sm">Sair</Link>
          </div>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div>
        <div className="row mb-3">
          <div className="col d-flex justify-content-between align-items-center">
            <h2 className="mb-0">📊 Painel Admin</h2>
            <Link to="/admin/logout" className="btn btn-outline-danger btn-sm">Sair</Link>
          </div>
        </div>
        <div className="alert alert-danger">
          <h5>⚠️ Erro de Conexão</h5>
          <p>{erro}</p>
          <p>Configure o Supabase no arquivo <code>.env</code></p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="row mb-3">
        <div className="col d-flex justify-content-between align-items-center">
          <h2 className="mb-0">📊 Painel Admin</h2>
          <Link to="/admin/logout" className="btn btn-outline-danger btn-sm">Sair</Link>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
        <div className="col">
          <div className="card h-100 text-center p-4">
            <div className="display-4 mb-3">📦</div>
            <h4>Produtos</h4>
            <p className="text-muted">Gerenciar produtos</p>
            <div className="d-flex flex-column gap-2">
              <Link to="/admin/cadastrar-produto" className="btn btn-custom">Cadastrar</Link>
              <Link to="/admin/listar-produtos" className="btn btn-warning">Alterar Valor</Link>
              <Link to="/produtos" className="btn btn-outline-secondary">Ver Todos</Link>
            </div>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100 text-center p-4">
            <div className="display-4 mb-3">👥</div>
            <h4>Clientes</h4>
            <p className="text-muted">Gerenciar clientes</p>
            <Link to="/admin/listar-clientes" className="btn btn-custom">Listar</Link>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100 text-center p-4">
            <div className="display-4 mb-3">🧾</div>
            <h4>Vendas</h4>
            <p className="text-muted">Histórico de vendas</p>
            <Link to="/admin/vendas" className="btn btn-custom">Ver Vendas</Link>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100 text-center p-4">
            <div className="display-4 mb-3">🚚</div>
            <h4>Entregas</h4>
            <p className="text-muted">Gerenciar entregas</p>
            <Link to="/admin/entregas" className="btn btn-custom">Ver Entregas</Link>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100 text-center p-4">
            <div className="display-4 mb-3">🛒</div>
            <h4>Loja</h4>
            <p className="text-muted">Ver catálogo</p>
            <Link to="/produtos" className="btn btn-custom">Acessar Loja</Link>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <h4 className="mb-3">📦 Lista de Produtos</h4>
      <div className="card mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length === 0 ? (
                  <tr>
                    <td colspan="4" className="text-center text-muted">Nenhum produto cadastrado</td>
                  </tr>
                ) : produtos.map(produto => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>R$ {parseFloat(produto.preco).toFixed(2)}</td>
                    <td>
                      {produto.estoque > 0 ? (
                        <span className="badge bg-success">{produto.estoque}</span>
                      ) : (
                        <span className="badge bg-danger">Esgotado</span>
                      )}
                    </td>
                    <td className="text-end">
                      <Link to={`/admin/excluir-produto/${produto.id}`} className="btn btn-sm btn-outline-danger" onClick={(e) => { if (!confirm('Excluir produto?')) e.preventDefault() }}>Excluir</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h4 className="mb-3">👥 Lista de Clientes</h4>
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Data Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colspan="3" className="text-center text-muted">Nenhum cliente cadastrado</td>
                  </tr>
                ) : clientes.map(cliente => (
                  <tr key={cliente.id}>
                    <td>{cliente.nome}</td>
                    <td>{cliente.telefone}</td>
                    <td>{new Date(cliente.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}