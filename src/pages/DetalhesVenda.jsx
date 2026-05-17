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
    const pageHeight = 280
    let y = 20

    const addPageIfNeeded = (requiredSpace) => {
      if (y + requiredSpace > pageHeight) {
        doc.addPage()
        y = 20
        return true
      }
      return false
    }

    const drawHeader = () => {
      doc.setFontSize(18)
      doc.text('Tempero Na Mesa', 105, y, { align: 'center' })
      
      doc.setFontSize(11)
      doc.text('O Sabor da Família', 105, y + 8, { align: 'center' })
      
      doc.setFontSize(9)
      doc.text('CNPJ: 37.220.844/0001-58', 105, y + 15, { align: 'center' })
      doc.text('Inscrição Estadual: 19.667.062-4', 105, y + 20, { align: 'center' })
      doc.text('Teresina - Piauí', 105, y + 25, { align: 'center' })
      doc.text(`Telefone: (86) 9 9439-6726`, 105, y + 30, { align: 'center' })
      
      doc.setFontSize(14)
      doc.text(`Pedido #${venda?.id}`, 105, y + 45, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text(`Cliente: ${venda?.clientes?.nome}`, 20, y + 60)
      doc.text(`Telefone: ${venda?.clientes?.telefone}`, 20, y + 68)
      doc.text(`CPF/CNPJ: ${venda?.clientes?.cpf_cnpj || 'Não informado'}`, 20, y + 76)
      doc.text(`Data: ${new Date(venda?.data_venda).toLocaleString('pt-BR')}`, 20, y + 84)
      doc.text(`Status: ${venda?.entregue ? 'Entregue' : 'Pendente'}`, 20, y + 92)
      
      y += 110
    }

    drawHeader()

    doc.setFontSize(12)
    doc.text('Itens do Pedido', 20, y)
    y += 10

    const colWidths = [80, 25, 35, 30]
    const colX = [20, 100, 125, 160]

    doc.setFillColor(220, 220, 220)
    doc.rect(20, y - 5, 170, 10, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Produto', colX[0] + 40, y)
    doc.text('Qtd', colX[1] + 5, y)
    doc.text('Valor Unit.', colX[2] + 5, y)
    doc.text('Total', colX[3] + 8, y)
    y += 10

    doc.setFont('helvetica', 'normal')
    itens.forEach((item) => {
      addPageIfNeeded(15)

      doc.rect(20, y - 5, 170, 10)
      doc.text(item.produto_nome.substring(0, 35), colX[0] + 5, y)
      doc.text(String(item.quantidade), colX[1] + 8, y)
      doc.text(`R$ ${parseFloat(item.produto_preco).toFixed(2)}`, colX[2] + 2, y)
      doc.text(`R$ ${parseFloat(item.total).toFixed(2)}`, colX[3] + 5, y)
      y += 10
    })

    addPageIfNeeded(25)
    y += 5
    doc.setFillColor(240, 240, 240)
    doc.rect(20, y, 170, 12, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`TOTAL A PAGAR: R$ ${parseFloat(venda?.valor_total).toFixed(2)}`, 105, y + 8, { align: 'center' })
    y += 20
    doc.setFont('helvetica', 'normal')

    if (venda?.endereco_entrega) {
      addPageIfNeeded(20)
      doc.setFontSize(11)
      doc.text('Endereço de Entrega:', 20, y)
      y += 8
      doc.text(venda.endereco_entrega, 20, y)
      y += 15
    }

    addPageIfNeeded(20)
    doc.text('_________________________________________', 105, y, { align: 'center' })
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