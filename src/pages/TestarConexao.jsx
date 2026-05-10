import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function TestarConexao() {
  const [status, setStatus] = useState('Testando...')
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    testar()
  }, [])

  const testar = async () => {
    try {
      // Testar tabela produtos
      const { data: prodData, error: prodError } = await supabase
        .from('produtos')
        .select('*')
        .limit(1)

      if (prodError) {
        setErro(prodError.message)
        setStatus('❌ Erro na tabela produtos')
        return
      }

      // Testar tabela clientes
      const { data: cliData, error: cliError } = await supabase
        .from('clientes')
        .select('*')
        .limit(1)

      if (cliError) {
        setErro(cliError.message)
        setStatus('❌ Erro na tabela clientes')
        return
      }

      // Testar tabela vendas
      const { data: vendData, error: vendError } = await supabase
        .from('vendas')
        .select('*')
        .limit(1)

      if (vendError) {
        setErro(vendError.message)
        setStatus('❌ Erro na tabela vendas')
        return
      }

      setDados({
        produtos: prodData || [],
        clientes: cliData || [],
        vendas: vendData || []
      })
      setStatus('✅ Conectado com sucesso!')
    } catch (err) {
      setErro(err.message)
      setStatus('❌ Erro de conexão')
    }
  }

  return (
    <div className="container py-5">
      <h2>🧪 Teste de Conexão Supabase</h2>
      
      <div className="card mt-4">
        <div className="card-body">
          <h4>Status: {status}</h4>
          
          {erro && (
            <div className="alert alert-danger mt-3">
              <strong>Erro:</strong> {erro}
            </div>
          )}

          {dados && (
            <div className="mt-3">
              <p><strong>Produtos encontrados:</strong> {dados.produtos.length}</p>
              <p><strong>Clientes encontrados:</strong> {dados.clientes.length}</p>
              <p><strong>Vendas encontradas:</strong> {dados.vendas.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}