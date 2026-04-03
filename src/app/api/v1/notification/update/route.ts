import { pushNotification } from "@/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import { getUserInfo } from "@/lib/server-utility";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const type = body?.type;

        const user = await getUserInfo();

        switch (type) {
            case "MEMBERSHIP_EXPIRY": {
                if (!user?.U_EXPIREDDATE) {
                    return NextResponse.json({ message: "No expiry date found" });
                }
                const now = new Date();
                const expiryDate = new Date(user.U_EXPIREDDATE);
                const remainingDays = Math.ceil(
                    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                if (remainingDays > 0 && remainingDays <= 14) {
                    await pushNotification({
                        title: "Membership Expiry",
                        message: `Your account is expiring in ${remainingDays} day(s)`,
                    });
                }
                break;
            }
            // Default case
            default:
                return NextResponse.json(
                    { message: "Invalid notification type" },
                    { status: 400 }
                );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}