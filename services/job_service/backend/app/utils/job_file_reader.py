import io
from xml.dom.minidom import Document
import PyPDF2
from PIL import Image
import pytesseract
import os


import requests

# Set up Tesseract and Poppler paths
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
POPPLER_PATH = "/usr/bin"

def extract_text_from_file(file_url: str, file_type: str = None) -> str:
    """
    Extract text from a file located at a given URL. The function automatically determines
    the file type from the URL extension if file_type is not provided. Supported types:
      - PDF (.pdf)
      - DOCX (.docx)
      - Images (.jpg, .jpeg, .png) via OCR
      - Plain text (fallback)
    """
    # Fetch file content from the URL
    response = requests.get(file_url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch file: {response.status_code}")
    
    # Determine file type if not explicitly provided
    if file_type is None:
        _, ext = os.path.splitext(file_url)
        file_type = ext.lower()
    
    
    text = ""
    if file_type == ".pdf":
        # Use in-memory bytes stream for PDF
        file_bytes = io.BytesIO(response.content)
        reader = PyPDF2.PdfReader(file_bytes)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        # if text == "":
        #     file_bytes = io.BytesIO(response.content)
        #     image = Image.open(file_bytes)
        #     text = pytesseract.image_to_string(image)

    elif file_type == ".docx":
        # Use in-memory bytes stream for DOCX
        file_bytes = io.BytesIO(response.content)
        document = Document(file_bytes)
        for para in document.paragraphs:
            text += para.text + "\n"
    elif file_type in [".jpg", ".jpeg", ".png"]:
        # For images, perform OCR using pytesseract
        file_bytes = io.BytesIO(response.content)
        image = Image.open(file_bytes)
        text = pytesseract.image_to_string(image)
    else:
        # Fallback: treat as plain text
        text = response.text
    
    return text
