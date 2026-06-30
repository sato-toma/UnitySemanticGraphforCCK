import { describe, expect, it } from "vitest";
import { SceneGraphParser } from "./sceneGraphParser";

const sampleToml = `
project = "TestProject"

[[gameObjects]]
id = "test-obj-1"
path = "TestItem"
name = "TestItem"
parent = ""

[[gameObjects.components]]
id = "comp-1"
type = "UnityEngine.Rigidbody"
enabled = true
`;

describe("SceneGraphParser", () => {
  it("parses a simple SceneGraph TOML", () => {
    const sceneGraph = SceneGraphParser.parse(sampleToml);
    expect(sceneGraph.project).toBe("TestProject");
    expect(sceneGraph.gameObjects).toHaveLength(1);
    const firstGameObject = sceneGraph.gameObjects[0]!;
    const firstComponent = firstGameObject.components[0]!;
    expect(firstComponent.type).toBe("UnityEngine.Rigidbody");
  });

  it("finds game objects by component", () => {
    const sceneGraph = SceneGraphParser.parse(sampleToml);
    const rigidbodies = SceneGraphParser.getGameObjectsWithComponent(
      sceneGraph,
      "UnityEngine.Rigidbody",
    );
    expect(rigidbodies).toHaveLength(1);
    expect(rigidbodies[0]!.name).toBe("TestItem");
  });
});
