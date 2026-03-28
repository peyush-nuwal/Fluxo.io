import nodemailer from "nodemailer";
import logger from "../config/logger.js";

// ========================================
// Email Configuration
// ========================================

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  // Check if required environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      "Email configuration missing: EMAIL_USER and EMAIL_PASSWORD are required",
    );
  }

  const config = {
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  return nodemailer.createTransport(config);
};

// ========================================
// Email Sending
// ========================================

/**
 * Send project invitation email
 */
export const sendProjectInvitation = async (
  collaboratorEmail,
  projectTitle,
  ownerName,
  invitationToken,
  frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000",
) => {
  try {
    const transporter = createTransporter();

    const subject = `You've been invited to collaborate on "${projectTitle}"`;

    const invitationLink = `${frontendUrl}/invitations/accept?token=${encodeURIComponent(invitationToken)}`;
    const logoUrl = `${frontendUrl}/assets/logo.svg`;

    const htmlContent = `
      <div style="margin:0;padding:0;background:#ebe7e2;font-family:'SF Pro Text','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ebe7e2;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;">
                <tr>
                  <td style="background:#ffffff;border:1px solid #d8d3cd;border-radius:8px;padding:36px 34px 30px;">
                    <div style="text-align:center;">
                      <img src="${logoUrl}" alt="Fluxo" width="28" height="28" style="display:inline-block;vertical-align:middle;" />
                      <p style="margin:8px 0 0;font-size:11px;letter-spacing:2.1px;text-transform:uppercase;color:#666666;">Fluxo</p>
                    </div>

                    <h1 style="margin:28px 0 10px;text-align:center;color:#0f0f0f;font-size:46px;line-height:1.05;font-weight:700;letter-spacing:-0.02em;">You're Invited!</h1>

                    <p style="margin:0 auto;text-align:center;max-width:470px;color:#303030;font-size:17px;line-height:1.62;">
                      <strong>${ownerName}</strong> invited you to collaborate on
                      <strong>"${projectTitle}"</strong> in Fluxo.
                    </p>

                    <div style="text-align:center;margin:28px 0 10px;">
                      <a
                        href="${invitationLink}"
                        style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:13px 26px;font-size:14px;font-weight:600;border-radius:2px;"
                      >
                        Accept Invitation
                      </a>
                    </div>

                    <div style="margin:26px auto 24px;text-align:center;">
                      <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Invitation illustration" style="display:block;margin:0 auto;">
                        <rect x="54" y="58" width="112" height="138" rx="14" stroke="#1F1F1F" stroke-width="3"/>
                        <rect x="85" y="75" width="50" height="8" rx="4" fill="#1F1F1F"/>
                        <path d="M86 126h48" stroke="#1F1F1F" stroke-width="3" stroke-linecap="round"/>
                        <path d="M86 142h40" stroke="#1F1F1F" stroke-width="3" stroke-linecap="round"/>
                        <rect x="64" y="98" width="92" height="20" rx="10" stroke="#1F1F1F" stroke-width="3"/>
                        <circle cx="80" cy="108" r="5" stroke="#1F1F1F" stroke-width="3"/>
                        <path d="M94 114c3-4 6-6 10-6 4 0 7 2 10 6" stroke="#1F1F1F" stroke-width="3" stroke-linecap="round"/>
                        <path d="M110 38v14M85 44l-6 10M135 44l6 10M67 64l-10 4M153 64l10 4" stroke="#1F1F1F" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                    </div>

                    <div style="margin:0 auto 26px;max-width:490px;background:#f5f5f5;border:1px solid #e7e7e7;border-radius:6px;padding:16px 18px;">
                      <p style="margin:0;color:#2c2c2c;font-size:14px;line-height:1.6;">
                        This invitation link is valid for 7 days and can only be used once.
                        If you did not expect this invitation, you can safely ignore this email.
                      </p>
                    </div>

                    <p style="margin:0;text-align:center;color:#7a7a7a;font-size:12px;line-height:1.5;">
                      Trouble with the button? Copy and paste this link into your browser:
                    </p>
                    <p style="margin:8px 0 0;text-align:center;word-break:break-all;color:#4e4e4e;font-size:12px;line-height:1.6;">
                      ${invitationLink}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Fluxo.io",
        address: process.env.EMAIL_USER,
      },
      to: collaboratorEmail,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    logger.info(
      `Project invitation email sent successfully to ${collaboratorEmail} for project: ${projectTitle}`,
    );

    return { success: true, message: "Invitation email sent successfully" };
  } catch (error) {
    logger.error("Error sending project invitation email:", {
      error: error.message,
      code: error.code,
      email: collaboratorEmail,
    });

    // Provide more specific error messages
    if (error.code === "EAUTH") {
      throw new Error(
        "Email authentication failed. Please check your email credentials.",
      );
    } else if (error.code === "ECONNECTION") {
      throw new Error(
        "Failed to connect to email service. Please check your internet connection.",
      );
    } else {
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
  }
};
