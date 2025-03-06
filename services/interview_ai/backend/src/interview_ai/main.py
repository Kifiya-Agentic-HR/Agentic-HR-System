from src.interview_ai.utils import json_to_dict
from src.interview_ai.crews import EvaluatorCrew, InterviewQACrew, InterviewFlowManagerCrew, IntroductionCrew 
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class UnifiedInterface:
    def __init__(self):
        self.flow_crew = InterviewFlowManagerCrew().crew()
        self.intro_crew = IntroductionCrew().crew()
        self.qa_crew = InterviewQACrew().crew()
        self.eval_crew = EvaluatorCrew().crew()

    def validate_keys(self, input_data, required_keys):
        return [
            key for key in required_keys
            if key not in input_data
        ]

    def _error(self, message):
        return {"error": message}

    def _call_crew(self, crew, input_data, crew_name):
        try:
            logger.info("-" * 50)
            logger.info(f"Calling {crew_name} with input: {input_data}")
            response = crew.kickoff(inputs=input_data)
            return json_to_dict(response.raw)
        except Exception as e:
            return self._error(f"{crew_name} error: {e}")

    def kickoff(self, input_data, max_conversation_history=5):
        print("Input data: ", input_data)
        if not isinstance(input_data, dict):
            return self._error("Input must be a dictionary.")
        try:
            flow_response = self.flow_crew.kickoff(inputs=input_data)
            flow_result = json_to_dict(flow_response.raw)
            stage = flow_result.get("state")
            logger.info("-" * 50)
            logger.info("-" * 50)
            logger.info(f"Flow manager result: {flow_result}")
        except Exception as e:
            return self._error(f"Flow manager error: {e}")

        config = {
            "welcome": {
                "required": ["user_info", "name", "role_info"],
                "crew": self.intro_crew,
                "crew_name": "Introduction crew"
            },
            "ongoing": {
                "required": ["conversation_history", "name", "skills", "user_info", "role_info", "user_answer"],
                "crew": self.qa_crew,
                "crew_name": "Interview QA crew"
            },
            "completed": {
                "required": ["conversation_history", "skills", "user_info", "role_info"],
                "crew": self.eval_crew,
                "crew_name": "Evaluator crew"
            }
        }

        if stage not in config:
            return self._error(f"Unrecognized stage: {stage}")

        missing = self.validate_keys(input_data, config[stage]["required"])
        
        if stage == "ongoing":
            if len(input_data["conversation_history"]) > max_conversation_history:
                input_data["conversation_history"] = input_data["conversation_history"][-max_conversation_history:]
                # keep only recent

        if missing:
            return self._error(f"Missing keys for '{stage}' stage: {', '.join(missing)}")
       
        result = self._call_crew(config[stage]["crew"], input_data, config[stage]["crew_name"])
        logger.info(f"Result [CREW KICKOFF]: {result}")
        return result