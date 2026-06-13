import "@fontsource/bebas-neue/400.css";
import "./styles.css";

import { createRoute, createRootRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ElvisCafe } from "@/components/elvis-cafe";

const rootRoute = createRootRoute({
  component: Root,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ElvisCafe,
});

function getRouterBasepath() {
  const baseUrl = import.meta.env.BASE_URL || "/";

  return baseUrl === "/" ? "/" : baseUrl.replace(/\/$/, "");
}

const routeTree = rootRoute.addChildren([indexRoute]);
const router = createRouter({ routeTree, basepath: getRouterBasepath() });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function Root() {
  return <Outlet />;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
