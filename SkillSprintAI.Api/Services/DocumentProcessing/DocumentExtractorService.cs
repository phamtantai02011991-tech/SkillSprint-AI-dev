using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using SkillSprintAI.Api.Models;

namespace SkillSprintAI.Api.Services.DocumentProcessing;

public class DocumentExtractorService : IDocumentExtractorService
{
    public async Task<List<DocumentChunk>> ExtractTextAsync(IFormFile file, string documentId, string version)
    {
        var chunks = new List<DocumentChunk>();
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        if (ext == ".pdf")
        {
            chunks = ExtractFromPdf(memoryStream, documentId, version);
        }
        else if (ext == ".docx")
        {
            chunks = ExtractFromDocx(memoryStream, documentId, version);
        }
        else
        {
            throw new NotSupportedException($"Tệp {ext} không được hỗ trợ. Vui lòng dùng PDF hoặc DOCX.");
        }

        return chunks;
    }

    private List<DocumentChunk> ExtractFromPdf(MemoryStream stream, string documentId, string version)
    {
        var chunks = new List<DocumentChunk>();
        using var pdfReader = new PdfReader(stream);
        using var pdfDoc = new PdfDocument(pdfReader);
        
        int numPages = pdfDoc.GetNumberOfPages();
        for (int i = 1; i <= numPages; i++)
        {
            var page = pdfDoc.GetPage(i);
            var strategy = new SimpleTextExtractionStrategy();
            string text = PdfTextExtractor.GetTextFromPage(page, strategy);
            
            // Simple chunking by page for this MVP
            if (!string.IsNullOrWhiteSpace(text))
            {
                chunks.Add(new DocumentChunk
                {
                    ChunkId = $"{documentId}_P{i}",
                    SectionId = $"Page_{i}",
                    Content = text.Trim(),
                    PageOrLocation = i.ToString()
                });
            }
        }
        return chunks;
    }

    private List<DocumentChunk> ExtractFromDocx(MemoryStream stream, string documentId, string version)
    {
        var chunks = new List<DocumentChunk>();
        using var wordDoc = WordprocessingDocument.Open(stream, false);
        var body = wordDoc.MainDocumentPart?.Document.Body;
        
        if (body != null)
        {
            var paragraphs = body.Elements<Paragraph>();
            var currentChunk = new StringBuilder();
            string currentSectionId = "General";
            int chunkCounter = 1;
            
            // Regex match formats like "1.", "1.1", "Section 1", "Điều 1"
            var sectionRegex = new System.Text.RegularExpressions.Regex(@"^((Section|Điều|Mục)\s*\d+(\.\d+)*|\d+(\.\d+)+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            
            foreach (var para in paragraphs)
            {
                var text = para.InnerText;
                if (string.IsNullOrWhiteSpace(text)) continue;
                
                var match = sectionRegex.Match(text);
                if (match.Success)
                {
                    // If we already have content, save it before starting new section
                    if (currentChunk.Length > 0)
                    {
                        chunks.Add(new DocumentChunk
                        {
                            ChunkId = $"{documentId}_C{chunkCounter++}",
                            SectionId = currentSectionId,
                            Content = currentChunk.ToString().Trim(),
                            PageOrLocation = currentSectionId
                        });
                        currentChunk.Clear();
                    }
                    
                    // Extract new section ID (e.g., "4.2")
                    currentSectionId = match.Value.Trim();
                }
                
                currentChunk.AppendLine(text);
                
                // Fallback max size just in case a section is insanely long
                if (currentChunk.Length > 1500) 
                {
                    chunks.Add(new DocumentChunk
                    {
                        ChunkId = $"{documentId}_C{chunkCounter++}",
                        SectionId = currentSectionId,
                        Content = currentChunk.ToString().Trim(),
                        PageOrLocation = $"{currentSectionId} (Part {chunkCounter})"
                    });
                    currentChunk.Clear();
                }
            }
            
            if (currentChunk.Length > 0)
            {
                 chunks.Add(new DocumentChunk
                {
                    ChunkId = $"{documentId}_C{chunkCounter}",
                    SectionId = currentSectionId,
                    Content = currentChunk.ToString().Trim(),
                    PageOrLocation = currentSectionId
                });
            }
        }
        return chunks;
    }
}
