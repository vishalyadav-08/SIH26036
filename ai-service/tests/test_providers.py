import pytest
from unittest.mock import MagicMock, patch
from app.providers.base import LLMResult, ProviderConfigurationError
from app.providers.gemini_provider import GeminiProvider
from app.providers.openai_provider import OpenAIProvider

@patch("app.providers.gemini_provider.settings")
def test_gemini_configuration_error(mock_settings):
    mock_settings.GEMINI_API_KEY = ""
    mock_settings.AI_MODEL = "gemini-1.5"
    with pytest.raises(ProviderConfigurationError):
        GeminiProvider()

@patch("app.providers.openai_provider.settings")
def test_openai_configuration_error(mock_settings):
    mock_settings.OPENAI_API_KEY = ""
    mock_settings.AI_MODEL = "gpt-4o"
    with pytest.raises(ProviderConfigurationError):
        OpenAIProvider()

@patch("app.providers.gemini_provider.genai")
@patch("app.providers.gemini_provider.settings")
def test_gemini_provider_success(mock_settings, mock_genai):
    mock_settings.GEMINI_API_KEY = "test_key"
    mock_settings.AI_MODEL = "gemini-1.5"
    mock_settings.AI_TIMEOUT_SECONDS = 30
    
    # Mock the client response
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is Gemini."
    mock_response.usage_metadata.prompt_token_count = 10
    mock_response.usage_metadata.candidates_token_count = 20
    mock_response.usage_metadata.total_token_count = 30
    
    mock_client.models.generate_content.return_value = mock_response
    mock_genai.Client.return_value = mock_client
    
    provider = GeminiProvider()
    result = provider.generate_response("system", "hello")
    
    assert isinstance(result, LLMResult)
    assert result.text == "This is Gemini."
    assert result.provider == "gemini"
    assert result.usage.total_tokens == 30

@patch("app.providers.openai_provider.openai")
@patch("app.providers.openai_provider.settings")
def test_openai_provider_success(mock_settings, mock_openai):
    mock_settings.OPENAI_API_KEY = "test_key"
    mock_settings.AI_MODEL = "gpt-4o"
    mock_settings.AI_TIMEOUT_SECONDS = 30
    
    mock_client = MagicMock()
    mock_response = MagicMock()
    
    mock_choice = MagicMock()
    mock_choice.message.content = "This is OpenAI."
    mock_response.choices = [mock_choice]
    
    mock_response.usage.prompt_tokens = 10
    mock_response.usage.completion_tokens = 20
    mock_response.usage.total_tokens = 30
    
    mock_client.chat.completions.create.return_value = mock_response
    mock_openai.OpenAI.return_value = mock_client
    
    provider = OpenAIProvider()
    result = provider.generate_response("system", "hello")
    
    assert isinstance(result, LLMResult)
    assert result.text == "This is OpenAI."
    assert result.provider == "openai"
    assert result.usage.total_tokens == 30
