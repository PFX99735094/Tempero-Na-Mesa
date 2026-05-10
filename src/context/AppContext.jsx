import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [carrinho, setCarrinho] = useState([])
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [vendas, setVendas] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [adminAuth, setAdminAuth] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true'
  })
  const [clienteSelecionado, setClienteSelecionado] = useState(() => {
    const saved = localStorage.getItem('clienteSelecionado')
    return saved ? JSON.parse(saved) : null
  })
  const [vendaConfirmada, setVendaConfirmada] = useState(() => {
    const saved = localStorage.getItem('vendaConfirmada')
    return saved ? JSON.parse(saved) : null
  })
  const [clienteLogado, setClienteLogado] = useState(() => {
    const saved = localStorage.getItem('clienteLogado')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    localStorage.setItem('adminAuth', adminAuth)
  }, [adminAuth])

  useEffect(() => {
    if (clienteSelecionado) {
      localStorage.setItem('clienteSelecionado', JSON.stringify(clienteSelecionado))
    } else {
      localStorage.removeItem('clienteSelecionado')
    }
  }, [clienteSelecionado])

  useEffect(() => {
    if (vendaConfirmada) {
      localStorage.setItem('vendaConfirmada', JSON.stringify(vendaConfirmada))
    } else {
      localStorage.removeItem('vendaConfirmada')
    }
  }, [vendaConfirmada])

  useEffect(() => {
    if (clienteLogado) {
      localStorage.setItem('clienteLogado', JSON.stringify(clienteLogado))
    } else {
      localStorage.removeItem('clienteLogado')
    }
  }, [clienteLogado])

  const showMessage = (msg) => {
    setMensagem(msg)
    setTimeout(() => setMensagem(''), 3000)
  }

  const carregarProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').order('created_at', { ascending: false })
    if (data) setProdutos(data)
  }

  const carregarClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
    if (data) setClientes(data)
  }

  const carregarVendas = async () => {
    const { data } = await supabase.from('vendas').select('*, clientes(nome, telefone, cpf_cnpj), itens(*)').order('data_venda', { ascending: false })
    if (data) setVendas(data)
  }

  const adicionarAoCarrinho = async (produto, quantidade) => {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id)
    let novoCarrinho
    if (itemExistente) {
      const novaQtd = itemExistente.quantidade + quantidade
      if (novaQtd > produto.estoque) {
        showMessage(`Erro! Estoque insuficiente. Disponível: ${produto.estoque}`)
        return
      }
      novoCarrinho = carrinho.map(item =>
        item.produto_id === produto.id ? { ...item, quantidade: novaQtd } : item
      )
    } else {
      if (quantidade > produto.estoque) {
        showMessage(`Erro! Estoque insuficiente. Disponível: ${produto.estoque}`)
        return
      }
      novoCarrinho = [...carrinho, { ...produto, produto_id: produto.id, quantidade }]
    }
    setCarrinho(novoCarrinho)
    showMessage(`${produto.nome} adicionado ao carrinho!`)
  }

  const atualizarQuantidade = (produtoId, quantidade) => {
    const item = carrinho.find(i => i.produto_id === produtoId)
    if (!item) return

    if (quantidade <= 0) {
      setCarrinho(carrinho.filter(i => i.produto_id !== produtoId))
      return
    }

    if (quantidade > item.estoque) {
      showMessage(`Erro! Estoque insuficiente. Máximo: ${item.estoque}`)
      return
    }

    setCarrinho(carrinho.map(i =>
      i.produto_id === produtoId ? { ...i, quantidade } : i
    ))
  }

  const removerDoCarrinho = (produtoId) => {
    setCarrinho(carrinho.filter(i => i.produto_id !== produtoId))
  }

  const limparCarrinho = () => {
    setCarrinho([])
  }

  const totalCarrinho = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)

  const loginAdmin = (password) => {
    if (password === 'ana@2026') {
      setAdminAuth(true)
      return true
    }
    return false
  }

  const logoutAdmin = () => {
    setAdminAuth(false)
  }

  const logoutCliente = () => {
    setClienteLogado(null)
    setClienteSelecionado(null)
  }

  return (
    <AppContext.Provider value={{
      carrinho,
      setCarrinho,
      produtos,
      setProdutos,
      clientes,
      setClientes,
      vendas,
      setVendas,
      mensagem,
      showMessage,
      adminAuth,
      setAdminAuth,
      clienteSelecionado,
      setClienteSelecionado,
      vendaConfirmada,
      setVendaConfirmada,
      clienteLogado,
      setClienteLogado,
      carregarProdutos,
      carregarClientes,
      carregarVendas,
      adicionarAoCarrinho,
      atualizarQuantidade,
      removerDoCarrinho,
      limparCarrinho,
      totalCarrinho,
      loginAdmin,
      logoutAdmin,
      logoutCliente
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}