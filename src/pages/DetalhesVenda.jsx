import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'
import { jsPDF } from 'jspdf'

export default function DetalhesVenda() {
  const { adminAuth } = useApp()
  const { id } = useParams()
  const [venda, setVenda] = useState(null)
  const [itens, setItens] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminAuth) {
      navigate('/admin')
      return
    }
    carregarVenda()
  }, [adminAuth, id])

  const carregarVenda = async () => {
    const { data: vendaData } = await supabase
      .from('vendas')
      .select('*, clientes(*)')
      .eq('id', id)
      .single()
    
    if (vendaData) {
      setVenda(vendaData)
      const { data: itensData } = await supabase
        .from('itens_venda')
        .select('*')
        .eq('venda_id', id)
      if (itensData) setItens(itensData)
    }
  }

  const gerarPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Tempero Na Mesa', 105, 20, { align: 'center' })
    
    doc.setFontSize(11)
    doc.text('O Sabor da Família', 105, 28, { align: 'center' })
    
    doc.setFontSize(9)
    doc.text('CNPJ: 37.220.844/0001-58', 105, 35, { align: 'center' })
    doc.text('Inscrição Estadual: 19.667.062-4', 105, 40, { align: 'center' })
    doc.text('Teresina - Piauí', 105, 45, { align: 'center' })
    doc.text(`Telefone: (86) 9 9439-6726`, 105, 50, { align: 'center' })
    
    doc.setFontSize(14)
    doc.text(`Pedido #${venda?.id}`, 105, 65, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(`Cliente: ${venda?.clientes?.nome}`, 20, 80)
    doc.text(`Telefone: ${venda?.clientes?.telefone}`, 20, 88)
    doc.text(`CPF/CNPJ: ${venda?.clientes?.cpf_cnpj || 'Não informado'}`, 20, 96)
    doc.text(`Data: ${new Date(venda?.data_venda).toLocaleString('pt-BR')}`, 20, 104)
    doc.text(`Status: ${venda?.entregue ? 'Entregue' : 'Pendente'}`, 20, 112)
    
    doc.setFontSize(12)
    doc.text('Itens do Pedido', 20, 130)
    
    let y = 140
    doc.setFontSize(10)
    doc.text('Produto', 20, y)
    doc.text('Qtd', 100, y)
    doc.text('Valor Unit.', 130, y)
    doc.text('Total', 170, y)
    
    y += 8
    itens.forEach(item => {
      doc.text(item.produto_nome, 20, y)
      doc.text(String(item.quantidade), 100, y)
      doc.text(`R$ ${parseFloat(item.produto_preco).toFixed(2)}`, 130, y)
      doc.text(`R$ ${parseFloat(item.total).toFixed(2)}`, 170, y)
      y += 8
    })
    
    y += 10
    doc.setFontSize(12)
    doc.text(`TOTAL A PAGAR: R$ ${parseFloat(venda?.valor_total).toFixed(2)}`, 20, y)
    
    if (venda?.endereco_entrega) {
      y += 15
      doc.setFontSize(11)
      doc.text('Endereço de Entrega:', 20, y)
      y += 8
      doc.text(venda.endereco_entrega, 20, y)
    }
    
    y += 20
    doc.text('_________________________________________', 20, y)
    doc.text('Assinatura do Cliente', 105, y + 8, { align: 'center' })
    
    doc.save(`venda_${venda?.id}.pdf`)
  }

  if (!adminAuth || !venda) return null

  return (
    <div>
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4">🧾 Venda #{venda.id}</h2>
        </div>
        <div className="col-auto">
          <button className="btn btn-danger me-2" onClick={gerarPDF}>📄 Gerar PDF</button>
          <Link to="/admin/vendas" className="btn btn-outline-secondary">← Voltar</Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>📍 Endereço de Entrega</h5>
            </div>
            <div className="card-body">
              <p className="mb-0">{venda.endereco_entrega}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>👤 Cliente</h5>
            </div>
            <div className="card-body">
              <p><strong>Nome:</strong> {venda.clientes?.nome}</p>
              <p><strong>Telefone:</strong> {venda.clientes?.telefone}</p>
              <p><strong>CPF/CNPJ:</strong> {venda.clientes?.cpf_cnpj || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>📦 Itens da Venda</h5>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço Unit.</th>
                <th>Quantidade</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.produto_nome}</td>
                  <td>R$ {parseFloat(item.produto_preco).toFixed(2)}</td>
                  <td>{item.quantidade}</td>
                  <td><strong>R$ {parseFloat(item.total).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-light">
                <td colSpan="3"><strong>Total Geral</strong></td>
                <td><strong>R$ {parseFloat(venda.valor_total).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}