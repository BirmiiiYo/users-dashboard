import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("сразу отдаёт исходное значение", () => {
    const { result } = renderHook(() => useDebouncedValue("em", 350));
    expect(result.current).toBe("em");
  });

  it("не обновляется до истечения задержки", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 350), {
      initialProps: { value: "e" },
    });

    rerender({ value: "em" });
    act(() => {
      vi.advanceTimersByTime(349);
    });
    expect(result.current).toBe("e");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("em");
  });

  it("продлевает ожидание при каждом новом вводе (одна навигация вместо пяти)", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 350), {
      initialProps: { value: "" },
    });

    for (const value of ["e", "em", "emi", "emil", "emily"]) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    expect(result.current).toBe("");
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(result.current).toBe("emily");
  });
});
