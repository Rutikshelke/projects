require("dotenv").config({ path: ".env" });

// Enable CORS for all origins in development mode Configure CORS middleware to allow access from all origins
const isDevelopment = process.env.NODE_ENV === 'development';

// ✅ Allowed Origins
const allowedOrigins = isDevelopment
    ? ["http://localhost:5173", "http://localhost:3000"]
    : process.env.ACCESS_CONTROL_ALLOW_ORIGIN
        ? process.env.ACCESS_CONTROL_ALLOW_ORIGIN.split(",").map(origin => origin.trim())
        : [];


// ✅ CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin); // ✅ Set the specific origin
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Cookie", "Authorization"],
    credentials: true, // ✅ Allows cookies to be sent
};

module.exports = corsOptions;