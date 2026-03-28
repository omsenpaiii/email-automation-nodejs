import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { smtp, to, subject, text } = body;

    if (!smtp || !to || !subject || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create transporter securely in memory for this request
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port),
      secure: Number(smtp.port) === 465, // true for 465, false for other ports
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: smtp.user,
      to,
      subject,
      text,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
