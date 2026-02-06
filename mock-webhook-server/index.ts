import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const receivedWebhooks: any[] = [];

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'mock-webhook-server' });
});

// Receive webhooks from backend
app.post('/webhook/bank-confirmation', (req: Request, res: Response) => {
    const webhook = {
        receivedAt: new Date().toISOString(),
        body: req.body,
    };

    receivedWebhooks.push(webhook);
    console.log('📩 Received webhook:', JSON.stringify(webhook, null, 2));

    res.status(200).json({
        success: true,
        message: 'Webhook received',
        externalId: `EXT-${Date.now()}`,
    });
});

// View received webhooks
app.get('/webhooks', (_req: Request, res: Response) => {
    res.json({ count: receivedWebhooks.length, webhooks: receivedWebhooks });
});

app.listen(PORT, () => {
    console.log(`🎯 Mock Webhook Server running on http://localhost:${PORT}`);
});
