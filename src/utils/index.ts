export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(price);
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

export function getStockLabel(stock: number): { label: string; color: string } {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (stock < 10) return { label: `Only ${stock} left`, color: 'text-amber-600 bg-amber-50' };
    return { label: 'In Stock', color: 'text-primary-700 bg-primary-50' };
}

export function getOrderStatusLabel(status: string): { label: string; color: string } {
    const statusMap: Record<string, { label: string; color: string }> = {
        PLACED: { label: 'Order Placed', color: 'bg-charcoal-100 text-charcoal-700' },
        PROCESSING: { label: 'Processing', color: 'bg-amber-100 text-amber-700' },
        PACKED: { label: 'Packed', color: 'bg-emerald-100 text-emerald-700' },
        SHIPPED: { label: 'Shipped', color: 'bg-primary-100 text-primary-700' },
        OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-primary-200 text-primary-900' },
        DELIVERED: { label: 'Delivered', color: 'bg-primary-100 text-primary-800' },
        CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
        REFUNDED: { label: 'Refunded', color: 'bg-charcoal-100 text-charcoal-600' },
    };
    return statusMap[status] || { label: status, color: 'bg-charcoal-100 text-charcoal-700' };
}

export function getStatusStep(status: string): number {
    const steps: Record<string, number> = {
        PLACED: 0,
        PROCESSING: 1,
        PACKED: 2,
        SHIPPED: 3,
        OUT_FOR_DELIVERY: 4,
        DELIVERED: 5,
    };
    return steps[status] ?? 0;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
