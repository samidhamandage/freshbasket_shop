from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.validators import generate_slug
from app.core.redis_client import cache_manager

class ProductService:
    @staticmethod
    def get_products(
        db: Session,
        category_slug: Optional[str] = None,
        featured: Optional[bool] = None,
        search: Optional[str] = None,
        limit: int = 20,
        skip: int = 0
    ) -> List[Product]:
        cache_key = f"products:{category_slug or 'all'}:{featured}:{search or ''}:{limit}:{skip}"
        cached = cache_manager.get(cache_key)
        if cached:
            # We will return cached data when available, but to keep ORM objects consistent
            pass

        query = db.query(Product).options(joinedload(Product.category))

        if category_slug:
            query = query.join(Product.category).filter(Category.slug == category_slug)

        if featured is not None:
            query = query.filter(Product.featured == featured)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Product.name.ilike(search_term)) | (Product.description.ilike(search_term))
            )

        products = query.order_by(Product.createdAt.desc()).offset(skip).limit(limit).all()
        return products

    @staticmethod
    def get_product_by_slug(db: Session, slug: str) -> Product:
        product = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.reviews)
        ).filter(Product.slug == slug).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Product:
        product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    @staticmethod
    def create_product(db: Session, data: ProductCreate) -> Product:
        base_slug = generate_slug(data.name)
        slug = base_slug
        count = 1
        while db.query(Product).filter(Product.slug == slug).first():
            slug = f"{base_slug}-{count}"
            count += 1

        stock_status = (
            "OUT_OF_STOCK" if data.stock == 0 else "LOW_STOCK" if data.stock < 10 else "IN_STOCK"
        )

        product = Product(
            name=data.name,
            slug=slug,
            description=data.description,
            price=data.price,
            comparePrice=data.comparePrice,
            images=data.images,
            categoryId=data.categoryId,
            stock=data.stock,
            stockStatus=stock_status,
            unit=data.unit,
            weight=data.weight,
            featured=data.featured,
            rating=0.0,
            reviewCount=0
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        cache_manager.invalidate("products:*")
        return product

    @staticmethod
    def update_product(db: Session, product_id: str, data: ProductUpdate) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(product, key, value)

        if "stock" in update_dict:
            product.stockStatus = (
                "OUT_OF_STOCK" if product.stock == 0 else "LOW_STOCK" if product.stock < 10 else "IN_STOCK"
            )

        db.commit()
        db.refresh(product)
        cache_manager.invalidate("products:*")
        return product

    @staticmethod
    def delete_product(db: Session, product_id: str) -> None:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        db.delete(product)
        db.commit()
        cache_manager.invalidate("products:*")

