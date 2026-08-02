import os
import sys
from pathlib import Path

import pymysql
from pymysql.constants import CLIENT

SCRIPTS_DIR = Path(__file__).resolve().parent / "scripts"


def _conexao():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3307")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        charset="utf8mb4",
        client_flag=CLIENT.MULTI_STATEMENTS,
    )


def _executar_arquivo(cursor, caminho):
    sql = Path(caminho).read_text(encoding="utf-8")
    cursor.execute(sql)
    while cursor.nextset():
        pass


def main():
    apenas_dados = "--only-data" in sys.argv
    conexao = _conexao()
    try:
        with conexao.cursor() as cursor:
            if not apenas_dados:
                print("Aplicando schema (hospital.sql)...")
                _executar_arquivo(cursor, SCRIPTS_DIR / "hospital.sql")
                print("Carregando triggers...")
                _executar_arquivo(cursor, SCRIPTS_DIR / "triggers.sql")
            print("Inserindo dados iniciais (data.sql)...")
            _executar_arquivo(cursor, SCRIPTS_DIR / "data.sql")
        conexao.commit()
        print("Concluido.")
    except Exception:
        conexao.rollback()
        raise
    finally:
        conexao.close()


if __name__ == "__main__":
    main()
