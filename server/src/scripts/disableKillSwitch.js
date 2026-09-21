require("dotenv").config();

const mongoose = require("mongoose");

const SystemSettings = require(
  "../models/SystemSettings"
);

const disableKillSwitch = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured."
    );
  }

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  const settings =
    await SystemSettings.findOneAndUpdate(
      {
        key: "global",
      },
      {
        $set: {
          isSystemActive: true,
          reason:
            "System restored with the emergency recovery script.",
          changedBy: null,
          lastChangedAt: new Date(),
        },

        $setOnInsert: {
          key: "global",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

  console.log(
    "Kill switch disabled successfully."
  );

  console.log(
    `System active: ${settings.isSystemActive}`
  );

  await mongoose.disconnect();
};

disableKillSwitch().catch(
  async (error) => {
    console.error(
      "Unable to disable the kill switch:",
      error.message
    );

    await mongoose
      .disconnect()
      .catch(() => {});

    process.exit(1);
  }
);