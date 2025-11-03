const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Resend } = require('resend');

const app = express();
const OLLAMA_URL = 'http://localhost:11434/api';

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(`${OLLAMA_URL}/generate`, {
      model: 'mistral',
      prompt: req.body.message,
      context: req.body.context || [],
      stream: false
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-invitation-email', async (req, res) => {
  try {
    console.log('Invitation email request received:', req.body);
    
    const { email, invitationId, organizationName, code, language = 'fr' } = req.body;

    if (!email || !invitationId || !code) {
      console.log('Missing required data:', { email, invitationId, code });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const resend = new Resend(resendApiKey);

    const invitationLink = `https://i4tknowledge.org/?email=${encodeURIComponent(email)}&code=${code}#register`;

    const subject = language === 'fr' 
      ? `Invitation à rejoindre ${organizationName || 'notre organisation'}`
      : `Invitation to join ${organizationName || 'our organization'}`;
      
    const htmlContent = language === 'fr'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Vous avez été invité(e) à rejoindre ${organizationName || 'notre organisation'}</h2>
          <p>Vous avez reçu cette invitation pour rejoindre notre plateforme collaborative.</p>
          <p>Cliquez sur le bouton ci-dessous pour accepter cette invitation :</p>
          <a href="${invitationLink}"
             style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            Accepter l'invitation
          </a>
          <p style="margin-top: 20px;">Si le bouton ci-dessus ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #333;">${invitationLink}</p>
          <p>Cette invitation expirera dans 7 jours.</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You have been invited to join ${organizationName || 'our organization'}</h2>
          <p>You have received this invitation to join our collaborative platform.</p>
          <p>Click the button below to accept this invitation:</p>
          <a href="${invitationLink}"
             style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            Accept invitation
          </a>
          <p style="margin-top: 20px;">If the above button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #333;">${invitationLink}</p>
          <p>This invitation will expire in 7 days.</p>
        </div>
      `;

    const emailData = {
      from: 'I4T Knowledge <noreply@i4tknowledge.org>',
      to: [email],
      subject: subject,
      html: htmlContent
    };

    console.log('Sending invitation email to:', email);
    const result = await resend.emails.send(emailData);
    console.log('Invitation email sent successfully:', result);

    // Vérifier si Resend a retourné une erreur (même avec un code 200)
    if (result.error) {
      console.error('Resend API error:', result.error);
      return res.status(500).json({
        error: 'Email service error',
        details: result.error.message || 'Domain verification pending or other Resend error'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation email sent successfully',
      emailId: result.data?.id
    });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    res.status(500).json({
      error: 'Failed to send invitation email',
      details: error.message
    });
  }
});

app.post('/api/send-reset-password-email', async (req, res) => {
  try {
    console.log('Reset password email request received:', req.body);
    
    const { email, resetId, code, language = 'en' } = req.body;

    if (!email || !resetId || !code) {
      console.log('Missing required data:', { email, resetId, code });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const resend = new Resend(resendApiKey);

    const resetLink = `https://i4tknowledge.org/?resetId=${resetId}&code=${code}&lang=${language}#reset-password`;

    const subject = language === 'fr' 
      ? 'Réinitialisation de votre mot de passe'
      : 'Reset your password';
      
    const htmlContent = language === 'fr'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <a href="${resetLink}"
             style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            Réinitialiser mon mot de passe
          </a>
          <p style="margin-top: 20px;">Si le bouton ci-dessus ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #333;">${resetLink}</p>
          <p><strong>Code de réinitialisation :</strong> ${code}</p>
          <p style="color: #666;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
          <p style="color: #666;">Ce lien expirera dans 24 heures.</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You have requested to reset your password.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${resetLink}"
             style="display: inline-block; background-color: #e6a210; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            Reset My Password
          </a>
          <p style="margin-top: 20px;">If the above button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #333;">${resetLink}</p>
          <p><strong>Reset code:</strong> ${code}</p>
          <p style="color: #666;">If you did not request this password reset, you can safely ignore this email.</p>
          <p style="color: #666;">This link will expire in 24 hours.</p>
        </div>
      `;

    const emailData = {
      from: 'I4T Knowledge <noreply@i4tknowledge.org>',
      to: [email],
      subject: subject,
      html: htmlContent
    };

    console.log('Sending reset password email to:', email);
    const result = await resend.emails.send(emailData);
    console.log('Reset password email sent successfully:', result);

    if (result.error) {
      console.error('Resend API error:', result.error);
      return res.status(500).json({
        error: 'Email service error',
        details: result.error.message || 'Domain verification pending or other Resend error'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset password email sent successfully',
      emailId: result.data?.id
    });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    res.status(500).json({
      error: 'Failed to send reset password email',
      details: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Backend server running on port 3000');
  console.log('- Ollama proxy available at /api/chat');
  console.log('- Email service available at /api/send-invitation-email');
  console.log('- Email service available at /api/send-reset-password-email');
});