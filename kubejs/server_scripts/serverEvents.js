const facingMap = {
    "north": [0, 0, -1],
    "south": [0, 0, 1],
    "west": [-1, 0, 0],
    "east": [1, 0, 0],
    "up": [0, 1, 0],
    "down": [0, -1, 0]
};

const usedMap = { "kubejs:reed_filter": 4, "kubejs:charcoal_filter": 8, "kubejs:limewater_filter": 8, "kubejs:chromium_filter": 16 };
const pollutionSet = new Set(["adpother:carbon", "adpother:sulfur", "adpother:dust"]);
const acidArray = ["tfc:vinegar", "tfc:milk_vinegar"];

const reportPollution = (player, block) => {
    if (!block.entityData?.data.used) { return; };
    player.tell(`§aAbsorbed§7: ${block.entityData.data.used}`);
    if (block.entityData?.data.carbon) { player.tell(`§8Carbon§7: ${block.entityData.data.carbon}`); };
    if (block.entityData?.data.sulfur) { player.tell(`§eSulfur§7: ${block.entityData.data.sulfur}`); };
    return;
};

const brushCleaning = (player, block, item, facing) => {
    player.server.scheduleRepeatingInTicks(20, ctx => {
        if (player.cooldowns.isOnCooldown(item)) { ctx.clear(); return; };
        player.addItemCooldown(item, 20);
        let ray = player.rayTrace(player.reachDistance);
        if (!ray.block || ray.block?.id != block.id) { ctx.clear(); return; };
        if (!block.entityData.data.used) { ctx.clear(); return; };
        if (player.mainHandItem.id != "minecraft:brush") { ctx.clear(); return; };
        if (!player.usingItem) { ctx.clear(); return; };

        if (block.entityData.data.carbon === undefined) {
            block.mergeEntityData({ data: { used: Math.max(block.entityData.data.used - 1, 0) } });
        } else {
            if (block.entityData.data.carbon <= 0) { ctx.clear(); return; };
            let usedData = Math.max(block.entityData.data.used - 1, 0);
            let carbonData = Math.max(block.entityData.data.carbon - 1, 0);

            block.mergeEntityData({
                data: {
                    used: usedData,
                    carbon: carbonData,
                    sulfur: block.entityData.data.sulfur
                }
            });
        };

        item.damageValue += 1;
        let usedKey = usedMap[block.id]; if (!usedKey) { ctx.clear(); return; };
        let usedData = Math.floor((block.entityData.data.used / usedKey) * 2);
        block.set(block.id, { level: String(usedData) });
        if (!["kubejs:charcoal_filter", "kubejs:chromium_filter"].includes(block.id)) { return; };
        block.popItemFromFace("tfc:soot", facing);
    });
};

const acidCleaning = (player, block, item, facing) => {
        if (!item.nbt || !item.nbt.fluid) { return; };
        if (!acidArray.includes(item.nbt.fluid.FluidName)) { return; };
        if (item.nbt.fluid.Amount < 100) { return; };

        let available = Math.min(Math.floor(item.nbt.fluid.Amount / 100), block.entityData.data.used);
        if (available <= 0) { return; };
        item.nbt.fluid.Amount -= available * 100;

        if (block.entityData.data.sulfur === undefined) {
            block.mergeEntityData({ data: { used: Math.max(block.entityData.data.used - 1, 0) } });
        } else {
            if (block.entityData.data.sulfur <= 0) { return; };
            let usedData = Math.max(block.entityData.data.used - available, 0);
            let sulfurData = Math.max(block.entityData.data.sulfur - available, 0);

            block.mergeEntityData({
                data: {
                    used: usedData,
                    carbon: block.entityData.data.carbon,
                    sulfur: sulfurData
                }
            });
        };

        if (item.nbt.fluid.Amount <= 0) { delete item.nbt.fluid; };
        block.popItemFromFace(Item.of("tfc:powder/sulfur", available), facing);
        let usedKey = usedMap[block.id]; if (!usedKey) { return; };
        let usedData = Math.floor((block.entityData.data.used / usedKey) * 2);
        block.set(block.id, {level: String(usedData)});
};

BlockEvents.rightClicked("tfc:bellows", event => {
    const { player, block } = event;

    if (Math.abs(block.entityData.pushed - player.level.time) < 20) { return; };
    let direction = facingMap[block.properties.facing];
    if (!direction) { return; };

    let baseSize = { x: 3, y: 3, z: 3 };

    if (direction[0] != 0) {
        baseSize.x += 8 * Math.sign(direction[0]);
    } else if (direction[1] != 0) {
        baseSize.y += 8 * Math.sign(direction[1]);
    } else if (direction[2] != 0) {
        baseSize.z += 8 * Math.sign(direction[2]);
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
                if (!pollutionSet.has(String(targetBlock.id))) { continue; };

                let newPos = targetBlock.getPos().offset(direction[0], direction[1], direction[2]);
                let newBlock = block.level.getBlock(newPos.x, newPos.y, newPos.z);
                if (newBlock.id != "minecraft:air") { continue; };

                newBlock.set(targetBlock.id, { density: targetBlock.properties.density });
                targetBlock.set("minecraft:air");
            };
        };
    };
});

BlockEvents.rightClicked("kubejs:reed_filter", event => {
    const { player, hand, block } = event;

    if (hand != "MAIN_HAND") { return; };
    if (!block.entityData.data.used) { return; };
    if (player.mainHandItem.empty) { reportPollution(player, block); return; };
});

BlockEvents.rightClicked("kubejs:charcoal_filter", event => {
    const { player, hand, block, item } = event;

    if (hand != "MAIN_HAND") { return; };
    if (!block.entityData.data.used) { return; };
    if (player.mainHandItem.empty) { reportPollution(player, block); return; };
    if (player.mainHandItem.id != "minecraft:brush") { return; };
    brushCleaning(player, block, item, event.facing);
});

BlockEvents.rightClicked("kubejs:limewater_filter", event => {
    const { player, hand, block, item } = event;

    if (hand != "MAIN_HAND") { return; };
    if (!block.entityData.data.used) { return; };
    if (player.mainHandItem.empty) { reportPollution(player, block); return; };

    if (player.mainHandItem.id == "minecraft:brush") {
        brushCleaning(player, block, item, event.facing);
    } else {
        acidCleaning(player, block, item, event.facing);
    };
});

BlockEvents.rightClicked("kubejs:chromium_filter", event => {
    const { player, hand, block, item } = event;

    if (hand != "MAIN_HAND") { return; };
    if (!block.entityData.data.used) { return; };
    if (player.mainHandItem.empty) { reportPollution(player, block); return; };

    if (player.mainHandItem.id == "minecraft:brush") {
        brushCleaning(player, block, item, event.facing);
    } else {
        acidCleaning(player, block, item, event.facing);
    };
});

ServerEvents.blockLootTables(event => { event.modifyBlock("kubejs:reed_filter", loot => { loot.clearPools(); })});