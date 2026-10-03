import sys
import json
import argparse
from validator import ValidationEngine

def main():
    parser = argparse.ArgumentParser(description="SkillSprint AI - Python Validation CLI")
    parser.add_argument('--input', type=str, required=True, help='JSON string from GenAI Output')
    
    args = parser.parse_args()
    
    try:
        genai_json = json.loads(args.input)
    except json.JSONDecodeError:
        print(json.dumps({"validation_status": "Error", "message": "Invalid JSON input"}))
        sys.exit(1)

    engine = ValidationEngine()
    result = engine.validate_plan(genai_json)
    
    # In kết quả ra stdout để C# (hoặc Node) đọc
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
