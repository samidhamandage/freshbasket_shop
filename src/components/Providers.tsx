'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { useEffect } from 'react';

function SessionAuthWatcher({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (typeof window !== 'undefined' && status === 'authenticated' && session) {
            sessionStorage.setItem('freshbasket_session_active', 'true');
        }
    }, [status, session]);

    return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionAuthWatcher>
                <CartProvider>{children}</CartProvider>
            </SessionAuthWatcher>
        </SessionProvider>
    );
}
