import json
import os

class ValidationEngine:
    def __init__(self, matrix_path: str = None):
        if not matrix_path:
            # Default to the data/role_matrix.json in the same directory
            base_dir = os.path.dirname(os.path.abspath(__file__))
            matrix_path = os.path.join(base_dir, 'data', 'role_matrix.json')
        
        with open(matrix_path, 'r', encoding='utf-8') as f:
            self.role_matrix = json.load(f)
            
        # Giả lập danh sách tài liệu hợp lệ trong hệ thống (Traceability Mock)
        self.valid_documents = ["POL-HR-01", "POL-IT-03", "SOP-GEN-01", "POL-HR-02", "POL-IT-05"]

    def validate_plan(self, genai_output: dict) -> dict:
        """
        Validate the Generative AI JSON output against the Role Requirement Matrix.
        """
        role = genai_output.get("role", "")
        generated_modules = genai_output.get("modules", [])
        
        if role not in self.role_matrix:
            return {"status": "Error", "message": f"Role '{role}' không tồn tại trong Matrix."}
            
        expected_reqs = self.role_matrix[role]
        mandatory_reqs = [r for r in expected_reqs if r["Mandatory"]]
        
        covered_count = 0
        traceable_count = 0
        missing_reqs = []
        unsupported_items = []
        
        # Flatten generated items to extract Source Document IDs
        gen_sources = set()
        for mod in generated_modules:
            source_id = mod.get("source_document_id")
            if source_id:
                gen_sources.add(source_id)
                # Kiểm tra Traceability
                if source_id in self.valid_documents:
                    traceable_count += 1
                else:
                    unsupported_items.append(mod.get("module_title", "Unknown Module"))

        # Kiểm tra Coverage
        for req in mandatory_reqs:
            if req["Policy"] in gen_sources:
                covered_count += 1
            else:
                missing_reqs.append(req["RequirementID"])
                
        total_mandatory = len(mandatory_reqs)
        coverage_score = (covered_count / total_mandatory * 100) if total_mandatory > 0 else 100
        
        total_generated = len(generated_modules)
        traceability_score = (traceable_count / total_generated * 100) if total_generated > 0 else 0
        
        # Xác định Status cuối cùng
        final_status = "Verified"
        if coverage_score < 100 or traceability_score < 100:
            final_status = "Verified with Warning"
        if missing_reqs:
            final_status = "Incomplete"
        if unsupported_items:
            final_status = "Manual Review Required"
            
        return {
            "validation_status": final_status,
            "coverage_score": coverage_score,
            "traceability_score": traceability_score,
            "missing_requirements": missing_reqs,
            "unsupported_items": unsupported_items,
            "role_validated": role
        }
