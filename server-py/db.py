from contextlib import contextmanager
from pathlib import Path

import psycopg2
import psycopg2.extras
import yaml


def _load_config() -> dict:
    compose_path = Path(__file__).parent.parent / "docker-compose.yaml"
    with open(compose_path) as f:
        data = yaml.safe_load(f)

    pg = data["services"]["postgres"]
    env = pg["environment"]
    host_port = int(pg["ports"][0].split(":")[0])

    return {
        "host": "localhost",
        "port": host_port,
        "dbname": env["POSTGRES_DB"],
        "user": env["POSTGRES_USER"],
        "password": env["POSTGRES_PASSWORD"],
    }


@contextmanager
def get_db():
    conn = psycopg2.connect(**_load_config(), cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
