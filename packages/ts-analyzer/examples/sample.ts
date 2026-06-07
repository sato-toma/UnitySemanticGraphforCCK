/// <reference path="../src/external/index.d.ts" />

/**
 * テスト用サンプルスクリプト
 * ClusterScript APIの使用例
 */
// 初期化時のコールバック
$.onStart(() => {
  console.log("Item initialized");
});
// プレイヤーが掴んだときのコールバック
$.onGrab((isGrab, isLeftHand) => {
  if (isGrab) {
    console.log("Grabbed by " + (isLeftHand ? "left" : "right") + " hand");
  }
});
// 毎フレーム更新
$.onUpdate((deltaTime) => {
  let t = ($.state.time as number | undefined) ?? 0;
  t += deltaTime;

  if (t > 10) {
    console.log("10 seconds elapsed");
    t = 0;
  }

  $.state.time = t;
});

// 衝突検出（Rigidbodyが必須）
$.onCollide((collision) => {
  if (collision.handle?.type === "player") {
    console.log("Collided with player");
  }
});

// 物理更新（PhysicsUpdate内でのみ使用可）
$.onPhysicsUpdate((deltaTime) => {
  // 上方向に力を加える
  $.addForce(new Vector3(0, 9.8, 0));
});

// インタラクト
$.onInteract((player) => {
  console.log("Interacted by: " + player.id);

  // 位置と回転を設定（MovableItemが必須）
  $.setPosition($.getPosition());
  $.setRotation($.getRotation());
});

// 使用時のコールバック（GrabbableItemが必須）
$.onUse((isDown) => {
  if (isDown) {
    console.log("Item used");
  }
});

// State管理
$.state.health = 100;
$.state.position = $.getPosition();

// 速度プロパティ（Rigidbodyが必須）
let velocity = $.velocity;
velocity.y = 5;
$.velocity = velocity;

// 角速度（Rigidbodyが必須）
$.angularVelocity = new Vector3(0, 90, 0);

// 重力設定（Rigidbodyが必須）
$.useGravity = true;
