import json
import re
import os
import nltk
import google.generativeai as genai

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from dotenv import load_dotenv

# Initialize dependencies
nltk.download("all", quiet=True)
lemmatizer = WordNetLemmatizer()
STOPWORDS = set(stopwords.words("english")).difference(set(["c++", "c"]))

# Load environment variables
load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is missing in environment variables.")

# Configure Gemini API
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

def preprocess_text(text):
    """Cleans and tokenizes text efficiently."""
    text = re.sub(r"[^a-zA-Z0-9+\s]", "", text.lower())
    tokens = [lemmatizer.lemmatize(word) for word in word_tokenize(text) if word not in STOPWORDS and len(word) > 2]
    return " ".join(tokens)

def extract_key_words(resume_text, job_text):
    """Extracts relevant technical keywords from resume and job description."""
    prompt = f"""
    Extract technical keywords from the resume and job description. Follow these rules:
    1. Return JSON with "resume_keywords" and "job_keywords" arrays.
    2. Include only technical terms, tools, and skills.
    3. Use lowercase and singular form.
    4. Remove generic terms like 'communication'.
    5. Example output:
    {{
        "resume_keywords": ["python", "machine learning", "sql"],
        "job_keywords": ["python", "data analysis", "aws"]
    }}

    Resume Text:
    {resume_text}

    Job Text:
    {job_text}
    """

    try:
        response = model.generate_content(prompt, generation_config={"temperature": 0.1})
        response_text = response.text.replace("```json", "").replace("```", "").strip()
        keywords = json.loads(response_text)  # Parse JSON

        # Normalize keywords
        keywords["resume_keywords"] = list(set(lemmatizer.lemmatize(kw.lower()) for kw in keywords.get("resume_keywords", [])))
        keywords["job_keywords"] = list(set(lemmatizer.lemmatize(kw.lower()) for kw in keywords.get("job_keywords", [])))

        return keywords
    except json.JSONDecodeError:
        print("Error: Unable to parse response from Gemini API.")
        return {"resume_keywords": [], "job_keywords": []}
    except Exception as e:
        print(f"Keyword extraction failed: {e}")
        return {"resume_keywords": [], "job_keywords": []}

def calculate_keyword_match(resume_kws, job_kws):
    """Calculates keyword matching percentage."""
    return (len(set(resume_kws) & set(job_kws)) / len(job_kws)) * 100 if job_kws else 0.0

def calculate_vector_similarity(job_text, resume_text):
    """Calculates TF-IDF cosine similarity."""
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([preprocess_text(job_text), preprocess_text(resume_text)])
    return cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0] * 100  # Convert to percentage

def calculate_scores(job_text, resume_text):
    """Calculates keyword and vector similarity scores."""
    keywords = extract_key_words(resume_text, job_text)
    keyword_score = calculate_keyword_match(keywords["resume_keywords"], keywords["job_keywords"])
    vector_score = calculate_vector_similarity(job_text, resume_text)

    # Weighted scoring system
    weighted_keyword = keyword_score * 0.3  # 30% weight
    weighted_vector = vector_score * 0.1    # 10% weight

    return {
        "raw_keyword_score": keyword_score,
        "raw_vector_score": vector_score,
        "weighted_keyword": weighted_keyword,
        "weighted_vector": weighted_vector,
        "total_score": weighted_keyword + weighted_vector,
        "matched_keywords": list(set(keywords["resume_keywords"]) & set(keywords["job_keywords"])),
    }
