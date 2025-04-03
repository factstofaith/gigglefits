"""
Alembic environment configuration for TAP Integration Platform
Generated with docker-alembic-standardizer
"""

import os
import sys
from pathlib import Path
from logging.config import fileConfig

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

# Import TAP models and configuration
from db.base import Base
from db.models import *  # noqa
from core.config_factory import ConfigFactory, EnvironmentType

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Get database URL from environment
environment = os.getenv('APP_ENVIRONMENT', 'development')
try:
    env_type = EnvironmentType[environment.upper()]
    app_config = ConfigFactory.create_config(env_type)
    database_url = app_config.DATABASE_URL
    if database_url:
        config.set_main_option('sqlalchemy.url', database_url)
except (KeyError, ImportError) as e:
    # Fallback to config file if ConfigFactory is not available
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        config.set_main_option('sqlalchemy.url', database_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    from sqlalchemy import create_engine

    url = config.get_main_option("sqlalchemy.url")
    
    # Connect with connect_args for SQLite (needed for SQLite support)
    connect_args = {}
    if url and url.startswith('sqlite'):
        connect_args['check_same_thread'] = False
    
    engine = create_engine(url, connect_args=connect_args)

    with engine.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()