// __tests__/unit.test.js

import { validate } from "../models/user.model.js";

// - These functions represent pure logic used in controllers
// - We test them here to ensure mathematical correctness
const calculateNewAverage = (currentAvg, count, newRating) => {
  if (count === 0) return newRating;
  const newCount = count + 1;
  const total = currentAvg * count + newRating;
  return Number((total / newCount).toFixed(2));
};

describe("Unit Tests - Pure Logic & Validation", () => {
  // SECTION 1: User Input Validation Logic
  describe("User Validation Logic", () => {
    // - Case: Valid User
    it("Should return no error for a completely valid user object", () => {
      const validUser = {
        nickname: "CodeMaster",
        email: "valid@example.com",
        password: "password123", // > 8 chars
        role: "user",
      };
      const { error } = validate(validUser);
      expect(error).toBeUndefined();
    });

    // - Case: Missing Email
    it("Should return an error when email is missing", () => {
      const invalidUser = {
        nickname: "NoEmailUser",
        password: "password123",
        role: "user",
      };
      const { error } = validate(invalidUser);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("email");
    });

    // - Case: Invalid Email Format
    it("Should return an error for invalid email format", () => {
      const invalidUser = {
        nickname: "BadEmail",
        email: "not-an-email",
        password: "password123",
        role: "user",
      };
      const { error } = validate(invalidUser);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("must be a valid email");
    });

    // - Case: Password Too Short
    it("Should return an error if password is less than 8 characters", () => {
      const shortPassUser = {
        nickname: "ShortPass",
        email: "test@test.com",
        password: "123", // < 8 chars
        role: "user",
      };
      const { error } = validate(shortPassUser);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("length must be at least 8");
    });

    // - Case: Password Too Long
    it("Should return an error if password is too long (> 100 chars)", () => {
      const longPass = "a".repeat(101);
      const longPassUser = {
        nickname: "LongPass",
        email: "test@test.com",
        password: longPass,
        role: "user",
      };
      const { error } = validate(longPassUser);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain(
        "length must be less than or equal to 100"
      );
    });

    // - Case: Missing Role
    it("Should return an error when role is missing", () => {
      const noRoleUser = {
        nickname: "NoRole",
        email: "test@test.com",
        password: "password123",
      };
      const { error } = validate(noRoleUser);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("role");
    });
  });

  // SECTION 2: Rating Calculation Logic
  describe("Rating Calculation Logic", () => {
    // - Case: First Rating
    it("Should return the rating itself if it is the first rating", () => {
      const result = calculateNewAverage(0, 0, 5);
      expect(result).toBe(5);
    });

    // - Case: Updating Average
    it("Should correctly update the average rating", () => {
      // Logic: (4.0 * 1 + 5.0) / 2 = 4.5
      const result = calculateNewAverage(4.0, 1, 5.0);
      expect(result).toBe(4.5);
    });

    // - Case: Floating Point Precision
    it("Should handle floating point results correctly (2 decimal places)", () => {
      // Logic: (4.5 * 2 + 3) / 3 = 12 / 3 = 4.0
      // Logic: (3.5 * 10 + 4) / 11 = 39 / 11 = 3.5454... -> 3.55
      const result = calculateNewAverage(3.5, 10, 4);
      expect(result).toBe(3.55);
    });

    // - Case: High Volume Calculation
    it("Should remain stable with larger numbers", () => {
      // Logic: (4.8 * 100 + 2) / 101 = 482 / 101 = 4.772... -> 4.77
      const result = calculateNewAverage(4.8, 100, 2);
      expect(result).toBe(4.77);
    });
  });
});
