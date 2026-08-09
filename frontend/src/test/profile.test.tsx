import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server";
import GamerProfilePage from "../pages/GamerProfile";

describe("GamerProfile Module — Onboarding & Profile Coverage", () => {
  it("renders onboarding form when GET /api/profiles/me returns 404", async () => {
    server.use(
      http.get("*/api/profiles/me", () => {
        return HttpResponse.json(
          { message: "Profile not found." },
          { status: 404 }
        );
      })
    );

    render(
      <MemoryRouter>
        <GamerProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Create Gamer Profile/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Initialize Profile/i })).toBeInTheDocument();
    });

    expect(screen.queryByText(/Profile Load Failed/i)).not.toBeInTheDocument();
  });

  it("renders gamer profile dashboard when GET /api/profiles/me returns profile data", async () => {
    server.use(
      http.get("*/api/profiles/me", () => {
        return HttpResponse.json({
          userId: "user-123",
          gamerTag: "ProGamer99",
          displayName: "Pro Gamer",
          bio: "Grinding ranked match",
          region: "us-east",
          skillLevel: "advanced",
          favoriteGames: ["valorant"],
          platforms: ["PC"],
          availability: [],
          gamingAccounts: []
        });
      })
    );

    render(
      <MemoryRouter>
        <GamerProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ProGamer99/i)).toBeInTheDocument();
      expect(screen.getByText(/Grinding ranked match/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Create Gamer Profile/i)).not.toBeInTheDocument();
  });
});
