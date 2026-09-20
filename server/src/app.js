const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const accessRoutes = require("./routes/accessRoutes");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();

app.use(express.json());
app.use(
	cors({
		origin: (origin, callback) => {
			const isDevelopmentOrigin =
				!origin || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
			const isConfiguredOrigin = origin === process.env.FRONTEND_URL;

			callback(null, isDevelopmentOrigin || isConfiguredOrigin);
		},
	})
);

app.get("/api/health", (req, res) => {
	res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/access", accessRoutes);
app.use("/api", resourceRoutes);

module.exports = app;

