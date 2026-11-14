from fastapi import APIRouter, Request, Header, HTTPException, status
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature")
):
    if not stripe_signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing stripe signature")
    payload = await request.body()
    return PaymentService.handle_webhook_event(payload, stripe_signature)

