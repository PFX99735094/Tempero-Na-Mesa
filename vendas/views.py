from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.utils import timezone
from django.template.loader import render_to_string
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import cm

from .models import Produto, Cliente, ItemCarrinho, Venda, ItemVenda

ADMIN_PASSWORD = "ana@2026"

def get_or_create_session_key(request):
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key

def produtos(request):
    session_key = request.session.session_key or get_or_create_session_key(request)
    produtos = Produto.objects.all().order_by('-created_at')
    
    for produto in produtos:
        itens_carrinho = ItemCarrinho.objects.filter(produto=produto, session_key=session_key)
        produto.reservado = sum(item.quantidade for item in itens_carrinho)
        produto.disponivel_real = produto.estoque - produto.reservado
    
    return render(request, 'vendas/produtos.html', {'produtos': produtos})

@require_POST
def adicionar_ao_carrinho(request, produto_id):
    produto = get_object_or_404(Produto, id=produto_id)
    session_key = get_or_create_session_key(request)
    quantidade = int(request.POST.get('quantidade', 1))
    
    itens_existentes = ItemCarrinho.objects.filter(produto=produto, session_key=session_key)
    qtd_no_carrinho = sum(item.quantidade for item in itens_existentes)
    estoque_disponivel = produto.estoque - qtd_no_carrinho
    
    if quantidade > estoque_disponivel:
        messages.error(request, f'Erro! Estoque insuficiente. Disponível: {estoque_disponivel}')
        return redirect('produtos')
    
    item, created = ItemCarrinho.objects.get_or_create(
        produto=produto,
        session_key=session_key,
        defaults={'quantidade': quantidade}
    )
    if not created:
        item.quantidade += quantidade
        item.save()
    
    messages.success(request, f'{produto.nome} adicionado ao carrinho!')
    return redirect('carrinho')

def carrinho(request):
    session_key = request.session.session_key or get_or_create_session_key(request)
    itens = ItemCarrinho.objects.filter(session_key=session_key)
    total = sum(item.total for item in itens)
    clientes = Cliente.objects.all()
    return render(request, 'vendas/carrinho.html', {'itens': itens, 'total': total, 'clientes': clientes})

def remover_do_carrinho(request, item_id):
    item = get_object_or_404(ItemCarrinho, id=item_id)
    item.delete()
    return redirect('carrinho')

@require_POST
def atualizar_quantidade(request, item_id):
    item = get_object_or_404(ItemCarrinho, id=item_id)
    nova_qtd = int(request.POST.get('quantidade', 1))
    if nova_qtd > 0:
        item.quantidade = nova_qtd
        item.save()
    else:
        item.delete()
    return redirect('carrinho')

def login_admin(request):
    if request.session.get('admin_authenticated'):
        return redirect('admin_dashboard')
    
    if request.method == 'POST':
        password = request.POST.get('password')
        if password == ADMIN_PASSWORD:
            request.session['admin_authenticated'] = True
            return redirect('admin_dashboard')
        else:
            messages.error(request, 'Senha incorreta!')
    return render(request, 'vendas/login_admin.html')

def logout_admin(request):
    request.session.flush()
    return redirect('produtos')

def admin_dashboard(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    produtos = Produto.objects.all().order_by('-created_at')
    clientes = Cliente.objects.all().order_by('-created_at')
    return render(request, 'vendas/admin_dashboard.html', {'produtos': produtos, 'clientes': clientes})

def listar_produtos(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    produtos = Produto.objects.all().order_by('-created_at')
    return render(request, 'vendas/listar_produtos.html', {'produtos': produtos})

@require_POST
def alterar_preco_produto(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    produto_id = request.POST.get('produto_id')
    novo_preco = request.POST.get('novo_preco')
    novo_estoque = request.POST.get('novo_estoque')
    produto = get_object_or_404(Produto, id=produto_id)
    
    if novo_preco:
        produto.preco = novo_preco
    if novo_estoque is not None:
        produto.estoque = int(novo_estoque)
    produto.save()
    
    messages.success(request, f'{produto.nome} atualizado!')
    return redirect('listar_produtos')

def cadastrar_produto(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    if request.method == 'POST':
        nome = request.POST.get('nome')
        descricao = request.POST.get('descricao')
        preco = request.POST.get('preco')
        estoque = request.POST.get('estoque')
        imagem = request.FILES.get('imagem')
        
        produto = Produto.objects.create(
            nome=nome,
            descricao=descricao,
            preco=preco,
            estoque=estoque,
            imagem=imagem
        )
        messages.success(request, f'Produto {produto.nome} cadastrado!')
        return redirect('produtos')
    
    return render(request, 'vendas/cadastrar_produto.html')

@require_POST
def excluir_produto(request, produto_id):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    produto = get_object_or_404(Produto, id=produto_id)
    produto.delete()
    messages.success(request, 'Produto excluído!')
    return redirect('produtos')

@require_POST
def adicionar_estoque(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    produto_id = request.POST.get('produto_id')
    quantidade = request.POST.get('quantidade')
    
    produto = get_object_or_404(Produto, id=produto_id)
    produto.estoque += int(quantidade)
    produto.save()
    
    messages.success(request, f'+{quantidade} unidades adicionadas ao estoque de {produto.nome}')
    return redirect('admin_dashboard')

def cadastrar_cliente(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    if request.method == 'POST':
        nome = request.POST.get('nome')
        telefone = request.POST.get('telefone')
        cpf_cnpj = request.POST.get('cpf_cnpj', '')
        senha = request.POST.get('senha', '')
        
        cliente = Cliente.objects.create(nome=nome, telefone=telefone, cpf_cnpj=cpf_cnpj, senha=senha)
        messages.success(request, f'Cliente {cliente.nome} cadastrado!')
        return redirect('listar_clientes')
    
    return render(request, 'vendas/cadastrar_cliente.html')

def cadastro_cliente(request):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        telefone = request.POST.get('telefone')
        cpf_cnpj = request.POST.get('cpf_cnpj', '')
        senha = request.POST.get('senha')
        
        if not nome or not telefone or not senha:
            messages.error(request, 'Preencha todos os campos!')
            return render(request, 'vendas/cadastro_cliente.html')
        
        if Cliente.objects.filter(telefone=telefone).exists():
            messages.error(request, 'Telefone já cadastrado!')
            return render(request, 'vendas/cadastro_cliente.html')
        
        cliente = Cliente.objects.create(nome=nome, telefone=telefone, cpf_cnpj=cpf_cnpj, senha=senha)
        messages.success(request, 'Cadastro realizado! Agora você pode fazer compras.')
        return redirect('produtos')
    
    return render(request, 'vendas/cadastro_cliente.html')

def listar_clientes(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    clientes = Cliente.objects.all().order_by('-created_at')
    return render(request, 'vendas/listar_clientes.html', {'clientes': clientes})

@require_POST
def excluir_cliente(request, cliente_id):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    cliente = get_object_or_404(Cliente, id=cliente_id)
    cliente.delete()
    messages.success(request, 'Cliente excluído!')
    return redirect('listar_clientes')

def vendas(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    vendas = Venda.objects.all().order_by('-data_venda')
    return render(request, 'vendas/vendas.html', {'vendas': vendas})

def detalhes_venda(request, venda_id):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    venda = get_object_or_404(Venda, id=venda_id)
    return render(request, 'vendas/detalhes_venda.html', {'venda': venda})

def entregas(request):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    vendas = Venda.objects.filter(entregue=False).order_by('-data_venda')
    return render(request, 'vendas/entregas.html', {'vendas': vendas})

def confirmar_entrega(request, venda_id):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    venda = get_object_or_404(Venda, id=venda_id)
    venda.entregue = True
    venda.save()
    messages.success(request, f'Entrega da venda #{venda.id} confirmada!')
    return redirect('entregas')

@require_POST
def excluir_venda(request, venda_id):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    venda = get_object_or_404(Venda, id=venda_id)
    venda.delete()
    messages.success(request, 'Venda excluída!')
    return redirect('entregas')

def finalizar_venda(request):
    if request.method == 'POST':
        cliente_id = request.POST.get('cliente_id')
        endereco = request.POST.get('endereco')
        
        cliente = get_object_or_404(Cliente, id=cliente_id)
        session_key = request.session.session_key or get_or_create_session_key(request)
        itens = ItemCarrinho.objects.filter(session_key=session_key)
        
        if not itens:
            messages.error(request, 'Carrinho vazio!')
            return redirect('carrinho')
        
        total = sum(item.total for item in itens)
        
        venda = Venda.objects.create(
            cliente=cliente,
            endereco_entrega=endereco,
            valor_total=total
        )
        
        for item in itens:
            ItemVenda.objects.create(
                venda=venda,
                produto_nome=item.produto.nome,
                produto_preco=item.produto.preco,
                quantidade=item.quantidade,
                total=item.total
            )
            produto = item.produto
            produto.estoque -= item.quantidade
            produto.save()
        
        itens.delete()
        
        messages.success(request, f'Venda #{venda.id} finalizada com sucesso!')
        return redirect('vendas')
    
    return redirect('carrinho')

def selecionar_cliente(request):
    if request.method == 'POST':
        cliente_id = request.POST.get('cliente_id')
        request.session['cliente_selecionado_id'] = cliente_id
        return redirect('finalizar_checkout')
    return redirect('carrinho')

def finalizar_checkout(request):
    cliente_id = request.session.get('cliente_selecionado_id')
    if not cliente_id:
        return redirect('carrinho')
    
    session_key = request.session.session_key or get_or_create_session_key(request)
    itens = ItemCarrinho.objects.filter(session_key=session_key)
    total = sum(item.total for item in itens)
    cliente = get_object_or_404(Cliente, id=cliente_id)
    
    if request.method == 'POST':
        senha = request.POST.get('senha')
        endereco = request.POST.get('endereco')
        
        if senha != cliente.senha:
            messages.error(request, 'Senha incorreta!')
            return render(request, 'vendas/finalizar_checkout.html', {'cliente': cliente, 'itens': itens, 'total': total})
        
        venda = Venda.objects.create(
            cliente=cliente,
            endereco_entrega=endereco,
            valor_total=total
        )
        
        for item in itens:
            ItemVenda.objects.create(
                venda=venda,
                produto_nome=item.produto.nome,
                produto_preco=item.produto.preco,
                quantidade=item.quantidade,
                total=item.total
            )
            produto = item.produto
            produto.estoque -= item.quantidade
            produto.save()
        
        itens.delete()
        del request.session['cliente_selecionado_id']
        
        messages.success(request, f'Venda #{venda.id} finalizada!')
        request.session['venda_confirmada_id'] = venda.id
        return redirect('confirmacao_pedido')
    
    return render(request, 'vendas/finalizar_checkout.html', {'cliente': cliente, 'itens': itens, 'total': total})

def confirmacao_pedido(request):
    venda_id = request.session.pop('venda_confirmada_id', None)
    if not venda_id:
        return redirect('produtos')
    
    venda = get_object_or_404(Venda, id=venda_id)
    return render(request, 'vendas/confirmacao_pedido.html', {'venda': venda})

def gerar_pdf_venda(request, venda_id):
    if not request.session.get('admin_authenticated'):
        return redirect('login_admin')
    
    venda = get_object_or_404(Venda, id=venda_id)
    itens = venda.itens.all()
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="venda_{venda.id}.pdf"'
    
    doc = SimpleDocTemplate(response, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, spaceAfter=20)
    title_style.alignment = 1
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, spaceAfter=20)
    subtitle_style.alignment = 1
    
    elements.append(Paragraph('Tempero Na Mesa', title_style))
    familia_style = ParagraphStyle('Familia', parent=styles['Normal'], fontSize=11, spaceAfter=2)
    familia_style.alignment = 1
    familia_style.fontName = 'Helvetica-Bold'
    elements.append(Paragraph('O Sabor da Família', familia_style))
    
    empresa_style = ParagraphStyle('Empresa', parent=styles['Normal'], fontSize=9, spaceAfter=3)
    empresa_style.alignment = 1
    elements.append(Paragraph('CNPJ: 37.220.844/0001-58', empresa_style))
    elements.append(Paragraph('Inscrição Estadual: 19.667.062-4', empresa_style))
    elements.append(Paragraph('Teresina - Piauí', empresa_style))
    elements.append(Paragraph('Telefone: (86) 9 9439-6726', empresa_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f'Pedido #{venda.id}', subtitle_style))
    
    data_cliente = [
        ['Cliente:', venda.cliente.nome],
        ['Telefone:', venda.cliente.telefone],
        ['CPF/CNPJ:', venda.cliente.cpf_cnpj or 'Não informado'],
        ['Data:', venda.data_venda.strftime('%d/%m/%Y %H:%M')],
        ['Status:', 'Entregue' if venda.entregue else 'Pendente'],
    ]
    
    t_cliente = Table(data_cliente, colWidths=[100, 300])
    t_cliente.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_cliente)
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph('Itens do Pedido', styles['Heading2']))
    
    data_itens = [['Produto', 'Qtd', 'Valor Unit.', 'Total']]
    for item in itens:
        data_itens.append([
            item.produto_nome,
            str(item.quantidade),
            f'R$ {item.produto_preco:.2f}',
            f'R$ {item.total:.2f}'
        ])
    
    t_itens = Table(data_itens, colWidths=[250, 50, 80, 80])
    t_itens.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    elements.append(t_itens)
    elements.append(Spacer(1, 20))
    
    data_total = [['TOTAL A PAGAR:', f'R$ {venda.valor_total:.2f}']]
    t_total = Table(data_total, colWidths=[410, 80])
    t_total.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#27ae60')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
    ]))
    elements.append(t_total)
    elements.append(Spacer(1, 30))
    
    if venda.endereco_entrega:
        elements.append(Paragraph('Endereço de Entrega:', styles['Heading3']))
        elements.append(Paragraph(venda.endereco_entrega, styles['Normal']))
    
    elements.append(Spacer(1, 40))
    elements.append(Paragraph('_________________________________________', styles['Normal']))
    
    assinatura_style = ParagraphStyle('Assinatura', parent=styles['Normal'], alignment=1)
    elements.append(Paragraph('Assinatura do Cliente', assinatura_style))
    
    doc.build(elements)
    return response