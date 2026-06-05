import unittest
from unittest.mock import patch

from app import create_app, profile_username, sanitize_payload


class ResumeBuilderTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_index_loads(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Resume Builder", response.data)

    @patch("app.compile_pdf")
    def test_render_handles_pdflatex_missing(self, mock_compile):
        mock_compile.side_effect = FileNotFoundError

        response = self.client.post("/render", json={"name": "Test"})
        self.assertEqual(response.status_code, 500)
        body = response.get_json()
        self.assertFalse(body["ok"])

    def test_profile_username_extracts_linkedin_and_github_handles(self):
        self.assertEqual(profile_username("https://linkedin.com/in/your-profile"), "your-profile")
        self.assertEqual(profile_username("https://github.com/your-handle"), "your-handle")
        self.assertEqual(profile_username("https://www.linkedin.com/in/khushvind-maurya/"), "khushvind-maurya")

    def test_sanitize_payload_accepts_generic_skills_text(self):
        data = sanitize_payload({"skills": "Python, Flask, SQL"})
        self.assertEqual(data["skills"], "Python, Flask, SQL")

    @patch("app.compile_pdf")
    def test_render_displays_profile_usernames(self, mock_compile):
        captured = {}

        def fake_compile(tex_source, output_name):
            captured["tex_source"] = tex_source
            return type("Result", (), {"ok": True, "pdf_path": "resume.pdf", "log": ""})()

        mock_compile.side_effect = fake_compile

        response = self.client.post(
            "/render",
            json={
                "linkedin": "https://linkedin.com/in/test-linkedin",
                "github": "https://github.com/test-github",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn(r"\href{https://linkedin.com/in/test-linkedin}{\faLinkedin\ test-linkedin}", captured["tex_source"])
        self.assertIn(r"\href{https://github.com/test-github}{\faGithub\ test-github}", captured["tex_source"])

    @patch("app.compile_pdf")
    def test_render_displays_generic_skills(self, mock_compile):
        captured = {}

        def fake_compile(tex_source, output_name):
            captured["tex_source"] = tex_source
            return type("Result", (), {"ok": True, "pdf_path": "resume.pdf", "log": ""})()

        mock_compile.side_effect = fake_compile

        response = self.client.post("/render", json={"skills": "Python, Flask, SQL"})

        self.assertEqual(response.status_code, 200)
        self.assertIn(r"\section{\textbf{Skills}}", captured["tex_source"])
        self.assertIn("Python, Flask, SQL", captured["tex_source"])
        self.assertNotIn("Programming Languages", captured["tex_source"])


if __name__ == "__main__":
    unittest.main()
