import PyPDF2
import docx2txt
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
import pathlib
import os

# Set up Tesseract and Poppler paths
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
POPPLER_PATH = "/usr/bin"

def extract_text_from_file(file_path):
    """
    Extracts text from a file based on its extension.
    Supports plain text, PDF, DOC/DOCX, and image formats.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = pathlib.Path(file_path).suffix.lower()

    try:
        if ext in [".txt", ".md", ".csv", ".json"]:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()

        elif ext == ".pdf":
            return _extract_text_from_pdf(file_path)

        elif ext in [".doc", ".docx"]:
            return docx2txt.process(file_path)

        elif ext in [".png", ".jpg", ".jpeg"]:
            return _extract_text_from_image(file_path)

        else:
            return ""

    except Exception as e:
        return f"Error extracting text from {file_path}: {str(e)}"

def _extract_text_from_pdf(file_path):
    """
    Extracts text from a PDF file. If no text is found, attempts OCR.
    """
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    if not text.strip():  # Use OCR if no text is extracted
        images = convert_from_path(file_path, poppler_path=POPPLER_PATH)
        for image in images:
            text += pytesseract.image_to_string(image) + "\n"
    
    return text.strip()

def _extract_text_from_image(file_path):
    """
    Extracts text from an image using OCR.
    """
    with Image.open(file_path) as image:
        return pytesseract.image_to_string(image).strip()
