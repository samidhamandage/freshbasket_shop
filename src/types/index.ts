export type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
    unit: string;
};

export type ProductWithCategory = {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    categoryId: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    stock: number;
    stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    unit: string;
    weight: string | null;
    featured: boolean;
    rating: number;
    reviewCount: number;
    createdAt: string;
};

export type OrderWithItems = {
    id: string;
    userId: string;
    status: OrderStatusType;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    couponCode: string | null;
    shippingName: string;
    shippingEmail: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    paymentIntentId: string | null;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
    items: {
        id: string;
        productId: string;
        quantity: number;
        price: number;
        name: string;
        image: string | null;
    }[];
    trackingHistory: {
        id: string;
        status: OrderStatusType;
        note: string | null;
        createdAt: string;
    }[];
    user?: {
        name: string | null;
        email: string;
    };
};

export type OrderStatusType =
    | 'PLACED'
    | 'PROCESSING'
    | 'PACKED'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';

export type ReviewWithUser = {
    id: string;
    userId: string;
    productId: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string | null;
        image: string | null;
    };
};

export type ShippingFormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
};

export type DashboardStats = {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    recentOrders: OrderWithItems[];
    monthlyRevenue: { month: string; revenue: number }[];
    ordersByStatus: { status: string; count: number }[];
};

export type CategoryType = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    _count?: { products: number };
};
