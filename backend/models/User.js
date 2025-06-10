import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    company: { type: String, required: true },
    designation: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "CEO",
        "CFO",
        "CTO",
        "CHRO",
        "CXO",
        "Admin",
        "COO",
        "CMO",
        "CIO",
        "CSO",
        "CPO",
        "CLO",
        "CCO",
        "CDO",
        "CRO",
        "CISO",
      ],
      default: "CXO",
    },
    otp: String,
    otpExpiresAt: Date,
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    profilePic: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    financialCertifications: {
      type: [String],
      default: [],
    },
    yearsOfFinanceExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    industrySpecializations: {
      type: [String],
      default: [],
    },
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    keyFinancialSkills: {
      type: [String],
      default: [],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    budgetManaged: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
