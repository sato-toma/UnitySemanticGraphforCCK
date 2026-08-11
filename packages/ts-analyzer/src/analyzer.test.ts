import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { ClusterScriptAnalyzer } from "./analyzer";
import { SceneGraphParser } from "./sceneGraphParser";

describe("ClusterScriptAnalyzer", () => {
  it("validates scriptable item behavior against the matching scene object", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-analyzer-"));
    const tsFilePath = path.join(tempDir, "sample.ts");
    const sceneGraphPath = path.join(tempDir, "SceneGraph.toml");

    fs.writeFileSync(tsFilePath, "$.onGrab(() => {});\n");
    fs.writeFileSync(
      sceneGraphPath,
      `
project = "TestProject"

[[gameObjects]]
id = "item-object"
path = "Item"
name = "Item"
parent = ""

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.Item"
enabled = true

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.GrabbableItem"
enabled = true

[[gameObjects.components]]
type = "UnityEngine.Rigidbody"
enabled = true

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.MovableItem"
enabled = true

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.ScriptableItem"
enabled = true
[gameObjects.components.properties]
Source_Code_Asset = "onGrabScript"

[[gameObjects]]
id = "other-object"
path = "Other"
name = "Other"
parent = ""
`,
    );

    const analyzer = new ClusterScriptAnalyzer(sceneGraphPath);
    const result = analyzer.analyzeTypeScriptFile(tsFilePath);

    expect(result.issues).toHaveLength(0);
  });

  it("requires MovableItem for setPosition and setRotation", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-analyzer-"));
    const tsFilePath = path.join(tempDir, "sample.ts");
    const sceneGraphPath = path.join(tempDir, "SceneGraph.toml");

    fs.writeFileSync(
      tsFilePath,
      "$.setPosition(new Vector3(1, 2, 3));\n$.setRotation(new Quaternion().setFromEulerAngles(new Vector3(0, 90, 0)));\n",
    );
    fs.writeFileSync(
      sceneGraphPath,
      `
project = "TestProject"

[[gameObjects]]
id = "item-object"
path = "Item"
name = "Item"
parent = ""

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.Item"
enabled = true

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.ScriptableItem"
enabled = true
[gameObjects.components.properties]
Source_Code_Asset = "onGrabScript"
`,
    );

    const analyzer = new ClusterScriptAnalyzer(sceneGraphPath);
    const result = analyzer.analyzeTypeScriptFile(tsFilePath);

    expect(result.issues).toHaveLength(2);
    expect(result.issues.map((issue) => issue.apiCall)).toEqual([
      "setPosition",
      "setRotation",
    ]);
    expect(result.issues[0]?.requiredComponents).toEqual([
      "ClusterVR.CreatorKit.Item.Implements.MovableItem",
    ]);
  });

  it("accepts MovableItem from the parent hierarchy", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-analyzer-"));
    const tsFilePath = path.join(tempDir, "sample.ts");
    const sceneGraphPath = path.join(tempDir, "SceneGraph.toml");

    fs.writeFileSync(tsFilePath, "$.setPosition(new Vector3(1, 2, 3));\n");
    fs.writeFileSync(
      sceneGraphPath,
      `
project = "TestProject"

[[gameObjects]]
id = "parent-obj"
path = "setPosition"
name = "setPosition"
parent = ""

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.MovableItem"
enabled = true

[[gameObjects]]
id = "child-obj"
path = "setPosition/Cube"
name = "Cube"
parent = "parent-obj"
`,
    );

    const sceneGraph = SceneGraphParser.parseFile(sceneGraphPath);
    const childObject = sceneGraph.gameObjects.find(
      (obj) => obj.id === "child-obj",
    );
    const components = SceneGraphParser.getEnabledComponentsInHierarchy(
      sceneGraph,
      childObject!,
    );

    expect(
      components.some(
        (component) =>
          component.type === "ClusterVR.CreatorKit.Item.Implements.MovableItem",
      ),
    ).toBe(true);

    const analyzer = new ClusterScriptAnalyzer(sceneGraphPath);
    const result = analyzer.analyzeTypeScriptFile(tsFilePath);

    expect(result.issues).toHaveLength(0);
  });

  it("validates the specific ScriptableItem that matches the analyzed file", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-analyzer-"));
    const tsFilePath = path.join(tempDir, "setRotationScript.ts");
    const sceneGraphPath = path.join(tempDir, "SceneGraph.toml");

    fs.writeFileSync(
      tsFilePath,
      "$.setRotation(new Quaternion().setFromEulerAngles(new Vector3(0, 90, 0)));\n",
    );
    fs.writeFileSync(
      sceneGraphPath,
      `
project = "TestProject"

[[gameObjects]]
id = "movable-object"
path = "Movable"
name = "Movable"
parent = ""

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.MovableItem"
enabled = true

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.ScriptableItem"
enabled = true
[gameObjects.components.properties]
Source_Code_Asset = "onGrabScript"

[[gameObjects]]
id = "rotation-object"
path = "setRotation"
name = "setRotation"
parent = ""

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.ScriptableItem"
enabled = true
[gameObjects.components.properties]
Source_Code_Asset = "setRotationScript"
`,
    );

    const analyzer = new ClusterScriptAnalyzer(sceneGraphPath);
    const result = analyzer.analyzeTypeScriptFile(tsFilePath);

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.apiCall).toBe("setRotation");
    expect(result.issues[0]?.requiredComponents).toEqual([
      "ClusterVR.CreatorKit.Item.Implements.MovableItem",
    ]);
  });

  it("resolves a nested script from Source_Code_Asset by basename", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-analyzer-"));
    const sceneGraphPath = path.join(tempDir, "SceneGraph.toml");
    const sourceDir = path.join(tempDir, "src");
    const sourceFilePath = path.join(sourceDir, "setRotationScript.ts");

    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(
      sourceFilePath,
      "$.setRotation(new Quaternion().setFromEulerAngles(new Vector3(0, 90, 0)));\n",
    );
    fs.writeFileSync(
      sceneGraphPath,
      `
project = "TestProject"

[[gameObjects]]
id = "rotation-object"
path = "setRotation"
name = "setRotation"
parent = ""

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.ScriptableItem"
enabled = true
[gameObjects.components.properties]
Source_Code_Asset = "setRotationScript"
`,
    );

    const analyzer = new ClusterScriptAnalyzer(sceneGraphPath);
    const result = analyzer.analyzeTypeScriptFile();

    expect(result.filePath).toBe(sourceFilePath);
  });

  it("resolves a script from Source_Code_Asset when no file path is provided", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-analyzer-"));
    const sceneGraphPath = path.join(tempDir, "SceneGraph.toml");
    const sourceDir = path.join(tempDir, "src");
    const sourceFilePath = path.join(sourceDir, "setPosition.ts");

    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(sourceFilePath, "$.setPosition(new Vector3(1, 2, 3));\n");
    fs.writeFileSync(
      sceneGraphPath,
      `
project = "TestProject"

[[gameObjects]]
id = "item-object"
path = "Item"
name = "Item"
parent = ""

[[gameObjects.components]]
type = "ClusterVR.CreatorKit.Item.Implements.ScriptableItem"
enabled = true
[gameObjects.components.properties]
Source_Code_Asset = "src/setPosition"
`,
    );

    const analyzer = new ClusterScriptAnalyzer(sceneGraphPath);
    const result = analyzer.analyzeTypeScriptFile();

    expect(result.filePath).toBe(sourceFilePath);
  });
});
