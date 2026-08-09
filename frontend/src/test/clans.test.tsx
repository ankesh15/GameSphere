import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ClansPage from "../pages/Clans";
import { useAuthStore } from "../store/auth";
import { useSocketStore } from "../store/socket";
import { useDialogStore } from "../store/dialog";

describe("Clan Module — Clans.tsx Coverage", () => {
  let mockSocket: {
    emit: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    };

    useAuthStore.setState({
      user: { id: "user-123", email: "owner@example.com", username: "CurrentGamer", roles: [] },
      accessToken: "mock-token",
      refreshToken: "mock-refresh"
    });

    useSocketStore.setState({
      socket: mockSocket as any,
      isConnected: true
    });

    useDialogStore.setState({
      modal: { isOpen: false, title: "", message: "", type: "info" },
      toasts: []
    });
  });

  it("switches channels updating active room and emitting socket chat.join", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ClansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Apex Predators")).toBeInTheDocument();
    });

    const announcementsBtn = screen.getByText("announcements").closest("button");
    expect(announcementsBtn).toBeInTheDocument();
    await user.click(announcementsBtn!);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("chat.join", {
        roomId: "clan:clan-100-announcements"
      });
    });
  });

  it("permits role updates for leaders/officers while hiding role controls for regular members", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MemoryRouter>
        <ClansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Apex Predators")).toBeInTheDocument();
    });

    // Owner view: role select combobox for user-456 is accessible once roster loads
    const selectElem = await screen.findByRole("combobox");
    expect(selectElem).toBeInTheDocument();

    await user.selectOptions(selectElem, "moderator");

    await waitFor(() => {
      expect(useDialogStore.getState().toasts[0]?.message).toBe(
        "Member role updated to moderator"
      );
    });

    // Rerender as regular member (user-456)
    useAuthStore.setState({
      user: { id: "user-456", email: "member@example.com", username: "RegularMember", roles: [] }
    });

    rerender(
      <MemoryRouter>
        <ClansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Apex Predators")).toBeInTheDocument();
    });

    // Role management combobox must not be rendered for non-managers
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("triggers handleKickMember using showConfirm dialog system and executes kick on approval", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ClansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Apex Predators")).toBeInTheDocument();
    });

    // Find role combobox and its adjacent kick button
    const selectElem = await screen.findByRole("combobox");
    const kickButton = selectElem.nextElementSibling as HTMLButtonElement;
    expect(kickButton).toBeInTheDocument();

    await user.click(kickButton);

    // Verify custom confirm dialog is triggered in useDialogStore modal state
    const modal = useDialogStore.getState().modal;
    expect(modal.isOpen).toBe(true);
    expect(modal.isConfirm).toBe(true);
    expect(modal.title).toBe("Kick Member");

    // Simulate clicking confirm
    modal.onConfirm!();

    await waitFor(() => {
      expect(useDialogStore.getState().toasts[0]?.message).toBe("Member kicked from clan.");
    });
  });

  it("enforces validateClanForm schema blocking creation when inputs exceed length limits", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ClansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Apex Predators")).toBeInTheDocument();
    });

    // Click plus button to open Create Clan modal
    const plusBtn = screen.getAllByRole("button").find((btn) =>
      btn.querySelector("svg.lucide-plus")
    );
    expect(plusBtn).toBeInTheDocument();
    await user.click(plusBtn!);

    expect(screen.getAllByText(/Create Clan Guild/i).length).toBeGreaterThan(0);

    // Fill form with invalid tag (1 char length fails validation)
    const nameInput = screen.getByPlaceholderText("e.g. Sentinels Guild");
    const tagInput = screen.getByPlaceholderText("e.g. SEN");

    await user.type(nameInput, "Valid Clan Name");
    await user.type(tagInput, "A"); // Tag length < 2 fails validation

    const submitBtn = screen.getAllByRole("button", { name: /Create Clan Guild/i })[0];
    await user.click(submitBtn);

    // Verify modal dialog surfaces validation error
    await waitFor(() => {
      const modal = useDialogStore.getState().modal;
      expect(modal.isOpen).toBe(true);
      expect(modal.title).toBe("Validation Error");
    });
  });

  it("opens mobile roster slide-over drawer and displays member list content", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ClansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Apex Predators")).toBeInTheDocument();
    });

    // Click mobile roster drawer toggle button
    const mobileToggle = screen.getByTitle("View Roster & Events");
    await user.click(mobileToggle);

    // Verify slide-over drawer opens showing roster header
    await waitFor(() => {
      expect(screen.getByText(/Roster & Events/i)).toBeInTheDocument();
    });
  });
});
