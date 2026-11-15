from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.coupon import Coupon
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])

COUPON_TEMPLATES = {
    "A1B2C3": {"discount": 10.0, "type": "percentage", "minOrder": 500.0, "maxUses": 1000},
    "X2Y5Z7": {"discount": 15.0, "type": "percentage", "minOrder": 800.0, "maxUses": 1000},
    "P8Q2R1": {"discount": 200.0, "type": "fixed", "minOrder": 600.0, "maxUses": 1000},
    "D4E5F6": {"discount": 12.0, "type": "percentage", "minOrder": 500.0, "maxUses": 1000},
    "G7H8J9": {"discount": 250.0, "type": "fixed", "minOrder": 1000.0, "maxUses": 1000},
    "K1L2M3": {"discount": 18.0, "type": "percentage", "minOrder": 800.0, "maxUses": 1000},
    "N4P5Q6": {"discount": 150.0, "type": "fixed", "minOrder": 500.0, "maxUses": 1000},
    "R7S8T9": {"discount": 20.0, "type": "percentage", "minOrder": 1000.0, "maxUses": 1000},
    "U1V2W3": {"discount": 300.0, "type": "fixed", "minOrder": 1200.0, "maxUses": 1000},
    "Z4A5B6": {"discount": 25.0, "type": "percentage", "minOrder": 1500.0, "maxUses": 1000},
}

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(data: CouponValidateRequest, db: Session = Depends(get_db)):
    if not data.code:
        return CouponValidateResponse(valid=False, message="Coupon code required")

    code = data.code.upper().strip()
    coupon = db.query(Coupon).filter(Coupon.code == code).first()

    # Auto-provision defined coupon template if not yet in database
    if not coupon and code in COUPON_TEMPLATES:
        tmpl = COUPON_TEMPLATES[code]
        coupon = Coupon(
            code=code,
            discount=tmpl["discount"],
            type=tmpl["type"],
            minOrder=tmpl["minOrder"],
            maxUses=tmpl["maxUses"],
            usedCount=0,
            active=True
        )
        db.add(coupon)
        db.commit()
        db.refresh(coupon)

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
    disc_val = int(coupon.discount) if float(coupon.discount).is_integer() else coupon.discount
    msg_type = f"{disc_val}% off" if coupon.type == "percentage" else f"₹{disc_val} off"

    return CouponValidateResponse(
        valid=True,
        discount=round(final_discount, 2),
        type=coupon.type,
        message=f"Coupon applied! {msg_type}"
    )

