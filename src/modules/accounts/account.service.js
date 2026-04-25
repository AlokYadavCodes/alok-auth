import {
    findAuthorizedAppCountByUserId,
    findAuthorizedAppsByUserId,
    revokeClientAccess,
    updateUserProfileImage,
} from "./account.repository.js";
import ApiError from "../../utils/ApiError.js";
import { findUserProfileById } from "../oauth/oauth.repository.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

async function getAccountOverview(userId) {
    const user = await findUserProfileById(userId);
    if (!user) {
        throw ApiError.notFound("User not found");
    }
    const authorizedAppCount = await findAuthorizedAppCountByUserId(userId);

    return {
        user,
        authorizedAppCount,
    };
}

async function getAuthorizedApps(userId) {
    const user = await findUserProfileById(userId);
    const apps = await findAuthorizedAppsByUserId(userId);

    return {
        user,
        apps: apps.map((app) => ({
            clientId: app.client_id,
            appName: app.app_name,
            websiteUrl: app.website_url,
            grantedScopes: app.scope.split(" "),
            lastUpdated: app.updated_at,
        })),
    };
}

async function revokeAuthorizedAppAccess(userId, clientId) {
    await revokeClientAccess({ userId, clientId });
}

async function setUserProfileImage(userId, file) {
    if (!file) {
        throw ApiError.badRequest("Missing profile image");
    }
    if (!file.mimetype?.startsWith("image/")) {
        throw ApiError.badRequest("Profile image must be an image file");
    }

    const profileImageUrl = await uploadToCloudinary(file);
    if (!profileImageUrl) {
        throw ApiError.internal("Profile image upload failed");
    }

    await updateUserProfileImage({ userId, profileImageUrl });
    return profileImageUrl;
}

export {
    getAccountOverview,
    getAuthorizedApps,
    revokeAuthorizedAppAccess,
    setUserProfileImage,
};
