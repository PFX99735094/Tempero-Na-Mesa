from django.contrib import admin
from .models import Produto, Venda, Cliente

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'preco', 'estoque', 'created_at', 'alterar_valor']
    search_fields = ['nome']
    ordering = ['-created_at']
    
    def alterar_valor(self, obj):
        return 'Editar'
    alterar_valor.short_description = 'Alterar Valor'
