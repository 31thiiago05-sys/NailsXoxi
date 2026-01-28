
interface EmailParams {
    to: string;
    subject: string;
    text: string;
}

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

export async function sendEmail({ to, subject, text }: EmailParams) {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
        console.warn('⚠️ EmailJS not configured. Skipping email.');
        return;
    }

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                accessToken: EMAILJS_PRIVATE_KEY,
                template_params: {
                    to_email: to,
                    subject: subject,
                    message: text,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ EmailJS Error:', errorText);
        } else {
            console.log(`✅ Email sent to ${to}`);
        }
    } catch (error) {
        console.error('❌ Email Network Error:', error);
    }
}
