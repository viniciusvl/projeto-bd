"""Exceções de domínio levantadas pela camada db/repository."""

class RepositoryError(Exception):
    """Classe base para todas as exceções desta camada."""


class EntidadeNaoEncontradaError(RepositoryError):
    """O registro solicitado não existe (ex.: paciente, escala, procedimento_realizado)."""


class EntidadeRelacionadaInexistenteError(RepositoryError):
    """Uma FK referenciada (paciente/residente/preceptor) não existe."""


class ProcedimentoJaFaturadoError(RepositoryError):
    """Tentativa de remover um procedimento_realizado que já foi faturado."""


class ConflitoDeEscalaError(RepositoryError):
    """O residente já possui uma escala cadastrada no horário de destino."""