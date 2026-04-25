import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../accounts/account.repository.js";
import ApiError from "../../utils/ApiError.js";

async function registerUser({ name, email, password }) {
    if (!name || !email || !password) {
        throw ApiError.badRequest("All fields are required: name, email, password");
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw ApiError.conflict("Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const profileImageUrls = [
        "https://res.cloudinary.com/dt5inuazc/image/upload/v1777105256/avatar1_utgryf.png",
        "https://res.cloudinary.com/dt5inuazc/image/upload/v1777105256/avatar3_wufg2k.png",
        "https://res.cloudinary.com/dt5inuazc/image/upload/v1777105255/avatar4_xgus8a.png",
        "https://res.cloudinary.com/dt5inuazc/image/upload/v1777105255/avatar2_n9yqxu.png"
    ];
    const profileImageUrl = profileImageUrls[Math.floor(Math.random() * profileImageUrls.length)];
    
    await createUser({ name, email, passwordHash, profileImageUrl });

    const user = { name, email };
    return user;
}

async function authenticateUser({ email, password }) {
    if (!email || !password) {
        throw ApiError.badRequest("Email and password are required");
    }

    const user = await findUserByEmail(email);
    if (!user) {
        throw ApiError.unauthorized("Invalid Credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw ApiError.unauthorized("Invalid Credentials");
    }

    return user;
}

export { authenticateUser, registerUser };
