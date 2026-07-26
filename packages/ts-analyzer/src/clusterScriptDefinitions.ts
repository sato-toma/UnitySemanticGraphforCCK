import {
  ApiMethod,
  ApiProperty,
  ClusterScriptDefinition,
  ComponentConstraint,
} from "./types";

/**
 * ClusterScript APIの定義と制約を管理
 * 参考: https://docs.cluster.mu/script/interfaces/ClusterScript.html
 */

export class ClusterScriptDefinitions {
  private static definitions: ClusterScriptDefinition | null = null;

  /**
   * ClusterScript定義をシングルトンで取得
   */
  static getDefinitions(): ClusterScriptDefinition {
    if (!this.definitions) {
      this.definitions = this.buildDefinitions();
    }
    return this.definitions;
  }

  /**
   * 定義を構築
   */
  private static buildDefinitions(): ClusterScriptDefinition {
    const methods = new Map<string, ApiMethod>();
    const properties = new Map<string, ApiProperty>();

    // 物理系メソッド
    methods.set("addForce", {
      name: "addForce",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      parameterTypes: ["Vector3"],
      returnType: "void",
      description: "アイテムの重心に力を加える (PhysicsUpdate内でのみ使用可)",
    });

    methods.set("addForceAt", {
      name: "addForceAt",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      parameterTypes: ["Vector3", "Vector3"],
      returnType: "void",
      description:
        "アイテムの指定位置に力を加える (PhysicsUpdate内でのみ使用可)",
    });

    methods.set("addImpulsiveForce", {
      name: "addImpulsiveForce",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      parameterTypes: ["Vector3"],
      returnType: "void",
      description: "アイテムの重心に撃力を加える",
    });

    methods.set("addImpulsiveForceAt", {
      name: "addImpulsiveForceAt",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      parameterTypes: ["Vector3", "Vector3"],
      returnType: "void",
      description: "アイテムの指定位置に撃力を加える",
    });

    methods.set("addImpulsiveTorque", {
      name: "addImpulsiveTorque",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      parameterTypes: ["Vector3"],
      returnType: "void",
      description: "アイテムの重心に角力積を加える",
    });

    methods.set("addTorque", {
      name: "addTorque",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      parameterTypes: ["Vector3"],
      returnType: "void",
      description:
        "アイテムの重心にトルクを加える (PhysicsUpdate内でのみ使用可)",
    });

    // インタラクション系メソッド
    methods.set("onGrab", {
      name: "onGrab",
      requiredComponents: [
        {
          componentType: "ClusterVR.CreatorKit.Item.Implements.GrabbableItem",
          requirement: "required",
        },
      ],
      description: "アイテムを掴む・手放すときに呼ばれるコールバック",
    });

    methods.set("onUse", {
      name: "onUse",
      requiredComponents: [
        {
          componentType: "ClusterVR.CreatorKit.Item.Implements.GrabbableItem",
          requirement: "required",
        },
      ],
      description: "掴んでいるアイテムに使う動作をしたときのコールバック",
    });

    methods.set("onRide", {
      name: "onRide",
      requiredComponents: [
        {
          componentType: "ClusterVR.CreatorKit.Item.RidableItem",
          requirement: "required",
        },
      ],
      description: "乗ることができるアイテムに乗る・降りるときのコールバック",
    });

    methods.set("onSteer", {
      name: "onSteer",
      requiredComponents: [
        {
          componentType: "ClusterVR.CreatorKit.Item.RidableItem",
          requirement: "required",
        },
      ],
      description: "乗ることができるアイテムに乗っているプレイヤーの移動入力",
    });

    methods.set("onInteract", {
      name: "onInteract",
      requiredComponents: [
        {
          componentType: "UnityEngine.Collider",
          requirement: "required",
        },
      ],
      description: "掴めないアイテムに使う動作をしたときのコールバック",
    });

    // コライダー系メソッド
    methods.set("onCollide", {
      name: "onCollide",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
        {
          componentType: "UnityEngine.Collider",
          requirement: "required",
        },
      ],
      description: "アイテムが別の物体と衝突したときのコールバック",
    });

    methods.set("getOverlaps", {
      name: "getOverlaps",
      requiredComponents: [
        {
          componentType:
            "ClusterVR.CreatorKit.Item.Implements.OverlapDetectorShape",
          requirement: "required",
        },
      ],
      description: "OverlapDetectorShapeに重なっている物体を取得",
    });

    // 移動系メソッド・プロパティ
    methods.set("setPosition", {
      name: "setPosition",
      requiredComponents: [
        {
          componentType: "ClusterVR.CreatorKit.Item.Implements.MovableItem",
          requirement: "required",
        },
      ],
      parameterTypes: ["Vector3"],
      returnType: "void",
      description: "アイテムの位置を設定",
    });

    methods.set("setRotation", {
      name: "setRotation",
      requiredComponents: [
        {
          componentType: "ClusterVR.CreatorKit.Item.Implements.MovableItem",
          requirement: "required",
        },
      ],
      parameterTypes: ["Quaternion"],
      returnType: "void",
      description: "アイテムの回転を設定",
    });

    // プロパティ
    properties.set("velocity", {
      name: "velocity",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      type: "Vector3",
      readable: true,
      writable: true,
      description: "アイテムの速度",
    });

    properties.set("angularVelocity", {
      name: "angularVelocity",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      type: "Vector3",
      readable: true,
      writable: true,
      description: "アイテムの角速度",
    });

    properties.set("useGravity", {
      name: "useGravity",
      requiredComponents: [
        {
          componentType: "UnityEngine.Rigidbody",
          requirement: "required",
        },
      ],
      type: "boolean",
      readable: true,
      writable: true,
      description: "重力の影響を受けるかどうか",
    });

    return {
      methods,
      properties,
    };
  }

  /**
   * メソッドの必須コンポーネントを取得
   */
  static getMethodConstraints(methodName: string): ComponentConstraint[] {
    const method = this.getDefinitions().methods.get(methodName);
    return method ? method.requiredComponents : [];
  }

  /**
   * プロパティの必須コンポーネントを取得
   */
  static getPropertyConstraints(propertyName: string): ComponentConstraint[] {
    const property = this.getDefinitions().properties.get(propertyName);
    return property ? property.requiredComponents : [];
  }

  /**
   * 利用可能なすべてのメソッド名を取得
   */
  static getAllMethodNames(): string[] {
    return Array.from(this.getDefinitions().methods.keys());
  }

  /**
   * 利用可能なすべてのプロパティ名を取得
   */
  static getAllPropertyNames(): string[] {
    return Array.from(this.getDefinitions().properties.keys());
  }
}
