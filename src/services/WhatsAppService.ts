import prisma from '@/lib/prisma';

type SendMessageResult = {
    success: boolean;
    error?: string;
};

/**
 * Normalizes a phone number to international format without '+' sign.
 * Indian numbers: 7498088327 → 917498088327
 */
function normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters (spaces, dashes, parentheses, plus sign)
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, remove leading zero
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }

    // If 10 digits (Indian local number), prepend country code 91
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    // If starts with 91 and is 12 digits, it's already correct
    // If someone passed +91, the + was already stripped above

    return cleaned;
}

/**
 * Sends a WhatsApp delivery notification using the Meta WhatsApp Cloud API.
 * This function never throws — errors are caught and logged internally.
 */
async function sendWhatsAppMessage(
    phoneNumber: string,
    userName: string
): Promise<SendMessageResult> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

    if (!phoneNumberId || !accessToken) {
        console.error('[WhatsApp] WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN not set in .env');
        return { success: false, error: 'WhatsApp API credentials not configured' };
    }

    // Normalize phone number to international format (e.g., 917498088327)
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    console.info('[WhatsApp] Sending message to:', normalizedPhone, '| User:', userName);

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const body = {
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'text',
        text: {
            body: `Hey ${userName}, your order has been delivered successfully 🎉\nYou can check your products and leave a review on the website.`,
        },
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[WhatsApp] API Error:', {
                status: response.status,
                body: responseText,
            });
            return { success: false, error: `HTTP ${response.status}: ${responseText}` };
        }

        console.info('[WhatsApp] API Success:', {
            status: response.status,
            body: responseText,
        });

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[WhatsApp] Network error:', message);
        return { success: false, error: message };
    }
}

/**
 * Non-blocking function to send a delivery notification and update the order.
 * Call with `void sendDeliveryNotification(...)` to fire-and-forget.
 * Only sets whatsappNotified=true on successful API response.
 */
export async function sendDeliveryNotification(
    orderId: string,
    phoneNumber: string,
    userName: string
): Promise<void> {
    try {
        const result = await sendWhatsAppMessage(phoneNumber, userName);

        if (result.success) {
            await prisma.order.update({
                where: { id: orderId },
                data: { whatsappNotified: true },
            });
            console.info(`[WhatsApp] ✅ Delivery notification sent for order ${orderId}`);
        } else {
            // DO NOT set whatsappNotified = true on failure → allows retry
            console.error(`[WhatsApp] ❌ Failed for order ${orderId}:`, result.error);
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[WhatsApp] ❌ Unexpected error for order ${orderId}:`, message);
    }
}
