import { z } from 'zod';

export const shippingSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().min(5, 'ZIP code must be at least 5 characters'),
});

export const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, 'Review must be at least 10 characters'),
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Full Name is required')
        .regex(/^[A-Za-z\s]+$/, 'Full Name can only contain letters and spaces (no numbers or special characters)'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
    name: z.string().min(2, 'Product name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be positive'),
    comparePrice: z.number().positive().optional().nullable(),
    categoryId: z.string().min(1, 'Category is required'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    unit: z.string().min(1, 'Unit is required'),
    weight: z.string().optional().nullable(),
    featured: z.boolean().optional(),
    images: z.array(z.string()).min(1, 'At least one image is required'),
});

export const couponSchema = z.object({
    code: z.string().min(3, 'Coupon code must be at least 3 characters'),
    discount: z.number().positive('Discount must be positive'),
    type: z.enum(['percentage', 'fixed']),
    minOrder: z.number().min(0).optional(),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
