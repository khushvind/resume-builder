import unittest
from unittest.mock import patch

from app import create_app


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


if __name__ == "__main__":
    unittest.main()
