using System.Diagnostics;
using System.Text.Json;

namespace SkillSprintAI.Api.Services.ValidationClient;

public interface IPythonValidationClient
{
    Task<string> ValidateAsync(object genAiOutput, object roleMatrix);
}

public class PythonValidationClient : IPythonValidationClient
{
    private readonly string _pythonScriptPath = @"d:\rajpham-dev-anti\python_validation\validator_cli.py";
    private readonly string _tempFolder = Path.Combine(Path.GetTempPath(), "SkillSprintAI");

    public PythonValidationClient()
    {
        if (!Directory.Exists(_tempFolder))
        {
            Directory.CreateDirectory(_tempFolder);
        }
    }

    public async Task<string> ValidateAsync(object genAiOutput, object roleMatrix)
    {
        string genAiPath = Path.Combine(_tempFolder, $"genai_{Guid.NewGuid()}.json");
        string matrixPath = Path.Combine(_tempFolder, $"matrix_{Guid.NewGuid()}.json");

        try
        {
            await File.WriteAllTextAsync(genAiPath, JsonSerializer.Serialize(genAiOutput));
            await File.WriteAllTextAsync(matrixPath, JsonSerializer.Serialize(roleMatrix));

            var processStartInfo = new ProcessStartInfo
            {
                FileName = "python",
                Arguments = $"\"{_pythonScriptPath}\" \"{genAiPath}\" \"{matrixPath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(processStartInfo);
            if (process == null) throw new Exception("Không thể khởi chạy tiến trình Python.");

            string output = await process.StandardOutput.ReadToEndAsync();
            string error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (!string.IsNullOrWhiteSpace(error) && string.IsNullOrWhiteSpace(output))
            {
                throw new Exception($"Lỗi Python: {error}");
            }

            return output; // JSON Report trả về từ Python
        }
        finally
        {
            if (File.Exists(genAiPath)) File.Delete(genAiPath);
            if (File.Exists(matrixPath)) File.Delete(matrixPath);
        }
    }
}
