from typing import Optional, List, Any
from pydantic import BaseModel
from app.schemas.order import OrderResponse
from app.schemas.product import ProductResponse

class MonthlyRevenueItem(BaseModel):
    month: str
    revenue: float
    refunded: float
    orders: int
    refundedOrders: int

class OrderStatusCount(BaseModel):
    status: str
    count: int

class DashboardStatsResponse(BaseModel):
    totalRevenue: float
    totalOrders: int
    totalUsers: int
    totalProducts: int
    recentOrders: List[OrderResponse] = []
    monthlyRevenue: List[MonthlyRevenueItem] = []
    ordersByStatus: List[OrderStatusCount] = []

class BestSellerItem(BaseModel):
    product: Optional[ProductResponse] = None
    totalSold: int

