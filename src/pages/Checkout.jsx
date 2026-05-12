import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function Checkout() {
  const { carrinho, totalCarrinho, clienteSelecionado, limparCarrinho, setVendaConfirmada } = useApp()
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [endereco, setEndereco] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    
    if (!clienteSelecionado) {
      navigate('/carrinho')
      return
    }

    // Validar senha do cliente
    if (senha !== clienteSelecionado.senha) {
      setErro('Senha incorreta!')
      return
    }

    if (!endereco || endereco.trim() === '') {
      setErro('Endereço de entrega obrigatório!')
      return
    }

    setLoading(true)

    try {
      // Criar venda
      const { data: vendaData, error: vendaError } = await supabase
        .from('vendas')
        .insert([{
          cliente_id: clienteSelecionado.id,
          endereco_entrega: endereco,
          valor_total: totalCarrinho,
          entregue: false
        }])
        .select()
        .single()

      if (vendaError) {
        setErro('Erro ao criar venda. Configure o Supabase.')
        setLoading(false)
        return
      }

      // Criar itens da venda
      const itens = carrinho.map(item => ({
        venda_id: vendaData.id,
        produto_nome: item.nome,
        produto_preco: item.preco,
        quantidade: item.quantidade,
        total: item.preco * item.quantidade
      }))

      await supabase.from('itens_venda').insert(itens)

      // Atualizar estoque
      for (const item of carrinho) {
        const { data: prodData } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.produto_id)
          .single()
        
        if (prodData) {
          await supabase
            .from('produtos')
            .update({ estoque: prodData.estoque - item.quantidade })
            .eq('id', item.produto_id)
        }
      }

      limparCarrinho()
      setVendaConfirmada(vendaData)
      navigate('/confirmacao')
    } catch (err) {
      setErro('Erro de conexão. Configure o Supabase.')
    }

    setLoading(false)
  }

  if (!clienteSelecionado) {
    navigate('/carrinho')
    return null
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4">✅ Finalizar Compra</h2>
        </div>
      </div>

      {erro && (
        <div className="alert alert-danger">{erro}</div>
      )}

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>📋 Resumo do Pedido</h5>
            </div>
            <div className="card-body">
              <table className="table">
                <tbody>
                  {carrinho.map(item => (
                    <tr key={item.produto_id}>
                      <td>{item.nome} x{item.quantidade}</td>
                      <td className="text-end">R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-light">
                    <td><strong>Total</strong></td>
                    <td className="text-end"><strong>R$ {totalCarrinho.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>📍 Informações de Entrega</h5>
            </div>
            <div className="card-body">
              <p><strong>Cliente:</strong> {clienteSelecionado.nome}</p>
              <p><strong>Telefone:</strong> {clienteSelecionado.telefone}</p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Senha do Cliente *</label>
                  <div className="input-group">
                    <input 
                      type={mostrarSenha ? "text" : "password"} 
                      className="form-control" 
                      placeholder="Digite sua senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {mostrarSenha ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <small className="text-muted">Senha criada no cadastro</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Endereço de Entrega *</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Digite o endereço completo para entrega"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={loading}>
                  {loading ? 'Processando...' : '✅ Confirmar Compra'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}