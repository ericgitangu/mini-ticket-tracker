from pathlib import Path

import pytest
import pytest_asyncio
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from testcontainers.community.postgres import PostgresContainer

from alembic import command
from app.db import get_session
from app.main import app

API_DIR = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session")
def postgres():
    with PostgresContainer("postgres:17-alpine", driver="asyncpg") as container:
        sync_url = container.get_connection_url().replace("+asyncpg", "+psycopg")
        cfg = Config(str(API_DIR / "alembic.ini"))
        cfg.set_main_option("script_location", str(API_DIR / "alembic"))
        cfg.set_main_option("sqlalchemy.url", sync_url)
        command.upgrade(cfg, "head")
        yield container


@pytest_asyncio.fixture
async def client(postgres):
    engine = create_async_engine(postgres.get_connection_url())
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE tickets"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client

    app.dependency_overrides.clear()
    await engine.dispose()
