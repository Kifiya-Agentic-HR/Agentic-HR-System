import aio_pika
from app.utils.config_local import Config
from tenacity import retry, wait_fixed, stop_after_attempt
import json
import logging

logger = logging.getLogger(__name__)

@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
async def publish_application(message):
    """Publishes a message to RabbitMQ with retry handling."""
    try:
        connection = await aio_pika.connect_robust(Config.RABBITMQ_URL)
        async with connection:
            channel = await connection.channel(publisher_confirms=True)
            await channel.declare_queue(Config.QUEUE_NAME, durable=True)
            
            await channel.default_exchange.publish(
                aio_pika.Message(
                    body=json.dumps(message, ensure_ascii=False).encode(),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key=Config.QUEUE_NAME
            )
        logger.info(f"Message sent successfully for app_id: {message.get('application_id')}")
    except Exception as e:
        logger.critical(f"Published failed to send message: {str(e)}")
        raise  # Re-raise to trigger retry

