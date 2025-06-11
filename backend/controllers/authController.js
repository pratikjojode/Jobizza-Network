import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

import cloudinary from "../utils/cloudinaryConfig.js";

export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      company,
      designation,
      role,
      linkedin,
      financialCertifications,
      yearsOfFinanceExperience,
      industrySpecializations,
      keyFinancialSkills,
      budgetManaged,
    } = req.body;

    if (!email || !password || !fullName || !company || !designation) {
      return res.status(400).json({
        message:
          "All required fields (email, password, full name, company, designation) must be filled.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    let profilePicUrl = "";
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString(
            "base64"
          )}`,
          {
            folder: "profile_pics",
            public_id: `jobizaaa-user-${email.split("@")[0]}-${Date.now()}`,
            overwrite: true,
          }
        );
        profilePicUrl = result.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        profilePicUrl = "";
      }
    }

    // Helper function to safely parse array fields
    const parseArrayField = (field) => {
      if (!field) return [];

      // If it's already an array, return it filtered
      if (Array.isArray(field)) {
        return field
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0);
      }

      // If it's a string, split it
      if (typeof field === "string") {
        return field
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      // For any other type, try to convert to string first
      return String(field)
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    };

    const parsedFinancialCertifications = parseArrayField(
      financialCertifications
    );
    const parsedIndustrySpecializations = parseArrayField(
      industrySpecializations
    );
    const parsedKeyFinancialSkills = parseArrayField(keyFinancialSkills);

    const newUser = new User({
      email,
      password,
      fullName,
      company,
      designation,
      role: role || "CXO",
      linkedin,
      financialCertifications: parsedFinancialCertifications,
      yearsOfFinanceExperience: parseInt(yearsOfFinanceExperience, 10) || 0,
      industrySpecializations: parsedIndustrySpecializations,
      keyFinancialSkills: parsedKeyFinancialSkills,
      budgetManaged,
      profilePic: profilePicUrl,
      isVerified: false,
      isApproved: false,
    });

    await newUser.save();

    try {
      await sendEmail({
        email: newUser.email,
        subject: "Welcome to Jobizaa Network!",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Jobizaa Network</title>
            <style>
              body { font-family: sans-serif; background-color: #f4f4f4; color: #333; }
              .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { background-color: #007bff; color: #ffffff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 20px; line-height: 1.6; }
              .footer { text-align: center; padding: 15px; font-size: 12px; color: #777; border-top: 1px solid #eee; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Welcome to Jobizaa Network!</h2>
              </div>
              <div class="content">
                <p>Dear ${newUser.fullName},</p>
                <p>Thank you for registering with Jobizaaa Network. We're excited to have you on board!</p>
                <p>Your account has been created successfully. Please note that your account requires verification upon login and admin approval for full access.</p>
                <p>We look forward to helping you connect with financial leaders and opportunities.</p>
                <p>Best regards,</p>
                <p>The Jobizaa Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Jobizaaa Network. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Dear ${newUser.fullName},\n\nThank you for registering with Jobizaaa Network. Your account has been created successfully. Your account requires verification and admin approval.\n\nBest regards,\nThe Jobizaa Team`,
      });
    } catch (emailError) {
      console.error("Error sending welcome email to user:", emailError);
    }

    const adminEmailAddress = "info@maharashtraeducationawards.com";
    try {
      await sendEmail({
        email: adminEmailAddress,
        subject: "New User Registration on Jobizaaa Network",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New User Registered</title>
            <style>
              body { font-family: sans-serif; background-color: #f4f4f4; color: #333; }
              .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { background-color: #28a745; color: #ffffff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 20px; line-height: 1.6; }
              .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .info-table th { background-color: #f2f2f2; }
              .footer { text-align: center; padding: 15px; font-size: 12px; color: #777; border-top: 1px solid #eee; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New User Registered on Jobizaaa Network</h2>
              </div>
              <div class="content">
                <p>A new user has just registered on Jobizaaa Network. Their account status is currently pending admin approval.</p>
                <table class="info-table">
                  <tr><th>Full Name</th><td>${newUser.fullName}</td></tr>
                  <tr><th>Email</th><td>${newUser.email}</td></tr>
                  <tr><th>Company</th><td>${newUser.company}</td></tr>
                  <tr><th>Designation</th><td>${newUser.designation}</td></tr>
                  <tr><th>Role</th><td>${newUser.role}</td></tr>
                  <tr><th>LinkedIn</th><td>${
                    newUser.linkedin || "N/A"
                  }</td></tr>
                  <tr><th>Financial Certs</th><td>${
                    parsedFinancialCertifications.join(", ") || "N/A"
                  }</td></tr>
                  <tr><th>Years Finance Exp</th><td>${
                    newUser.yearsOfFinanceExperience || "N/A"
                  }</td></tr>
                  <tr><th>Industry Specializations</th><td>${
                    parsedIndustrySpecializations.join(", ") || "N/A"
                  }</td></tr>
                  <tr><th>Key Financial Skills</th><td>${
                    parsedKeyFinancialSkills.join(", ") || "N/A"
                  }</td></tr>
                  <tr><th>Budget Managed</th><td>${
                    newUser.budgetManaged || "N/A"
                  }</td></tr>
                  ${
                    profilePicUrl
                      ? `<tr><th>Profile Pic</th><td><a href="${profilePicUrl}" target="_blank">View Profile Pic</a></td></tr>`
                      : ""
                  }
                  <tr><th>Registered At</th><td>${new Date(
                    newUser.createdAt
                  ).toLocaleString()}</td></tr>
                  <tr><th>Verified</th><td>${
                    newUser.isVerified ? "Yes" : "No"
                  }</td></tr>
                  <tr><th>Approved</th><td>${
                    newUser.isApproved ? "Yes" : "No"
                  }</td></tr>
                </table>
                <p>You may need to review and approve this user for full access. Please check the admin dashboard.</p>
                <p>Best regards,</p>
                <p>Jobizaaa System Notifications</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Jobizaaa Network. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `New User Registered:\n\nFull Name: ${newUser.fullName}\nEmail: ${
          newUser.email
        }\nCompany: ${newUser.company}\nDesignation: ${
          newUser.designation
        }\nRole: ${newUser.role}\nLinkedIn: ${
          newUser.linkedin || "N/A"
        }\nFinancial Certs: ${
          parsedFinancialCertifications.join(", ") || "N/A"
        }\nYears Finance Exp: ${
          newUser.yearsOfFinanceExperience || "N/A"
        }\nIndustry Specializations: ${
          parsedIndustrySpecializations.join(", ") || "N/A"
        }\nKey Financial Skills: ${
          parsedKeyFinancialSkills.join(", ") || "N/A"
        }\nBudget Managed: ${newUser.budgetManaged || "N/A"}\nProfile Pic: ${
          profilePicUrl || "N/A"
        }\nRegistered At: ${new Date(
          newUser.createdAt
        ).toLocaleString()}\n\nThis user needs to be verified upon login and potentially approved by an admin.`,
      });
    } catch (adminEmailError) {
      console.error("Error sending admin notification email:", adminEmailError);
    }

    res.status(201).json({
      message:
        "Registration successful. Your account is awaiting admin approval and verification upon login.",
      newUser: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
        isApproved: newUser.isApproved,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password and role required" });
    }

    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: email,
      subject: "Your OTP - Jobizaaa",
      html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Your OTP Code</title>
                            <style>
                                body {
                                    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
                                    margin: 0;
                                    padding: 0;
                                    background-color: #f4f4f4;
                                    color: #333333;
                                }
                                .email-container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    background-color: #ffffff;
                                    border-radius: 8px;
                                    overflow: hidden;
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    background-color: #007bff;
                                    color: #ffffff;
                                    padding: 20px;
                                    text-align: center;
                                }
                                .content {
                                    padding: 30px;
                                    line-height: 1.6;
                                }
                                .otp-box {
                                    background-color: #e9ecef;
                                    border-left: 5px solid #007bff;
                                    padding: 25px 20px;
                                    text-align: center;
                                    margin: 30px 0;
                                    border-radius: 4px;
                                }
                                .otp-code {
                                    font-size: 38px;
                                    font-weight: bold;
                                    color: #007bff;
                                    letter-spacing: 5px;
                                    margin: 0;
                                }
                                .footer {
                                    background-color: #f8f9fa;
                                    color: #777777;
                                    font-size: 12px;
                                    text-align: center;
                                    padding: 20px;
                                    border-top: 1px solid #eeeeee;
                                }
                                .button {
                                    display: inline-block;
                                    background-color: #007bff;
                                    color: #ffffff;
                                    padding: 10px 20px;
                                    border-radius: 5px;
                                    text-decoration: none;
                                    margin-top: 20px;
                                }
                                a {
                                    color: #007bff;
                                    text-decoration: none;
                                }
                                a:hover {
                                    text-decoration: underline;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <div class="header">
                                    <h2>Jobizaaa Network</h2>
                                </div>
                                <div class="content">
                                    <p>Hello,</p>
                                    <p>Your One-Time Password (OTP) for Jobizaaa login is:</p>
                                    <div class="otp-box">
                                        <p class="otp-code">${otp}</p>
                                    </div>
                                    <p>This OTP is valid for **10 minutes only**. For your security, do not share this code with anyone.</p>
                                    <p>If you did not request this OTP, please ignore this email or contact support immediately.</p>
                                    <p>Best regards,<br>The Jobizaaa Team</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; ${new Date().getFullYear()} Jobizaaa Network. All rights reserved.</p>
                                    <p>Navi Mumbai, Maharashtra, India</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
      text: `Your OTP for Jobizaaa login is: ${otp}. This OTP is valid for 10 minutes only. If you didn't request this, please ignore this email.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      if (user.otpExpiresAt < new Date()) {
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();
      }
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || "",
        fullName: user.fullName,
        company: user.company,
        designation: user.designation,
        linkedin: user.linkedin || "",
        financialCertifications: user.financialCertifications || [],
        yearsOfFinanceExperience: user.yearsOfFinanceExperience || 0,
        industrySpecializations: user.industrySpecializations || [],
        keyFinancialSkills: user.keyFinancialSkills || [],
        budgetManaged: user.budgetManaged || "",
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // The URL sent to the user still uses the PLAIN token
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request for Jobizaaa Network",
      html: `
                <p>You requested a password reset for your Jobizaaa Network account.</p>
                <p>Please click on the following link to reset your password:</p>
                <p><a href="${resetUrl}">Reset My Password</a></p>
                <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
                <p>Best regards,<br>The Jobizaaa Team</p>
            `,
      text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}. This link is valid for 1 hour.`,
    });

    res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Server error during password reset request." });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required." });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Your password has been successfully updated." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
};
