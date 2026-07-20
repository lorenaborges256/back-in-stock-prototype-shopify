import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let etherealTransportPromise;

function createEmailError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function requireDevelopmentEtherealMode() {
  if (env.nodeEnv !== 'development') {
    throw createEmailError(
      'EMAIL_TRANSPORT_DISABLED',
      'Email delivery is available only in the development environment.'
    );
  }

  if (env.emailMode !== 'ethereal') {
    throw createEmailError(
      'EMAIL_TRANSPORT_DISABLED',
      'Ethereal email testing is disabled by EMAIL_MODE.'
    );
  }
}

function escapeHtml(value) {
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return String(value).replace(/[&<>"']/gu, (character) => replacements[character]);
}

function oneLineText(value) {
  return String(value).replace(/[\r\n]+/gu, ' ').trim();
}

function validatedProductUrl(value) {
  try {
    const productUrl = new URL(String(value));

    if (productUrl.protocol !== 'https:' ) {
      throw new Error('The URL is not HTTPS.');
    }

    return productUrl.toString();
  } catch {
    throw createEmailError(
      'EMAIL_TEMPLATE_INVALID',
      'The notification request does not contain a safe product URL.'
    );
  }
}

function buildEmailContent(notificationRequest) {
  const firstName = oneLineText(notificationRequest.firstName || '');
  const productTitle = oneLineText(notificationRequest.productTitle);
  const variantTitle = oneLineText(notificationRequest.variantTitle);
  const productUrl = validatedProductUrl(notificationRequest.productUrl);
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
  const subject = `Back in stock: ${productTitle} — ${variantTitle}`;

  const text = [
    greeting,
    `${productTitle} (${variantTitle}) is currently available in this development prototype.`,
    `View the product: ${productUrl}`,
    'This notification does not reserve stock. Availability can change before you return to the product page.',
    'This is an Ethereal test preview and was not delivered to a real inbox.'
  ].join('\n\n');

  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p><strong>${escapeHtml(productTitle)}</strong> (${escapeHtml(variantTitle)}) is currently available in this development prototype.</p>`,
    `<p><a href="${escapeHtml(productUrl)}">View the product</a></p>`,
    '<p>This notification does not reserve stock. Availability can change before you return to the product page.</p>',
    '<p><em>This is an Ethereal test preview and was not delivered to a real inbox.</em></p>'
  ].join('\n');

  return { subject, text, html };
}

async function getEtherealTransport() {
  requireDevelopmentEtherealMode();

  if (!etherealTransportPromise) {
    etherealTransportPromise = (async () => {
      const account = await nodemailer.createTestAccount();

      return {
        transporter: nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass
          }
        }),
        from: `"Back-in-Stock Prototype" <${account.user}>`
      };
    })();
  }

  try {
    return await etherealTransportPromise;
  } catch (error) {
    // A failed account-creation attempt must not remain cached for later tests.
    etherealTransportPromise = undefined;
    throw error;
  }
}

/**
 * Sends only through a temporary Ethereal account. Callers must handle both
 * the send result and any persistence update independently so a database
 * failure after sending cannot cause an unsafe automatic resend.
 */
export async function sendBackInStockNotification(notificationRequest) {
  const { transporter, from } = await getEtherealTransport();
  const content = buildEmailContent(notificationRequest);

  const info = await transporter.sendMail({
    from,
    to: notificationRequest.emailDisplay,
    subject: content.subject,
    text: content.text,
    html: content.html
  });

  const messageId = typeof info.messageId === 'string'
    ? info.messageId.slice(0, 255)
    : undefined;
  const previewUrl = nodemailer.getTestMessageUrl(info);

  return {
    messageId,
    previewUrl: typeof previewUrl === 'string' ? previewUrl : null
  };
}