from typing import Iterator

from sqlalchemy.orm import Session

from db.connect import get_session


def get_db() -> Iterator[Session]:
    with get_session() as session:
        yield session
