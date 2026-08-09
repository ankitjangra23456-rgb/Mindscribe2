import os
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


def send_otp_email(to_email: str, otp_code: str) -> tuple[bool, str]:
    # 1. Try HTTP Email API (Brevo / Resend) if configured — best for cloud hosts (Render/AWS/Vercel)
    brevo_api_key = os.getenv("BREVO_API_KEY", "").strip()
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()

    sender_email = os.getenv("SMTP_SENDER", os.getenv("SMTP_USER", "noreply@mindscribe.ai")).strip()

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

    # --- Brevo HTTP API (Port 443) ---
    if brevo_api_key:
        try:
            res = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "accept": "application/json",
                    "api-key": brevo_api_key,
                    "content-type": "application/json"
                },
                json={
                    "sender": {"name": "Mindscribe ExamX AI", "email": sender_email},
                    "to": [{"email": to_email}],
                    "subject": f"{otp_code} is your Mindscribe ExamX AI Verification Code",
                    "htmlContent": html_body
                },
                timeout=5
            )
            if res.status_code in (200, 201, 202):
                print(f"[Email Service] Successfully sent OTP to {to_email} via Brevo HTTP API")
                return True, "Sent via Brevo HTTP API"
            else:
                print(f"[Email Service Warning] Brevo API error ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"[Email Service Warning] Brevo HTTP failed: {e}")

    # --- Resend HTTP API (Port 443 — 100% Free 3,000 emails/mo) ---
    if resend_api_key:
        try:
            from_addr = "onboarding@resend.dev" if "resend.dev" in sender_email or not sender_email.endswith(".com") else sender_email
            # Use onboarding@resend.dev for instant free tier sending
            if not from_addr or "gmail.com" in from_addr:
                from_addr = "onboarding@resend.dev"

            res = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": f"Mindscribe ExamX AI <{from_addr}>",
                    "to": [to_email],
                    "subject": f"{otp_code} is your Mindscribe ExamX AI Verification Code",
                    "html": html_body
                },
                timeout=5
            )
            if res.status_code in (200, 201, 202):
                print(f"[Email Service] Successfully sent OTP to {to_email} via Resend HTTP API")
                return True, "Sent via Resend HTTP API"
            else:
                print(f"[Email Service Warning] Resend API error ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"[Email Service Warning] Resend HTTP failed: {e}")

    # 2. SMTP Fallback (for local development or environments allowing outbound SMTP)
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_user or not smtp_pass:
        msg = f"SMTP credentials missing in env (SMTP_USER='{smtp_user}')"
        print(f"[Email Service Note] {msg}")
        return False, msg

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{otp_code} is your Mindscribe ExamX AI Verification Code"
    msg["From"] = f"Mindscribe ExamX AI <{sender_email}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, 465, timeout=3)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=3)
            server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True, f"Sent via SMTP port {smtp_port}"
    except Exception as err587:
        err1 = str(err587)
        print(f"[Email Service Warning] SMTP port {smtp_port} failed: {err587}")

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=3)
        server.login(smtp_user, smtp_pass)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True, "Sent via fallback SSL port 465"
    except Exception as err465:
        err2 = str(err465)
        print(f"[Email Service Error] All email methods failed for {to_email}: SMTP={err1} | SSL={err2}")
        return False, f"Render blocks SMTP ports 587/465: {err1}"
