import crypto from "crypto";

export const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export const comparePassword = (password, hash) => {
  const hashed = crypto.createHash("sha256").update(password).digest("hex");
  return hashed === hash;
};