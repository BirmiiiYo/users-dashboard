import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Drawer } from "@/components/ui/drawer";

function Harness() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Открыть карточку
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Emily Johnson" description="admin">
        <p>Контент панели</p>
        <button type="button">Действие внутри</button>
      </Drawer>
    </div>
  );
}

describe("Drawer", () => {
  it("не рендерится, пока закрыт", () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("открывается модальным диалогом с подписью из заголовка", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Открыть карточку" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Emily Johnson");
    expect(dialog).toHaveAccessibleDescription("admin");
  });

  it("переводит фокус внутрь панели при открытии", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Открыть карточку" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Закрыть панель" }));
  });

  it("закрывается по Esc и возвращает фокус на триггер", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Открыть карточку" });

    await user.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("закрывается кликом по оверлею", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Открыть карточку" }));
    await user.click(screen.getByTestId("drawer-overlay"));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("циклит Tab внутри панели и не выпускает фокус наружу", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Открыть карточку" }));

    const close = screen.getByRole("button", { name: "Закрыть панель" });
    const inner = screen.getByRole("button", { name: "Действие внутри" });

    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(inner);
    // с последнего элемента Tab уводит на первый, а не в адресную строку браузера
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });

  it("блокирует прокрутку страницы под панелью", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Открыть карточку" }));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
