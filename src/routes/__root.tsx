import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ThemeApplier } from "@/components/ThemeApplier";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jazel Bernardo — Business Hub" },
      {
        name: "description",
        content:
          "The unified operations hub for Jazel Bernardo — managing Get Dat Express, Dupart, and Ghetto Print from one editorial command center.",
      },
      { name: "author", content: "Jazel Bernardo" },
      { property: "og:title", content: "Jazel Bernardo — Business Hub" },
      {
        property: "og:description",
        content:
          "Three businesses, one operating system. POS, logistics and print operations in a single, beautiful interface.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jazel Bernardo — Business Hub" },
      { name: "description", content: "Seamless Solutions is a professional business hub application for managing your company's operations." },
      { property: "og:description", content: "Seamless Solutions is a professional business hub application for managing your company's operations." },
      { name: "twitter:description", content: "Seamless Solutions is a professional business hub application for managing your company's operations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b7da8883-97f5-4197-85e2-ff2965ef8e3a/id-preview-580f9699--8c1e02c5-a8b3-45d7-a951-4354b00c50b2.lovable.app-1777074804764.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b7da8883-97f5-4197-85e2-ff2965ef8e3a/id-preview-580f9699--8c1e02c5-a8b3-45d7-a951-4354b00c50b2.lovable.app-1777074804764.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <ThemeApplier />
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
