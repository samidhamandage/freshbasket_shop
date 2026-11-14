import logging
from typing import Optional, Dict, Any
import stripe
from fastapi import HTTPException, status
from app.core.config import settings
from app.database.session import SessionLocal
from app.models.order import Order

logger = logging.getLogger("freshbasket.payment")
stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    @staticmethod
    def create_payment_intent(amount: float, order_id: str, currency: str = "inr") -> Dict[str, str]:
        if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "sk_test_placeholder":
            # Test mock client secret if stripe key is dummy
            mock_id = f"pi_mock_{order_id}"
            return {
                "clientSecret": f"{mock_id}_secret_mock",
                "paymentIntentId": mock_id
            }

        try:
            # Stripe requires amount in smallest currency unit (paise for INR)
            amount_in_cents = int(round(amount * 100))
            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency=currency.lower(),
                metadata={"orderId": order_id},
                automatic_payment_methods={"enabled": True}
            )
            return {
                "clientSecret": intent.client_secret,
                "paymentIntentId": intent.id
            }
        except Exception as e:
            logger.error(f"Stripe PaymentIntent error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment processing error: {str(e)}"
            )

    @staticmethod
    def handle_webhook_event(payload: bytes, sig_header: str) -> Dict[str, Any]:
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        if not webhook_secret or webhook_secret == "whsec_placeholder":
            return {"received": True, "note": "Stripe webhook secret not configured"}

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            logger.error(f"Stripe webhook signature validation failed: {e}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            order_id = payment_intent.get("metadata", {}).get("orderId")
            if order_id:
                db = SessionLocal()
                try:
                    order = db.query(Order).filter(Order.id == order_id).first()
                    if order:
                        order.paymentStatus = "completed"
                        order.paymentIntentId = payment_intent.get("id")
                        db.commit()
                        logger.info(f"Payment marked completed for order {order_id}")
                finally:
                    db.close()

        return {"received": True, "type": event["type"]}

