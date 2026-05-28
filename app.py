from __future__ import annotations

import os
import re
import shutil
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request, send_file

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class CompileResult:
    ok: bool
    pdf_path: Path | None
    log: str


DEFAULT_DATA: dict[str, Any] = {
    "name": "Your Name",
    "course": "Bachelor of Technology",
    "branch": "Mathematics and Computing",
    "phone": "+91-0000000000",
    "email": "you@example.com",
    "linkedin": "https://linkedin.com/in/your-profile",
    "github": "https://github.com/your-handle",
    "academic_details": [
        {
            "year": "2021-25",
            "degree": "B.Tech Mathematics and Computing",
            "institute": "Your Institute",
            "marks": "8.00/10.0",
        },
        {
            "year": "2021",
            "degree": "Class XII",
            "institute": "Your School",
            "marks": "95%",
        },
    ],
    "experience": [
        {
            "title": "Company | Team",
            "role": "Software Engineer",
            "duration": "(Jun 2025 - Present)",
            "points": [
                "Built and shipped production features.",
                "Improved reliability and performance across services.",
            ],
        }
    ],
    "internships": [
        {
            "title": "Organization | Team",
            "role": "Intern",
            "duration": "(May 2024 - Jul 2024)",
            "points": [
                "Worked on core project deliverables and tooling.",
                "Collaborated with mentors and cross-functional stakeholders.",
            ],
        }
    ],
    "projects": [
        {
            "title": "Project Name",
            "subtitle": "Short descriptor",
            "duration": "(Jan 2025 - Mar 2025)",
            "url": "https://github.com/",
            "points": [
                "Implemented the main idea and shipped a polished prototype.",
                "Measured improvements with clear metrics.",
            ],
        }
    ],
    "skills": {
        "languages": "Python, C/C++, Java",
        "libraries": "NumPy, Pandas, PyTorch",
        "tools": "Git, Linux, Docker, LaTeX",
    },
    "show_contact": {
        "phone": True,
        "email": True,
        "linkedin": True,
        "github": True,
    },
    "show_sections": {
        "academic": True,
        "experience": True,
        "internships": True,
        "projects": True,
        "skills": True,
    },
}


def resolve_pdflatex_command() -> list[str]:
    configured_path = os.getenv("PDFLATEX_PATH", "").strip()
    if configured_path:
        return [configured_path]

    resolved = shutil.which("pdflatex")
    if resolved:
        return [resolved]

    return ["pdflatex"]


def latex_escape(value: str) -> str:
    if value is None:
        return ""

    substitutions = {
        "\\": r"\\textbackslash{}",
        "&": r"\\&",
        "%": r"\\%",
        "$": r"\\$",
        "#": r"\\#",
        "_": r"\\_",
        "{": r"\\{",
        "}": r"\\}",
        "~": r"\\textasciitilde{}",
        "^": r"\\textasciicircum{}",
    }
    pattern = re.compile("|".join(re.escape(key) for key in substitutions))
    return pattern.sub(lambda m: substitutions[m.group()], str(value))


def latex_url(value: str) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    text = text.replace("\\", "/")
    text = text.replace("{", "").replace("}", "")
    return text


def sanitize_payload(payload: dict[str, Any]) -> dict[str, Any]:
    data = {
        "name": payload.get("name") or DEFAULT_DATA["name"],
        "course": payload.get("course") or DEFAULT_DATA["course"],
        "branch": payload.get("branch") or DEFAULT_DATA["branch"],
        "phone": payload.get("phone") or DEFAULT_DATA["phone"],
        "email": payload.get("email") or DEFAULT_DATA["email"],
        "linkedin": payload.get("linkedin") or DEFAULT_DATA["linkedin"],
        "github": payload.get("github") or DEFAULT_DATA["github"],
        "academic_details": payload.get("academic_details") or [],
        "experience": payload.get("experience") or [],
        "internships": payload.get("internships") or [],
        "projects": payload.get("projects") or [],
        "skills": payload.get("skills") or {},
        "show_contact": payload.get("show_contact") or {},
        "show_sections": payload.get("show_sections") or {},
    }

    skills = data["skills"]
    data["skills"] = {
        "languages": skills.get("languages", ""),
        "libraries": skills.get("libraries", ""),
        "tools": skills.get("tools", ""),
    }

    merged_sections = dict(DEFAULT_DATA["show_sections"])
    merged_sections.update({k: bool(v) for k, v in data["show_sections"].items()})
    data["show_sections"] = merged_sections

    merged_contact = dict(DEFAULT_DATA["show_contact"])
    merged_contact.update({k: bool(v) for k, v in data["show_contact"].items()})
    data["show_contact"] = merged_contact

    for key in ["academic_details", "experience", "internships", "projects"]:
        if not isinstance(data[key], list):
            data[key] = []

    data["academic_details"] = [
        {
            "year": str(row.get("year", "")),
            "degree": str(row.get("degree", "")),
            "institute": str(row.get("institute", "")),
            "marks": str(row.get("marks", "")),
        }
        for row in data["academic_details"]
        if isinstance(row, dict)
    ]

    for key in ["experience", "internships"]:
        clean_rows = []
        for row in data[key]:
            if not isinstance(row, dict):
                continue
            points = row.get("points")
            if not isinstance(points, list):
                points = []
            clean_rows.append(
                {
                    "title": str(row.get("title", "")),
                    "role": str(row.get("role", "")),
                    "duration": str(row.get("duration", "")),
                    "points": [str(point) for point in points if str(point).strip()],
                }
            )
        data[key] = clean_rows

    clean_projects = []
    for row in data["projects"]:
        if not isinstance(row, dict):
            continue
        points = row.get("points")
        if not isinstance(points, list):
            points = []
        clean_projects.append(
            {
                "title": str(row.get("title", "")),
                "subtitle": str(row.get("subtitle", "")),
                "duration": str(row.get("duration", "")),
                "url": str(row.get("url", "")),
                "points": [str(point) for point in points if str(point).strip()],
            }
        )
    data["projects"] = clean_projects

    return data


def compile_pdf(tex_source: str, output_name: str) -> CompileResult:
    with tempfile.TemporaryDirectory(prefix="resume-builder-") as temp_dir:
        temp_path = Path(temp_dir)
        tex_file = temp_path / "cv.tex"
        tex_file.write_text(tex_source, encoding="utf-8")

        cmd = resolve_pdflatex_command() + [
            "-interaction=nonstopmode",
            "-halt-on-error",
            tex_file.name,
        ]

        logs: list[str] = []
        for _ in range(2):
            process = subprocess.run(
                cmd,
                cwd=temp_path,
                capture_output=True,
                text=True,
                check=False,
            )
            logs.append(process.stdout)
            logs.append(process.stderr)
            if process.returncode != 0:
                return CompileResult(ok=False, pdf_path=None, log="\n".join(logs))

        pdf_file = temp_path / "cv.pdf"
        if not pdf_file.exists():
            return CompileResult(ok=False, pdf_path=None, log="\n".join(logs) + "\nPDF not created")

        final_pdf = OUTPUT_DIR / f"{output_name}.pdf"
        shutil.copy2(pdf_file, final_pdf)
        return CompileResult(ok=True, pdf_path=final_pdf, log="\n".join(logs))


def create_app() -> Flask:
    app = Flask(__name__, template_folder=str(BASE_DIR / "templates"), static_folder=str(BASE_DIR / "static"))
    app.jinja_env.filters["latex_escape"] = latex_escape
    app.jinja_env.filters["latex_url"] = latex_url

    @app.get("/")
    def index() -> str:
        return render_template("index.html", default_data=DEFAULT_DATA)

    @app.post("/render")
    def render_resume():
        payload = request.get_json(silent=True) or {}
        data = sanitize_payload(payload)
        tex_source = render_template("cv.tex.jinja", data=data)

        try:
            doc_id = uuid.uuid4().hex
            result = compile_pdf(tex_source=tex_source, output_name=doc_id)
        except FileNotFoundError:
            configured_path = os.getenv("PDFLATEX_PATH", "").strip()
            return (
                jsonify(
                    {
                        "ok": False,
                        "error": (
                            "pdflatex not found. Install MiKTeX or TeX Live, restart VS Code/terminal, "
                            "and ensure pdflatex is on PATH."
                            + (f" Or set PDFLATEX_PATH={configured_path}." if configured_path else "")
                        ),
                    }
                ),
                500,
            )

        if not result.ok or result.pdf_path is None:
            return jsonify({"ok": False, "error": "PDF compilation failed.", "log": result.log[-4000:]}), 400

        return jsonify({"ok": True, "pdf_url": f"/pdf/{doc_id}", "download_url": f"/download/{doc_id}"})

    @app.get("/pdf/<doc_id>")
    def serve_pdf(doc_id: str):
        pdf_path = OUTPUT_DIR / f"{doc_id}.pdf"
        if not pdf_path.exists():
            return jsonify({"ok": False, "error": "PDF not found"}), 404
        return send_file(pdf_path, mimetype="application/pdf")

    @app.get("/download/<doc_id>")
    def download_pdf(doc_id: str):
        pdf_path = OUTPUT_DIR / f"{doc_id}.pdf"
        if not pdf_path.exists():
            return jsonify({"ok": False, "error": "PDF not found"}), 404
        return send_file(pdf_path, mimetype="application/pdf", as_attachment=True, download_name="resume.pdf")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=int(os.getenv("PORT", "5000")))
