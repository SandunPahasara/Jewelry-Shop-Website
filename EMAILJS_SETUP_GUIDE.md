# EmailJS Setup Guide for Order Confirmation Emails

## What Was Fixed

✅ Removed duplicate parameter names in email sending  
✅ Cleaned up variable handling  
✅ Added detailed console logging for debugging

## Current Status

⚠️ The code is ready, but you need **real EmailJS credentials** to send emails.

Currently, the credentials are placeholder values:

```
EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE'
EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE'
EMAILJS_ORDER_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE'
```

---

## Step 1: Create EmailJS Account (Free)

1. Go to **[emailjs.com](https://www.emailjs.com/)**
2. Click **Sign Up** (free tier available)
3. Create account with your email

---

## Step 2: Connect Email Service

After signing in:

1. Click **Email Services** in left sidebar
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended) → Click "Gmail" → Follow OAuth setup
   - **Outlook** → Enter email & password
   - **Custom SMTP** → Enter SMTP details

4. Name your service (e.g., "Luxe Jewelry")
5. Click **Create Service**
6. **Copy the Service ID** (looks like `service_xxxxxxxxxxxx`)

---

## Step 3: Create Email Template

1. Click **Email Templates** in left sidebar
2. Click **Create New Template**
3. **Template Name**: `Order Confirmation`
4. **Subject**: `Your Luxe Jewelry Order #{{order_number}} Confirmed`
5. **Email Content** (paste below):

```
Hello {{customer_name}},

Your order has been confirmed! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number: #{{order_number}}
Order Date: {{order_date}}
Payment Method: {{payment_method}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{items_summary}}

Total Amount: {{total_amount}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPPING ADDRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{shipping_address}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estimated Delivery: 3–5 business days
We'll send tracking updates to {{customer_email}}

Thank you for shopping at Luxe Jewelry! 💎

—
Luxe Jewelry | Colombo, Sri Lanka
support@luxejewelry.com
```

6. Click **Save**
7. **Copy the Template ID** (looks like `template_xxxxxxxxxxxx`)

---

## Step 4: Get Your Public Key

1. Click **Account** in left sidebar (or top-right menu)
2. Go to **API Keys** tab
3. **Copy your Public Key** (looks like `xxxxxxxxxxxxxxx`)

---

## Step 5: Update checkout.html

Open [checkout.html](checkout.html#L12-L19) and replace:

```javascript
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY_HERE"; // ← Replace this
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID_HERE"; // ← Replace this
const EMAILJS_ORDER_TEMPLATE_ID = "YOUR_TEMPLATE_ID_HERE"; // ← Replace this
```

With your actual credentials from EmailJS.

**Example:**

```javascript
const EMAILJS_PUBLIC_KEY = "a1b2c3d4e5f6g7h8i9j0";
const EMAILJS_SERVICE_ID = "service_abc123xyz";
const EMAILJS_ORDER_TEMPLATE_ID = "template_order_confirm_v1";
```

---

## Step 6: Test

1. **Hard refresh** your browser: `Ctrl+F5` (or `Cmd+Shift+R` on Mac)
2. Add items to cart
3. Go to **Checkout**
4. Fill in shipping & payment details
5. Click **Place Order**
6. Open **browser console** (`F12` → `Console` tab)

### Expected Console Output (Success):

```
✅ EmailJS initialized
📧 EmailJS Config: {publicKey: "...", serviceId: "...", templateId: "..."}
📧 Email Parameters: {to_email: "user@email.com", customer_name: "John Doe", ...}
✅ Confirmation email sent to user@email.com
```

### If Error:

```
❌ EmailJS Error Details:
   message: "..."
   status: 403
   text: "..."
```

---

## Troubleshooting

### Error: "Invalid Public Key"

- Double-check you copied the **Public Key** correctly from EmailJS Account → API Keys
- Make sure there are no extra spaces

### Error: "Service not found"

- Verify the **Service ID** is correct
- Make sure you **created an email service** in EmailJS

### Error: "Template not found"

- Verify the **Template ID** is correct
- Make sure the template is published (saved)

### Email not received

1. Check spam/junk folder
2. Verify recipient email address is correct
3. Check brower console for specific error
4. Make sure EmailJS service has remaining monthly quota (free tier: 200/month)

### Still Not Working?

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Click **Email Log** to see failed/successful sends
3. Share the error message from the log

---

## Variable Reference

These EXACT variable names must match your EmailJS template:

| Variable           | Description                | Example                               |
| ------------------ | -------------------------- | ------------------------------------- |
| `to_email`         | Customer's email           | user@gmail.com                        |
| `customer_name`    | Customer full name         | Jane Doe                              |
| `customer_phone`   | Phone number               | +94 77 123 4567                       |
| `order_number`     | Order ID                   | LJ-ABC123                             |
| `order_date`       | Order date                 | 15 Apr 2024                           |
| `payment_method`   | Payment type               | Credit Card, PayPal, Cash on Delivery |
| `items_summary`    | List of items              | Product A × 2 — $100.00               |
| `total_amount`     | Total price                | $100.00                               |
| `shipping_address` | Full address               | 123 Main St, City 12345               |
| `customer_email`   | Customer email (duplicate) | user@gmail.com                        |

---

## After Setup

Once emails are working:

- ✅ Customers receive order confirmation emails
- ✅ Emails include order details, items, shipping address
- ✅ Customers can track delivery

Need help? Check the browser console (`F12 → Console`) for detailed error messages!
