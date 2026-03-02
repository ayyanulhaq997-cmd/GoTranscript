import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy_url_for_build.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key_for_build",
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // refreshing the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // 1. Define Public Routes
    const isPublicRoute =
        path === "/" ||
        path.startsWith("/auth") ||
        path.startsWith("/api") ||
        path.startsWith("/_next") ||
        path.endsWith(".ico") ||
        path.endsWith(".svg") ||
        path.endsWith(".png") ||
        path.endsWith(".jpg");

    // 2. Define Protected Routes
    const isProtectedRoute =
        path.startsWith("/dashboard") ||
        path.startsWith("/upload") ||
        path.startsWith("/jobs") ||
        path.startsWith("/admin") ||
        path.startsWith("/payment");

    // 3. Logic for Protected Routes
    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/signin";
        // Pass original path as redirect param if you want to be fancy later
        return NextResponse.redirect(url);
    }

    // 4. Logic for Auth Routes (prevent double login)
    if (path.startsWith("/auth") && user) {
        // Allow signout to still happen if it's a route
        if (path !== "/auth/signout") {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
