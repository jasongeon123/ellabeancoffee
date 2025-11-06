import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: string;
    orderNumber?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
  }
) {
  try {
    // In production, you would use a proper email template
    // For now, we'll use simple HTML
    const itemsList = orderDetails.items
      .map(
        (item) =>
          `<li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4A2C2A; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-items { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .total { font-size: 20px; font-weight: bold; color: #4A2C2A; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Order!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your order has been confirmed and we're preparing it with care.</p>

              <div class="order-items">
                <h3>Order Details</h3>
                ${orderDetails.orderNumber ? `<p><strong>Order Number: ${orderDetails.orderNumber}</strong></p>` : ""}
                <ul>${itemsList}</ul>
                <hr>
                <p class="total">Total: $${orderDetails.total.toFixed(2)}</p>
              </div>

              <p>We'll notify you when your order is ready for pickup at our next location.</p>
              ${orderDetails.orderNumber ? `<p>Track your order using: <strong>${orderDetails.orderNumber}</strong></p>` : ""}

              <p>Thank you for supporting Ella Bean Coffee!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Ella Bean Coffee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
      console.log("Email would be sent to:", to);
      console.log("Order ID:", orderDetails.orderId);
      console.log("Total:", orderDetails.total);
      return { success: true, message: "Email logging (no API key configured)" };
    }

    await resend.emails.send({
      from: "Ella Bean Coffee <orders@ellabean.coffee>",
      to,
      subject: `Order Confirmation - Ella Bean Coffee`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendEmailChangeVerification(
  to: string,
  token: string,
  userName?: string | null
) {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/account/verify-email-change?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4A2C2A; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button {
              display: inline-block;
              background: #4A2C2A;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .code {
              background: #f4f4f4;
              padding: 2px 8px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Verify Your New Email</h1>
            </div>
            <div class="content">
              <p>Hello${userName ? ' ' + userName : ''},</p>
              <p>You've requested to change your email address for your Ella Bean Coffee account.</p>

              <p><strong>To complete this change, please click the button below:</strong></p>

              <a href="${verificationUrl}" class="button">Verify New Email Address</a>

              <p>Or copy and paste this link into your browser:</p>
              <p class="code">${verificationUrl}</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>If you didn't request this change, please ignore this email</li>
                  <li>Your current email address will remain active until verification</li>
                </ul>
              </div>

              <p>After verification, this email address will be your new login email.</p>

              <p>Stay caffeinated,<br>The Ella Bean Coffee Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Ella Bean Coffee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
      console.log("Verification email would be sent to:", to);
      console.log("Verification URL:", verificationUrl);
      return { success: true, message: "Email logging (no API key configured)" };
    }

    await resend.emails.send({
      from: "Ella Bean Coffee <security@ellabean.coffee>",
      to,
      subject: "Verify Your New Email Address - Ella Bean Coffee",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
}

export async function sendEmailChangeNotification(
  to: string,
  newEmail: string,
  userName?: string | null
) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert {
              background: #f8d7da;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
              color: #721c24;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .email-display {
              background: #f4f4f4;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Email Change Request</h1>
            </div>
            <div class="content">
              <p>Hello${userName ? ' ' + userName : ''},</p>
              <p>We wanted to notify you that a request has been made to change the email address on your Ella Bean Coffee account.</p>

              <div class="email-display">
                New email address: ${newEmail}
              </div>

              <div class="alert">
                <strong>⚠️ Important Security Alert:</strong>
                <p><strong>If you made this request:</strong></p>
                <ul>
                  <li>Check your new email inbox for a verification link</li>
                  <li>The change won't take effect until verified</li>
                  <li>The verification link expires in 1 hour</li>
                </ul>

                <p><strong>If you did NOT make this request:</strong></p>
                <ul>
                  <li>Your account may be compromised</li>
                  <li>Change your password immediately</li>
                  <li>The email change will NOT complete without verification</li>
                  <li>Contact us if you need assistance</li>
                </ul>
              </div>

              <p>Your current email address (<strong>${to}</strong>) will remain active until the new email is verified.</p>

              <p>Stay secure,<br>The Ella Bean Coffee Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Ella Bean Coffee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
      console.log("Notification email would be sent to:", to);
      console.log("New email:", newEmail);
      return { success: true, message: "Email logging (no API key configured)" };
    }

    await resend.emails.send({
      from: "Ella Bean Coffee <security@ellabean.coffee>",
      to,
      subject: "⚠️ Email Change Request - Action Required",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return { success: false, error };
  }
}

export async function sendShippingNotificationEmail(
  to: string,
  orderDetails: {
    orderNumber: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    items: Array<{ name: string; quantity: number }>;
  }
) {
  try {
    const itemsList = orderDetails.items
      .map((item) => `<li>${item.quantity}x ${item.name}</li>`)
      .join("");

    const trackingInfo = orderDetails.trackingNumber
      ? `
        <div class="tracking-info">
          <h3>Tracking Information</h3>
          <p><strong>Tracking Number:</strong> <span class="code">${orderDetails.trackingNumber}</span></p>
          ${orderDetails.carrier ? `<p><strong>Carrier:</strong> ${orderDetails.carrier}</p>` : ""}
          ${orderDetails.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>` : ""}
        </div>
      `
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4A2C2A; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .tracking-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4A2C2A; }
            .order-items { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .code { background: #f4f4f4; padding: 5px 10px; border-radius: 3px; font-family: monospace; }
            .icon { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Your Order Has Shipped!</h1>
            </div>
            <div class="content">
              <div class="icon">🚚</div>
              <p>Great news! Your Ella Bean Coffee order is on its way.</p>

              <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>

              ${trackingInfo}

              <div class="order-items">
                <h3>Items Being Delivered</h3>
                <ul>${itemsList}</ul>
              </div>

              <p>Your coffee is being carefully transported and will arrive soon. We can't wait for you to enjoy it!</p>

              <p>If you have any questions about your shipment, please don't hesitate to reach out.</p>

              <p>Thank you for choosing Ella Bean Coffee!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Ella Bean Coffee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
      console.log("Shipping notification would be sent to:", to);
      console.log("Order Number:", orderDetails.orderNumber);
      return { success: true, message: "Email logging (no API key configured)" };
    }

    await resend.emails.send({
      from: "Ella Bean Coffee <shipping@ellabean.coffee>",
      to,
      subject: `Your Order Has Shipped! - Order #${orderDetails.orderNumber}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send shipping notification:", error);
    return { success: false, error };
  }
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  orderDetails: {
    orderNumber: string;
    status: string;
    statusMessage: string;
    items?: Array<{ name: string; quantity: number }>;
  }
) {
  try {
    const statusColors: { [key: string]: string } = {
      pending: "#ffc107",
      processing: "#17a2b8",
      shipped: "#28a745",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };

    const statusEmojis: { [key: string]: string } = {
      pending: "⏳",
      processing: "⚙️",
      shipped: "📦",
      delivered: "✅",
      cancelled: "❌",
    };

    const color = statusColors[orderDetails.status] || "#4A2C2A";
    const emoji = statusEmojis[orderDetails.status] || "📋";

    const itemsList = orderDetails.items
      ? `
        <div class="order-items">
          <h3>Order Items</h3>
          <ul>${orderDetails.items.map((item) => `<li>${item.quantity}x ${item.name}</li>`).join("")}</ul>
        </div>
      `
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${color}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .status-badge { background: ${color}; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .order-items { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emoji} Order Status Update</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your Ella Bean Coffee order has been updated.</p>

              <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>

              <div class="status-badge">${orderDetails.status.toUpperCase()}</div>

              <p>${orderDetails.statusMessage}</p>

              ${itemsList}

              <p>You can track your order status at any time using your order number.</p>

              <p>Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Ella Bean Coffee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
      console.log("Status update email would be sent to:", to);
      console.log("Order Number:", orderDetails.orderNumber);
      console.log("Status:", orderDetails.status);
      return { success: true, message: "Email logging (no API key configured)" };
    }

    await resend.emails.send({
      from: "Ella Bean Coffee <orders@ellabean.coffee>",
      to,
      subject: `Order Update: ${orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)} - #${orderDetails.orderNumber}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send status update email:", error);
    return { success: false, error };
  }
}

export async function sendAbandonedCartEmail(
  to: string,
  cartDetails: {
    userName?: string;
    items: Array<{ name: string; quantity: number; price: number; imageUrl?: string }>;
    total: number;
  }
) {
  try {
    const itemsList = cartDetails.items
      .map(
        (item) => `
        <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee;">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-right: 15px;" />`
              : ""
          }
          <div style="flex: 1;">
            <strong>${item.name}</strong><br />
            <span style="color: #666;">Qty: ${item.quantity}</span>
          </div>
          <div style="font-weight: bold; color: #4A2C2A;">
            $${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4A2C2A; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .cart-items { background: white; border-radius: 5px; margin: 20px 0; overflow: hidden; }
            .total { background: #4A2C2A; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; }
            .cta-button {
              display: inline-block;
              background: #4A2C2A;
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .discount-box {
              background: #fff3cd;
              border: 2px dashed #ffc107;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☕ Your Coffee is Waiting!</h1>
            </div>
            <div class="content">
              <p>Hello${cartDetails.userName ? " " + cartDetails.userName : ""},</p>
              <p>We noticed you left some delicious coffee in your cart. Don't let your perfect brew get away!</p>

              <div class="cart-items">
                ${itemsList}
                <div class="total">
                  Total: $${cartDetails.total.toFixed(2)}
                </div>
              </div>

              <div class="discount-box">
                <h3 style="margin-top: 0; color: #856404;">🎁 Special Offer Just For You!</h3>
                <p style="margin-bottom: 0; font-size: 18px;">Complete your purchase today and enjoy your premium coffee!</p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/cart" class="cta-button">Complete Your Order</a>
              </div>

              <p style="text-align: center; color: #666; font-size: 14px;">
                This is a friendly reminder about items in your cart. If you've already completed your purchase, please disregard this email.
              </p>

              <p>Questions? We're here to help! Reach out to us anytime.</p>

              <p>Happy brewing!<br>The Ella Bean Coffee Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Ella Bean Coffee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
      console.log("Abandoned cart email would be sent to:", to);
      console.log("Cart total:", cartDetails.total);
      return { success: true, message: "Email logging (no API key configured)" };
    }

    await resend.emails.send({
      from: "Ella Bean Coffee <hello@ellabean.coffee>",
      to,
      subject: "☕ Your Coffee is Waiting - Complete Your Order!",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send abandoned cart email:", error);
    return { success: false, error };
  }
}
