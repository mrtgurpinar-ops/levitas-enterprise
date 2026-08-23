import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Get DATABASE_URL or default to local SQLite database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./levitas_enterprise.db")

# Protect against legacy postgres:// protocol string from Railway/Heroku
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True
        )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"[!] Warning: Primary database connection failed ({e}), falling back to SQLite.")
    DATABASE_URL = "sqlite:///./levitas_enterprise.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
