import time
start = time.time()
import asyncio
import json
import logging
from concurrent.futures import ThreadPoolExecutor
import aio_pika
from config_local import Config
from src.database.model.screen_result_model import ScreeningResultDocument
from src.database.model.recommendation_model import RecommendationDocument

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
MAX_RETRIES = 3

async def process_message(message: aio_pika.IncomingMessage):
    """
    Processes a message from the queue.
    - Includes a delay.
    - Handles AI evaluation errors with a retry mechanism.
    - Re-queues messages on transient failures.
    - Logs permanent failures after MAX_RETRIES.
    """
    data = {}
    try:
        # Acknowledge the message upfront, we will handle requeuing manually
        await message.ack()
        
        data = json.loads(message.body.decode())
        logger.info(f"Processing message for application_id: {data.get('application_id')}")

        # Unpack data for the AI call
        job_description = data.get("job_description")
        job_skills = data.get("job_skills")    
        job_id = data.get("job_id")
        application_id = data.get("application_id")
        resume_path = data.get("resume_path")
        source = data.get('from')

        # --- Essential Data Validation ---
        if not all([job_description, resume_path, application_id]):
            raise ValueError(
                f"Message for application_id: {application_id} is missing essential data "
                f"(job_description, resume_path, or application_id)."
            )

        # Add a 30-second delay to rate-limit AI requests
        logger.info(f"Waiting 30 seconds before AI evaluation for application_id: {data.get('application_id')}...")
        await asyncio.sleep(30)

        # Offload the blocking scoreResume call to the thread pool
        loop = asyncio.get_running_loop()
        llm_output, kw_score, vec_score, parsed_resume = await loop.run_in_executor(
            executor, scoreResume, job_description, job_skills, resume_path
        )

        # --- AI Output Validation ---
        if not isinstance(llm_output, dict) or "overall_score" not in llm_output:
            raise ValueError("AI output is missing 'overall_score' or is not a valid dictionary.")

        # Calculate final score safely
        overall_score = llm_output.get("overall_score", 0)
        logger.info(f"keyword score: {kw_score}, vector score: {vec_score}, overall score: {overall_score}")
        final_score = overall_score * 0.9 + kw_score * 0.05 + vec_score * 0.05
        
        source = data.get('from')
        application_id = data.get("application_id")
        job_id = data.get("job_id")

        if source == "recommendation":
            result = {
                "job_id": job_id,
                "score": round(float(final_score), 1),
                "reasoning": llm_output.get("score_breakdown", {}),
                "application_id": application_id,
            }
            await loop.run_in_executor(
                executor, RecommendationDocument.create_recommendation, result
            )
            logger.info(f"Consumer: Successfully processed recommendation for application_id {application_id}")
        else:
            result = {
                "application_id": application_id,
                "score": round(float(final_score), 1),
                "reasoning": llm_output.get("score_breakdown", {}),
                "parsed_cv": parsed_resume,
            }
            await loop.run_in_executor(
                executor, ScreeningResultDocument.create_result, result
            )
            logger.info(f"Consumer: Successfully processed web application for application_id {application_id}")

    except (json.JSONDecodeError, ValueError) as e:
        # For data errors, log but don't requeue to avoid poison pill loops
        logger.error(f"Data or AI validation error for application_id: {data.get('application_id')}. Won't requeue. Error: {e}")
    
    except Exception as e:
        logger.error(f"Transient error processing application_id: {data.get('application_id')}. Error: {e}")
        
        headers = message.headers or {}
        retry_count = headers.get("x-retry-count", 0)

        if retry_count < MAX_RETRIES:
            logger.info(f"Re-queuing message for application_id: {data.get('application_id')}. Retry attempt {retry_count + 1}")
            
            # Update retry count in headers
            headers["x-retry-count"] = retry_count + 1
            
            # Re-publish the message to the end of the queue
            await message.channel.default_exchange.publish(
                aio_pika.Message(
                    body=message.body,
                    headers=headers,
                    delivery_mode=message.delivery_mode
                ),
                routing_key=message.routing_key
            )
        else:
            logger.critical(
                f"Message for application_id: {data.get('application_id')} has failed after {MAX_RETRIES} retries. "
                f"Moving to dead-letter handling (logging only for now)."
            )
            # In a real-world scenario, you would publish this to a dead-letter queue.
            # For now, we just log it as critical.

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
