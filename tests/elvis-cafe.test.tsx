import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ElvisCafe } from "@/components/elvis-cafe";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", { alt, ...props }),
}));

describe("ElvisCafe", () => {
  it("starts the player and changes stations", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    expect(screen.getByTestId("station-title")).toHaveTextContent("Sun Studio After Dark");

    fireEvent.click(screen.getByRole("button", { name: /next station/i }));

    expect(screen.getByTestId("station-title")).toHaveTextContent("Vegas Midnight Jukebox");
  });
});
