import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

import Layout from './components/Layout'
import Produtos from './pages/Produtos'
import Carrinho from './pages/Carrinho'
import CadastroCliente from './pages/CadastroCliente'
import LoginAdmin from './pages/LoginAdmin'
import LogoutAdmin from './pages/LogoutAdmin'
import AdminDashboard from './pages/AdminDashboard'
import CadastrarProduto from './pages/CadastrarProduto'
import ListarProdutos from './pages/ListarProdutos'
import ExcluirProduto from './pages/ExcluirProduto'
import CadastrarCliente from './pages/CadastrarCliente'
import ListarClientes from './pages/ListarClientes'
import Vendas from './pages/Vendas'
import DetalhesVenda from './pages/DetalhesVenda'
import Entregas from './pages/Entregas'
import Checkout from './pages/Checkout'
import ConfirmacaoPedido from './pages/ConfirmacaoPedido'
import TestarConexao from './pages/TestarConexao'


function AdminRoute({ children }) {
  const { adminAuth } = useApp()
  const navigate = useNavigate()
  
  if (!adminAuth) {
    navigate('/admin')
    return null
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Produtos />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="carrinho" element={<Carrinho />} />
        <Route path="cadastre-se" element={<CadastroCliente />} />
        <Route path="admin" element={<LoginAdmin />} />
        <Route path="admin/logout" element={<LogoutAdmin />} />
        <Route path="admin/painel" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/cadastrar-produto" element={<AdminRoute><CadastrarProduto /></AdminRoute>} />
        <Route path="admin/listar-produtos" element={<AdminRoute><ListarProdutos /></AdminRoute>} />
        <Route path="admin/excluir-produto/:id" element={<AdminRoute><ExcluirProduto /></AdminRoute>} />
        <Route path="admin/cadastrar-cliente" element={<AdminRoute><CadastrarCliente /></AdminRoute>} />
        <Route path="admin/listar-clientes" element={<AdminRoute><ListarClientes /></AdminRoute>} />
        <Route path="admin/vendas" element={<AdminRoute><Vendas /></AdminRoute>} />
        <Route path="admin/venda/:id" element={<AdminRoute><DetalhesVenda /></AdminRoute>} />
        <Route path="admin/entregas" element={<AdminRoute><Entregas /></AdminRoute>} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="confirmacao" element={<ConfirmacaoPedido />} />
        <Route path="testar" element={<TestarConexao />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}