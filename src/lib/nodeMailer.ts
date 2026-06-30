import nodemailer from "nodemailer";
const transporter = ()=>{
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 456, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

export async function sendEmail(toMail: string, subject: string, html: string) {
    const transport = transporter();
    try {
        await transport.sendMail({
            from: process.env.SMTP_FROM,
            to: toMail,
            subject: subject,
            html: html,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}  
