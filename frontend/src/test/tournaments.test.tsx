import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TournamentsPage from "../pages/Tournaments";
import { useAuthStore } from "../store/auth";
import { useDialogStore } from "../store/dialog";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server";

describe("Tournament Module — Tournaments.tsx Coverage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: "user-123", email: "test@example.com", username: "CurrentGamer", roles: [] },
      accessToken: "mock-token",
      refreshToken: "mock-refresh"
    });

    useDialogStore.setState({
      modal: { isOpen: false, title: "", message: "", type: "info" },
      toasts: []
    });
  });

  it("renders bracket rounds and matches including BYE status for non-power-of-two participants", async () => {
    render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Summer Championship 2026").length).toBeGreaterThan(0);
    });

    // Check Round headers
    expect(screen.getByText(/Round 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Round 2/i)).toBeInTheDocument();

    // Check BYE match rendering
    expect(screen.getByText(/BYE/i)).toBeInTheDocument();
  });

  it("enforces validateTournamentForm schema blocking submission when dates or prize pool are invalid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Summer Championship 2026").length).toBeGreaterThan(0);
    });

    // Open Create Tournament modal
    const hostBtn = screen.getAllByRole("button", { name: /Create Tournament/i })[0];
    await user.click(hostBtn);

    // Fill form with invalid end date (before start date) and negative prize pool
    const nameInput = screen.getByPlaceholderText(/Valorant Summer Masters/i);
    await user.type(nameInput, "Invalid Tourney");

    const prizeInput = screen.getByText(/Prize Pool/i).nextElementSibling as HTMLInputElement;
    const startInput = screen.getByText(/Starts At/i).nextElementSibling as HTMLInputElement;
    const endInput = screen.getByText(/Ends At/i).nextElementSibling as HTMLInputElement;

    await user.clear(prizeInput);
    await user.type(prizeInput, "-500");
    await user.type(startInput, "2026-08-10T10:00");
    await user.type(endInput, "2026-08-01T10:00");

    const submitBtn = screen.getAllByRole("button", { name: /Create Tournament/i })[1];
    await user.click(submitBtn);

    // Verify modal dialog surfaces validation error
    await waitFor(() => {
      const modal = useDialogStore.getState().modal;
      expect(modal.isOpen).toBe(true);
      expect(modal.title).toBe("Validation Error");
    });
  });

  it("triggers joinTournament API and displays success toast", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      user: { id: "user-newbie", email: "newbie@ex.com", username: "NewbieGamer", roles: [] }
    });

    render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Summer Championship 2026").length).toBeGreaterThan(0);
    });

    const joinBtn = screen.getByRole("button", { name: /Join Tournament/i });
    await user.click(joinBtn);

    await waitFor(() => {
      expect(useDialogStore.getState().toasts[0]?.message).toBe("Successfully joined tournament!");
    });
  });

  it("submits match result and shows success toast via useDialogStore", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Summer Championship 2026").length).toBeGreaterThan(0);
    });

    // Open Report Result modal on match m1-r2
    const reportBtn = screen.getByRole("button", { name: /Report Result/i });
    await user.click(reportBtn);

    expect(screen.getByText(/Report Match Score/i)).toBeInTheDocument();

    const submitResultBtn = screen.getByRole("button", { name: /Submit Scores/i });
    await user.click(submitResultBtn);

    await waitFor(() => {
      expect(useDialogStore.getState().toasts[0]?.message).toBe("Match scores submitted!");
    });
  });

  it("renders <EmptyState /> component when no tournaments exist", async () => {
    // Override MSW handler to return empty list
    server.use(
      http.get("*/api/tournaments", () => {
        return HttpResponse.json([]);
      })
    );

    render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Tournaments Scheduled")).toBeInTheDocument();
    });

    expect(screen.getByText("There are currently no active competitive brackets. Be the first host to create one!")).toBeInTheDocument();
  });
});
