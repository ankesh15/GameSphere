import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import { useAuthStore } from "../store/auth";

describe("Auth Module — Login & Register Coverage", () => {
  beforeEach(() => {
    // Reset auth store before each test
    useAuthStore.getState().clearTokens();
  });

  describe("LoginPage Component", () => {
    it("renders email, password, and sign-in button", () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
    });

    it("mutates auth store state on successful login", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/^Email$/i), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/i), "Password123!");
      await user.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.accessToken).toBe("mock-access-token");
        expect(state.user?.email).toBe("test@example.com");
      });
    });

    it("displays error message on invalid credentials failure", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/^Email$/i), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/i), "WrongPassword");
      await user.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe("RegisterPage Component", () => {
    it("enforces client-side validation schema via validateRegistrationForm", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      // Enter valid email but weak password to trigger client-side validation schema error
      await user.type(screen.getByLabelText(/^Email$/i), "test@example.com");
      await user.type(screen.getByLabelText(/^Username$/i), "ProGamer");
      await user.type(screen.getByLabelText(/^Password$/i), "short");

      const submitBtn = screen.getByRole("button", { name: /Create account/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
      });
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("mutates auth store state on successful registration", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/^Email$/i), "newuser@example.com");
      await user.type(screen.getByLabelText(/^Username$/i), "ProGamer");
      await user.type(screen.getByLabelText(/^Password$/i), "SecurePass123!");

      const submitBtn = screen.getByRole("button", { name: /Create account/i });
      await user.click(submitBtn);

      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.accessToken).toBe("mock-access-token");
        expect(state.user?.username).toBe("ProGamer");
      });
    });

    it("displays error toast on duplicate email API failure", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/^Email$/i), "existing@example.com");
      await user.type(screen.getByLabelText(/^Username$/i), "ProGamer");
      await user.type(screen.getByLabelText(/^Password$/i), "SecurePass123!");

      const submitBtn = screen.getByRole("button", { name: /Create account/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
      });
    });
  });
});
