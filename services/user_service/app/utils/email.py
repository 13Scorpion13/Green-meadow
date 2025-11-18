import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()

async def send_password_reset_email(email: str, token: str):
    msg = MIMEMultipart()
    msg["Subject"] = "Сброс пароля"
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = email

    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    body = f"""
    Вы запросили сброс пароля. Перейдите по ссылке:
    {link}
    Ссылка действительна 1 час.
    """

    msg.attach(MIMEText(body, "plain"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
            use_tls=False,
        )
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")