import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ sender: 1, receiver: 1 });

connectionRequestSchema.pre("save", async function (next) {
  // Only run these checks if the document is new (i.e., a new request is being created)
  if (this.isNew) {
    if (this.sender.equals(this.receiver)) {
      return next(new Error("Cannot send a connection request to yourself."));
    }

    const existingConnection = await this.constructor.findOne({
      $or: [
        { sender: this.sender, receiver: this.receiver },
        { sender: this.receiver, receiver: this.sender },
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        return next(
          new Error(
            "A pending connection request already exists with this user."
          )
        );
      }
      if (existingConnection.status === "accepted") {
        return next(new Error("You are already connected with this user."));
      }
    }
  }

  next();
});

export default mongoose.model("ConnectionRequest", connectionRequestSchema);
