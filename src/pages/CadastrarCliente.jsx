import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function CadastrarCliente() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const { adminAuth, showMessage } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nome || !telefone) {
      showMessage('Preencha os campos obrigatórios!')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nome, telefone, cpf_cnpj: cpfCnpj, senha }])
      .select()
      .single()

    setLoading(false)

    if (error) {
      showMessage('Erro ao cadastrar: ' + error.message)
    } else {
      showMessage(`Cliente ${nome} cadastrado!`)
      navigate('/admin/listar-clientes')
    }
  }

  if (!adminAuth) {
    navigate('/admin')
    return null
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="mb-0">👥 Cadastrar Novo Cliente</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Nome Completo *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Nome completo do cliente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Telefone *</label>
                <input 
                  type="text" 
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
                <label className="form-label fw-bold">Senha</label>
                <div className="input-group">
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    className="form-control" 
                    placeholder="Senha para o cliente acessar"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
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
              
              <hr />
              
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-custom text-white" disabled={loading}>
                  💾 Salvar Cliente
                </button>
                <Link to="/admin" className="btn btn-outline-secondary">
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}