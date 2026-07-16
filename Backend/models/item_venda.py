from datetime import datetime
from extensions import db


class ItemVenda(db.Model):
    __tablename__ = "itens_venda"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    venda_id = db.Column(
        db.Integer,
        db.ForeignKey("vendas.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    produto_id = db.Column(
        db.Integer,
        db.ForeignKey("produtos.id"),
        nullable=True,
        index=True
    )

    descricao = db.Column(
        db.Text,
        nullable=False
    )

    quantidade = db.Column(
        db.Integer,
        nullable=False
    )

    preco_unitario = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    desconto = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    valor_total = db.Column(
        db.Numeric(10, 2),
        nullable=False
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
    venda = db.relationship(
    "Venda",
    back_populates="itens"
    )

    produto = db.relationship(
        "Produto",
        back_populates="itens_venda"
    )
    def __repr__(self):
     return f"<ItemVenda{self.id}>"