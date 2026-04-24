import { findUserById } from "../accounts/account.repository.js";

async function getHomepageData(userId) {
    if (!userId) {
        return { currentUser: null };
    }

    const user = await findUserById(userId);
    if (!user) {
        return { currentUser: null };
    }

    return {
        currentUser: {
            name: user.name,
            email: user.email,
        },
    };
}

export { getHomepageData };
