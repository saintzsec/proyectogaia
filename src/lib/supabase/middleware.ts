import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path === "/admin" || path.startsWith("/admin/");
  const isDocenteArea = path === "/docente" || path.startsWith("/docente/");

  if (isAdminArea || isDocenteArea) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);

    if (!user) {
      const redirectRes = NextResponse.redirect(loginUrl);
      copyCookies(supabaseResponse, redirectRes);
      return redirectRes;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.role) {
      const redirectRes = NextResponse.redirect(loginUrl);
      copyCookies(supabaseResponse, redirectRes);
      return redirectRes;
    }

    if (isAdminArea && profile.role !== "admin_gaia") {
      const url = request.nextUrl.clone();
      url.pathname = "/docente";
      const redirectRes = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirectRes);
      return redirectRes;
    }

    if (isDocenteArea && profile.role !== "docente") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      const redirectRes = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirectRes);
      return redirectRes;
    }
  }

  return supabaseResponse;
}
