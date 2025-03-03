import json
import os
import re
from dotenv import load_dotenv
import google.generativeai as genai
from src.service.screening_service import balance_braces

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables!")

genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-2.0-flash")


def analyze_job_skills(job_requirement_text):
    prompt = f"""
    {{
      "task": "Extract and categorize skills from a given job requirement text.",
      "instructions": [
        "Identify the top 5 most relevant skills from the job requirement.",
        "Determine the required proficiency level for each skill as 'beginner', 'intermediate', or 'expert'."
      ],
      "output_format": {{
        "skills": [
          {{
            "skill_name": "string",
            "required_level": "beginner/intermediate/expert"
          }}
        ]
      }},
      "rules": [
        "Return only valid JSON.",
        "Do not include any additional explanations or text.",
        "Ensure exactly 5 skills are listed."
      ],
      "job_requirement_text": "{job_requirement_text}"
    }}
    """

    # Generate content from the model
    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.1, "top_p": 0.95}
    )

    response_text = response.text.strip()

    # Extract JSON content
    match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if match:
        json_str = balance_braces(match.group(0))
    else:
        return {}

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {}  # Return an empty dict if JSON parsing fails
