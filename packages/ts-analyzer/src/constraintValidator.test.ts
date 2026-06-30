import { describe, expect, it } from "vitest";
import { ConstraintValidator } from "./constraintValidator";

const gameObject = {
  id: "test-obj-1",
  path: "TestItem",
  name: "TestItem",
  parent: "",
  components: [
    {
      id: "comp-1",
      type: "UnityEngine.Rigidbody",
      enabled: true,
      properties: {},
    },
  ],
};

describe("ConstraintValidator", () => {
  it("validates required components", () => {
    const result = ConstraintValidator.validateGameObject(gameObject, [
      { componentType: "UnityEngine.Rigidbody", requirement: "required" },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.missingRequired).toHaveLength(0);
  });

  it("detects missing required components", () => {
    const result = ConstraintValidator.validateGameObject(gameObject, [
      { componentType: "UnityEngine.Collider", requirement: "required" },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.missingRequired).toEqual(["UnityEngine.Collider"]);
  });
});
