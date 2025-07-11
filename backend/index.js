const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SSLCommerzPayment = require('sslcommerz-lts');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://evotwyhhjcjrtmmdjtar.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b3R3eWhoamNqcnRtbWRqdGFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY4MTU3MCwiZXhwIjoyMDYyMjU3NTcwfQ.cgzgxil8x0x-6bK4Vtt2PkAxq2nLLOcCJAaJRvmrp9k';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = 5050;

// Allow requests from mobile or emulator
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// SSLCommerz configuration
const store_id = "sobol682cd03e147d7";
const store_passwd = "sobol682cd03e147d7@ssl";
const is_live = false; // false = sandbox, true = live

// Your server's local IP so the phone can connect
const BASE_URL = 'http://192.168.0.105:5050';

app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({ success: false, error: 'Missing user_id or amount' });
    }

    const tran_id = `txn_${Date.now()}_${user_id}`;
    const data = {
      total_amount: parseFloat(amount),
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${BASE_URL}/api/payment/success`,
      fail_url: `${BASE_URL}/api/payment/fail`,
      cancel_url: `${BASE_URL}/api/payment/cancel`,
      ipn_url: `${BASE_URL}/api/payment/ipn`,
      shipping_method: 'NO',
      product_name: 'Premium Subscription',
      product_category: 'Digital',
      product_profile: 'general',
      cus_name: 'Sobol User',
      cus_email: `user_${user_id}@sobol.com`,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Sobol User',
      ship_add1: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      value_a: user_id,
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return res.json({ success: true, url: apiResponse.GatewayPageURL, tran_id });
    } else {
      return res.status(500).json({ success: false, error: 'No GatewayPageURL', details: apiResponse });
    }

  } catch (error) {
    console.error('Error initiating payment:', error);
    return res.status(500).json({ success: false, error: 'Payment initiation failed', message: error.message });
  }
});

// Payment Success
app.post('/api/payment/success', async (req, res) => {
  console.log('✅ Payment Success:', req.body);

  const { tran_id, status, value_a } = req.body;

  // Determine user_id: best if you send user_id in value_a from payment initiation, else parse tran_id
  const user_id = value_a || tran_id.split('_').slice(2).join('_');

  if (status === 'VALID' && user_id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq('id', user_id);
        if (!error) {
          console.log('Updated profile data:', data);
        }

      if (error) {
        console.error('❌ Supabase update failed:', error);
      } else {
        console.log(`✅ Profile ${user_id} marked as paid`);
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
    }
  } else {
    console.log('⚠️ Payment status not VALID or user_id missing');
  }

  res.send(`
    <html>
      <body>
        <h2>Payment Successful!</h2>
        <p>Transaction ID: ${tran_id}</p>
        <p>Amount: ${req.body.amount} BDT</p>
        <script> setTimeout(() => window.close(), 3000); </script>
      </body>
    </html>
  `);
});

// Payment Fail
app.post('/api/payment/fail', (req, res) => {
  console.log('❌ Payment Failed:', req.body);
  res.send(`
    <html>
      <body>
        <h2>Payment Failed</h2>
        <p>Transaction ID: ${req.body.tran_id}</p>
        <script> setTimeout(() => window.close(), 3000); </script>
      </body>
    </html>
  `);
});

// Payment Cancel
app.post('/api/payment/cancel', (req, res) => {
  console.log('⚠️ Payment Cancelled:', req.body);
  res.send(`
    <html>
      <body>
        <h2>Payment Cancelled</h2>
        <p>Transaction ID: ${req.body.tran_id}</p>
        <script> setTimeout(() => window.close(), 3000); </script>
      </body>
    </html>
  `);
});

// IPN - server-to-server status updates
app.post('/api/payment/ipn', (req, res) => {
  console.log('📩 IPN received:', req.body);

  // TODO: Verify IPN with SSLCommerz if needed.
  // You can fetch status by hitting SSLCommerz validation endpoint using tran_id or val_id.

  res.status(200).send('IPN OK');
});

// Test and Health Check
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', ip: req.ip, timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', server: 'SSLCommerz Node Server', timestamp: new Date().toISOString() });
});

// Show all registered routes
app.get('/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      routes.push({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      });
    }
  });
  res.json({ routes });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at: http://192.168.0.105:${PORT}`);
});
