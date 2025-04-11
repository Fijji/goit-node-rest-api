import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const [type, token] = authHeader.split(" ");
        if (type !== "Bearer" || !token) {
            return next(HttpError(401, "Not authorized"));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user || user.token !== token) {
            return next(HttpError(401, "Not authorized"));
        }

        req.user = user;
        next();
    } catch (error) {
        next(HttpError(401, "Not authorized"));
    }
};

export default authMiddleware;
