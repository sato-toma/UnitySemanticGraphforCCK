$.onCollide((collision) => {
  if (collision.handle?.type === "player") {
    $.log("collide with a player.");
  } else if (collision.handle?.type === "item") {
    $.log("collide with an item.");
  }
});
