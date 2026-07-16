from datetime import datetime
from extensions import db


class Cliente(db.Model):
    __tablename__ = "clientes"

    id = db.Column(db.Integer, primary_key=True)

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True
    )

    nome = db.Column(db.String(150), nullable=False)

    cpf_cnpj = db.Column(
        db.String(18),
        index=True
    )

    telefone = db.Column(db.String(20))

    email = db.Column(
        db.String(150),
        index=True
    )

    endereco = db.Column(db.String(255))
    cidade = db.Column(db.String(100))
    estado = db.Column(db.String(2))
    cep = db.Column(db.String(10))

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

    # Relacionamentos
    empresa = db.relationship(
        "Empresa",
        back_populates="clientes"
    )

    orcamentos = db.relationship(
        "Orcamento",
        back_populates="cliente"
    )

    vendas = db.relationship(
        "Venda",
        back_populates="cliente"
    )

    receitas = db.relationship(
        "Receita",
        back_populates="cliente"
    )

    def __repr__(self):
        return f"<Cliente {self.nome}>"