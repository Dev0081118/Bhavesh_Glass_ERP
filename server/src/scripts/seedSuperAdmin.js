require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createInitialPassword } = require("../controllers/authController");

const seedSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin123@example.com";
  const phone = process.env.SUPER_ADMIN_PHONE || "+91 98765 43210";
  const dob = process.env.SUPER_ADMIN_DOB || "1990-04-12";
  const password = createInitialPassword(phone, dob);

  await mongoose.connect(process.env.MONGODB_URI);

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      name: process.env.SUPER_ADMIN_NAME || "Super Admin",
      email: email.toLowerCase(),
      phone,
      dob: new Date(dob),
      password: hashedPassword,
      role: "Super Admin",
      status: "Active",
      access: User.defaultAccessForRole("Super Admin"),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log(`Super Admin ready: ${email}`);
  console.log(`Initial password: ${password}`);
  await mongoose.disconnect();
};

seedSuperAdmin().catch(async (error) => {
  console.error("Unable to seed Super Admin:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
