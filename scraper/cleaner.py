import re
from collections import OrderedDict


class SchemeCleaner:
    """
    Cleans structured scheme sections while preserving
    useful formatting for RAG.

    Features
    --------
    ✓ Remove duplicate lines
    ✓ Remove duplicate paragraphs
    ✓ Remove navigation text
    ✓ Preserve markdown
    ✓ Preserve bullets
    ✓ Preserve numbering
    ✓ Preserve URLs
    ✓ Normalize whitespace
    ✓ Remove empty sections
    """

    def __init__(self):

        self.remove_patterns = [

            r"Skip to main content",
            r"Government of India",
            r"Government of Maharashtra",
            r"भारत सरकार",
            r"महाराष्ट्र शासन",
            r"Toggle navigation",
            r"Home",
            r"Menu",
            r"Search",
            r"Login",
            r"Register",
            r"Sign In",
            r"Privacy Policy",
            r"Terms & Conditions",
            r"Cookies.*",
            r"Powered by.*",
            r"All Rights Reserved.*",
            r"Copyright.*",
            r"Back to Top",

        ]

    # --------------------------------------------------

    def clean(self, sections):

        cleaned = OrderedDict()

        for section, text in sections.items():

            if not text:
                continue

            text = self.remove_patterns_from_text(text)

            text = self.normalize_urls(text)

            text = self.normalize_whitespace(text)

            text = self.normalize_bullets(text)

            text = self.normalize_numbering(text)

            text = self.remove_duplicate_lines(text)

            text = self.remove_duplicate_paragraphs(text)

            text = self.remove_empty_markdown(text)

            text = text.strip()

            if text:
                cleaned[section] = text

        return cleaned

    # --------------------------------------------------

    def remove_patterns_from_text(self, text):

        for pattern in self.remove_patterns:

            text = re.sub(
                pattern,
                "",
                text,
                flags=re.IGNORECASE
            )

        return text

    # --------------------------------------------------

    @staticmethod
    def normalize_whitespace(text):

        text = text.replace("\r", "")

        text = re.sub(r"\t+", " ", text)

        text = re.sub(r" +", " ", text)

        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    # --------------------------------------------------

    @staticmethod
    def normalize_bullets(text):

        replacements = {

            "•": "- ",
            "●": "- ",
            "▪": "- ",
            "◦": "- ",
            "►": "- ",
            "■": "- "

        }

        for old, new in replacements.items():
            text = text.replace(old, new)

        return text

    # --------------------------------------------------

    @staticmethod
    def normalize_numbering(text):

        text = re.sub(r"(\d+)\)", r"\1.", text)

        return text

    # --------------------------------------------------

    @staticmethod
    def normalize_urls(text):

        text = re.sub(

            r"https?://([^\s]+)",

            lambda m: m.group(0).strip(),

            text

        )

        return text

    # --------------------------------------------------

        # --------------------------------------------------

    @staticmethod
    def remove_duplicate_paragraphs(text):

        paragraphs = []

        seen = set()

        for paragraph in text.split("\n\n"):

            paragraph = paragraph.strip()

            if not paragraph:
                continue

            key = paragraph.lower()

            if key in seen:
                continue

            seen.add(key)

            paragraphs.append(paragraph)

        return "\n\n".join(paragraphs)

    # --------------------------------------------------

    @staticmethod
    def remove_empty_markdown(text):

        lines = []

        for line in text.split("\n"):

            line = line.rstrip()

            if line in [
                "#",
                "##",
                "###",
                "####",
                "-",
                "*"
            ]:
                continue

            lines.append(line)

        return "\n".join(lines)

    @staticmethod
    def remove_duplicate_lines(text):

        seen = set()

        lines = []

        for line in text.split("\n"):

            stripped = line.strip()

            if not stripped:
                lines.append("")
                continue

            key = stripped.lower()

            if key in seen:
                continue

            seen.add(key)

            lines.append(stripped)
        return "\n".join(lines)

       