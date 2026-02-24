import { describe, it, expect, beforeEach } from "vitest";
import {
  loadLastSyncTime,
  saveLastSyncTime,
} from "./localStorage";

describe("localStorage sync helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadLastSyncTime returns null when nothing stored", () => {
    expect(loadLastSyncTime()).toBeNull();
  });

  it("saveLastSyncTime and loadLastSyncTime roundtrip", () => {
    const date = new Date("2025-02-23T12:00:00.000Z");
    saveLastSyncTime(date);
    const loaded = loadLastSyncTime();
    expect(loaded).toBeInstanceOf(Date);
    expect(loaded.toISOString()).toBe(date.toISOString());
  });

  it("saveLastSyncTime accepts ISO string", () => {
    const iso = "2025-02-23T12:00:00.000Z";
    saveLastSyncTime(iso);
    const loaded = loadLastSyncTime();
    expect(loaded).toBeInstanceOf(Date);
    expect(loaded.toISOString()).toBe(iso);
  });
});
