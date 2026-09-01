import pytest
from unittest.mock import patch
from app.providers.factory import get_provider
from app.providers.base import UnsupportedProviderError

@patch("app.providers.factory.settings")
def test_factory_unsupported_provider(mock_settings):
    mock_settings.AI_PROVIDER = "unknown"
    with pytest.raises(UnsupportedProviderError):
        get_provider()

@patch("app.providers.factory.settings")
def test_factory_empty_provider(mock_settings):
    mock_settings.AI_PROVIDER = ""
    with pytest.raises(UnsupportedProviderError):
        get_provider()
