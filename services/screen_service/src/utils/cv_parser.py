# Load environment variables
import os
import google.generativeai as genai

from dotenv import load_dotenv


load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is missing in environment variables.")

# Configure Gemini API
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

def parse_cv(unstructured_cv):
    """format the resume."""
    prompt = f"""

You are given an unstructured CV named unstructured_cv as plain text. Your task is to convert this CV into a structured markdown format while ensuring that every sentence from the original text is preserved. Follow these instructions carefully:

1. Divide the CV into the following sections:

    Personal Information: Identify and include details such as name, contact info, and address.
    Education: List all educational details like degrees, institutions, dates, and certifications.
    Work Experience: Capture all job roles, responsibilities, companies, and dates.
    Skills: Extract and list all technical and soft skills mentioned.
    Projects/Research (if applicable): Include any details related to projects or research work.
    Additional Information: Place any details that do not clearly belong to the above categories here.
    Formatting Requirements:

2. Use markdown headers (e.g., # Personal Information) for each section.
    - Under each header, list the corresponding sentences as bullet points (using - before each sentence).
    - Do not paraphrase or summarize; every sentence from the unstructured CV must appear exactly as provided.
    - If a sentence applies to more than one section, include it in each relevant section.
3. Example Output Format:
    - The final output should look like this:
        # Personal Information
            - Sentence about name or contact info.
            - Another sentence about personal details.

        # Education
            - Sentence about degree or certification.
            - Sentence detailing institution and dates.

        # Work Experience
            - Sentence describing a job role and responsibilities.
            - Sentence with company information and dates.

        # Skills
            - Sentence listing a skill.
            - Another sentence listing a different skill.

        # Projects/Research
            - Sentence describing a project or research.

        # Additional Information
            - Any remaining sentence not covered above.

the unstructured_cv is {unstructured_cv}
4. Processing Instructions:

    - Analyze each sentence of the input CV and decide which section(s) it belongs to.
    - Ensure that no sentence is missed; if necessary, include the same sentence in multiple sections if it fits.
    - The order of sentences should be maintained to preserve context and detail.


"""
    

    try:
        response = model.generate_content(prompt, generation_config={"temperature": 0.7})
        response_text = response.text

        # Normalize keywords

        return response_text
    except Exception as e:
        return {"resume_keywords": [], "job_keywords": []}
