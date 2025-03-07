import asyncio
import json
import logging
from src.service.screening_service import scoreResume
from config_local import Config
import aio_pika
from concurrent.futures import ThreadPoolExecutor
from src.models import ScreeningResultDocument
# Configure logging
logger = logging.getLogger(__name__)

# ThreadPool for running synchronous operations asynchronously
executor = ThreadPoolExecutor()
async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try: 

            logger.info("Processing message...")
            data = json.loads(message.body.decode())

            # Extract job details
            job_data = data.get("job")
            

            llm_output, kw_score, vec_score, parsed_resume = scoreResume(
                job_data, data.get("resume_path")
            )
            final_score = (llm_output["overall_score"] * 0.6) + kw_score + vec_score

            result = {
                "application_id": data.get("application_id"),
                "score": round(final_score, 1),
                "reasoning": llm_output.get("score_breakdown", {}),
                "parsed_cv": parsed_resume,
            }

            # Save result to MongoDB asynchronously
            await asyncio.get_running_loop().run_in_executor(
                executor, ScreeningResultDocument.create_result, result
            )

            logger.info(f"Consumer : Successfully processed application")

        except json.JSONDecodeError:
            logger.error("Failed to decode JSON from message body.")
        except Exception as e:
            logger.exception(f"Error processing message: {e}")

async def consume_messages():
    """Consumes messages from RabbitMQ and processes them."""
    try:
        logger.info("consuming ")
        connection = await aio_pika.connect_robust(url=Config.RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            queue = await channel.declare_queue(Config.QUEUE_NAME, durable=True)

            logger.info(" [*] Waiting for messages. To exit press CTRL+C")
            await queue.consume(process_message)

            # Keep running
            await asyncio.Future()
    except Exception as e:
        logger.exception(f"Error in message consumption: {e}")

if __name__ == "__main__":
    try:
        logger.warning("CONSUMER RUNNING")
        asyncio.run(consume_messages())
    except KeyboardInterrupt:
        logger.info("Shutting down consumer...")
