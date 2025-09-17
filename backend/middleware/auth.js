// backend/middleware/auth.js
const admin = require('firebase-admin');
const UserProfile = require('../models/userProfile.model'); // Import our model
const serviceAccount = require('../serviceAccountKey.json');

// Initialize only if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}


async function authMiddleware(req, res, next) {
    const headerToken = req.headers.authorization;
    if (!headerToken || !headerToken.startsWith("Bearer ")) {
        return res.status(401).send({ message: "No or invalid token provided" });
    }

    const token = headerToken.split(" ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // This holds Firebase user data (uid, email)
        
        // --- NEW ---
        // Fetch the user's profile from our DB and attach it to the request
        const profile = await UserProfile.findOne({ firebaseUid: decodedToken.uid });
        req.profile = profile; // This holds our app-specific data (role, xp, etc.)

        next();
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return res.status(403).send({ message: "Could not authorize" });
    }
}

module.exports = authMiddleware;