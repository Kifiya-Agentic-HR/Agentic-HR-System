import json
import re
from config_local import Config
from dotenv import load_dotenv
import google.generativeai as genai
from app.utils.job_file_reader import extract_text_from_file
import logging

load_dotenv()
logger = logging.getLogger(__name__)
# Load API key
gemini_api_key = Config.GEMINI_KEY
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables!")

# Configure Gemini AI
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

def balance_braces(json_str):
    """
    Balances unclosed JSON braces in case of an incomplete response.
    """
    open_braces = json_str.count("{")
    close_braces = json_str.count("}")
    if open_braces > close_braces:
        json_str += "}" * (open_braces - close_braces)
    return json_str
def extract_job_requirement(job_file_path):
    """
    Extracts job_requirement and job_description  using an AI model.
    """

    # Extract text from the job file
    extracted_job = extract_text_from_file(job_file_path)

    # Sanitize and truncate the extracted text to prevent prompt injection and manage prompt length
    sanitized_job_text = extracted_job.replace('"', '\\"').replace('\n', ' ')

    # Construct the AI prompt
    prompt = f"""
{{
  "task": "Extract job skills and requirements from the provided job description text and output them as a JSON object. If any information cannot be determined, use appropriate empty values.",
  "job_text": "{sanitized_job_text}",
  "output_format": {{
    "job_skills": {{
      "technical_skills": ["list", "of", "technical", "skills"],
      "soft_skills": ["list", "of", "soft", "skills"]
    }},
    "job_requirements": {{
      "education": ["list", "of", "educational", "requirements"],
      "experience": ["list", "of", "experience", "requirements"],
      "certifications": ["list", "of", "required", "certifications"]
    }}
  }},
  "instructions": [
    {{
      "step": 1,
      "action": "Identify Technical Skills",
      "details": [
        "Extract hard skills related to specific technologies/tools",
        "Focus on measurable technical capabilities",
        "Include programming languages, software, and technical methodologies"
      ]
    }},
    {{
      "step": 2,
      "action": "Identify Soft Skills",
      "details": [
        "Extract interpersonal and workplace skills",
        "Include communication, leadership, and teamwork abilities",
        "Identify personality traits mentioned in requirements"
      ]
    }},
    {{
      "step": 3,
      "action": "Extract Education Requirements",
      "details": [
        "Identify required degrees or educational background",
        "Note specific fields of study if mentioned",
        "Extract any academic achievement requirements"
      ]
    }},
    {{
      "step": 4,
      "action": "Identify Experience Requirements",
      "details": [
        "Extract minimum years of experience required",
        "Identify specific industry experience mentions",
        "Note any special project experience requirements"
      ]
    }},
    {{
      "step": 5,
      "action": "Identify Certifications",
      "details": [
        "Extract required professional certifications",
        "Include optional preferred certifications",
        "Note any licensing requirements"
      ]
    }}
  ],
  "rules": [
    "Return empty lists if no relevant information is found",
    "Do not invent or assume unspecified requirements",
    "Maintain original phrasing from the job text",
    "Prioritize most critical requirements first in lists",
    "Exclude generic phrases like 'good communication skills' unless specifically stated"
  ]
}}
"""

    # Generate response using the AI model
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.1,
                "top_p": 0.95,
            }
        )

        response_text = response.text.strip()

        if not response_text:
            raise ValueError("AI model returned an empty response.")

        # Extract JSON object from the response
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            json_str = match.group(0)
        else:
            raise ValueError("No valid JSON object found in the response.")

        # Parse JSON safely
        result = json.loads(json_str)
        logger.info("Extracted job information successfully.")
        return result

    except Exception as e:
        logger.error(f"Failed to process job: {str(e)}")
        return {
            "error": f"Failed to process job: {str(e)}"
        }
