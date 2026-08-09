import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatRoom from "../components/ChatRoom";
import { useSocketStore } from "../store/socket";
import { useAuthStore } from "../store/auth";

describe("Real-Time Chat Module — ChatRoom.tsx Coverage", () => {
  let eventListeners: Record<string, Function> = {};
  let mockSocket: {
    emit: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    eventListeners = {};
    mockSocket = {
      emit: vi.fn(),
      on: vi.fn((event: string, callback: Function) => {
        eventListeners[event] = callback;
      }),
      off: vi.fn()
    };

    useAuthStore.setState({
      user: { id: "user-123", email: "test@example.com", username: "TestGamer", roles: [] },
      accessToken: "mock-token",
      refreshToken: "mock-refresh"
    });

    useSocketStore.setState({
      socket: mockSocket as any,
      isConnected: true
    });
  });

  it("fetches and renders chat history on room load", async () => {
    render(<ChatRoom roomId="general" />);

    await waitFor(() => {
      expect(screen.getByText("Hello squad!")).toBeInTheDocument();
      expect(screen.getByText("Ready for match!")).toBeInTheDocument();
    });
  });

  it("renders ErrorAlert on history fetch failure and retries on action click", async () => {
    const user = userEvent.setup();
    render(<ChatRoom roomId="fail-room" />);

    await waitFor(() => {
      expect(screen.getByText("Chat History Unavailable")).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: /Retry Loading History/i });
    expect(retryBtn).toBeInTheDocument();

    await user.click(retryBtn);

    // Verify retry attempt occurred (shows error alert again since roomId is fail-room)
    await waitFor(() => {
      expect(screen.getByText("Chat History Unavailable")).toBeInTheDocument();
    });
  });

  it("renders sender message alignment correctly (isMe distinction)", async () => {
    const { container } = render(<ChatRoom roomId="general" />);

    await waitFor(() => {
      expect(screen.getByText("Hello squad!")).toBeInTheDocument();
    });

    // Check message containers for flex-row-reverse vs flex-row
    const myMsg = screen.getByText("Hello squad!").closest(".flex");
    const otherMsg = screen.getByText("Ready for match!").closest(".flex");

    expect(myMsg?.className).toContain("flex-row-reverse");
    expect(otherMsg?.className).toContain("flex-row");
  });

  it("handles socket events: joins room on mount, appends incoming chat.message, and emits chat.send on submission", async () => {
    const user = userEvent.setup();
    render(<ChatRoom roomId="general" />);

    // 1. Verify socket.emit("chat.join") on mount
    expect(mockSocket.emit).toHaveBeenCalledWith("chat.join", { roomId: "general" });

    await waitFor(() => {
      expect(screen.getByText("Hello squad!")).toBeInTheDocument();
    });

    // 2. Simulate receiving chat.message via socket event
    act(() => {
      if (eventListeners["chat.message"]) {
        eventListeners["chat.message"]({
          id: "msg-3",
          roomId: "general",
          senderId: "user-999",
          content: "Incoming live message!",
          messageType: "text",
          createdAt: new Date().toISOString()
        });
      }
    });

    expect(screen.getByText("Incoming live message!")).toBeInTheDocument();

    // 3. Type and submit message via chat input (verify socket.emit("chat.send"))
    const input = screen.getByPlaceholderText(/Message this channel session/i);
    const sendBtn = screen.getByRole("button", { name: "" }); // icon button

    await user.type(input, "Winning play!");
    await user.click(sendBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith("chat.send", {
      roomId: "general",
      content: "Winning play!"
    });
  });
});
