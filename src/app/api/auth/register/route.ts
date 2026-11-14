import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { error: (parsed.error as any).issues?.[0]?.message || (parsed.error as any).errors?.[0]?.message || 'Invalid data' },
                { status: 400 }
            );
        }

        const { name, email, password } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        return NextResponse.json(
            { message: 'Account created', userId: user.id },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
