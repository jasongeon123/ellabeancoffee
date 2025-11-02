import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: string;
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
                <ul>${itemsList}</ul>
                <hr>
                <p class="total">Total: $${orderDetails.total.toFixed(2)}</p>
              </div>

              <p>We'll notify you when your order is ready for pickup at our next location.</p>
              <p>Order ID: ${orderDetails.orderId}</p>

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
