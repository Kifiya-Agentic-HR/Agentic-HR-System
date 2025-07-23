import smtplib
import ssl
from email.message import EmailMessage
from app.config import settings
from app.logger import logger

def send_email_notification(to: str, subject: str, body: str = "", html: str = ""):
    """
    Basic SMTP-based sending of an email.
    Could be replaced with an API-based provider like SendGrid or Mailgun.
    """

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SENDER_EMAIL
    msg["To"] = to

    # If HTML content is provided, set the content type accordingly
    if html:
        msg.add_alternative(html, subtype="html")
    else:
        msg.set_content(body)

    try:
        logger.info("Creating secure connection with SMTP server")
        context = ssl.create_default_context()
        logger.info("Connecting to SMTP server...")
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls(context=context)
            logger.info("Logging in...")
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            logger.info("Sending email...")
            server.send_message(msg)
            logger.info("Email sent.")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

