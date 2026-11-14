from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.coupon import Coupon
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(data: CouponValidateRequest, db: Session = Depends(get_db)):
    if not data.code:
        return CouponValidateResponse(valid=False, message="Coupon code required")

    coupon = db.query(Coupon).filter(Coupon.code == data.code.upper().strip()).first()
    if not coupon or not coupon.active:
        return CouponValidateResponse(valid=False, message="Invalid or expired coupon")

    if coupon.expiresAt and coupon.expiresAt < datetime.now():
        return CouponValidateResponse(valid=False, message="This coupon has expired")

    if coupon.usedCount >= coupon.maxUses:
        return CouponValidateResponse(valid=False, message="This coupon has reached its usage limit")

    if data.subtotal < coupon.minOrder:
        return CouponValidateResponse(
            valid=False,
            message=f"Minimum order of ₹{coupon.minOrder:.2f} required"
        )

    discount = (
        (data.subtotal * coupon.discount) / 100
        if coupon.type == "percentage"
        else coupon.discount
    )
    final_discount = min(discount, data.subtotal)
    msg_type = f"{coupon.discount}% off" if coupon.type == "percentage" else f"₹{coupon.discount} off"

    return CouponValidateResponse(
        valid=True,
        discount=round(final_discount, 2),
        type=coupon.type,
        message=f"Coupon applied! {msg_type}"
    )

