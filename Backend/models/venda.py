from datetime import datetime

from extensions import db


class Venda(db.Model):

    __tablename__ = "vendas"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True
    )

    cliente_id = db.Column(
        db.Integer,
        db.ForeignKey("clientes.id"),
        nullable=True,
        index=True
    )

    data_venda = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    subtotal = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    desconto = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    # Taxa cobrada pela forma de pagamento
    taxa_pagamento = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    # Percentual da taxa utilizado na venda
    percentual_taxa = db.Column(
        db.Numeric(5, 2),
        default=0
    )

    total = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    forma_pagamento = db.Column(
        db.String(50)
    )

    parcelas = db.Column(
        db.Integer,
        default=1
    )

    status = db.Column(
        db.String(30),
        default="FINALIZADA"
    )

    observacao = db.Column(
        db.Text
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

    deletado_em = db.Column(
        db.DateTime,
        nullable=True
    )

    empresa = db.relationship(
        "Empresa",
        back_populates="vendas"
    )

    cliente = db.relationship(
        "Cliente",
        back_populates="vendas"
    )

    itens = db.relationship(
        "ItemVenda",
        back_populates="venda",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Venda {self.id}>"