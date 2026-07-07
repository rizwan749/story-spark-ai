/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSessionBookmarks,
  addSessionBookmark,
  removeSessionBookmark,
  isSessionBookmarked,
} from "../session-bookmarks";

const SESSION_KEY = "story_spark_session_bookmarks";

const SESSION_STORE: Record<string, string> = {};
const mockGetItem = vi.fn((key: string) => SESSION_STORE[key] ?? null);
const mockSetItem = vi.fn((key: string, value: string) => {
  SESSION_STORE[key] = value;
});
const mockDispatchEvent = vi.fn();

const mockSessionStorage = {
  getItem: mockGetItem,
  setItem: mockSetItem,
  removeItem: vi.fn((key: string) => {
    delete SESSION_STORE[key];
  }),
  clear: vi.fn(() => {
    Object.keys(SESSION_STORE).forEach((k) => delete SESSION_STORE[k]);
  }),
  get length() {
    return Object.keys(SESSION_STORE).length;
  },
  key: vi.fn((i: number) => Object.keys(SESSION_STORE)[i] ?? null),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(SESSION_STORE).forEach((k) => delete SESSION_STORE[k]);

  Object.defineProperty(globalThis, "sessionStorage", {
    value: mockSessionStorage,
    writable: true,
  });

  Object.defineProperty(globalThis, "window", {
    value: {
      dispatchEvent: mockDispatchEvent,
    },
    writable: true,
  });
});

interface Story {
  uuid: string;
  title: string;
  content: string;
  prompt: string;
  author: string;
}

const makeStory = (uuid: string, title = "Test Story"): Story => ({
  uuid,
  title,
  content: "content",
  prompt: "prompt",
  author: "author",
});

describe("getSessionBookmarks", () => {
  it("returns an empty array when sessionStorage is empty", () => {
    const result = getSessionBookmarks();
    expect(result).toEqual([]);
    expect(mockGetItem).toHaveBeenCalledWith(SESSION_KEY);
  });

  it("parses and returns bookmarks from sessionStorage", () => {
    const stories = [makeStory("abc-123", "Story A"), makeStory("def-456", "Story B")];
    SESSION_STORE[SESSION_KEY] = JSON.stringify(stories);

    const result = getSessionBookmarks();
    expect(result).toHaveLength(2);
    expect(result[0].uuid).toBe("abc-123");
    expect(result[1].uuid).toBe("def-456");
  });

  it("returns an empty array when sessionStorage contains invalid JSON", () => {
    SESSION_STORE[SESSION_KEY] = "not valid json";

    const result = getSessionBookmarks();
    expect(result).toEqual([]);
    expect(mockGetItem).toHaveBeenCalledWith(SESSION_KEY);
  });
});

describe("addSessionBookmark", () => {
  it("adds a story to sessionStorage", () => {
    const story = makeStory("uuid-1");
    addSessionBookmark(story);

    expect(mockSetItem).toHaveBeenCalledWith(SESSION_KEY, expect.any(String));
    const saved = JSON.parse(SESSION_STORE[SESSION_KEY]);
    expect(saved).toHaveLength(1);
    expect(saved[0].uuid).toBe("uuid-1");
  });

  it("dispatches session_bookmarks_changed event after adding", () => {
    addSessionBookmark(makeStory("uuid-2"));
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "session_bookmarks_changed" })
    );
  });

  it("does not add duplicate bookmark for same uuid", () => {
    const story = makeStory("dup-uuid");
    addSessionBookmark(story);
    addSessionBookmark(story);

    const saved = JSON.parse(SESSION_STORE[SESSION_KEY]);
    expect(saved).toHaveLength(1);
    expect(mockSetItem).toHaveBeenCalledTimes(1);
  });

  it("adds two different stories without deduplication", () => {
    addSessionBookmark(makeStory("uuid-a"));
    addSessionBookmark(makeStory("uuid-b"));

    const saved = JSON.parse(SESSION_STORE[SESSION_KEY]);
    expect(saved).toHaveLength(2);
  });
});

describe("removeSessionBookmark", () => {
  it("removes the story with the given uuid from sessionStorage", () => {
    SESSION_STORE[SESSION_KEY] = JSON.stringify([
      makeStory("remove-me"),
      makeStory("keep-me"),
    ]);

    removeSessionBookmark("remove-me");

    const saved = JSON.parse(SESSION_STORE[SESSION_KEY]);
    expect(saved).toHaveLength(1);
    expect(saved[0].uuid).toBe("keep-me");
  });

  it("dispatches session_bookmarks_changed event after removing", () => {
    SESSION_STORE[SESSION_KEY] = JSON.stringify([makeStory("to-remove")]);
    mockDispatchEvent.mockClear();

    removeSessionBookmark("to-remove");
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "session_bookmarks_changed" })
    );
  });

  it("handles removal of non-existent uuid without error", () => {
    expect(() => removeSessionBookmark("non-existent")).not.toThrow();
  });
});

describe("isSessionBookmarked", () => {
  it("returns true when the uuid exists in bookmarks", () => {
    SESSION_STORE[SESSION_KEY] = JSON.stringify([makeStory("exists-uuid")]);

    const result = isSessionBookmarked("exists-uuid");
    expect(result).toBe(true);
  });

  it("returns false when the uuid does not exist in bookmarks", () => {
    SESSION_STORE[SESSION_KEY] = JSON.stringify([makeStory("other-uuid")]);

    const result = isSessionBookmarked("missing-uuid");
    expect(result).toBe(false);
  });

  it("returns false when sessionStorage is empty", () => {
    const result = isSessionBookmarked("any-uuid");
    expect(result).toBe(false);
  });
});
