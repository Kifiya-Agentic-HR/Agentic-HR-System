from src.logger import setup_logging
setup_logging()

import pika
import json
import logging
import time
from pymongo.errors import PyMongoError

from config_local import Config
from src.database.model.screen_result_model import ScreeningResultDocument
from src.service.screening_service import scoreResume

# Configure logging
logger = logging.getLogger(__name__)

class Consumer:
    """
    A synchronous RabbitMQ consumer that processes messages one by one.
    """
    def __init__(self):
        """Initializes the consumer."""
        self.connection = None
        self.channel = None

    def process_message(self, ch, method, properties, body):
        """
        Callback function to process a single message.
        It performs the scoring and database operations synchronously.
        """
        try:
            logger.info("Processing message...")
            data = json.loads(body.decode())
            
            job_description = data.get("job_description", "")
            job_skills = data.get("job_skills", [])
            job_id = data.get("job_id", "")
            application_id = data.get("application_id", "")
            resume_path = data.get("resume_path", "")
            source = data.get('from', "")

            try:
            # Synchronously call the scoring function
                llm_output, kw_score, vec_score, parsed_resume = scoreResume(
                    job_description, job_skills, resume_path
                )

                overall_score = llm_output.get("overall_score", 0.0) if isinstance(llm_output, dict) else 0.0
                kw_score = float(kw_score) if kw_score is not None else 0.0
                vec_score = float(vec_score) if vec_score is not None else 0.0
                
                logger.info(f"keyword score: {kw_score}, vector score: {vec_score}, overall score: {overall_score}")
                final_score = overall_score * 0.9 + kw_score * 0.05 + vec_score * 0.05
                
                score_breakdown = llm_output.get("score_breakdown", {}) if isinstance(llm_output, dict) else {}
                
                if source == "recommendation":
                    result = {
                        "status": "completed",
                        "job_id": job_id,
                        "score": round(float(final_score), 1),
                        "reasoning": score_breakdown,
                        "application_id": application_id,
                    }
                    ScreeningResultDocument.create_result(result)
                    logger.info(f"Consumer: Successfully processed application from recommendation with application_id {application_id}")
                else:
                    result = {
                        "status": "completed",
                        "application_id": application_id,
                        "score": round(float(final_score), 1),
                        "reasoning": score_breakdown,
                        "parsed_cv": parsed_resume,
                    }
                    ScreeningResultDocument.update_or_create_result(application_id,result)
                    logger.info(f"Consumer: Successfully processed application from web with application_id {application_id}")
            except Exception as e:
                result = {
                        "status": "failed",
                        "application_id": application_id,
                        "error_message": str(e),
                        "original_message": data
                    }
                ScreeningResultDocument.update_or_create_result(application_id,result)
                logger.error(f"Error processing application {application_id}: {str(e)}")   
              
            
            # Acknowledge the message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            logger.info("Message processed successfully. Waiting for 20 seconds.")
            time.sleep(20)

        except json.JSONDecodeError:
            logger.error("Failed to decode JSON from message body.")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except PyMongoError as e:
            logger.error(f"Database error: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def run(self):
        """Connects to RabbitMQ and starts consuming messages."""
        try:
            logger.info("Starting synchronous consumer...")
            # Establish a connection to RabbitMQ
            self.connection = pika.BlockingConnection(pika.URLParameters(Config.RABBITMQ_URL))
            self.channel = self.connection.channel()

            # Set prefetch count to 1 to process messages one by one
            self.channel.basic_qos(prefetch_count=1)
            
            # Declare a durable queue
            self.channel.queue_declare(queue=Config.QUEUE_NAME, durable=True)
            
            # Set up the consumer
            self.channel.basic_consume(
                queue=Config.QUEUE_NAME,
                on_message_callback=self.process_message
            )

            logger.info(" [*] Waiting for messages. To exit press CTRL+C")
            self.channel.start_consuming()

        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
        except Exception as e:
            logger.exception(f"A critical error occurred in the consumer run loop: {e}")
        finally:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("RabbitMQ connection closed.")

if __name__ == "__main__":
    try:
        logger.info("CONSUMER RUNNING")
        consumer = Consumer()
        consumer.run()
    except KeyboardInterrupt:
        logger.info("Shutting down")