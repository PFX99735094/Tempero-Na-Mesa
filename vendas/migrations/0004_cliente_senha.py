from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vendas', '0003_rename_endereco_entrega_venda_endereco_entrega'),
    ]

    operations = [
        migrations.AddField(
            model_name='cliente',
            name='senha',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
    ]