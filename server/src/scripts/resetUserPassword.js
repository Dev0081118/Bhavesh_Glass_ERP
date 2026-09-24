require("dotenv").config();

const mongoose =
  require("mongoose");

const ConnectDB =
  require("../db/db");

const User =
  require("../models/User");

const {
  createInitialPassword,
  hashPassword,
} = require(
  "../utils/password"
);

const getArgument =
  (name) => {
    const prefix =
      `--${name}=`;

    const direct =
      process.argv.find(
        (arg) =>
          arg.startsWith(
            prefix
          )
      );

    if (direct) {
      return direct.slice(
        prefix.length
      );
    }

    const index =
      process.argv.indexOf(
        `--${name}`
      );

    if (
      index !== -1 &&
      process.argv[
        index + 1
      ]
    ) {
      return process.argv[
        index + 1
      ];
    }

    return null;
  };

const resetUserPassword =
  async () => {
    try {
      const email =
        getArgument(
          "email"
        );

      const id =
        getArgument(
          "id"
        );

      if (
        !email &&
        !id
      ) {
        throw new Error(
          "Provide exactly one user using --email <email> or --id <mongo-id>."
        );
      }

      if (
        email &&
        id
      ) {
        throw new Error(
          "Use either --email or --id, not both."
        );
      }

      await ConnectDB();

      let user;

      if (email) {
        user =
          await User.findOne({
            email:
              email
                .trim()
                .toLowerCase(),
          });
      } else {
        if (
          !mongoose.isValidObjectId(
            id
          )
        ) {
          throw new Error(
            "Invalid MongoDB user ID."
          );
        }

        user =
          await User.findById(
            id
          );
      }

      if (!user) {
        throw new Error(
          "User not found."
        );
      }

      if (!user.phone) {
        throw new Error(
          "User does not have a phone number. Default password cannot be generated."
        );
      }

      if (!user.dob) {
        throw new Error(
          "User does not have a date of birth. Default password cannot be generated."
        );
      }

      const defaultPassword =
        createInitialPassword(
          user.phone,
          user.dob
        );

      if (
        !defaultPassword
      ) {
        throw new Error(
          "Unable to generate the default password from this user's phone number and date of birth."
        );
      }

      user.password =
        await hashPassword(
          defaultPassword
        );

      await user.save();

      console.log("");
      console.log(
        "Password reset successful."
      );
      console.log(
        `User: ${user.name}`
      );
      console.log(
        `Role: ${user.role}`
      );
      console.log(
        `Email: ${user.email}`
      );
      console.log(
        `Default password: ${defaultPassword}`
      );
      console.log("");
    } catch (error) {
      console.error("");
      console.error(
        `Password reset failed: ${error.message}`
      );
      console.error("");

      process.exitCode =
        1;
    } finally {
      if (
        mongoose.connection
          .readyState !== 0
      ) {
        await mongoose
          .disconnect()
          .catch(
            () => {}
          );
      }
    }
  };

resetUserPassword();