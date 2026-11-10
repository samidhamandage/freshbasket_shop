import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@freshbasket.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@freshbasket.com',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    // Create test user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@freshbasket.com' },
        update: {},
        create: {
            name: 'John Doe',
            email: 'user@freshbasket.com',
            password: userPassword,
            role: 'USER',
        },
    });

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'fruits-vegetables' },
            update: {},
            create: {
                name: 'Fruits & Vegetables',
                slug: 'fruits-vegetables',
                description: 'Fresh organic fruits and vegetables',
                image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'dairy-eggs' },
            update: {},
            create: {
                name: 'Dairy & Eggs',
                slug: 'dairy-eggs',
                description: 'Farm fresh dairy products and eggs',
                image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'bakery' },
            update: {},
            create: {
                name: 'Bakery',
                slug: 'bakery',
                description: 'Freshly baked goods and bread',
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'meat-seafood' },
            update: {},
            create: {
                name: 'Meat & Seafood',
                slug: 'meat-seafood',
                description: 'Premium quality meat and seafood',
                image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'beverages' },
            update: {},
            create: {
                name: 'Beverages',
                slug: 'beverages',
                description: 'Refreshing drinks and beverages',
                image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'snacks' },
            update: {},
            create: {
                name: 'Snacks',
                slug: 'snacks',
                description: 'Delicious snacks and munchies',
                image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'pantry' },
            update: {},
            create: {
                name: 'Pantry',
                slug: 'pantry',
                description: 'Essential pantry staples',
                image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'frozen' },
            update: {},
            create: {
                name: 'Frozen Foods',
                slug: 'frozen',
                description: 'Frozen meals and ingredients',
                image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
            },
        }),
    ]);

    // Create products
    const products = [
        { name: 'Organic Bananas', slug: 'organic-bananas', description: 'Sweet and ripe organic bananas, perfect for smoothies, baking, or a healthy snack. Sourced from sustainable farms.', price: 2.49, comparePrice: 3.49, images: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600', categoryId: categories[0].id, stock: 150, unit: 'bunch', weight: '1 lb', featured: true, rating: 4.8, reviewCount: 124 },
        { name: 'Fresh Strawberries', slug: 'fresh-strawberries', description: 'Plump, juicy strawberries hand-picked at peak ripeness. Perfect for desserts, salads, or eating fresh.', price: 4.99, comparePrice: 6.99, images: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600', categoryId: categories[0].id, stock: 75, unit: 'pack', weight: '1 lb', featured: true, rating: 4.9, reviewCount: 89 },
        { name: 'Avocados', slug: 'avocados', description: 'Creamy Hass avocados, perfectly ripe and ready to eat. Great for guacamole, toast, or salads.', price: 1.99, images: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600', categoryId: categories[0].id, stock: 200, unit: 'each', weight: '200g', featured: true, rating: 4.7, reviewCount: 156 },
        { name: 'Baby Spinach', slug: 'baby-spinach', description: 'Tender baby spinach leaves, pre-washed and ready to use. Perfect for salads, smoothies, and cooking.', price: 3.49, images: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600', categoryId: categories[0].id, stock: 90, unit: 'bag', weight: '5 oz', rating: 4.5, reviewCount: 67 },
        { name: 'Red Bell Peppers', slug: 'red-bell-peppers', description: 'Sweet, crunchy red bell peppers. Rich in vitamin C and perfect for salads, stir-fry, or roasting.', price: 1.79, images: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600', categoryId: categories[0].id, stock: 120, unit: 'each', weight: '200g', rating: 4.6, reviewCount: 45 },
        { name: 'Organic Whole Milk', slug: 'organic-whole-milk', description: 'Fresh organic whole milk from grass-fed cows. Rich, creamy, and perfect for drinking, cooking, or baking.', price: 5.99, comparePrice: 7.49, images: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600', categoryId: categories[1].id, stock: 60, unit: 'gallon', weight: '1 gal', featured: true, rating: 4.8, reviewCount: 203 },
        { name: 'Free Range Eggs', slug: 'free-range-eggs', description: 'Farm-fresh free range eggs from pasture-raised hens. Rich golden yolks and superior flavor.', price: 4.49, images: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600', categoryId: categories[1].id, stock: 100, unit: 'dozen', weight: '12 eggs', featured: true, rating: 4.9, reviewCount: 178 },
        { name: 'Greek Yogurt', slug: 'greek-yogurt', description: 'Thick and creamy Greek yogurt, packed with protein. Perfect for breakfast, snacking, or cooking.', price: 3.99, images: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', categoryId: categories[1].id, stock: 85, unit: 'tub', weight: '32 oz', rating: 4.7, reviewCount: 92 },
        { name: 'Aged Cheddar Cheese', slug: 'aged-cheddar-cheese', description: 'Sharp aged cheddar cheese, perfectly matured for bold flavor. Great for sandwiches, burgers, and snacking.', price: 6.99, images: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=600', categoryId: categories[1].id, stock: 45, unit: 'block', weight: '8 oz', rating: 4.6, reviewCount: 55 },
        { name: 'Sourdough Bread', slug: 'sourdough-bread', description: 'Artisan sourdough bread with a crispy crust and tangy, chewy interior. Made with a 100-year-old starter.', price: 5.49, comparePrice: 6.99, images: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600', categoryId: categories[2].id, stock: 30, unit: 'loaf', weight: '1 lb', featured: true, rating: 4.9, reviewCount: 267 },
        { name: 'Croissants', slug: 'croissants', description: 'Buttery, flaky French croissants baked fresh daily. Perfect for breakfast with jam or as a sandwich base.', price: 3.99, images: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600', categoryId: categories[2].id, stock: 50, unit: 'pack of 4', weight: '8 oz', rating: 4.8, reviewCount: 134 },
        { name: 'Chocolate Chip Cookies', slug: 'chocolate-chip-cookies', description: 'Gooey chocolate chip cookies made with premium dark chocolate and real butter. Soft center, crispy edges.', price: 4.49, images: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600', categoryId: categories[2].id, stock: 60, unit: 'pack of 6', weight: '12 oz', rating: 4.7, reviewCount: 89 },
        { name: 'Salmon Fillet', slug: 'salmon-fillet', description: 'Wild-caught Atlantic salmon fillet, rich in omega-3 fatty acids. Perfect for grilling, baking, or pan-searing.', price: 12.99, comparePrice: 15.99, images: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600', categoryId: categories[3].id, stock: 25, unit: 'fillet', weight: '8 oz', featured: true, rating: 4.8, reviewCount: 76 },
        { name: 'Chicken Breast', slug: 'chicken-breast', description: 'Boneless, skinless chicken breast. Lean, versatile, and perfect for any recipe from grilling to stir-fry.', price: 7.99, images: 'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=600', categoryId: categories[3].id, stock: 80, unit: 'pack', weight: '1 lb', rating: 4.6, reviewCount: 143 },
        { name: 'Ground Beef', slug: 'ground-beef', description: 'Premium 80/20 ground beef, perfect for burgers, tacos, pasta sauce, and more. From grass-fed cattle.', price: 8.99, images: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600', categoryId: categories[3].id, stock: 65, unit: 'pack', weight: '1 lb', rating: 4.5, reviewCount: 98 },
        { name: 'Cold Pressed Orange Juice', slug: 'cold-pressed-orange-juice', description: 'Freshly squeezed, cold-pressed orange juice with no added sugar. Pure, refreshing, and packed with vitamin C.', price: 6.49, comparePrice: 7.99, images: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600', categoryId: categories[4].id, stock: 40, unit: 'bottle', weight: '32 oz', featured: true, rating: 4.7, reviewCount: 112 },
        { name: 'Green Tea', slug: 'green-tea', description: 'Premium Japanese green tea bags. Smooth, delicate flavor with natural antioxidants. Single origin Sencha.', price: 4.99, images: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600', categoryId: categories[4].id, stock: 100, unit: 'box', weight: '20 bags', rating: 4.6, reviewCount: 78 },
        { name: 'Sparkling Water', slug: 'sparkling-water', description: 'Naturally carbonated sparkling mineral water. Crisp, clean, and refreshing. Zero calories, zero sweeteners.', price: 1.29, images: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600', categoryId: categories[4].id, stock: 200, unit: 'bottle', weight: '1 L', rating: 4.4, reviewCount: 56 },
        { name: 'Mixed Nuts', slug: 'mixed-nuts', description: 'Premium roasted mixed nuts including almonds, cashews, walnuts, and pecans. Lightly salted for perfect flavor.', price: 8.99, comparePrice: 10.99, images: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600', categoryId: categories[5].id, stock: 70, unit: 'bag', weight: '12 oz', featured: true, rating: 4.8, reviewCount: 167 },
        { name: 'Dark Chocolate Bar', slug: 'dark-chocolate-bar', description: '72% cacao single-origin dark chocolate bar. Rich, complex flavor with notes of berry and espresso.', price: 3.99, images: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600', categoryId: categories[5].id, stock: 90, unit: 'bar', weight: '3.5 oz', rating: 4.7, reviewCount: 134 },
        { name: 'Extra Virgin Olive Oil', slug: 'extra-virgin-olive-oil', description: 'Cold-pressed extra virgin olive oil from Italian olives. Rich, fruity flavor perfect for cooking and dressing.', price: 9.99, comparePrice: 12.99, images: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', categoryId: categories[6].id, stock: 55, unit: 'bottle', weight: '16.9 oz', featured: true, rating: 4.9, reviewCount: 201 },
        { name: 'Basmati Rice', slug: 'basmati-rice', description: 'Premium aged basmati rice, long grain and aromatic. Perfect for biryanis, pilafs, and everyday meals.', price: 5.49, images: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', categoryId: categories[6].id, stock: 120, unit: 'bag', weight: '2 lb', rating: 4.6, reviewCount: 89 },
        { name: 'Organic Pasta', slug: 'organic-pasta', description: 'Organic durum wheat penne pasta. Bronze die-cut for better sauce adhesion. Cooks to perfect al dente.', price: 2.99, images: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600', categoryId: categories[6].id, stock: 150, unit: 'box', weight: '16 oz', rating: 4.5, reviewCount: 67 },
        { name: 'Frozen Mixed Berries', slug: 'frozen-mixed-berries', description: 'Flash-frozen mixed berries including blueberries, raspberries, and strawberries. Perfect for smoothies and baking.', price: 5.99, images: 'https://images.unsplash.com/photo-1425934398893-310a009a77f9?w=600', categoryId: categories[7].id, stock: 45, unit: 'bag', weight: '16 oz', featured: true, rating: 4.7, reviewCount: 123 },
        { name: 'Ice Cream', slug: 'vanilla-ice-cream', description: 'Premium Madagascar vanilla bean ice cream. Rich, creamy, and made with real vanilla beans and organic cream.', price: 6.99, images: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', categoryId: categories[7].id, stock: 35, unit: 'pint', weight: '16 oz', rating: 4.8, reviewCount: 145 },
        { name: 'Frozen Pizza', slug: 'frozen-pizza', description: 'Artisan frozen Margherita pizza with hand-stretched dough, San Marzano tomato sauce, and fresh mozzarella.', price: 7.99, images: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', categoryId: categories[7].id, stock: 8, unit: 'pizza', weight: '12 inch', rating: 4.5, reviewCount: 78 },
        { name: 'Organic Blueberries', slug: 'organic-blueberries', description: 'Plump, sweet organic blueberries bursting with antioxidants. Perfect for snacking, smoothies, and baking.', price: 5.49, images: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600', categoryId: categories[0].id, stock: 55, unit: 'pint', weight: '6 oz', rating: 4.8, reviewCount: 92 },
        { name: 'Almond Butter', slug: 'almond-butter', description: 'Creamy almond butter made from dry-roasted almonds. No added sugar, salt, or oil. Pure nutty goodness.', price: 8.49, images: 'https://images.unsplash.com/photo-1612187715604-1964e5aae67e?w=600', categoryId: categories[6].id, stock: 40, unit: 'jar', weight: '12 oz', rating: 4.7, reviewCount: 56 },
        { name: 'Kombucha', slug: 'ginger-kombucha', description: 'Organic ginger-lemon kombucha, raw and unpasteurized. Probiotic-rich, fizzy, and naturally detoxifying.', price: 3.49, images: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600', categoryId: categories[4].id, stock: 65, unit: 'bottle', weight: '16 oz', rating: 4.5, reviewCount: 43 },
        { name: 'Shrimp', slug: 'wild-caught-shrimp', description: 'Wild-caught jumbo shrimp, peeled and deveined. Sweet, tender, and perfect for shrimp scampi or cocktail.', price: 14.99, images: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600', categoryId: categories[3].id, stock: 20, unit: 'bag', weight: '1 lb', rating: 4.6, reviewCount: 67 },
    ];

    for (const product of products) {
        const stockStatus = product.stock === 0 ? 'OUT_OF_STOCK' : product.stock < 10 ? 'LOW_STOCK' : 'IN_STOCK';
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {},
            create: { ...product, stockStatus },
        });
    }

    // Create coupons
    await prisma.coupon.upsert({
        where: { code: 'FRESH10' },
        update: {},
        create: {
            code: 'FRESH10',
            discount: 10,
            type: 'percentage',
            minOrder: 25,
            maxUses: 1000,
        },
    });

    await prisma.coupon.upsert({
        where: { code: 'SAVE5' },
        update: {},
        create: {
            code: 'SAVE5',
            discount: 5,
            type: 'fixed',
            minOrder: 30,
            maxUses: 500,
        },
    });

    await prisma.coupon.upsert({
        where: { code: 'WELCOME20' },
        update: {},
        create: {
            code: 'WELCOME20',
            discount: 20,
            type: 'percentage',
            minOrder: 50,
            maxUses: 200,
        },
    });

    console.log('✅ Seed completed successfully');
    console.log(`   Admin: admin@freshbasket.com / admin123`);
    console.log(`   User: user@freshbasket.com / user123`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Coupons: 3 (FRESH10, SAVE5, WELCOME20)`);
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
