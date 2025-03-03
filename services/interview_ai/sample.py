import openai
import os
import ast
import time

openai.api_key = os.getenv("OPENAI_API_KEY")  # Set your API key here or in environment variables 

# List of fintech-focused job roles
JOB_ROLES = [
    "Data Scientist",
    "Data Engineer",
    "Machine Learning Engineer",
    "Quantitative Analyst",
    "Financial Data Analyst",
    "Blockchain Developer",
    "AI Research Scientist",
    "DevOps Engineer (Financial Systems)",
    "Fraud Detection Specialist",
    "Risk Management Data Analyst",
    "Cloud Security Engineer",
    "Financial Software Engineer",
    "Big Data Architect",
    "Business Intelligence Developer",
    "Cryptocurrency Analyst"
]

def generate_skills(role):
    """Generate technical skills for a given job role"""
    prompt = f"""List 10-15 specific technical skills required for a {role} in a fintech company.
Respond with a Python list formatted exactly like: ['skill 1', 'skill 2', ...]"""
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )
        return ast.literal_eval(response.choices[0].message['content'].strip())
    except:
        print(f"Error generating skills for {role}")
        return []

def generate_questions(role, skill):
    """Generate interview questions for a specific skill"""
    prompt = f"""Generate 25-35 concise, technical interview questions about {skill} for a {role} position in fintech.
Focus on practical applications and specific technologies.
Format each question on a separate line without numbering or bullets."""
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=1500
        )
        return [q.strip() for q in response.choices[0].message['content'].split('\n') if q.strip()]
    except:
        print(f"Error generating questions for {skill}")
        return []

def generate_interview_questions():
    """Main function to generate and save all questions"""
    with open("fintech_interview_questions.txt", "w") as f:
        for role in JOB_ROLES:
            f.write(f"\n{'#' * 40}\n# {role.upper()}\n{'#' * 40}\n\n")
            
            # Generate skills
            skills = generate_skills(role)
            f.write(f"REQUIRED SKILLS:\n{'-' * 40}\n")
            f.write('\n'.join([f"- {skill}" for skill in skills]) + '\n\n')
            
            # Generate questions for each skill
            for skill in skills:
                f.write(f"\n{skill.upper()} QUESTIONS:\n{'-' * 40}\n")
                questions = generate_questions(role, skill)
                f.write('\n'.join(questions) + '\n')
                time.sleep(1)  # Rate limit protection
            
            print(f"Completed: {role}")
            
    print("\nAll questions generated successfully!")

if __name__ == "__main__":
    generate_interview_questions()