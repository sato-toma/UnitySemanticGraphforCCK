$.onStart(() => {
  $.state.amplitude = 1.0;
  $.state.period = 2.0;
  $.state.time = 0;
});

$.onUpdate((deltaTime) => {
  const time = Number($.state.time ?? 0) + deltaTime;
  $.state.time = time;

  const amplitude = Number($.state.amplitude ?? 1.0);
  const period = Number($.state.period ?? 2.0);
  const phase = (time / period) * Math.PI * 2;
  const targetY = Math.sin(phase) * amplitude;

  const currentPosition = $.getPosition();
  const nextPosition = new Vector3(
    currentPosition.x,
    targetY,
    currentPosition.z,
  );

  $.setPosition(nextPosition);

  if (time >= period) {
    $.log(`position y=${Number(nextPosition.y).toFixed(2)}`);
    $.state.time = 0;
  }
});
