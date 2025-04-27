import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import sendEmail from "../helpers/sendEmail.js";
import {nanoid} from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET || "default";

export const register = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return next(HttpError(400, error.message));

        const { email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return next(HttpError(409, "Email in use"));

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatarURL = gravatar.url(email, {
            s: '250',
            d: 'retro',
            protocol: 'https',
        });
        const verificationToken = nanoid();
        const newUser = await User.create({
            email,
            password: hashedPassword,
            avatarURL,
            verificationToken
        });
        const verificationLink = `${req.protocol}://${req.get("host")}/api/auth/verify/${verificationToken}`;

        await sendEmail(
            email,
            "Please verify your email",
            `<p>Click to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
        );

        res.status(201).json({
            message: "Success",
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
                avatarURL: newUser.avatarURL
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
        if (!user.verify) {
            return next(HttpError(401, "Email not verified"));
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
                avatarURL: user.avatarURL
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
            avatarURL: user.avatarURL
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

export const updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(HttpError(400, "No file uploaded"));
        }

        const { path: tempPath, filename } = req.file;
        const avatarsDir = path.resolve("public", "avatars");
        const finalPath = path.join(avatarsDir, filename);

        await fs.rename(tempPath, finalPath);

        const avatarURL = `/avatars/${filename}`;
        req.user.avatarURL = avatarURL;
        await req.user.save();

        res.status(200).json({ avatarURL });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await User.findOne({ where: { verificationToken } });

        if (!user) return next(HttpError(404, "User not found"));

        user.verify = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: "Verification successful" });
    } catch (error) {
        next(error);
    }
};

export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next(HttpError(400, "missing required field email"));

        const user = await User.findOne({ where: { email } });
        if (!user) return next(HttpError(404, "User not found"));
        if (user.verify) return next(HttpError(400, "Verification has already been passed"));

        const verificationLink = `${req.protocol}://${req.get("host")}/api/auth/verify/${user.verificationToken}`;

        await sendEmail(
            email,
            "Please verify your email",
            `<p>Click to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
        );

        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        next(error);
    }
};

