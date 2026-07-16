from datetime import datetime
from extensions import db


class Orcamento(db.Model):
    __tablename__ = "orcamentos"

    id = db.Column(db.Integer, primary_key=True)

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True
    )
    cliente_id = db.Column(
        db.Integer,
        db.ForeignKey("clientes.id"),
        nullable=False,
        index=True
    )

    frete = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    desconto = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    subtotal = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    total = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="RASCUNHO"
    )

    observacao = db.Column(db.Text)

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
        back_populates="orcamentos"
    )

    cliente = db.relationship(
        "Cliente",
        back_populates="orcamentos"
    )

    itens = db.relationship(
        "ItemOrcamento",
        back_populates="orcamento",
        cascade="all, delete-orphan"
    )
    def __repr__(self):
     return f"<Orcamento {self.id}>"