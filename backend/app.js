const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Webhook } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['CLERK_SECRET_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is not set in environment variables`);
        process.exit(1);
    }
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});


// Update static file serving
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// HTML routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html'));
});

// Clerk webhook handling
app.post('/api/webhooks/clerk', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        // Verify webhook signature
        const webhook = new Webhook(req.body, req.headers);
        const evt = webhook.verify(process.env.CLERK_WEBHOOK_SECRET);
        
        if (!evt) {
            return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        }
        
        // Handle different webhook events
        switch (evt.type) {
            case 'user.created':
                console.log('New user created:', evt.data);
                break;
            case 'user.updated':
                console.log('User updated:', evt.data);
                break;
            case 'session.created':
                console.log('New session created:', evt.data);
                break;
            case 'session.ended':
                console.log('Session ended:', evt.data);
                break;
            default:
                console.log('Unhandled webhook event:', evt.type);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(400).json({ success: false, message: 'Webhook error' });
    }
});

// Protected route example
app.get('/api/protected', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        // Verify the session token with Clerk
        // In production, use Clerk's SDK or middleware for token verification
        res.json({ success: true, message: 'Protected route accessed' });
    } catch (error) {
        console.error('Error accessing protected route:', error);
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});