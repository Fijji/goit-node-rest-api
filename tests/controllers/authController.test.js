import { jest } from '@jest/globals';
jest.unstable_mockModule('../../models/user.js', () => ({
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

import { login } from "../../controllers/authController.js";
import httpMocks from "node-mocks-http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { default: User } = await import("../../models/user.js");

describe("Login Controller", () => {
    const mockUser = {
        id: 1,
        email: "test@test.com",
        password: "password123",
        subscription: "pro",
        avatarURL: "/avatars/1_1744637549854.jpg",
        save: jest.fn(),
    };

    const reqBody = {
        email: "test@test.com",
        password: "password123",
    };

    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/api/users/login",
            body: reqBody,
        });
        res = httpMocks.createResponse();
        next = jest.fn();

        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare = jest.fn().mockResolvedValue(true);

        jwt.sign = jest.fn().mockReturnValue("mocked-jwt-token");

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should respond with 200 status code", async () => {
        await login(req, res, next);
        expect(res.statusCode).toBe(200);
    });

    it("should return a token in response", async () => {
        await login(req, res, next);
        const data = res._getJSONData();
        expect(data.token).toBe("mocked-jwt-token");
    });

    it("should return a user object with details", async () => {
        await login(req, res, next);
        const data = res._getJSONData();
        expect(data.user).toBeDefined();
        expect(typeof data.user.email).toBe("string");
        expect(typeof data.user.subscription).toBe("string");
        expect(data.user.email).toBe("test@test.com");
        expect(data.user.subscription).toBe("pro");
        expect(data.user.avatarURL).toBe("/avatars/1_1744637549854.jpg");
    });
});
