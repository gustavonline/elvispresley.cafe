import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ElvisCafe } from "@/components/elvis-cafe";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", { alt, ...props }),
}));

describe("ElvisCafe", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("starts the player and changes stations", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    expect(screen.getByTestId("station-title")).toHaveTextContent("Sun Studio After Dark");

    fireEvent.click(screen.getByRole("button", { name: /next station/i }));

    expect(screen.getByTestId("station-title")).toHaveTextContent("Vegas Midnight Jukebox");
  });

  it("keeps hidden tool controls out of the pre-start keyboard path", () => {
    render(<ElvisCafe />);

    expect(screen.queryByRole("navigation", { name: /cafe tools/i })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Tab" });

    expect(screen.getByRole("button", { name: /press any key to start/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "a", code: "KeyA" });

    expect(screen.getByRole("navigation", { name: /cafe tools/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("does not run global shortcuts while focus is inside an interactive control", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    const volume = screen.getByRole("slider", { name: /volume/i });
    volume.focus();
    fireEvent.keyDown(volume, { key: "ArrowRight" });

    expect(screen.getByTestId("station-title")).toHaveTextContent("Sun Studio After Dark");
  });

  it("manages About dialog semantics, focus trap, shortcut blocking, and Escape close", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));
    fireEvent.click(screen.getByRole("button", { name: /about/i }));

    const dialog = screen.getByRole("dialog", { name: /elvispresley\.cafe/i });
    const closeButton = screen.getByRole("button", { name: /^close$/i });
    const disableShortcuts = screen.getByRole("checkbox", { name: /disable keyboard shortcuts/i });

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("station-title")).toHaveTextContent("Sun Studio After Dark");

    disableShortcuts.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: /elvispresley\.cafe/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /about/i })).toHaveFocus();
  });

  it("labels the timer panel and restores focus when it closes", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    const timerButton = screen.getByRole("button", { name: /pomodoro timer/i });
    fireEvent.click(timerButton);

    expect(timerButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: /pomodoro timer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^start$/i })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: /close timer/i }));

    expect(screen.queryByRole("region", { name: /pomodoro timer/i })).not.toBeInTheDocument();
    expect(timerButton).toHaveFocus();
  });
});
