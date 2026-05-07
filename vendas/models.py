from django.db import models

class Produto(models.Model):
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    estoque = models.IntegerField(default=0)
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nome
    
    @property
    def disponivel(self):
        return self.estoque > 0

class Cliente(models.Model):
    nome = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20)
    cpf_cnpj = models.CharField(max_length=18, blank=True, default='', verbose_name='CPF/CNPJ')
    senha = models.CharField(max_length=128, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nome

class ItemCarrinho(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.IntegerField(default=1)
    session_key = models.CharField(max_length=40, blank=True, null=True)
    
    @property
    def total(self):
        return self.produto.preco * self.quantidade

class Venda(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    endereco_entrega = models.TextField()
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    data_venda = models.DateTimeField(auto_now_add=True)
    entregue = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Venda #{self.id} - {self.cliente.nome}"

class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, related_name='itens', on_delete=models.CASCADE)
    produto_nome = models.CharField(max_length=200)
    produto_preco = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade = models.IntegerField()
    total = models.DecimalField(max_digits=10, decimal_places=2)