import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchRequestForm from "../components/MatchRequestForm";
import MatchOfferOverlay from "../components/MatchOfferOverlay";
import { useSocketStore } from "../store/socket";
import { useDialogStore } from "../store/dialog";

describe("Matchmaking Module — Form & Offer Overlay Coverage", () => {
  beforeEach(() => {
    // Reset stores
    useSocketStore.setState({
      socket: null,
      isConnected: false,
      activeMatchOffer: null,
      isQueued: false,
      queuedGameId: null,
      queuedRequestId: null,
      elapsedTime: 0,
      matchSessionId: null
    });
    useDialogStore.setState({
      modal: { isOpen: false, title: "", message: "", type: "info" },
      toasts: []
    });
  });

  describe("MatchRequestForm Component", () => {
    it("renders initial matchmaking parameters form", () => {
      render(<MatchRequestForm />);

      expect(screen.getByText(/Match Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose Game/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Find Squad/i })).toBeInTheDocument();
    });

    it("transitions to queuing state upon successful match request submission", async () => {
      const user = userEvent.setup();
      render(<MatchRequestForm />);

      const submitBtn = screen.getByRole("button", { name: /Find Squad/i });
      await user.click(submitBtn);

      await waitFor(() => {
        const state = useSocketStore.getState();
        expect(state.isQueued).toBe(true);
        expect(state.queuedRequestId).toBe("req-123");
      });
    });

    it("resets queue state to idle on successful cancellation", async () => {
      const user = userEvent.setup();
      useSocketStore.setState({
        isQueued: true,
        queuedGameId: "valorant",
        queuedRequestId: "req-123"
      });

      render(<MatchRequestForm />);

      expect(screen.getByText(/Searching for Teammates/i)).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: /Cancel Matchmaking Request/i });
      await user.click(cancelBtn);

      await waitFor(() => {
        expect(useSocketStore.getState().isQueued).toBe(false);
      });

      expect(useDialogStore.getState().toasts[0]?.message).toBe("Matchmaking request canceled");
    });

    it("retains queue state and displays error dialog on cancellation API failure", async () => {
      const user = userEvent.setup();
      useSocketStore.setState({
        isQueued: true,
        queuedGameId: "valorant",
        queuedRequestId: "fail-cancel"
      });

      render(<MatchRequestForm />);

      const cancelBtn = screen.getByRole("button", { name: /Cancel Matchmaking Request/i });
      await user.click(cancelBtn);

      await waitFor(() => {
        const modal = useDialogStore.getState().modal;
        expect(modal.isOpen).toBe(true);
        expect(modal.title).toBe("Cancellation Error");
        expect(modal.type).toBe("error");
      });

      // Queue state remains intact on failure
      expect(useSocketStore.getState().isQueued).toBe(true);
    });
  });

  describe("MatchOfferOverlay Component", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("renders match found modal and counts down timer every second", async () => {
      const expiresAt = new Date(Date.now() + 90000).toISOString();
      useSocketStore.setState({
        activeMatchOffer: {
          sessionId: "sess-100",
          gameId: "valorant",
          region: "us-east",
          playerIds: ["p1", "p2"],
          status: "pending",
          acceptedBy: ["p1"],
          expiresAt
        }
      });

      render(<MatchOfferOverlay />);

      expect(screen.getByText(/Match Found!/i)).toBeInTheDocument();
      expect(screen.getByText(/1 of 2 ready/i)).toBeInTheDocument();
      expect(screen.getByText(/90s/i)).toBeInTheDocument();

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.getByText(/80s/i)).toBeInTheDocument();
    });

    it("triggers acceptMatch and declineMatch actions correctly", async () => {
      const acceptSpy = vi.fn();
      const declineSpy = vi.fn();

      useSocketStore.setState({
        activeMatchOffer: {
          sessionId: "sess-100",
          gameId: "valorant",
          region: "global",
          playerIds: ["p1", "p2"],
          status: "pending",
          acceptedBy: [],
          expiresAt: new Date(Date.now() + 30000).toISOString()
        },
        acceptMatch: acceptSpy,
        declineMatch: declineSpy
      });

      const { rerender } = render(<MatchOfferOverlay />);

      // Accept match
      const acceptBtn = screen.getByRole("button", { name: /Accept Match/i });
      act(() => {
        acceptBtn.click();
      });

      expect(acceptSpy).toHaveBeenCalledTimes(1);

      // Reset store for decline test
      act(() => {
        useSocketStore.setState({
          activeMatchOffer: {
            sessionId: "sess-200",
            gameId: "valorant",
            region: "global",
            playerIds: ["p1", "p2"],
            status: "pending",
            acceptedBy: [],
            expiresAt: new Date(Date.now() + 30000).toISOString()
          },
          acceptMatch: acceptSpy,
          declineMatch: declineSpy
        });
      });

      rerender(<MatchOfferOverlay />);

      const declineBtn = screen.getByRole("button", { name: /Decline/i });
      act(() => {
        declineBtn.click();
      });

      expect(declineSpy).toHaveBeenCalledTimes(1);
    });
  });
});
