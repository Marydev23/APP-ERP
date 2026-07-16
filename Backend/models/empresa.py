from datetime import datetime
from extensions import db


class Empresa(db.Model):
    __tablename__ = "empresas"

    id = db.Column(db.Integer, primary_key=True)

    nome = db.Column(db.String(150), nullable=False)

    cnpj = db.Column(db.String(18), unique=True, nullable=False, index=True)

    endereco = db.Column(db.String(255))

    cidade = db.Column(db.String(100))

    estado = db.Column(db.String(2))

    cep = db.Column(db.String(9))

    telefone = db.Column(db.String(20))

    email = db.Column(db.String(150), unique=True, index=True)

    site = db.Column(db.String(255))

    instagram = db.Column(db.String(100))

    slogan = db.Column(db.String(255))

    logo = db.Column(db.String(255))

    ativo = db.Column(db.Boolean, default=True)

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
    usuarios = db.relationship(
        "Usuario",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    clientes = db.relationship(
        "Cliente",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    categorias = db.relationship(
        "Categoria",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    produtos = db.relationship(
        "Produto",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    funcionarios = db.relationship(
        "Funcionario",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    receitas = db.relationship(
        "Receita",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    despesas = db.relationship(
        "Despesa",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    orcamentos = db.relationship(
        "Orcamento",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    vendas = db.relationship(
        "Venda",
        back_populates="empresa",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Empresa {self.nome}>"