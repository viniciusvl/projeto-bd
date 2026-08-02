from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Pessoa(Base):
    __tablename__ = "pessoa"

    id_pessoa: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    cpf: Mapped[str] = mapped_column(String(14), nullable=False, unique=True)
    data_nascimento: Mapped[date] = mapped_column(Date, nullable=False)
    is_flamengo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    telefone: Mapped[Optional[str]] = mapped_column(String(15))


class Paciente(Pessoa):
    __tablename__ = "paciente"

    id_pessoa: Mapped[int] = mapped_column(
        ForeignKey("pessoa.id_pessoa", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    num_convenio: Mapped[Optional[str]] = mapped_column(String(30))
    grupo_sanguineo: Mapped[Optional[str]] = mapped_column(String(4))
    estado: Mapped[Optional[str]] = mapped_column(String(2))
    cidade: Mapped[Optional[str]] = mapped_column(String(100))
    bairro: Mapped[Optional[str]] = mapped_column(String(100))
    logradouro: Mapped[Optional[str]] = mapped_column(String(150))
    numero: Mapped[Optional[str]] = mapped_column(String(10))

    alergias: Mapped[list["AlergiaPaciente"]] = relationship(
        back_populates="paciente",
        primaryjoin="Paciente.id_pessoa == foreign(AlergiaPaciente.id_pessoa)",
        cascade="all, delete-orphan",
    )
    atendimentos: Mapped[list["Atendimento"]] = relationship(
        back_populates="paciente", foreign_keys="Atendimento.id_paciente"
    )
    internacoes: Mapped[list["Internacao"]] = relationship(back_populates="paciente")


class AlergiaPaciente(Base):
    __tablename__ = "alergia_paciente"

    id_pessoa: Mapped[int] = mapped_column(
        ForeignKey("pessoa.id_pessoa", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    alergia: Mapped[str] = mapped_column(String(100), primary_key=True)

    paciente: Mapped["Paciente"] = relationship(
        back_populates="alergias",
        primaryjoin="foreign(AlergiaPaciente.id_pessoa) == Paciente.id_pessoa",
        overlaps="alergias",
    )


class Profissional(Pessoa):
    __tablename__ = "profissional"

    id_pessoa: Mapped[int] = mapped_column(
        ForeignKey("pessoa.id_pessoa", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    crm: Mapped[str] = mapped_column(String(13), nullable=False, unique=True)
    data_admissao: Mapped[date] = mapped_column(Date, nullable=False)

    especialidades: Mapped[list["Especialidade"]] = relationship(
        secondary="profissional_especialidade",
        back_populates="profissionais",
        viewonly=True,
    )


class Preceptor(Profissional):
    __tablename__ = "preceptor"

    id_profissional: Mapped[int] = mapped_column(
        ForeignKey("profissional.id_pessoa", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    titulacao: Mapped[str] = mapped_column(String(50), nullable=False)

    atendimentos: Mapped[list["Atendimento"]] = relationship(
        back_populates="preceptor", foreign_keys="Atendimento.id_preceptor"
    )
    escalas: Mapped[list["Escala"]] = relationship(
        back_populates="preceptor", foreign_keys="Escala.id_preceptor"
    )


class Residente(Profissional):
    __tablename__ = "residente"

    id_profissional: Mapped[int] = mapped_column(
        ForeignKey("profissional.id_pessoa", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    ano_residencia: Mapped[int] = mapped_column(Integer, nullable=False)

    atendimentos: Mapped[list["Atendimento"]] = relationship(
        back_populates="residente", foreign_keys="Atendimento.id_residente"
    )
    escalas: Mapped[list["Escala"]] = relationship(
        back_populates="residente", foreign_keys="Escala.id_residente"
    )


class Especialidade(Base):
    __tablename__ = "especialidade"

    id_especialidade: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    nome: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)

    profissionais: Mapped[list["Profissional"]] = relationship(
        secondary="profissional_especialidade",
        back_populates="especialidades",
        viewonly=True,
    )


class ProfissionalEspecialidade(Base):
    __tablename__ = "profissional_especialidade"

    id_profissional: Mapped[int] = mapped_column(
        ForeignKey("profissional.id_pessoa", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    id_especialidade: Mapped[int] = mapped_column(
        ForeignKey("especialidade.id_especialidade", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )


class Procedimento(Base):
    __tablename__ = "procedimento"

    id_procedimento: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    codigo: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    tempo_medio_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    media_tempo_procedimento: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2))
    risco: Mapped[str] = mapped_column(String(10), nullable=False)

    realizacoes: Mapped[list["ProcedimentoRealizado"]] = relationship(
        back_populates="procedimento"
    )


class Unidade(Base):
    __tablename__ = "unidade"

    id_unidade: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(80), nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    capacidade_leitos: Mapped[int] = mapped_column(Integer, nullable=False)

    atendimentos: Mapped[list["Atendimento"]] = relationship(
        back_populates="unidade", foreign_keys="Atendimento.id_unidade"
    )
    escalas: Mapped[list["Escala"]] = relationship(
        back_populates="unidade", foreign_keys="Escala.id_unidade"
    )
    internacoes: Mapped[list["Internacao"]] = relationship(back_populates="unidade")


class Atendimento(Base):
    __tablename__ = "atendimento"

    id_atendimento: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    data_hora: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duracao_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    id_paciente: Mapped[int] = mapped_column(
        ForeignKey("paciente.id_pessoa", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    id_residente: Mapped[int] = mapped_column(
        ForeignKey("residente.id_profissional", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    id_preceptor: Mapped[int] = mapped_column(
        ForeignKey("preceptor.id_profissional", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    id_unidade: Mapped[Optional[int]] = mapped_column(
        ForeignKey("unidade.id_unidade", ondelete="SET NULL", onupdate="CASCADE")
    )

    paciente: Mapped["Paciente"] = relationship(
        back_populates="atendimentos", foreign_keys=[id_paciente]
    )
    residente: Mapped["Residente"] = relationship(
        back_populates="atendimentos", foreign_keys=[id_residente]
    )
    preceptor: Mapped["Preceptor"] = relationship(
        back_populates="atendimentos", foreign_keys=[id_preceptor]
    )
    unidade: Mapped[Optional["Unidade"]] = relationship(
        back_populates="atendimentos", foreign_keys=[id_unidade]
    )
    procedimentos_realizados: Mapped[list["ProcedimentoRealizado"]] = relationship(
        back_populates="atendimento", cascade="all, delete-orphan"
    )


class ProcedimentoRealizado(Base):
    __tablename__ = "procedimento_realizado"

    id_atendimento: Mapped[int] = mapped_column(
        ForeignKey("atendimento.id_atendimento", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    id_procedimento: Mapped[int] = mapped_column(
        ForeignKey("procedimento.id_procedimento", ondelete="RESTRICT", onupdate="CASCADE"),
        primary_key=True,
    )
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    faturado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    tempo_real_minutos: Mapped[Optional[int]] = mapped_column(Integer)
    data_hora_inicio: Mapped[Optional[datetime]] = mapped_column(DateTime)
    observacao: Mapped[Optional[str]] = mapped_column(Text)

    atendimento: Mapped["Atendimento"] = relationship(
        back_populates="procedimentos_realizados"
    )
    procedimento: Mapped["Procedimento"] = relationship(back_populates="realizacoes")

class Escala(Base):
    __tablename__ = "escala"
    __table_args__ = (
        UniqueConstraint(
            "id_unidade",
            "dia_semana",
            "turno",
            "id_residente",
            name="uq_escala_unidade_turno_residente",
        ),
    )

    id_escala: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_unidade: Mapped[int] = mapped_column(
        ForeignKey("unidade.id_unidade", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    dia_semana: Mapped[str] = mapped_column(String(10), nullable=False)
    turno: Mapped[str] = mapped_column(String(10), nullable=False)
    id_residente: Mapped[int] = mapped_column(
        ForeignKey("residente.id_profissional", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    id_preceptor: Mapped[int] = mapped_column(
        ForeignKey("preceptor.id_profissional", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    versao: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    __mapper_args__ = {
        "version_id_col": versao
    }

    unidade: Mapped["Unidade"] = relationship(
        back_populates="escalas", foreign_keys=[id_unidade]
    )
    residente: Mapped["Residente"] = relationship(
        back_populates="escalas", foreign_keys=[id_residente]
    )
    preceptor: Mapped["Preceptor"] = relationship(
        back_populates="escalas", foreign_keys=[id_preceptor]
    )


class Internacao(Base):
    __tablename__ = "internacao"

    id_internacao: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    id_paciente: Mapped[int] = mapped_column(
        ForeignKey("paciente.id_pessoa", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    id_unidade: Mapped[int] = mapped_column(
        ForeignKey("unidade.id_unidade", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )
    data_entrada: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    data_saida: Mapped[Optional[datetime]] = mapped_column(DateTime)
    motivo: Mapped[Optional[str]] = mapped_column(String(255))

    paciente: Mapped["Paciente"] = relationship(back_populates="internacoes")
    unidade: Mapped["Unidade"] = relationship(back_populates="internacoes")


class AuditoriaAtendimento(Base):
    __tablename__ = "auditoria_atendimento"

    id_auditoria: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True
    )
    id_atendimento: Mapped[Optional[int]] = mapped_column(Integer)
    operacao: Mapped[str] = mapped_column(String(10), nullable=False)
    data_hora_antigo: Mapped[Optional[datetime]] = mapped_column(DateTime)
    duracao_minutos_antigo: Mapped[Optional[int]] = mapped_column(Integer)
    id_paciente_antigo: Mapped[Optional[int]] = mapped_column(Integer)
    id_residente_antigo: Mapped[Optional[int]] = mapped_column(Integer)
    id_preceptor_antigo: Mapped[Optional[int]] = mapped_column(Integer)
    id_unidade_antigo: Mapped[Optional[int]] = mapped_column(Integer)
    data_hora_novo: Mapped[Optional[datetime]] = mapped_column(DateTime)
    duracao_minutos_novo: Mapped[Optional[int]] = mapped_column(Integer)
    id_paciente_novo: Mapped[Optional[int]] = mapped_column(Integer)
    id_residente_novo: Mapped[Optional[int]] = mapped_column(Integer)
    id_preceptor_novo: Mapped[Optional[int]] = mapped_column(Integer)
    id_unidade_novo: Mapped[Optional[int]] = mapped_column(Integer)
    usuario_db: Mapped[Optional[str]] = mapped_column(String(128))
    registrado_em: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
