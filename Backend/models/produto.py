from datetime import datetime
from extensions import db


class Produto(db.Model):
    __tablename__ = "produtos"

    id = db.Column(db.Integer, primary_key=True)

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True
    )

    categoria_id = db.Column(
        db.Integer,
        db.ForeignKey("categorias.id"),
        nullable=True,
        index=True
    )

    nome = db.Column(
        db.String(150),
        nullable=False
    )

    descricao = db.Column(db.Text)

    valor_unitario = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    estoque = db.Column(
        db.Integer,
        default=0
    )

    ativo = db.Column(
        db.Boolean,
        default=True
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    empresa = db.relationship(
    "Empresa",
    back_populates="produtos"
    )

    categoria = db.relationship(
        "Categoria",
        back_populates="produtos"
    )

    itens_orcamento = db.relationship(
        "ItemOrcamento",
        back_populates="produto"
    )

    itens_venda = db.relationship(
        "ItemVenda",
        back_populates="produto"
    )
    def __repr__(self):
        return f"<Produto {self.id}>"