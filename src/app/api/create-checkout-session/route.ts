import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_build", {
    apiVersion: "2025-01-27.acacia" as any, // fallback to latest safely
});

export async function POST(req: Request) {
    try {
        const { jobId, price } = await req.json();

        const origin = req.headers.get("origin") || "http://localhost:3000";

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Audio Transcription Job",
                            description: `Job ID: ${jobId}`,
                        },
                        unit_amount: price, // in cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&job_id=${jobId}`,
            cancel_url: `${origin}/dashboard`,
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
