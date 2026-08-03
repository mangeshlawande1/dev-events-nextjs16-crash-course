import {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";
import bcrypt from "bcryptjs";

export const userRoles = ["user", "organizer", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /** Bcrypt hash - never the plaintext password. */
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: userRoles,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

/** Hash the password whenever it's set/changed - never store plaintext. */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User> & {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
};

export type UserResponse = User & { _id: string };

const UserModel = models.User || model<User>("User", userSchema);

export default UserModel;
