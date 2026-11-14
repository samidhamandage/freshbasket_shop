from typing import Optional, Dict, Any
from pydantic import BaseModel

class CreatePaymentIntentRequest(BaseModel):
    orderId: str
    amount: float
    currency: str = "inr"

class PaymentIntentResponse(BaseModel):
    clientSecret: str
    paymentIntentId: str

class PaymentStatusResponse(BaseModel):
    status: str
    orderId: str
    paymentStatus: str

