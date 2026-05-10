import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function CadastroCliente() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const { showMessage } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nome || !telefone || !senha) {
      showMessage('Preencha todos os campos obrigatórios!')
      return
    }

    setLoading(true)

    const { data: existente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefone', telefone)
      .single()

    if (existente) {
      showMessage('Telefone já cadastrado!')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nome, telefone, cpf_cnpj: cpfCnpj, senha }])
      .select()
      .single()

    setLoading(false)

    if (error) {
      showMessage('Erro ao cadastrar: ' + error.message)
    } else {
      showMessage('Cadastro realizado! Agora você pode fazer compras.')
      navigate('/produtos')
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="mb-0">📝 Cadastre-se</h3>
          </div>
          <div className="card-body">
            <p className="text-muted">Crie sua conta para fazer compras</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Nome Completo *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Telefone *</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">CPF ou CNPJ</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="CPF ou CNPJ (somente números)"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Senha *</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Crie uma senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength="4"
                />
                <small className="text-muted">Use esta senha ao fazer compras</small>
              </div>
              
              <hr />
              
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-custom text-white" disabled={loading}>
                  ✅ Criar Conta
                </button>
                <Link to="/produtos" className="btn btn-outline-secondary">
                  Voltar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}