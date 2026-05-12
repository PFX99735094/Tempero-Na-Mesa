import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginAdmin() {
  const [password, setPassword] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [error, setError] = useState('')
  const { loginAdmin, showMessage, adminAuth } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (adminAuth) {
      navigate('/admin/painel')
    }
  }, [adminAuth])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (loginAdmin(password)) {
      navigate('/admin/painel')
    } else {
      setError('Senha incorreta!')
      showMessage('Senha incorreta!')
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight: '60vh'}}>
      <div className="card" style={{maxWidth: '400px', width: '100%'}}>
        <div className="banner-logo">
          <h1 style={{fontSize: '1.5rem', margin: 0, color: 'white', fontFamily: 'Georgia, serif', fontStyle: 'italic'}}>Tempero na Mesa</h1>
        </div>
        
        <div className="card-body">
          <h3 className="text-center mb-4">🔐 Acesso Restrito</h3>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Senha de Acesso</label>
              <div className="input-group">
                <input 
                  type={mostrarSenha ? "text" : "password"} 
                  className="form-control" 
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
            <button type="submit" className="btn btn-custom w-100">Entrar</button>
          </form>
          
          <div className="text-center mt-3">
            <Link to="/produtos" className="text-muted">← Voltar para Loja</Link>
          </div>
        </div>
      </div>
    </div>
  )
}