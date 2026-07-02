import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock jwt-decode before importing jwt module
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

import { isJwtTokenFormat, decodedToken } from "../jwt";
import { jwtDecode } from "jwt-decode";

const mockJwtDecode = jwtDecode as ReturnType<typeof vi.fn>;

const validPayload = {
  userId: "user-123",
  email: "test@example.com",
  role: "user",
  subscriptionType: "free",
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000) - 60,
};

describe("isJwtTokenFormat", () => {
  it("should return true for a valid 3-part JWT", () => {
    expect(isJwtTokenFormat("part1.part2.part3")).toBe(true);
    expect(isJwtTokenFormat("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U")).toBe(true);
  });

  it("should return false for non-string input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isJwtTokenFormat(null as any)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isJwtTokenFormat(undefined as any)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isJwtTokenFormat(123 as any)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isJwtTokenFormat({} as any)).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isJwtTokenFormat("")).toBe(false);
  });

  it("should return false for single dot (no parts)", () => {
    expect(isJwtTokenFormat("nodots")).toBe(false);
  });

  it("should return false for single dot (2 parts)", () => {
    expect(isJwtTokenFormat("one.two")).toBe(false);
  });

  it("should return false for four parts", () => {
    expect(isJwtTokenFormat("one.two.three.four")).toBe(false);
  });

  it("should return false for whitespace-only string", () => {
    expect(isJwtTokenFormat("   ")).toBe(false);
  });
});

describe("decodedToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw for invalid token format", () => {
    expect(() => decodedToken("not-a-jwt")).toThrow("Token format is invalid");
  });

  it("should throw for empty string", () => {
    expect(() => decodedToken("")).toThrow("Token format is invalid");
  });

  it("should throw when jwtDecode throws", () => {
    mockJwtDecode.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Failed to decode JWT token");
  });

  it("should throw when decoded payload is not an object", () => {
    mockJwtDecode.mockReturnValueOnce(null);
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token payload is not a valid object");
    mockJwtDecode.mockReturnValueOnce("string");
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token payload is not a valid object");
  });

  it("should throw when userId and _id are missing", () => {
    mockJwtDecode.mockReturnValueOnce({
      email: "test@example.com",
      role: "user",
      subscriptionType: "free",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token is missing a valid");
  });

  it("should throw when userId is empty string", () => {
    mockJwtDecode.mockReturnValueOnce({
      userId: "   ",
      email: "test@example.com",
      role: "user",
      subscriptionType: "free",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token is missing a valid");
  });

  it("should throw when email is missing", () => {
    mockJwtDecode.mockReturnValueOnce({
      userId: "user-123",
      role: "user",
      subscriptionType: "free",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token is missing a valid");
  });

  it("should throw when email is invalid format", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      email: "not-an-email",
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token 'email' claim is not a valid email");
  });

  it("should throw when role is missing", () => {
    mockJwtDecode.mockReturnValueOnce({
      userId: "user-123",
      email: "test@example.com",
      subscriptionType: "free",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token is missing a valid");
  });

  it("should throw for invalid role", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      role: "superuser",
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token 'role' claim must be one of:");
  });

  it("should throw for invalid subscriptionType", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      subscriptionType: "enterprise",
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token 'subscriptionType' claim must be one of:");
  });

  it("should throw when exp is missing", () => {
    mockJwtDecode.mockReturnValueOnce({
      userId: "user-123",
      email: "test@example.com",
      role: "user",
      subscriptionType: "free",
      iat: Math.floor(Date.now() / 1000) - 60,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token is missing a valid numeric");
  });

  it("should throw when token is expired", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      exp: Math.floor(Date.now() / 1000) - 3600,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token has expired");
  });

  it("should throw when iat is missing", () => {
    mockJwtDecode.mockReturnValueOnce({
      userId: "user-123",
      email: "test@example.com",
      role: "user",
      subscriptionType: "free",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token is missing a valid numeric");
  });

  it("should throw when name is not a string", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: 123 as any,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token 'name' claim must be a string");
  });

  it("should throw when postsCount is not a number", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      postsCount: "many" as any,
    });
    expect(() => decodedToken("part1.part2.part3")).toThrow("Token 'postsCount' claim must be a number");
  });

  it("should return decoded payload for valid token", () => {
    mockJwtDecode.mockReturnValueOnce(validPayload);
    const result = decodedToken("part1.part2.part3");
    expect(result).toEqual(validPayload);
    expect(mockJwtDecode).toHaveBeenCalledWith("part1.part2.part3");
  });

  it("should accept valid roles: user, admin, super_admin, writer, guest", () => {
    const roles = ["user", "admin", "super_admin", "writer", "guest"];
    for (const role of roles) {
      mockJwtDecode.mockReturnValueOnce({ ...validPayload, role });
      expect(() => decodedToken("part1.part2.part3")).not.toThrow();
    }
  });

  it("should accept valid subscriptionTypes: free, pro, premium", () => {
    const subs = ["free", "pro", "premium"];
    for (const sub of subs) {
      mockJwtDecode.mockReturnValueOnce({ ...validPayload, subscriptionType: sub });
      expect(() => decodedToken("part1.part2.part3")).not.toThrow();
    }
  });

  it("should accept valid optional name and postsCount", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      name: "Test User",
      postsCount: 42,
    });
    const result = decodedToken("part1.part2.part3");
    expect(result.name).toBe("Test User");
    expect(result.postsCount).toBe(42);
  });

  it("should accept _id instead of userId", () => {
    mockJwtDecode.mockReturnValueOnce({
      ...validPayload,
      _id: "user-456",
      userId: undefined,
    });
    expect(() => decodedToken("part1.part2.part3")).not.toThrow();
  });
});
