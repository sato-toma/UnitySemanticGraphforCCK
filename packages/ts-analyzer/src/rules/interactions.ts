import { ApiMethod } from "../types";

export const interactionMethodRules: ApiMethod[] = [
  {
    name: "onGrab",
    requiredComponents: [
      {
        componentType: "ClusterVR.CreatorKit.Item.Implements.GrabbableItem",
        requirement: "required",
      },
    ],
    description: "アイテムを掴む・手放すときに呼ばれるコールバック",
  },
  {
    name: "onUse",
    requiredComponents: [
      {
        componentType: "ClusterVR.CreatorKit.Item.Implements.GrabbableItem",
        requirement: "required",
      },
    ],
    description: "掴んでいるアイテムに使う動作をしたときのコールバック",
  },
  {
    name: "onRide",
    requiredComponents: [
      {
        componentType: "ClusterVR.CreatorKit.Item.RidableItem",
        requirement: "required",
      },
    ],
    description: "乗ることができるアイテムに乗る・降りるときのコールバック",
  },
  {
    name: "onSteer",
    requiredComponents: [
      {
        componentType: "ClusterVR.CreatorKit.Item.RidableItem",
        requirement: "required",
      },
    ],
    description: "乗ることができるアイテムに乗っているプレイヤーの移動入力",
  },
  {
    name: "onInteract",
    requiredComponents: [
      {
        componentType: "UnityEngine.Collider",
        requirement: "required",
      },
    ],
    description: "掴めないアイテムに使う動作をしたときのコールバック",
  },
  {
    name: "onCollide",
    requiredComponents: [
      {
        componentType: "UnityEngine.Rigidbody",
        requirement: "required",
      },
    ],
    description: `アイテムが別の物体と衝突したときのコールバック

注意:
- IsKinematic が設定されている Rigidbody は、Rigidbody のないコライダーや IsKinematic が設定されていない Rigidbody との Collision 判定を行いません。
- 掴まれている状態のアイテムはその Rigidbody が IsKinematic に変更されるため、上述のコライダーとの Collision 判定が行われません。
- それらのアイテムで衝突判定が必要な場合は、どちらかに IsTrigger なコライダーを設定して Trigger イベントを検知するか、設置されているコライダーに IsKinematic がオフで Constraints を全てオンにした Rigidbody を設定してください。

参考: https://docs.cluster.mu/creatorkit/trigger-components/on-collide-item-trigger/`,
  },
  {
    name: "getOverlaps",
    requiredComponents: [
      {
        componentType:
          "ClusterVR.CreatorKit.Item.Implements.OverlapDetectorShape",
        requirement: "required",
      },
    ],
    description: "OverlapDetectorShapeに重なっている物体を取得",
  },
];

export const interactionRules = {
  methods: interactionMethodRules,
  properties: [],
};
