import re
import logging
import httpx
from app.core.config import settings
from app.database.session import SessionLocal
from app.models.order import Order

logger = logging.getLogger("freshbasket.whatsapp")

def normalize_phone_number(phone: str) -> str:
    cleaned = re.sub(r"\D", "", phone)
    if cleaned.startswith("0"):
        cleaned = cleaned[1:]
    if len(cleaned) == 10:
        cleaned = "91" + cleaned
    return cleaned

async def send_whatsapp_message(phone_number: str, user_name: str) -> dict:
    phone_id = settings.WHATSAPP_PHONE_NUMBER_ID
    token = settings.WHATSAPP_ACCESS_TOKEN
    version = settings.WHATSAPP_API_VERSION or "v18.0"

    if not phone_id or not token:
        logger.warning("[WhatsApp] Credentials not configured in .env; skipping notification.")
        return {"success": False, "error": "WhatsApp credentials missing"}

    normalized_phone = normalize_phone_number(phone_number)
    logger.info(f"[WhatsApp] Sending message to {normalized_phone} for user {user_name}")

    url = f"https://graph.facebook.com/{version}/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": normalized_phone,
        "type": "text",
        "text": {
            "body": f"Hey {user_name}, your order has been delivered successfully 🎉\nYou can check your products and leave a review on the website."
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.is_success:
                logger.info(f"[WhatsApp] Message sent successfully to {normalized_phone}")
                return {"success": True}
            else:
                logger.error(f"[WhatsApp] API error ({resp.status_code}): {resp.text}")
                return {"success": False, "error": resp.text}
    except Exception as e:
        logger.error(f"[WhatsApp] Network error: {e}")
        return {"success": False, "error": str(e)}

async def send_delivery_notification(order_id: str, phone: str, user_name: str) -> None:
    try:
        res = await send_whatsapp_message(phone, user_name)
        if res.get("success"):
            db = SessionLocal()
            try:
                order = db.query(Order).filter(Order.id == order_id).first()
                if order:
                    order.whatsappNotified = True
                    db.commit()
                    logger.info(f"[WhatsApp] Set whatsappNotified=True for order {order_id}")
            finally:
                db.close()
    except Exception as e:
        logger.error(f"[WhatsApp] Delivery notification background task failed: {e}")

