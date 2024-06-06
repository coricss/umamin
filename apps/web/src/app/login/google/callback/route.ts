import { generateId } from "lucia";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";

import { google, lucia } from "@/lib/auth";
import { and, db, eq, schema } from "@umamin/server";
import { nanoid } from "nanoid";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookies().get("code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    const googleUser: GoogleUser = await googleUserResponse.json();

    const existingUser = await db.query.account.findFirst({
      where: and(
        eq(schema.account.providerId, "google"),
        eq(schema.account.providerUserId, googleUser.sub),
      ),
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }

    const usernameId = generateId(5);
    const userId = nanoid();

    await db.insert(schema.user).values({
      id: userId,
      imageUrl: googleUser.picture,
      username: `umamin_${usernameId}`,
    });

    await db.insert(schema.account).values({
      providerId: "google",
      providerUserId: googleUser.sub,
      userId,
      picture: googleUser.picture,
      email: googleUser.email,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
      },
    });
  } catch (err: any) {
    console.log(err);
    if (err instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400,
      });
    }

    return new Response(null, {
      status: 500,
    });
  }
}

interface GoogleUser {
  sub: string;
  picture: string;
  email: string;
}
