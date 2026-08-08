import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


def send_otp_email(to_email: str, otp_code: str) -> tuple[bool, str]:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
    sender_email = os.getenv("SMTP_SENDER", smtp_user or "noreply@mindscribe.ai").strip()

    if not smtp_user or not smtp_pass:
        msg = f"SMTP credentials missing in env (SMTP_USER='{smtp_user}', SMTP_PASSWORD={'set' if smtp_pass else 'empty'})"
        print(f"[Email Service Note] {msg}")
        return False, msg

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{otp_code} is your Mindscribe ExamX AI Verification Code"
    msg["From"] = f"Mindscribe ExamX AI <{sender_email}>"
    msg["To"] = to_email

    html_body = f"""
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin: 0;">ExamX <span style="color: #2563eb;">AI</span></h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Verification Code</p>
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.5; text-align: center;">
        Use the 6-digit code below to complete your registration:
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">{otp_code}</span>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
    """

    msg.attach(MIMEText(html_body, "html"))

    # Attempt 1: TLS on port 587 (or configured port)
    err1 = ""
    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, 465, timeout=10)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True, f"Sent via port {smtp_port}"
    except Exception as err587:
        err1 = str(err587)
        print(f"[Email Service Warning] Port {smtp_port} failed: {err587}")

    # Attempt 2: Fallback to SSL on port 465
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
        server.login(smtp_user, smtp_pass)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True, "Sent via fallback SSL port 465"
    except Exception as err465:
        err2 = str(err465)
        print(f"[Email Service Error] Both failed: 587={err1}, 465={err2}")
        return False, f"587 err: {err1} | 465 err: {err2}"
