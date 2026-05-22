import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import {
  PasswordChangeForm,
  DangerZone,
} from "@/components/settings/settings-forms";

// ─── Mocks ─────────────────────────────────────────────────────
const mockUpdateUser = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  })),
}));

// vi.mock factories are hoisted — declare toast spies with vi.hoisted
const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

// Mock shadcn Dialog so the content is always visible in jsdom
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({
    children,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogClose: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <button className={className}>{children}</button>,
}));

// ─── PasswordChangeForm ────────────────────────────────────────
describe("PasswordChangeForm component (Phase 4)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the password change form", () => {
    render(<PasswordChangeForm />);
    expect(screen.getByText("Đổi mật khẩu")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu mới")).toBeInTheDocument();
    expect(screen.getByLabelText("Xác nhận mật khẩu mới")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cập nhật mật khẩu/ }),
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", () => {
    render(<PasswordChangeForm />);
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới"), {
      target: { value: "different456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Cập nhật mật khẩu/ }));
    expect(mockToastError).toHaveBeenCalledWith("Mật khẩu xác nhận không khớp");
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("shows error when password is shorter than 6 characters", () => {
    render(<PasswordChangeForm />);
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới"), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Cập nhật mật khẩu/ }));
    expect(mockToastError).toHaveBeenCalledWith(
      "Mật khẩu phải có ít nhất 6 ký tự",
    );
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("calls supabase.auth.updateUser with new password on valid submit", async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null });
    render(<PasswordChangeForm />);
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới"), {
      target: { value: "newpassword" },
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Cập nhật mật khẩu/ }),
      );
    });
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "newpassword" });
    });
  });

  it("shows success toast after successful password update", async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null });
    render(<PasswordChangeForm />);
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới"), {
      target: { value: "newpassword" },
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Cập nhật mật khẩu/ }),
      );
    });
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("Đổi mật khẩu thành công");
    });
  });

  it("shows error toast when supabase update fails", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: "Same password" },
    });
    render(<PasswordChangeForm />);
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới"), {
      target: { value: "newpassword" },
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Cập nhật mật khẩu/ }),
      );
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Same password");
    });
  });
});

// ─── DangerZone ────────────────────────────────────────────────
describe("DangerZone component (Phase 4)", () => {
  const USER_EMAIL = "test@example.com";

  beforeEach(() => vi.clearAllMocks());

  it("renders the danger zone card", () => {
    render(<DangerZone email={USER_EMAIL} />);
    expect(screen.getByText("Vùng nguy hiểm")).toBeInTheDocument();
  });

  it("renders the delete account trigger button", () => {
    render(<DangerZone email={USER_EMAIL} />);
    // Both the DialogTrigger and the confirm button share the same label
    const buttons = screen.getAllByRole("button", { name: "Xóa tài khoản" });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the confirmation dialog content", () => {
    render(<DangerZone email={USER_EMAIL} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Xác nhận email để xóa tài khoản"),
    ).toBeInTheDocument();
  });

  it("confirm button is disabled when email does not match", () => {
    render(<DangerZone email={USER_EMAIL} />);
    fireEvent.change(screen.getByLabelText("Xác nhận email để xóa tài khoản"), {
      target: { value: "wrong@example.com" },
    });
    const buttons = screen.getAllByRole("button", { name: /Xóa tài khoản/ });
    // The confirm button (last) must be disabled when email doesn't match
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it("calls signOut when confirmation email matches", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    render(<DangerZone email={USER_EMAIL} />);
    fireEvent.change(screen.getByLabelText("Xác nhận email để xóa tài khoản"), {
      target: { value: USER_EMAIL },
    });
    // The confirm button should be enabled when email matches
    const buttons = screen.getAllByRole("button", { name: /Xóa tài khoản/ });
    await act(async () => {
      fireEvent.click(buttons[buttons.length - 1]!);
    });
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("shows success toast after account deletion", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    render(<DangerZone email={USER_EMAIL} />);
    fireEvent.change(screen.getByLabelText("Xác nhận email để xóa tài khoản"), {
      target: { value: USER_EMAIL },
    });
    const buttons = screen.getAllByRole("button", { name: /Xóa tài khoản/ });
    await act(async () => {
      fireEvent.click(buttons[buttons.length - 1]!);
    });
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("Tài khoản đã được xóa");
    });
  });

  it("shows error toast when signOut fails", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "Network error" } });
    render(<DangerZone email={USER_EMAIL} />);
    fireEvent.change(screen.getByLabelText("Xác nhận email để xóa tài khoản"), {
      target: { value: USER_EMAIL },
    });
    const buttons = screen.getAllByRole("button", { name: /Xóa tài khoản/ });
    await act(async () => {
      fireEvent.click(buttons[buttons.length - 1]!);
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Xóa tài khoản thất bại. Vui lòng liên hệ hỗ trợ.",
      );
    });
  });
});
