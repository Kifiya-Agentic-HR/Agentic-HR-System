print("Consumer script started")
import time
start = time.time()
import asyncio
import json
import logging
from concurrent.futures import ThreadPoolExecutor
import aio_pika
from config_local import Config
from src.models import ScreeningResultDocument
import sys
m = time.time() - start
print(f"Time taken to import: {m}")
from src.service.screening_service import scoreResume
print(f"Time taken to import scoreResume: {time.time() - (m+start)}")

# Configure logging
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger(__name__)

# ThreadPool for running blocking (synchronous) operations asynchronously
executor = ThreadPoolExecutor()

async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            logger.info("Processing message...")
            data = json.loads(message.body.decode())

            # Extract job details and resume_path
            job_description = data.get("job_description")
            job_skills = data.get("job_skills")            
            application_id = data.get("application_id")
            resume_path = data.get("resume_path")

            # Offload the blocking scoreResume call to the thread pool
            loop = asyncio.get_running_loop()
            llm_output, kw_score, vec_score, parsed_resume = await loop.run_in_executor(
                executor, scoreResume, job_description, job_skills, resume_path
            )

            # Calculate final score safely, defaulting overall_score to 0 if missing
            overall_score = llm_output.get("overall_score", 0)
            final_score = (overall_score ) 
            

            result = {
                "application_id": application_id,
                "score": round(final_score, 1),
                "reasoning": llm_output.get("score_breakdown", {}),
                "parsed_cv": parsed_resume,
            }

            # Save result to MongoDB asynchronously using the executor
            await loop.run_in_executor(
                executor, ScreeningResultDocument.create_result, result
            )

            logger.info(f"Consumer: Successfully processed application {application_id}")

        except json.JSONDecodeError:
            logger.error("Failed to decode JSON from message body.")
        except Exception as e:
            logger.error(f"Error processing message: {e}")

async def consume_messages():
    """Consumes messages from RabbitMQ and processes them."""
    try:
        logger.info("Starting consumer...")
        connection = await aio_pika.connect_robust(Config.RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            queue = await channel.declare_queue(Config.QUEUE_NAME, durable=True)

            logger.info(" [*] Waiting for messages. To exit press CTRL+C")
            await queue.consume(process_message)

            # Keep running indefinitely
            await asyncio.Future()
    except Exception as e:
        logger.exception(f"Error in message consumption: {e}")

if __name__ == "__main__":
    try:
        print(f"Consumer script started, time taken: {time.time() - start}")
        logger.info("CONSUMER RUNNING")
        asyncio.run(consume_messages())
    except KeyboardInterrupt:
        logger.info("Shutting down consumer...")
