import os
import sys
import pytest

# Add the project root to Python path for imports to work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.config_factory import ConfigFactory, EnvironmentType
from core.settings import BaseSettings, DevelopmentSettings, TestSettings, ProductionSettings

@pytest.fixture
def clean_config_factory():
    """Reset ConfigFactory before and after tests."""
    ConfigFactory.reset()
    yield
    ConfigFactory.reset()

def test_get_config_development(clean_config_factory, monkeypatch):
    """Test ConfigFactory returns development config when environment is development."""
    monkeypatch.setenv("APP_ENVIRONMENT", "development")
    config = ConfigFactory.get_config()
    assert isinstance(config, DevelopmentSettings)
    assert config.DEBUG is True
    assert config.APP_ENVIRONMENT == "development"

def test_get_config_test(clean_config_factory, monkeypatch):
    """Test ConfigFactory returns test config when environment is test."""
    monkeypatch.setenv("APP_ENVIRONMENT", "test")
    config = ConfigFactory.get_config()
    assert isinstance(config, TestSettings)
    assert config.TESTING is True
    assert config.APP_ENVIRONMENT == "test"

def test_get_config_production(clean_config_factory, monkeypatch):
    """Test ConfigFactory returns production config when environment is production."""
    monkeypatch.setenv("APP_ENVIRONMENT", "production")
    config = ConfigFactory.get_config()
    assert isinstance(config, ProductionSettings)
    assert config.DEBUG is False
    assert config.APP_ENVIRONMENT == "production"

def test_get_config_default(clean_config_factory, monkeypatch):
    """Test ConfigFactory returns development config when environment is not set."""
    monkeypatch.delenv("APP_ENVIRONMENT", raising=False)
    config = ConfigFactory.get_config()
    assert isinstance(config, DevelopmentSettings)

def test_get_config_invalid(clean_config_factory, monkeypatch):
    """Test ConfigFactory returns development config when environment is invalid."""
    monkeypatch.setenv("APP_ENVIRONMENT", "invalid")
    config = ConfigFactory.get_config()
    assert isinstance(config, DevelopmentSettings)

def test_create_config(clean_config_factory):
    """Test create_config method creates appropriate config instance."""
    dev_config = ConfigFactory.create_config(EnvironmentType.DEVELOPMENT)
    test_config = ConfigFactory.create_config(EnvironmentType.TEST)
    prod_config = ConfigFactory.create_config(EnvironmentType.PRODUCTION)
    
    assert isinstance(dev_config, DevelopmentSettings)
    assert isinstance(test_config, TestSettings)
    assert isinstance(prod_config, ProductionSettings)

def test_singleton_instance(clean_config_factory, monkeypatch):
    """Test ConfigFactory returns the same instance on multiple calls."""
    monkeypatch.setenv("APP_ENVIRONMENT", "development")
    config1 = ConfigFactory.get_config()
    config2 = ConfigFactory.get_config()
    assert config1 is config2  # Same instance, not just equal