import { parse as parseToml } from "@iarna/toml";
import * as fs from "fs";
import { SceneGraph, GameObject, Component } from "./types";

/**
 * SceneGraph.toml ファイルを解析
 */
export class SceneGraphParser {
  /**
   * TOMLファイルをパース
   */
  static parseFile(filePath: string): SceneGraph {
    const content = fs.readFileSync(filePath, "utf-8");
    return this.parse(content);
  }

  /**
   * TOML文字列をパース
   */
  static parse(content: string): SceneGraph {
    const parsed = parseToml(content) as any;

    const sceneGraph: SceneGraph = {
      project: parsed.project || "Unknown",
      gameObjects: this.parseGameObjects(parsed.gameObjects || []),
    };

    return sceneGraph;
  }

  /**
   * GameObjectsを抽出・変換
   */
  private static parseGameObjects(rawObjects: any[]): GameObject[] {
    return rawObjects.map((obj) => ({
      id: obj.id || "",
      path: obj.path || "",
      name: obj.name || "",
      parent: obj.parent || "",
      components: this.parseComponents(obj.components || []),
    }));
  }

  /**
   * Componentsを抽出・変換
   */
  private static parseComponents(rawComponents: any[]): Component[] {
    return rawComponents.map((comp) => ({
      id: comp.id || "",
      type: comp.type || "",
      enabled: comp.enabled !== false,
      properties: comp.properties || {},
    }));
  }

  /**
   * GameObjectをIDで取得
   */
  static getGameObjectById(
    sceneGraph: SceneGraph,
    id: string,
  ): GameObject | null {
    return sceneGraph.gameObjects.find((obj) => obj.id === id) || null;
  }

  /**
   * GameObjectをパスで取得
   */
  static getGameObjectByPath(
    sceneGraph: SceneGraph,
    pathPattern: string,
  ): GameObject[] {
    const regex = new RegExp(pathPattern);
    return sceneGraph.gameObjects.filter((obj) => regex.test(obj.path));
  }

  /**
   * 指定オブジェクトの祖先を取得する
   */
  static getGameObjectAncestors(
    sceneGraph: SceneGraph,
    gameObject: GameObject,
  ): GameObject[] {
    const ancestors: GameObject[] = [];
    let current = gameObject;

    while (current.parent) {
      const parent = this.getGameObjectById(sceneGraph, current.parent);
      if (!parent) {
        break;
      }
      ancestors.push(parent);
      current = parent;
    }

    return ancestors;
  }

  /**
   * 指定オブジェクトと祖先を含めた有効なコンポーネントを取得する
   */
  static getEnabledComponentsInHierarchy(
    sceneGraph: SceneGraph,
    gameObject: GameObject,
  ): Component[] {
    const components = [...gameObject.components];
    for (const ancestor of this.getGameObjectAncestors(sceneGraph, gameObject)) {
      components.push(...ancestor.components);
    }
    return components.filter((comp) => comp.enabled);
  }

  /**
   * 特定のコンポーネントを持つGameObjectをすべて取得
   */
  static getGameObjectsWithComponent(
    sceneGraph: SceneGraph,
    componentType: string,
  ): GameObject[] {
    return sceneGraph.gameObjects.filter((obj) =>
      obj.components.some(
        (comp) => comp.type === componentType && comp.enabled,
      ),
    );
  }

  /**
   * ScriptableItem の Source_Code_Asset を参照する GameObject を検索
   */
  static getGameObjectsWithScriptableItem(sceneGraph: SceneGraph): GameObject[] {
    return sceneGraph.gameObjects.filter((obj) =>
      obj.components.some(
        (comp) =>
          comp.type === "ClusterVR.CreatorKit.Item.Implements.ScriptableItem" &&
          comp.enabled,
      ),
    );
  }

  /**
   * 特定のコンポーネントを持たないGameObjectをすべて取得
   */
  static getGameObjectsWithoutComponent(
    sceneGraph: SceneGraph,
    componentType: string,
  ): GameObject[] {
    return sceneGraph.gameObjects.filter(
      (obj) =>
        !obj.components.some(
          (comp) => comp.type === componentType && comp.enabled,
        ),
    );
  }

  /**
   * GameObjectのコンポーネント統計
   */
  static analyzeComponentDistribution(
    sceneGraph: SceneGraph,
  ): Map<string, number> {
    const distribution = new Map<string, number>();

    for (const obj of sceneGraph.gameObjects) {
      for (const comp of obj.components) {
        if (comp.enabled) {
          const count = distribution.get(comp.type) || 0;
          distribution.set(comp.type, count + 1);
        }
      }
    }

    return distribution;
  }

  /**
   * GameObjectの構造を可視化（デバッグ用）
   */
  static visualizeHierarchy(sceneGraph: SceneGraph): string {
    const lines: string[] = [];

    const roots = sceneGraph.gameObjects.filter((obj) => !obj.parent);

    const printNode = (obj: GameObject, depth: number = 0) => {
      const indent = "  ".repeat(depth);
      const componentNames = obj.components
        .filter((c) => c.enabled)
        .map((c) => c.type.split(".").pop())
        .join(", ");

      lines.push(
        `${indent}${obj.name}${componentNames ? ` [${componentNames}]` : ""}`,
      );

      const children = sceneGraph.gameObjects.filter(
        (o) => o.parent === obj.id,
      );
      for (const child of children) {
        printNode(child, depth + 1);
      }
    };

    for (const root of roots) {
      printNode(root);
    }

    return lines.join("\n");
  }
}
