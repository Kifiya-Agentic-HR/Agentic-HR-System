from crewai import Agent, Crew, Task
from crewai.project import CrewBase, agent, crew, task
import json

###############################################################################
# Crew 1: QA Crew
#   - Contains the Answer Evaluator and Question Generator agents and tasks.
#   - Input: conversation_history, skills (dict), user_answer.
#   - Order: first run the answer evaluator then the question generator.
###############################################################################

from typing import Tuple, Any

def validate_skills(result: Any) -> Tuple[bool, Any]:
    """Validate the skills dictionary for consistency and correctness."""
    try:
        if not isinstance(result, dict):
            data = result.raw
            data = data.replace('```json', '').replace('```', '')
            result = json.loads(data)
            if "skills" not in result:
                return (False, {
                    "error": "Missing or invalid 'skills' dictionary",
                    "code": "MISSING_SKILLS"
                })

        skills = result["skills"]
        if not isinstance(skills, dict):
            return (False, {
                "error": "'skills' must be a dictionary",
                "code": "INVALID_SKILLS_TYPE"
            })

        for skill, details in skills.items():
            if not isinstance(details, dict):
                return (False, {
                    "error": f"Invalid structure for skill '{skill}'",
                    "code": "INVALID_SKILL_STRUCTURE"
                })

            # Required fields and their expected types
            required_fields = {
                "required_level": str,
                "rating": int,
                "questions_asked": int,
                "weight": int
            }

            for field, expected_type in required_fields.items():
                if field not in details:
                    return (False, {
                        "error": f"Missing required field '{field}' in skill '{skill}'",
                        "code": "MISSING_FIELD",
                        "context": {"skill": skill}
                    })
                if not isinstance(details[field], expected_type):
                    return (False, {
                        "error": f"Field '{field}' in skill '{skill}' must be of type {expected_type.__name__}",
                        "code": "INVALID_TYPE",
                        "context": {"skill": skill, "field": field}
                    })

            # Validate rating (1-10)
            if not (1 <= details["rating"] <= 10):
                return (False, {
                    "error": f"Rating for skill '{skill}' must be between 1 and 10",
                    "code": "INVALID_RATING",
                    "context": {"skill": skill, "rating": details["rating"]}
                })

            # Validate required level
            valid_levels = {"beginner", "intermediate", "advanced"}
            if details["required_level"].lower() not in valid_levels:
                return (False, {
                    "error": f"Invalid required_level '{details['required_level']}' for skill '{skill}'. Must be one of {valid_levels}",
                    "code": "INVALID_REQUIRED_LEVEL",
                    "context": {"skill": skill, "required_level": details["required_level"]}
                })

        return (True, result)  # Return validated skills dictionary

    except Exception as e:
        return (False, {
            "error": "Unexpected error during validation",
            "code": "SYSTEM_ERROR",
            "details": str(e)
        })


@CrewBase
class InterviewQACrew:
    """QA Crew: Handles evaluating answers and generating follow-up questions."""
    agents_config = 'config/qa_agents.yaml' 
    tasks_config = 'config/qa_tasks.yaml' 

    @agent
    def answer_evaluator(self) -> Agent:
        """Answer Evaluator agent config."""
        return Agent(
            config=self.agents_config['answer_evaluator'],
            # verbose=True
        )

    @agent
    def question_generator(self) -> Agent:
        """Question Generator agent config."""
        return Agent(
            config=self.agents_config['question_generator'],
        )

    @agent
    def output_formatter(self) -> Agent:
        """Output Formatter agent config."""
        return Agent(
            config=self.agents_config['output_formatter'],
        )
    
    @task
    def output_formatter_task(self) -> Task:
        """Task for formatting the output."""
        return Task(
            config=self.tasks_config['output_formatter_task'],
            context=[self.question_generation_task()]
        )

    @task
    def answer_evaluation_task(self) -> Task:
        """Task for evaluating the answer."""
        return Task(
            config=self.tasks_config['answer_evaluation_task'],
            # guardrail=validate_skills,
            max_retries=3 
        )

    @task
    def question_generation_task(self) -> Task:
        """Task for generating the next question."""
        return Task(
            config=self.tasks_config['question_generation_task'],
            context=[self.answer_evaluation_task()],
        )

    @crew
    def crew(self) -> Crew:
        """
        Defines the QA Crew and the hierarchical process that runs the agents and tasks
        for evaluating answers and generating follow-up questions.
        """
        return Crew(
            agents=[self.answer_evaluator(), self.question_generator()],
            tasks=[self.answer_evaluation_task(), self.question_generation_task(), self.output_formatter_task()],
            # verbose=True,
            output_log_file='logs/qa_crew.log'
        )