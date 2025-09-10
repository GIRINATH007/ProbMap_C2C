import User from "../models/userModel.js";
import FirebaseAuthMiddleware from "./firebaseAuth.js";

class AdminAuthMiddleware {
  verifyAdminSession = async (req, res, next) => {
    await FirebaseAuthMiddleware.verifySessionCookie(req, res, async () => {
      try {
        const firebaseUID = req.user?.uid;
        
        if (!firebaseUID) {
          res.status(401).json({ error: "Authentication required" });
          return;
        }

        const user = await User.findOne({ firebaseUID });
        
        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }

        if (!user.isAdmin) {
          res.status(403).json({ error: "Admin access required" });
          return;
        }
        req.admin = {
          uid: firebaseUID,
          email: user.email,
          fullName: user.fullName,
          isAdmin: user.isAdmin
        };

        next();
      } catch (error) {
        console.error("Admin authentication error:", error);
        res.status(500).json({ error: "Internal server error during admin authentication" });
      }
    });
  };
}

export default new AdminAuthMiddleware();
