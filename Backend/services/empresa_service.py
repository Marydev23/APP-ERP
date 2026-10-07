import datetime

from exceptions.api_exception import BadRequest, NotFound
from models.empresa import Empresa
from extensions import db
from models.usuario import Usuario


class EmpresaService:

    @staticmethod
    def registrar(dados, usuario_id):
        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            raise NotFound("Usuário não encontrado.")

        if usuario.empresa_id is not None:
            raise BadRequest("Usuário já possui uma empresa.")

        if not dados.get("nome"):
            
            raise BadRequest("Nome da empresa é obrigatório.")
  
        if not dados.get("cnpj"):
            raise BadRequest("CNPJ é obrigatório.")

        if not dados.get("email"):
            raise BadRequest("E-mail é obrigatório.")

        empresa = Empresa.query.filter_by(
            cnpj=dados["cnpj"]
        ).first()

        if empresa:
            raise BadRequest("CNPJ já cadastrado.")

        empresa = Empresa.query.filter_by(
            email=dados["email"]
        ).first()

        if empresa:
            raise BadRequest("E-mail já cadastrado.")

        empresa = Empresa(
            nome=dados["nome"],
            cnpj=dados["cnpj"],
            email=dados["email"],
            telefone=dados.get("telefone"),
            cidade=dados.get("cidade"),
            estado=dados.get("estado"),
            endereco=dados.get("endereco"),
            cep=dados.get("cep"),
            site=dados.get("site"),
            instagram=dados.get("instagram"),
            slogan=dados.get("slogan"),
            logo=dados.get("logo")
        )
        try:
            db.session.add(empresa)

            db.session.flush()

            usuario.empresa_id = empresa.id

            db.session.commit()

            return empresa
        except Exception:
            db.session.rollback()
            raise

       
       
    

    @staticmethod
    def listar(empresa_id):

        empresa = Empresa.query.get(empresa_id)

        if not empresa:
            raise NotFound("Empresa não encontrada.")

        return empresa

    @staticmethod
    def listar_todas():
        return Empresa.query.all()
    
    @staticmethod
    def atualizar(empresa_id, dados):

        empresa = Empresa.query.get(empresa_id)

        if not empresa:
            raise NotFound("Empresa não encontrada.")

        empresa.nome = dados.get("nome", empresa.nome)
        empresa.cnpj = dados.get("cnpj", empresa.cnpj)
        empresa.email = dados.get("email", empresa.email)
        empresa.telefone = dados.get("telefone", empresa.telefone)
        empresa.cidade = dados.get("cidade", empresa.cidade)
        empresa.estado = dados.get("estado", empresa.estado)
        empresa.endereco = dados.get("endereco", empresa.endereco)
        empresa.cep = dados.get("cep", empresa.cep)
        empresa.site = dados.get("site", empresa.site)
        empresa.instagram = dados.get("instagram", empresa.instagram)
        empresa.slogan = dados.get("slogan", empresa.slogan)
        empresa.logo = dados.get("logo", empresa.logo)

        db.session.commit()

        return empresa
        
    @staticmethod
    def deletar(empresa_id):

        empresa = Empresa.query.get(empresa_id)

        if not empresa:
            raise NotFound("Empresa não encontrada.")

        empresa.deletado_em = datetime.utcnow()

        db.session.commit()