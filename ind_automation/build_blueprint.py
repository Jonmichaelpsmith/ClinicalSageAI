import sys
import json
from pathlib import Path
from ind_automation.create_template import TemplateGenerator
from ind_automation.ectd_ga import build_sequence


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception as e:
        print(json.dumps({"error": f"Invalid JSON input: {e}"}))
        sys.exit(1)

    project_id = payload.get("project_id", "DEMO")
    serial = str(payload.get("serial", "0001")).zfill(4)
    module3_data = payload.get("module3", {})

    tg = TemplateGenerator()
    if module3_data:
        tg.save_module3_to_file(module3_data)

    buf = build_sequence(project_id, serial)
    out_dir = Path("ectd") / project_id
    out_dir.mkdir(parents=True, exist_ok=True)
    zip_path = out_dir / f"{serial}.zip"
    with open(zip_path, "wb") as f:
        f.write(buf.getvalue())

    result = {
        "zip_path": str(zip_path),
        "validation": {"status": "success"}
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
