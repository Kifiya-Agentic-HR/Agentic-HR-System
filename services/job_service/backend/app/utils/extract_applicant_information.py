import json
import re
from app.utils.config_local import Config
from dotenv import load_dotenv
import google.generativeai as genai
from app.utils.file_reader import extract_text_from_file
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
def extract_applicant_information(resume_file_path):
    """
    Extracts specific details from an applicant's resume using an AI model.
    """
    logger.info("Extracting applicant information from resume.")

    # Extract text from the resume file
    extracted_applicant_resume = extract_text_from_file(resume_file_path)

    # Sanitize and truncate the extracted text to prevent prompt injection and manage prompt length
    sanitized_resume = extracted_applicant_resume.replace('"', '\\"').replace('\n', ' ')

    # Construct the AI prompt
    prompt = f"""
    {{
      "task": "Extract specific details from the provided resume text and output them as a JSON object. If any information is not available, set its value to 'Unknown'.",
      "resume_text": "{sanitized_resume}",
      "output_format": {{
        "email": "string",
        "full_name": "string",
        "phone_number": "string",
        "gender": "string ('Male' or 'Female' or 'Unknown')",
        "disability": "string or 'Unknown'",
        "experience_years": "string"
      }},
      "instructions": [
        {{
          "step": 1,
          "action": "Extract Contact Information",
          "details": [
            "Identify and extract the email address from the resume text.",
            "Identify and extract the phone number from the resume text."
          ]
        }},
        {{
          "step": 2,
          "action": "Extract Personal Details",
          "details": [
            "Identify and extract the full name of the candidate.",
            "Determine the gender of the candidate as 'Male', 'Female', or 'Unknown'. If not explicitly mentioned, set as 'Unknown'.",
            "Identify any mention of disability. If no disability is specified, set this field to 'Unknown'."
          ]
        }},
        {{
          "step": 3,
          "action": "Extract Professional Experience",
          "details": [
            "Calculate the total years of experience mentioned in the resume and represent it as a string."
          ]
        }}
      ],
      "rules": [
        "If any information is not available or cannot be determined, set its value to 'Unknown'.",
        "Ensure the output is a valid JSON object with the specified keys.",
        "Do not invent or assume information that is not present in the resume text."
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
        logger.info("Extracted applicant information successfully.")
        return result

    except Exception as e:
        logger.error(f"Failed to process resume: {str(e)}")
        return {
            "error": f"Failed to process resume: {str(e)}"
        }
