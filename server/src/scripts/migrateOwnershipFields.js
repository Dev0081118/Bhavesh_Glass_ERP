require("dotenv").config();

const mongoose =
  require("mongoose");

const ConnectDB =
  require("../db/db");

const {
  SaleBill,
  Payment,
  Dispatch,
  LR,
} = require("../models");

const run =
  async () => {
    try {
      await ConnectDB();

      const saleBills =
        await SaleBill.find({
          createdBy:
            null,

          manager: {
            $ne:
              null,
          },
        });

      let saleBillUpdates =
        0;

      for (
        const bill of
        saleBills
      ) {
        bill.createdBy =
          bill.manager;

        await bill.save();

        saleBillUpdates++;
      }

      const payments =
        await Payment.find({
          createdBy:
            null,

          receivedBy: {
            $ne:
              null,
          },
        });

      let paymentUpdates =
        0;

      for (
        const payment of
        payments
      ) {
        payment.createdBy =
          payment.receivedBy;

        await payment.save();

        paymentUpdates++;
      }

      const dispatches =
        await Dispatch.find({
          createdBy:
            null,

          manager: {
            $ne:
              null,
          },
        });

      let dispatchUpdates =
        0;

      for (
        const dispatch of
        dispatches
      ) {
        dispatch.createdBy =
          dispatch.manager;

        await dispatch.save();

        dispatchUpdates++;
      }

      const lrs =
        await LR.find({
          $or: [
            {
              createdBy:
                null,
            },

            {
              assignedTo:
                null,
            },
          ],
        }).populate(
          "dispatch",
          "manager"
        );

      let lrUpdates =
        0;

      for (
        const lr of
        lrs
      ) {
        const responsible =
          lr.dispatch
            ?.manager;

        if (
          !responsible
        ) {
          continue;
        }

        if (
          !lr.createdBy
        ) {
          lr.createdBy =
            responsible;
        }

        if (
          !lr.assignedTo
        ) {
          lr.assignedTo =
            responsible;
        }

        await lr.save();

        lrUpdates++;
      }

      console.log("");
      console.log(
        "Ownership migration complete."
      );

      console.log(
        `Sale Bills updated: ${saleBillUpdates}`
      );

      console.log(
        `Payments updated: ${paymentUpdates}`
      );

      console.log(
        `Dispatches updated: ${dispatchUpdates}`
      );

      console.log(
        `LR records updated: ${lrUpdates}`
      );

      console.log("");
    } catch (error) {
      console.error(
        "Ownership migration failed:",
        error
      );

      process.exitCode =
        1;
    } finally {
      await mongoose
        .disconnect()
        .catch(
          () => {}
        );
    }
  };

run();