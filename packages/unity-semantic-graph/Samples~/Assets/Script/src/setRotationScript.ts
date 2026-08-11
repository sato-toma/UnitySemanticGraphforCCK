$.onStart(() => {
  $.state.speed = 90;
  $.state.time = 0;
  $.log("setRotation sample started. Rotating continuously around the Y axis.");
});

$.onUpdate((deltaTime) => {
  const time = Number($.state.time ?? 0) + deltaTime;
  $.state.time = time;

  const speed = Number($.state.speed ?? 90);
  const angle = time * speed;
  const rotation = new Quaternion().setFromEulerAngles(
    new Vector3(0, angle, 0),
  );

  $.setRotation(rotation);

  if (time >= 1) {
    $.log(`rotation y=${angle.toFixed(2)}`);
    $.state.time = 0;
  }
});
