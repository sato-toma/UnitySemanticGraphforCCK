$.onStart(() => {
  $.state.overlapPlayers = [];
  $.state.overlapItems = [];
});

$.onUpdate(() => {
  let previousOverlapPlayers = (
    Array.isArray($.state.overlapPlayers) ? $.state.overlapPlayers : []
  ) as string[];
  let currentOverlapPlayers: string[] = [];
  let previousOverlapItems = (
    Array.isArray($.state.overlapItems) ? $.state.overlapItems : []
  ) as string[];
  let currentOverlapItems: string[] = [];

  let overlaps = $.getOverlaps();
  for (let overlap of overlaps) {
    let handle = overlap.handle;
    if (handle == null) continue;
    else if (handle.type === "player") {
      currentOverlapPlayers.push(handle.id);
      if (previousOverlapPlayers.includes(handle.id)) continue;
      $.log(`overlap with player: ${handle.id}`);
    } else if (handle.type === "item") {
      currentOverlapItems.push(handle.id);
      if (previousOverlapItems.includes(handle.id)) continue;
      $.log(`overlap with item: ${handle.id}`);
    }
  }
  $.state.overlapPlayers = currentOverlapPlayers;
  $.state.overlapItems = currentOverlapItems;
});
