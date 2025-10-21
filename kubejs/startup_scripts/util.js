global.ran = (min, max) => { return (Math.random() * (max - min) + min); };
global.intRan = (min, max) => { return Number((Math.random() * (max - min) + min).toFixed(0)); };
global.clamp = (val, min, max) => { return Math.max(min, Math.min(max, val)); };
global.popMainHand = (player) => { player.give(player.mainHandItem.copyAndClear()); };
global.popOffHand = (player) => { player.give(player.offHandItem.copyAndClear()); };
global.pi = 3.14159265359;