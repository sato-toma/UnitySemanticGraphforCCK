import { ApiMethod, ApiProperty } from "../types";

export const physicsMethodRules: ApiMethod[] = [
  {
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
  },
  {
    name: "addForceAt",
    requiredComponents: [
      {
        componentType: "UnityEngine.Rigidbody",
        requirement: "required",
      },
    ],
    parameterTypes: ["Vector3", "Vector3"],
    returnType: "void",
    description: "アイテムの指定位置に力を加える (PhysicsUpdate内でのみ使用可)",
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    name: "addTorque",
    requiredComponents: [
      {
        componentType: "UnityEngine.Rigidbody",
        requirement: "required",
      },
    ],
    parameterTypes: ["Vector3"],
    returnType: "void",
    description: "アイテムの重心にトルクを加える (PhysicsUpdate内でのみ使用可)",
  },
];

export const physicsPropertyRules: ApiProperty[] = [
  {
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
  },
  {
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
  },
  {
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
  },
];

export const physicsRules = {
  methods: physicsMethodRules,
  properties: physicsPropertyRules,
};
