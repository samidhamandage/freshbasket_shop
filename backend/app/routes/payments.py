from fastapi import APIRouter, Depends
from app.schemas.payment import CreatePaymentIntentRequest, PaymentIntentResponse
from app.services.payment_service import PaymentService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.post("/create-intent", response_model=PaymentIntentResponse)
def create_payment_intent(
    data: CreatePaymentIntentRequest,
    current_user: User = Depends(get_current_user)
):
    result = PaymentService.create_payment_intent(
        amount=data.amount,
        order_id=data.orderId,
        currency=data.currency
    )
    return PaymentIntentResponse(**result)

