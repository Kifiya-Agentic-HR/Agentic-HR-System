import asyncio
import json
import logging
from src.service.screening_service import scoreResume
from config_local import Config
import aio_pika
from concurrent.futures import ThreadPoolExecutor
from src.models import ScreeningResultDocument
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
            job_data = data.get("job")
            

            llm_output, kw_score, vec_score, parsed_resume = scoreResume(
                job_data, data.get("resume_path")
            )
            final_score = (llm_output["overall_score"] * 0.6) + kw_score + vec_score

            result = {
                "application_id": data.get("app_id"),
                "score": round(final_score, 1),
                "reasoning": llm_output.get("score_breakdown", {}),
                "parsed_cv": parsed_resume,
            }

            # Save result to MongoDB asynchronously
            await asyncio.get_running_loop().run_in_executor(
                executor, ScreeningResultDocument.create_result, result
            )

            logging.info(f"Consumer : Successfully processed application")

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
