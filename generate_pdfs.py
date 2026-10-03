import os
import random

# Install fpdf if needed: pip install fpdf
try:
    from fpdf import FPDF
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf"])
    from fpdf import FPDF

# Tùy chỉnh thư mục đầu ra
output_dir = r"d:\rajpham-dev-anti\SkillSprintAI.Api\SeedData\Pdfs"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

departments = ["CustomerSupport", "Finance", "IT", "HR", "General"]
doc_types = ["SOP", "Policy", "Guideline", "Handbook"]

lorem_ipsum = """
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
"""

def generate_text_pages(pdf, num_pages, title):
    for i in range(num_pages):
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt=f"{title} - Page {i+1}", ln=True, align='C')
        pdf.ln(10)
        
        pdf.set_font("Arial", size=12)
        # Lặp lại nội dung lorem ipsum nhiều lần để phủ kín trang
        for _ in range(15):
            pdf.multi_cell(0, 10, txt=lorem_ipsum)
            pdf.ln(5)

print("Đang tạo 30 file PDF...")
for i in range(1, 31):
    dept = random.choice(departments)
    dtype = random.choice(doc_types)
    num_pages = random.randint(5, 10) # Mỗi file từ 5 đến 10 trang
    filename = f"{dept}_{dtype}_{i:02d}.pdf"
    
    pdf = FPDF()
    # Add title page
    pdf.add_page()
    pdf.set_font("Arial", 'B', 24)
    pdf.cell(200, 40, txt=f"Official {dtype}", ln=True, align='C')
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 20, txt=f"Department: {dept}", ln=True, align='C')
    pdf.cell(200, 20, txt=f"Document ID: {filename}", ln=True, align='C')
    
    # Add content pages
    generate_text_pages(pdf, num_pages, f"{dtype} of {dept}")
    
    filepath = os.path.join(output_dir, filename)
    pdf.output(filepath)
    print(f"Created: {filename} ({num_pages} pages)")

print("✅ Đã tạo thành công 30 file PDF!")
