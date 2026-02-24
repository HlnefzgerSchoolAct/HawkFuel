import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requestPermission,
  startReminderScheduler,
  stopReminderScheduler,
} from "./notificationService";

describe("notificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== "undefined" && "Notification" in window) {
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: vi.fn().mockResolvedValue("granted"),
      });
    }
  });

  it("requestPermission returns granted when permission is granted", async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    vi.stubGlobal("Notification", {
      permission: "granted",
      requestPermission: vi.fn(),
    });
    const result = await requestPermission();
    expect(result).toBe("granted");
  });

  it("requestPermission returns denied when permission is denied", async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    vi.stubGlobal("Notification", {
      permission: "denied",
      requestPermission: vi.fn(),
    });
    const result = await requestPermission();
    expect(result).toBe("denied");
  });

  it("startReminderScheduler and stopReminderScheduler do not throw", () => {
    expect(() => startReminderScheduler()).not.toThrow();
    expect(() => stopReminderScheduler()).not.toThrow();
  });
});
