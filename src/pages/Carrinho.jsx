import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

export default function Carrinho() {
  const { carrinho, atualizarQuantidade, removerDoCarrinho, totalCarrinho, setClienteSelecionado, showMessage, clientes, carregarClientes } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoadingClientes(true)
    await carregarClientes()
    setLoadingClientes(false)
  }

  const handleFinalizar = () => {
    if (clientes.length === 0) {
      showMessage('Nenhum cliente cadastrado. Cadastre-se primeiro!')
      navigate('/cadastre-se')
      return
    }
    setShowModal(true)
  }

  const handleSelecionarCliente = (e) => {
    e.preventDefault()
    const clienteId = e.target.cliente_id.value
    const cliente = clientes.find(c => c.id === parseInt(clienteId))
    if (cliente) {
      setClienteSelecionado(cliente)
      navigate('/checkout')
    }
  }

  if (carrinho.length === 0) {
    return (
      <div className="alert alert-info text-center py-5">
        <h3>🛒 Carrinho Vazio</h3>
        <p>Adicione produtos.</p>
        <Link to="/produtos" className="btn btn-custom">Ver Produtos</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="row mb-3">
        <div className="col">
          <h2 className="mb-3">🛒 Meu Carrinho</h2>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Produto</th>
                  <th className="text-nowrap">R$ Unit.</th>
                  <th style={{width: '120px'}}>Qtd</th>
                  <th>Total</th>
                  <th style={{width: '40px'}}></th>
                </tr>
              </thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.produto_id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {item.imagem && (
                          <img src={item.imagem} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px'}} className="me-2" alt="" />
                        )}
                        <span className="text-truncate">{item.nome}</span>
                      </div>
                    </td>
                    <td>R$ {parseFloat(item.preco).toFixed(2)}</td>
                    <td>
                      <div className="input-group input-group-sm" style={{width: '110px'}}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}>-</button>
                        <input type="number" value={item.quantidade} className="form-control form-control-sm text-center" style={{width: '50px'}} readOnly />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}>+</button>
                      </div>
                    </td>
                    <td><strong>R$ {(item.preco * item.quantidade).toFixed(2)}</strong></td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removerDoCarrinho(item.produto_id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-6">
              <h4 className="mb-0">Total: <span className="text-success">R$ {totalCarrinho.toFixed(2)}</span></h4>
            </div>
            <div className="col-6 text-end">
              <Link to="/produtos" className="btn btn-outline-secondary btn-sm">← Mais</Link>
              <button className="btn btn-success btn-sm ms-2" onClick={handleFinalizar}>Finalizar</button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selecionar Cliente</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSelecionarCliente}>
                <div className="modal-body">
                  {loadingClientes ? (
                    <div className="text-center py-3"><div className="spinner-border"></div></div>
                  ) : clientes.length === 0 ? (
                    <div className="text-center">
                      <p>Nenhum cliente cadastrado.</p>
                      <Link to="/cadastre-se" className="btn btn-primary">Cadastrar-se</Link>
                    </div>
                  ) : (
                    <select name="cliente_id" className="form-select" required>
                      <option value="">-- Selecione --</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  {clientes.length > 0 && <button type="submit" className="btn btn-custom btn-sm">Continuar</button>}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}