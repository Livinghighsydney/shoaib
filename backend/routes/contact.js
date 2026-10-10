const router = require('express').Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = 'Shoaib_zaffar_5@hotmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

router.post('/', async (req, res) => {
  const { name, email, subject, message, projectType } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: subject ? `[Portfolio] ${subject}` : `[Portfolio] New message from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B1A10;">New Portfolio Contact</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #555; width: 120px;"><strong>Name</strong></td><td>${name}</td></tr>
            <tr><td style="padding: 6px 0; color: #555;"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${projectType ? `<tr><td style="padding: 6px 0; color: #555;"><strong>Project Type</strong></td><td>${projectType}</td></tr>` : ''}
            ${subject ? `<tr><td style="padding: 6px 0; color: #555;"><strong>Subject</strong></td><td>${subject}</td></tr>` : ''}
          </table>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
