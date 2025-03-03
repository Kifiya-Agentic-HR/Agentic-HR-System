import asyncio
import json
import logging
from src.service.screening_service import scoreResume
from services.job_service.backend.config_local import Config
from src.models import ResultDocument, JobDocument
import aio_pika
from concurrent.futures import ThreadPoolExecutor
from src.service.skill_analysis_service import analyse_job_skills

# Configure logging
logging.basicConfig(level=logging.INFO)

# ThreadPool for running synchronous operations asynchronously
executor = ThreadPoolExecutor()

async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            logging.info("Processing message...")
            data = json.loads(message.body.decode())

            # Extract job details
            job_id = data.get("job_id")
            job_fetch = JobDocument.get_job_by_id(job_id)
            if not job_fetch:
                logging.error(f"Job with ID {job_id} not found.")
                return

            job_text = job_fetch.get("description", "")
            skill_fetch = analyse_job_skills(job_text)

            # Score resume
            llm_output, kw_score, vec_score, parsed_resume = scoreResume(
                job_text, data.get("resume_path")
            )
            final_score = (llm_output["overall_score"] * 0.6) + kw_score + vec_score

            result = {
                "application_id": data.get("app_id"),
                "score": round(final_score, 1),
                "reasoning": llm_output.get("score_breakdown", {}),
                "skills": skill_fetch,
                "parsed_cv": parsed_resume,
            }

            # Save result to MongoDB asynchronously
            await asyncio.get_running_loop().run_in_executor(
                executor, ResultDocument.create, result
            )

            logging.info(f"Successfully processed application {data.get('app_id')}")

        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from message body.")
        except Exception as e:
            logging.exception(f"Error processing message: {e}")

async def consume_messages():
    """Consumes messages from RabbitMQ and processes them."""
    try:
        connection = await aio_pika.connect_robust(url=Config.RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            queue = await channel.declare_queue(Config.QUEUE_NAME, durable=True)

            logging.info(" [*] Waiting for messages. To exit press CTRL+C")
            await queue.consume(process_message)

            # Keep running
            await asyncio.Future()
    except Exception as e:
        logging.exception(f"Error in message consumption: {e}")

if __name__ == "__main__":
    try:
        logging.info("CONSUMER RUNNING")
        asyncio.run(consume_messages())
    except KeyboardInterrupt:
        logging.info("Shutting down consumer...")
