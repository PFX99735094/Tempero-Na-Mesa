import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Layout() {
  const { carrinho, mensagem, adminAuth } = useApp()
  const navigate = useNavigate()

  const handleAdminClick = (e) => {
    e.preventDefault()
    if (adminAuth) {
      navigate('/admin/painel')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div>
      <div className="banner-logo">
        <h1 className="brand-text">Tempero na Mesa</h1>
      </div>

      <nav className="navbar navbar-expand-lg navbar-custom navbar-dark sticky-top">
        <div className="container-fluid px-3">
          <Link className="navbar-brand fw-bold brand-text me-2" to="/">🛒 Tempero na Mesa</Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/produtos">Produtos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/carrinho">Carrinho {carrinho.length > 0 && `(${carrinho.length})`}</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cadastre-se">Cadastre-se</Link>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin" onClick={handleAdminClick}>Admin</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        {mensagem && (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            {mensagem}
            <button type="button" className="btn-close" onClick={() => useApp().showMessage('')}></button>
          </div>
        )}
        
        <Outlet />
      </div>
    </div>
  )
}