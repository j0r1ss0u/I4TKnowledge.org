const { onCall } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'joris.galea@i4tknowledge.net',
    pass: 'Labaleine&1827'  // Remplacez par votre mot de passe d'application
  }
});

exports.sendEmail = onCall({
  region: 'us-central1',
  maxInstances: 10,
  cors: "*",
  invoker: "public"  // Cette option est cruciale pour permettre les appels non authentifiés
}, async (request) => {
  // Le reste de votre code reste inchangé
  try {
    const { to, subject, html } = request.data;

    // Vérification des données requises
    if (!to || !subject || !html) {
      throw new Error('Les champs to, subject et html sont requis');
    }

    // Configuration de l'email
    const mailOptions = {
      from: 'I4TK <joris.galea@i4tknowledge.net>',
      to: to,
      subject: subject,
      html: html
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);

    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);

    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'unknown'
      }
    };
  }
});