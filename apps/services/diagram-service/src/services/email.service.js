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
  frontendUrl = process.env.FRONTEND_URL || "http://localhost:4000",
) => {
  try {
    const transporter = createTransporter();

    const subject = `You've been invited to collaborate on "${projectTitle}"`;

    const invitationLink = `${frontendUrl}/projects/invitation/accept?token=${encodeURIComponent(invitationToken)}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Project Collaboration Invitation
        </h2>
        <p>Hello,</p>
        <p>
          <strong>${ownerName}</strong> has invited you to collaborate on the project:
          <strong style="color: #007bff;">"${projectTitle}"</strong>
        </p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">
            To accept this invitation and start collaborating:
          </p>
          <ol style="margin: 15px 0;">
            <li>Click the "Accept Invitation" button below</li>
            <li>Create an account or log in to Fluxo.io</li>
            <li>You'll be automatically added as a collaborator to the project</li>
            <li>Start collaborating!</li>
          </ol>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${invitationLink}" 
            style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"
          >
            Accept Invitation
          </a>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          This invitation link is valid for 7 days and can only be used once.
        </p>
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
