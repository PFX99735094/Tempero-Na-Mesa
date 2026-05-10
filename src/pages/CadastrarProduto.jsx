import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useApp } from '../context/AppContext'

export default function CadastrarProduto() {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [estoque, setEstoque] = useState('')
  const [imagem, setImagem] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const { adminAuth, showMessage } = useApp()
  const navigate = useNavigate()

  const handleImagem = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagem(file)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nome || !descricao || !preco || !estoque) {
      showMessage('Preencha todos os campos obrigatórios!')
      return
    }

    setLoading(true)

    let imagemUrl = null
    
    if (imagem) {
      try {
        const fileName = `${Date.now()}_${imagem.name.replace(/\s/g, '_')}`
        
        // Primeiro: verificar se bucket existe
        const { data: buckets } = await supabase.storage.listBuckets()
        console.log('Buckets disponíveis:', buckets)
        
        const bucketProdutos = buckets?.find(b => b.name === 'produtos')
        
        if (!bucketProdutos) {
          // Criar bucket
          console.log('Criando bucket produtos...')
          const { error: createError } = await supabase.storage.createBucket('produtos', { 
            public: true 
          })
          if (createError) {
            console.error('Erro ao criar bucket:', createError)
          } else {
            console.log('Bucket criado!')
          }
        }

        // Agora tentar upload
        console.log('Fazendo upload...')
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(fileName, imagem)

        if (uploadError) {
          console.error('Erro upload:', uploadError)
          // Continuar sem imagem
        } else {
          // URL pública correta
          imagemUrl = `https://dwyzycovqccfbucovqzt.supabase.co/storage/v1/object/public/produtos/${fileName}`
          console.log('Upload OK! URL:', imagemUrl)
        }
      } catch (err) {
        console.error('Erro no upload:', err)
      }
    }

    // Salvar no banco
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ 
        nome, 
        descricao, 
        preco: parseFloat(preco), 
        estoque: parseInt(estoque),
        imagem: imagemUrl
      }])
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error('Erro ao salvar:', error)
      showMessage('Erro ao cadastrar: ' + error.message)
    } else {
      console.log('Produto salvo com imagem:', imagemUrl)
      showMessage(`Produto ${nome} cadastrado!`)
      navigate('/produtos')
    }
  }

  if (!adminAuth) {
    navigate('/admin')
    return null
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="mb-0">📦 Cadastrar Produto</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Nome do Produto *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: Pimenta Dedo de Moça"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Descrição *</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Características do produto..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>
              
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label fw-bold">Preço (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    placeholder="0,00"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    required
                  />
                </div>
                
                <div className="col-6 mb-3">
                  <label className="form-label fw-bold">Estoque *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Qtd"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Foto do Produto</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleImagem}
                />
                {preview && (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="mt-2" 
                    style={{maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px'}}
                  />
                )}
                <small className="text-muted d-block">JPG, PNG (opcional)</small>
              </div>
              
              <hr />
              
              <div className="d-flex gap-2 flex-wrap">
                <button type="submit" className="btn btn-custom" disabled={loading}>
                  {loading ? 'Salvando...' : '💾 Salvar'}
                </button>
                <Link to="/produtos" className="btn btn-outline-secondary">
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