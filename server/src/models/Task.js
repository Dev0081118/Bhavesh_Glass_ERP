const mongoose =
  require("mongoose");

const taskSchema =
  new mongoose.Schema(
    {
      title: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength:
          200,
      },

      description: {
        type:
          String,

        trim:
          true,

        default:
          "",
      },

      department: {
        type:
          String,

        enum: [
          "Account",
          "Sales",
          "Purchase",
          "Production",
          "Dispatch",
        ],

        required:
          true,

        index:
          true,
      },

      assignedTo: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      assignedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      relatedModule: {
        type:
          String,

        trim:
          true,

        default:
          "",
      },

      relatedRecordId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        default:
          null,
      },

      priority: {
        type:
          String,

        enum: [
          "Low",
          "Medium",
          "High",
          "Urgent",
        ],

        default:
          "Medium",

        index:
          true,
      },

      status: {
        type:
          String,

        enum: [
          "Pending",
          "In Progress",
          "Blocked",
          "Completed",
          "Cancelled",
        ],

        default:
          "Pending",

        index:
          true,
      },

      progress: {
        type:
          Number,

        default:
          0,

        min:
          0,

        max:
          100,
      },

      dueDate: {
        type:
          Date,

        required:
          true,

        index:
          true,
      },

      completedAt: {
        type:
          Date,

        default:
          null,
      },

      notes: {
        type:
          String,

        trim:
          true,

        default:
          "",
      },
    },

    {
      timestamps:
        true,
    }
  );

taskSchema.index({
  assignedTo:
    1,

  status:
    1,

  dueDate:
    1,
});

module.exports =
  mongoose.model(
    "Task",
    taskSchema
  );