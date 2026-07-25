import { Component, ComponentConstraint, GameObject, SceneGraph } from "./types";
import { ClusterScriptDefinitions } from "./clusterScriptDefinitions";
import { SceneGraphParser } from "./sceneGraphParser";

/**
 * コンポーネント制約の検証エンジン
 */
export class ConstraintValidator {
  /**
   * GameObjectが指定されたコンポーネント制約を満たしているかチェック
   */
  static validateGameObject(
    gameObject: GameObject,
    constraints: ComponentConstraint[],
    sceneGraph?: SceneGraph,
  ): {
    isValid: boolean;
    missingRequired: string[];
    extraForbidden: string[];
  } {
    const components = sceneGraph
      ? SceneGraphParser.getEnabledComponentsInHierarchy(sceneGraph, gameObject)
      : gameObject.components;

    const availableComponents = new Set(
      components.filter((c) => c.enabled).map((c) => c.type),
    );

    const missingRequired: string[] = [];
    const extraForbidden: string[] = [];

    for (const constraint of constraints) {
      switch (constraint.requirement) {
        case "required":
          if (!availableComponents.has(constraint.componentType)) {
            missingRequired.push(constraint.componentType);
          }
          break;

        case "forbidden":
          if (availableComponents.has(constraint.componentType)) {
            extraForbidden.push(constraint.componentType);
          }
          break;

        case "optional":
          // オプショナルなので何もしない
          break;
      }
    }

    const isValid = missingRequired.length === 0 && extraForbidden.length === 0;

    return {
      isValid,
      missingRequired,
      extraForbidden,
    };
  }

  /**
   * コンポーネント利用可能性を検証
   */
  static validateComponentUsage(
    gameObject: GameObject,
    componentType: string,
    sceneGraph?: SceneGraph,
  ): boolean {
    const components = sceneGraph
      ? SceneGraphParser.getEnabledComponentsInHierarchy(sceneGraph, gameObject)
      : gameObject.components;
    return components.some((c) => c.type === componentType && c.enabled);
  }

  /**
   * 複数のコンポーネントが必要な場合、すべてが存在するかチェック
   */
  static validateAllComponentsPresent(
    gameObject: GameObject,
    requiredComponents: string[],
    sceneGraph?: SceneGraph,
  ): {
    isValid: boolean;
    present: string[];
    missing: string[];
  } {
    const present: string[] = [];
    const missing: string[] = [];

    const enabledComponents = new Set(
      (sceneGraph
        ? SceneGraphParser.getEnabledComponentsInHierarchy(sceneGraph, gameObject)
        : gameObject.components
      )
        .filter((c) => c.enabled)
        .map((c) => c.type),
    );

    for (const component of requiredComponents) {
      if (enabledComponents.has(component)) {
        present.push(component);
      } else {
        missing.push(component);
      }
    }

    return {
      isValid: missing.length === 0,
      present,
      missing,
    };
  }

  /**
   * コンポーネントが含まれないかチェック (禁止コンポーネント)
   */
  static validateNoForbiddenComponents(
    gameObject: GameObject,
    forbiddenComponents: string[],
    sceneGraph?: SceneGraph,
  ): {
    isValid: boolean;
    found: string[];
  } {
    const enabledComponents = new Set(
      (sceneGraph
        ? SceneGraphParser.getEnabledComponentsInHierarchy(sceneGraph, gameObject)
        : gameObject.components
      )
        .filter((c) => c.enabled)
        .map((c) => c.type),
    );

    const found: string[] = forbiddenComponents.filter((c) =>
      enabledComponents.has(c),
    );

    return {
      isValid: found.length === 0,
      found,
    };
  }

  /**
   * コンポーネントプロパティの検証
   */
  static validateComponentProperty(
    component: Component,
    propertyName: string,
    expectedValue?: any,
  ): boolean {
    if (!component.properties) {
      return false;
    }

    if (!(propertyName in component.properties)) {
      return false;
    }

    if (expectedValue !== undefined) {
      return component.properties[propertyName] === expectedValue;
    }

    return true;
  }

  /**
   * メソッド使用可能性の検証
   */
  static canUseMethod(
    gameObject: GameObject,
    methodName: string,
  ): {
    canUse: boolean;
    missingComponents: string[];
  } {
    const constraints =
      ClusterScriptDefinitions.getMethodConstraints(methodName);
    const validation = this.validateGameObject(gameObject, constraints);

    return {
      canUse: validation.isValid,
      missingComponents: validation.missingRequired,
    };
  }

  /**
   * プロパティアクセス可能性の検証
   */
  static canAccessProperty(
    gameObject: GameObject,
    propertyName: string,
  ): {
    canAccess: boolean;
    missingComponents: string[];
  } {
    const constraints =
      ClusterScriptDefinitions.getPropertyConstraints(propertyName);
    const validation = this.validateGameObject(gameObject, constraints);

    return {
      canAccess: validation.isValid,
      missingComponents: validation.missingRequired,
    };
  }

  /**
   * 複数メソッドの使用可能性を一括検証
   */
  static batchValidateMethods(
    gameObject: GameObject,
    methodNames: string[],
  ): Map<string, { canUse: boolean; missingComponents: string[] }> {
    const results = new Map();

    for (const methodName of methodNames) {
      results.set(methodName, this.canUseMethod(gameObject, methodName));
    }

    return results;
  }

  /**
   * 複数プロパティのアクセス可能性を一括検証
   */
  static batchValidateProperties(
    gameObject: GameObject,
    propertyNames: string[],
  ): Map<string, { canAccess: boolean; missingComponents: string[] }> {
    const results = new Map();

    for (const propertyName of propertyNames) {
      results.set(
        propertyName,
        this.canAccessProperty(gameObject, propertyName),
      );
    }

    return results;
  }

  /**
   * コンポーネントの互換性チェック
   */
  static checkComponentCompatibility(
    gameObject: GameObject,
    component1: string,
    component2: string,
  ): boolean {
    const hasComponent1 = gameObject.components.some(
      (c) => c.type === component1 && c.enabled,
    );
    const hasComponent2 = gameObject.components.some(
      (c) => c.type === component2 && c.enabled,
    );

    // 両方あるか、どちらでもない場合は互換性がある
    // 片方だけある場合は互換性がない（要件に応じてカスタマイズ可能）
    return hasComponent1 === hasComponent2;
  }
}
