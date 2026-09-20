const Activity = require("../models/Activity");

const recordActivity = async ({ action, description, actor, target, metadata }) => {
  try {
    await Activity.create({ action, description, actor, target, metadata });
  } catch (error) {
    console.error("Unable to record activity:", error.message);
  }
};

module.exports = { recordActivity };
