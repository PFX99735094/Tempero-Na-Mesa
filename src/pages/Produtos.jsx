import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'

export default function Produtos() {
  const { adicionarAoCarrinho } = useApp()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    setLoading(true)
    const { data } = await supabase.from('produtos').select('*').order('created_at', { ascending: false })
    if (data) setProdutos(data)
    setLoading(false)
  }

  return (
    <div>
      <div className="row mb-3">
        <div className="col">
          <h2 className="mb-3">📦 Catálogo de Produtos</h2>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : produtos.length === 0 ? (
        <div className="alert alert-info">
          <h4>Nenhum produto cadastrado.</h4>
          <p>Clique em "Cadastrar" no menu para adicionar.</p>
          <Link to="/admin/cadastrar-produto" className="btn btn-custom">Cadastrar Produto</Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {produtos.map(produto => (
            <div className="col" key={produto.id}>
              <div className="card h-100">
                {produto.imagem ? (
                  <img src={produto.imagem} className="product-image" alt={produto.nome} />
                ) : (
                  <div className="product-image d-flex align-items-center justify-content-center bg-light">
                    <span className="text-muted">📷 Sem imagem</span>
                  </div>
                )}
                
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{produto.nome}</h5>
                  <p className="card-text text-muted small flex-grow-1">{produto.descricao}</p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="price-tag">R$ {parseFloat(produto.preco).toFixed(2)}</span>
                    {produto.estoque > 0 ? (
                      <span className="estoque-badge bg-success text-white">✓ {produto.estoque} disponível(s)</span>
                    ) : (
                      <span className="estoque-badge bg-danger text-white">✗ Esgotado</span>
                    )}
                  </div>
                  
                  {produto.estoque > 0 ? (
                    <button className="btn btn-custom w-100" onClick={() => adicionarAoCarrinho(produto, 1)}>
                      Adicionar ao Carrinho
                    </button>
                  ) : (
                    <button className="btn btn-secondary w-100" disabled>Indisponível</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}