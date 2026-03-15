import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerativeUiBuilder from "../components/GenerativeUiBuilder";

describe("GenerativeUiBuilder", () => {
  it("renders the builder and summary", async () => {
    render(<GenerativeUiBuilder />);
    expect(screen.getByText(/Generative UI Builder/i)).toBeInTheDocument();
    expect(screen.getByTestId("builder-summary")).toBeInTheDocument();
  });

  it("updates summary when template changes", async () => {
    render(<GenerativeUiBuilder />);
    const select = screen.getByLabelText(/Template/i) as HTMLSelectElement;
    userEvent.selectOptions(select, "assistant");
    expect(select.value).toBe("assistant");
    expect(screen.getByTestId("builder-summary")).toHaveTextContent(/Assistant summary/i);
  });

  it("exposes the AI payload preview", () => {
    render(<GenerativeUiBuilder />);
    expect(screen.getByTestId("builder-preview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /AI payload/i })).toBeInTheDocument();
  });
});
