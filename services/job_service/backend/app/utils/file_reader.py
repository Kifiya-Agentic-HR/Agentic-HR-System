import os
import logging
import requests
import tempfile
from pdfminer.high_level import extract_text
from docx import Document
from typing import Union

logger = logging.getLogger(__name__)

def extract_text_from_file(file_path_or_url: str) -> str:
    """
    Handles both local files and URLs for text extraction
    """
    try:
        # Check if input is a local file path
        if os.path.exists(file_path_or_url):
            logger.info(f"Processing local file: {file_path_or_url}")
            
            # Handle different file types
            if file_path_or_url.lower().endswith('.pdf'):
                return extract_text_from_pdf(file_path_or_url)
            elif file_path_or_url.lower().endswith(('.docx', '.doc')):
                return extract_text_from_docx(file_path_or_url)
            elif file_path_or_url.lower().endswith('.txt'):
                return extract_text_from_txt(file_path_or_url)
            else:
                raise ValueError(f"Unsupported file format: {file_path_or_url}")
        
        # Handle URL case
        logger.info(f"Processing URL: {file_path_or_url}")
        response = requests.get(file_path_or_url)
        response.raise_for_status()
        
        # Handle different content types
        content_type = response.headers.get('Content-Type', '')
        if 'application/pdf' in content_type:
            return extract_text_from_pdf_bytes(response.content)
        elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in content_type:
            return extract_text_from_docx_bytes(response.content)
        elif 'text/plain' in content_type:
            return response.text
        else:
            raise ValueError(f"Unsupported content type from URL: {content_type}")

    except Exception as e:
        logger.error(f"Error extracting text from {file_path_or_url}: {str(e)}")
        raise

# Local file handlers
def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from local PDF file"""
    try:
        return extract_text(file_path)
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from local DOCX file"""
    try:
        doc = Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
        raise

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from local TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logger.error(f"TXT extraction error: {str(e)}")
        raise

# Byte stream handlers
def extract_text_from_pdf_bytes(content: bytes) -> str:
    """Extract text from PDF bytes"""
    try:
        with tempfile.NamedTemporaryFile(delete=True, suffix='.pdf') as tmp:
            tmp.write(content)
            tmp.seek(0)
            return extract_text(tmp.name)
    except Exception as e:
        logger.error(f"PDF bytes extraction error: {str(e)}")
        raise

def extract_text_from_docx_bytes(content: bytes) -> str:
    """Extract text from DOCX bytes"""
    try:
        with tempfile.NamedTemporaryFile(delete=True, suffix='.docx') as tmp:
            tmp.write(content)
            tmp.seek(0)
            doc = Document(tmp.name)
            return '\n'.join([para.text for para in doc.paragraphs])
    except Exception as e:
        logger.error(f"DOCX bytes extraction error: {str(e)}")
        raise