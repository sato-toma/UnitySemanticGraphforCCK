$.onGrab((isGrab, isLeftHand) => {
  if (isGrab) {
    if (isLeftHand) {
      $.log("grabbed by left hand.");
    } else {
      $.log("grabbed by right hand.");
    }
  }
});