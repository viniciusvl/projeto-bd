import os
from contextlib import contextmanager
from typing import Iterator

import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "hospital")


def get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
    )


def executar_query(sql, dados=(), fetch=False):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, dados)
        if fetch:
            resultado = cursor.fetchall()
        else:
            resultado = (cursor.rowcount, cursor.lastrowid)
        conn.commit()
        return resultado
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4",
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_size=5,
    max_overflow=10,
    future=True,
    echo=os.getenv("SQL_ECHO", "").lower() in {"1", "true", "yes"},
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    class_=Session,
)


@contextmanager
def get_session() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()