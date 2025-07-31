from config_local import Config
from dotenv import load_dotenv
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)
load_dotenv()

gemini_api_key = Config.GEMINI_KEY
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables!")

genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

# function to identify the weights
def analyze_job_requirements(job_text):

   prompt = f"""
   Analyze the unstructured job requirements text contained in the 'job_text' string variable.

   Follow these steps:

   1. Text Preprocessing:
      - Check for potential OCR errors (e.g., '1' vs 'l', '0' vs 'O') and correct if present
      - Normalize whitespace and clean formatting artifacts

   2. Identify Key Components:
      - Find explicit requirements using indicators like "must have", "required", "essential", "needs", "should possess"
      - Note repeated terms/phrases and emphasized concepts
      - Flag emotionally charged words: "critical", "strong", "proven", "expert", "exceptional"

   3. Categorization:
      - Classify elements into:
      [Education], [Technical Skills], [Experience], 
      [Certifications], [Soft Skills], [Other]

   4. Weight Calculation:
      - Assign percentage weights to each category considering:
      • Frequency of mentions
      • Strength of language used
      • Position in text (early mentions = higher priority)
      • Explicit prioritization clues
      - Total must equal 100%
      - Use precise values (can be decimals, no rounding constraints)

   6. Output:
      JSON format only, like:
      {{
         "Technical Skills": 27.5,
         "Education": 33.3,
         "Experience": 22, 
         "Soft Skills": 12.2,
         "Other": 5
      }}

   job_text:
   {job_text}
   """
   
   try:
      response = model.generate_content(
         prompt, 
      )

      

      return response.text

   except Exception as e:
      logger.error(str(e))
      return 