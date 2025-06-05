import { NextResponse, userAgent } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const publicRoutes = [
  "/Images",
  "/mobile-not-supported",
  "/_next",
  "/api/login",
  "/api/logout",
  //"/api/event-update",
];

// export const config = {
//   matcher: ["/api/*"],
// };

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const { device } = userAgent(request);
  const cookieStore = await cookies();

  // Check if the device is a mobile
  // if (device.type === "mobile") {
  //   // Redirect to the custom mobile-not-supported page
  //   const mobileRedirectUrl = new URL("/mobile-not-supported", request.url);
  //   return NextResponse.redirect(mobileRedirectUrl);
  // }

  try {
    const session = cookieStore.get("session")?.value;

    if (publicRoutes.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    if (!session) {
      if (pathname === "/login") {
        return NextResponse.next();
      }
      if (pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ message: "Session expired", success: false }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return loginRedirect(request);
    }

    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    if (pathname === "/login") {
      return dashboardRedirect(request);
    }

    // Allow the request to proceed for authenticated users
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-userID", payload.id);
    requestHeaders.set("x-email", payload.email);

    return NextResponse.next({ headers: requestHeaders });
  } catch (error) {
    console.log(error);
    await cookieStore.delete("session");
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return loginRedirect(request);
  }
}

// Apply middleware to all routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};

const loginRedirect = async (request) => {
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
};

const dashboardRedirect = async (request) => {
  const dashboardUrl = new URL("/dashboard", request.url);
  return NextResponse.redirect(dashboardUrl);
};
