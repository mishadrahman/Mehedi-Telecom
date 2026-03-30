import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFirebaseErrorMessage(error: any): string {
  if (!error || !error.code) return error?.message || "An unknown error occurred";
  
  switch (error.code) {
    case 'auth/user-not-found':
      return "No account found with this email.";
    case 'auth/wrong-password':
      return "Incorrect password. Please try again.";
    case 'auth/email-already-in-use':
      return "An account already exists with this email.";
    case 'auth/weak-password':
      return "Password should be at least 6 characters.";
    case 'auth/invalid-email':
      return "Please enter a valid email address.";
    case 'auth/network-request-failed':
      return "Network error. Please check your connection.";
    case 'permission-denied':
      return "You don't have permission to perform this action.";
    default:
      return error.message;
  }
}

const TELEGRAM_BOT_TOKEN = "8509503437:AAFFirfKZf9alvZJwUxdaKmNLPrad2m-91Y";
const TELEGRAM_CHANNEL_ID = "-1002284201399";

export async function uploadToTelegram(file: File, caption: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("chat_id", TELEGRAM_CHANNEL_ID);
    formData.append("photo", file);
    formData.append("caption", caption);

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!data.ok) throw new Error("Telegram upload failed");

    const fileId = data.result.photo[data.result.photo.length - 1].file_id;
    
    // Get file path
    const fileResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json();
    if (!fileData.ok) throw new Error("Failed to get file path from Telegram");

    const filePath = fileData.result.file_path;
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
  } catch (error) {
    console.error("Telegram upload error:", error);
    throw new Error("Image upload failed. Please check your network connection or try a smaller image.");
  }
}

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const payload = {
    Host: "smtp.gmail.com",
    Username: "prahad010@gmail.com",
    Password: "dlre rpzv rost myss",
    To: to,
    From: "prahad010@gmail.com",
    Subject: subject,
    Body: body,
    Action: "Send",
    nocache: Math.floor(1e6 * Math.random() + 1)
  };

  const jsonPayload = JSON.stringify(payload);
  
  const endpoints = [
    "https://smtpjs.com/v3/smtpjs.aspx?",
    "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent("https://smtpjs.com/v3/smtpjs.aspx?"),
    "https://corsproxy.io/?" + encodeURIComponent("https://smtpjs.com/v3/smtpjs.aspx?")
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout per endpoint

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: jsonPayload,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const text = await response.text();
      if (text === "OK") {
        return true;
      }
    } catch (error) {
      // Silently catch network errors/aborts and try the next endpoint
    }
  }

  // If all endpoints fail (e.g., due to strict adblockers), we resolve gracefully
  // instead of throwing an error, so it doesn't break the user experience.
  console.warn("Email notification could not be sent (likely blocked by browser/adblocker).");
  return false;
}

export async function sendOrderToTelegram(orderData: any) {
  const message = `
📦 *New Order Received!*
--------------------------
👤 *Customer:* ${orderData.customerName}
📧 *Email:* ${orderData.userEmail || 'N/A'}
📞 *Phone:* ${orderData.phone}
🏠 *Address:* ${orderData.address}
💰 *Total:* ৳${orderData.totalPrice}
💳 *Payment:* ${orderData.paymentMethod}
--------------------------
🛒 *Items:*
${orderData.items.map((item: any) => `- ${item.name} (x${item.quantity}) - ৳${item.price * item.quantity}`).join('\n')}
--------------------------
Status: Pending
  `;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.warn("Telegram notification failed (likely blocked by network/adblocker):", error);
    // We catch this silently so it doesn't break the user's checkout flow
  }
}
