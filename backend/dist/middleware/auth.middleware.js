"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: "unauthorized user" });
    }
    else {
        token.startsWith("Bearer ");
        const actualToken = token.split(" ")[1];
        try {
            jsonwebtoken_1.default.verify(actualToken, process.env.JWT_SECRET || "your_jwt_secret", (err, user) => {
                if (err) {
                    res.status(401).json({ message: "unauthorized user", error: err });
                    return;
                }
                else {
                    req.user = user;
                }
            });
            next();
        }
        catch (error) {
            res.status(401).json({ message: "Invalid or expired token", error });
            return;
        }
    }
}
exports.auth = auth;
