import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";

const JWT_SECRET = process.env.JWT_SECRET || "default";

export const register = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return next(HttpError(400, error.message));

        const { email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return next(HttpError(409, "Email in use"));

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });

        res.status(201).json({
            message: "Success",
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return next(HttpError(400, error.message));

        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(HttpError(401, "Email or password is wrong"));
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
        user.token = token;
        await user.save();
        res.status(200).json({
            token,
            user: {
                email: user.email,
                subscription: user.subscription,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return next(HttpError(401, "Not authorized"));
        }

        user.token = null;
        await user.save();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getCurrent = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return next(HttpError(401, "Not authorized"));
        }

        res.status(200).json({
            email: user.email,
            subscription: user.subscription,
        });
    } catch (error) {
        next(error);
    }
};

export const updateSubscription = async (req, res, next) => {
    try {
        const user = req.user;
        const { subscription } = req.body;
        const allowed = ["starter", "pro", "business"];
        if (!allowed.includes(subscription)) {
            return next(HttpError(400, "Invalid subscription type"));
        }

        user.subscription = subscription;
        await user.save();

        res.status(200).json({
            email: user.email,
            subscription: user.subscription,
        });
    } catch (error) {
        next(error);
    }
};
