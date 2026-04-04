import crypto from "crypto";

const SALT_SIZE = 16;
const HASH_SIZE = 32;
const ITERATIONS = 10000;

export function hashPassword(password:any) {
    if (!password) {
        throw new Error("Password cannot be empty");
    }
    const salt = crypto.randomBytes(SALT_SIZE);
    const hash = crypto.pbkdf2Sync(
        password,
        salt,
        ITERATIONS,
        HASH_SIZE,
        "sha256"
    );
    return `${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password:any, storedPassword:any) {

    if (!password || !storedPassword) return false;

    const parts = storedPassword.split(":");

    if (parts.length !== 2) return false;

    const salt = Buffer.from(parts[0], "base64");
    const hash = Buffer.from(parts[1], "base64");

    const newHash = crypto.pbkdf2Sync(
        password,
        salt,
        ITERATIONS,
        HASH_SIZE,
        "sha256"
    );

    return crypto.timingSafeEqual(hash, newHash);
}