import {
  receiveWhatsAppWebhook,
  verifyWhatsAppWebhook,
} from '@/src/whatsappWebhook';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = verifyWhatsAppWebhook;
export const POST = receiveWhatsAppWebhook;
