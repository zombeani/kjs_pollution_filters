global.ran = (min, max) => { return (Math.random() * (max - min) + min); };
global.intRan = (min, max) => { return Math.floor(Math.random() * (max - min + 1)) + min; };
global.clamp = (val, min, max) => { return Math.max(min, Math.min(max, val)); };
global.popMainHand = (player) => { player.give(player.mainHandItem.copyAndClear()); };
global.popOffHand = (player) => { player.give(player.offHandItem.copyAndClear()); };
global.pi = 3.14159265359;

const facingMap = {
    "north": [0, 0, -1],
    "south": [0, 0, 1],
    "west": [-1, 0, 0],
    "east": [1, 0, 0],
    "up": [0, 1, 0],
    "down": [0, -1, 0]
};

global.bellowPush = (block) => {
    let direction = facingMap[block.properties.facing];
    if (!direction) { return; };

    let baseSize = { x: 3, y: 3, z: 3 };

    if (direction[0] != 0) {
        baseSize.x += 10 * Math.sign(direction[0]);
    } else if (direction[1] != 0) {
        baseSize.y += 10 * Math.sign(direction[1]);
    } else if (direction[2] != 0) {
        baseSize.z += 10 * Math.sign(direction[2]);
    };

    let aabb = AABB.ofSize(block.pos, baseSize.x, baseSize.y, baseSize.z).move(direction[0] * 2, direction[1] * 2, direction[2] * 2);
    let floorItem = block.level.getEntitiesWithin(aabb).stream().filter(e => !e.living).filter(e => e.type == "minecraft:item").toList();
    
    for (let entity of floorItem) {
        let velocity = { x: direction[0] * 0.5, y: direction[1] * 0.5, z: direction[2] * 0.5 };
        entity.addDeltaMovement(new Vec3d(velocity.x, velocity.y, velocity.z));
    };
    
    for (let x = aabb.minX; x <= aabb.maxX; x++) {
        for (let y = aabb.minY; y <= aabb.maxY; y++) {
            for (let z = aabb.minZ; z <= aabb.maxZ; z++) {
                let targetBlock = block.level.getBlock(x, y, z);
                if (targetBlock?.entityData?.temperature) { block.level.sendBlockUpdated(targetBlock.pos, targetBlock.blockState, targetBlock.blockState, 3); };
                if (!pollutionSet.has(String(targetBlock.id))) { continue; };

                let newPos = targetBlock.getPos().offset(direction[0], direction[1], direction[2]);
                let newBlock = block.level.getBlock(newPos.x, newPos.y, newPos.z);
                if (newBlock.id != "minecraft:air") { continue; };

                newBlock.set(targetBlock.id, { density: targetBlock.properties.density });
                targetBlock.set("minecraft:air");
            };
        };
    };
}