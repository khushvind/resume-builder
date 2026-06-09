# Resume Builder (MVP)

A Python + LaTeX resume builder that keeps the output style close to the reference template while giving a web form UI, live A4 preview, section toggles, and PDF download.

## What this MVP includes
- Flask web app with split layout: form (left) + A4 preview (right)
- LaTeX rendering using a Jinja template based on the reference format
- Toggleable sections:
  - Academic Details
  - Experience
  - Internships
  - Key Projects
  - Skills
- PDF download endpoint
- Basic tests for app startup and render error handling

## Requirements
- Python 3.10+
- A TeX distribution with `pdflatex` in PATH:

## Run with Docker (Recommended)
The easiest way to run the app is using Docker, which bundles all LaTeX dependencies:
```powershell
docker build -t resume-builder .
docker run -d -p 80:5000 --name resume-builder-app resume-builder
```
Then open http://localhost.

## Run locally
```powershell
cd e:\Projects\resume-builder
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000.

## Run tests
```powershell
cd e:\Projects\resume-builder
.\.venv\Scripts\Activate.ps1
```powershell
python -m pytest
```

## Notes
- The app currently ignores profile image and logo (as requested).
- PDFs are generated into `output/`.
- If `pdflatex` is not installed, the UI returns a clear error message.

## Project layout
- `app.py` Flask app and PDF compilation flow
- `templates/index.html` UI
- `templates/cv.tex.jinja` Jinja-powered LaTeX template
- `static/styles.css` UI styling
- `tests/test_app.py` smoke tests
