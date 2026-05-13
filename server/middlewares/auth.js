import { clerkClient, getAuth } from "@clerk/express";

// middleware to check userId and premium plan
export const auth = async (req, res, next) => {

    try {

        // get auth data
        const { userId, sessionClaims } = getAuth(req);

        // check premium plan
        const hasPremiumPlan =
            sessionClaims?.metadata?.plan === 'premium';

        // get user
        const user = await clerkClient.users.getUser(userId);

        // set free usage
        if (!hasPremiumPlan) {

            req.free_usage =
                user.privateMetadata.free_usage || 0;

        }
        else {

            await clerkClient.users.updateUserMetadata(userId, {

                privateMetadata: {
                    free_usage: 0
                }

            });

            req.free_usage = 0;
        }

        // set plan
        req.plan = hasPremiumPlan ? 'premium' : 'free';

        next();

    }
    catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
}