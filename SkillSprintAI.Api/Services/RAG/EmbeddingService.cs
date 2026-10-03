using System.Text;
using System.Text.Json;

namespace SkillSprintAI.Api.Services.RAG;

public interface IEmbeddingService
{
    Task<string> GetEmbeddingVectorJsonAsync(string text);
}

public class GeminiEmbeddingService : IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeminiEmbeddingService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? "DEMO_KEY_ONLY";
    }

    public async Task<string> GetEmbeddingVectorJsonAsync(string text)
    {
        var requestBody = new
        {
            model = "models/embedding-001",
            content = new
            {
                parts = new[] { new { text = text } }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        // Simulated API call for Phase 1. In real world, un-comment below and return real vector arrays.
        /*
        var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={_apiKey}", content);
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            return json; // Extract just the vector array
        }
        */
        
        // Mock returning a dummy vector JSON string for testing
        return "[0.1, -0.2, 0.5, 0.88]"; 
    }
}
