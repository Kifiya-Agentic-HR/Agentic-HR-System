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
  "task": "Extract job details from the provided job file text and output them as a JSON object matching the specified schema. If any field is not found, use an empty string or an empty object as appropriate. Job status should be 'open' and extract at most top 4 skills with their required levels.",
  "job_text": "{sanitized_job_text}",
  "output_format": {{
    "title": "{{string}}",
    "description": {{
      "summary": "{{string}}",
      "type": "{{string}}",
      "commitment": "{{string}}",
      "qualification_level": "{{string}}",
      "responsibilities": "{{string}}",
      "location": "{{string}}"
    }},
    "job_status": "{{string}}",
    "skills": {{"*": {{"required_level": "{{string}}"}}}},
    "created_at": "{{string}}"
  }},
  "instructions": [
    {{
      "step": 1,
      "action": "Extract Basic Fields",
      "details": [
        "Identify and extract the _id, title, job_status, and created_at fields from the job file.",
        "Ensure _id is treated as a string."
      ]
    }},
    {{
      "step": 2,
      "action": "Extract Description Section",
      "details": [
        "Within the description object, extract summary, type, commitment, qualification_level, responsibilities, and location.",
        "Preserve HTML or any formatting present in responsibilities."
      ]
    }},
    {{
      "step": 3,
      "action": "Extract Skills",
      "details": [
        "Extract each skill as a key under the skills field along with its required_level value.",
        "If no skills are present, return an empty object."
      ]
    }}
  ],
  "rules": [
    "Return empty strings or empty objects for fields where information is not available.",
    "Do not generate or assume data that is not present in the job file.",
    "Maintain original formatting where applicable, especially for complex fields like responsibilities.",
    "Ensure that the final output is valid JSON."
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
