import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function ListarProdutos() {
  const { adminAuth, showMessage } = useApp()
  const [produtos, setProdutos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminAuth) {
      navigate('/admin')
      return
    }
    carregarProdutos()
  }, [adminAuth])

  const carregarProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').order('created_at', { ascending: false })
    if (data) setProdutos(data)
  }

  const handleSalvar = async (produtoId, novoPreco, novoEstoque) => {
    const { error } = await supabase
      .from('produtos')
      .update({ 
        preco: novoPreco ? parseFloat(novoPreco) : undefined,
        estoque: novoEstoque !== '' ? parseInt(novoEstoque) : undefined
      })
      .eq('id', produtoId)

    if (!error) {
      showMessage('Produto atualizado!')
      carregarProdutos()
    }
  }

  const handleExcluir = async (produtoId) => {
    if (!confirm('Excluir produto?')) return

    const { error } = await supabase.from('produtos').delete().eq('id', produtoId)
    if (!error) {
      showMessage('Produto excluído!')
      carregarProdutos()
    }
  }

  if (!adminAuth) return null

  return (
    <div>
      <div className="row mb-4">
        <div className="col">
          <h2>📦 Lista de Produtos</h2>
        </div>
        <div className="col-auto">
          <Link to="/admin" className="btn btn-outline-secondary">← Voltar ao Painel</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço Atual</th>
                <th>Novo Preço</th>
                <th>Estoque Atual</th>
                <th>Novo Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(produto => (
                <tr key={produto.id}>
                  <td>{produto.nome}</td>
                  <td><strong>R$ {parseFloat(produto.preco).toFixed(2)}</strong></td>
                  <td>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <input type="number" step="0.01" min="0" placeholder="Preço" className="form-control form-control-sm" style={{width: '100px'}} id={`preco-${produto.id}`} defaultValue={produto.preco} />
                      <input type="number" min="0" placeholder="Estoque" className="form-control form-control-sm" style={{width: '80px'}} id={`estoque-${produto.id}`} defaultValue={produto.estoque} />
                      <button type="button" className="btn btn-success btn-sm" onClick={() => {
                        const preco = document.getElementById(`preco-${produto.id}`).value
                        const estoque = document.getElementById(`estoque-${produto.id}`).value
                        handleSalvar(produto.id, preco, estoque)
                      }}>Salvar</button>
                    </div>
                  </td>
                  <td>{produto.estoque}</td>
                  <td>
                    <span className={`badge bg-${produto.estoque > 0 ? 'success' : 'danger'}`}>
                      {produto.estoque > 0 ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(produto.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr>
                  <td colspan="6" className="text-center">Nenhum produto cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}