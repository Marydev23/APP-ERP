from datetime import datetime
from extensions import db


class ItemOrcamento(db.Model):
    __tablename__ = "itens_orcamento"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    orcamento_id = db.Column(
        db.Integer,
        db.ForeignKey("orcamentos.id", ondelete="CASCADE"),
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
    orcamento = db.relationship(
    "Orcamento",
    back_populates="itens"
    )

    produto = db.relationship(
        "Produto",
        back_populates="itens_orcamento"
    )
    def __repr__(self):
        return f"<ItemOrcamento {self.id}>"