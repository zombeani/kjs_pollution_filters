const facingMap = {
    "north": [0, 0, -1],
    "south": [0, 0, 1],
    "west": [-1, 0, 0],
    "east": [1, 0, 0],
    "up": [0, 1, 0],
    "down": [0, -1, 0]
};

const pollutionArray = ["adpother:carbon", "adpother:sulfur", "adpother:dust"];
const acidArray = ["tfc:vinegar", "tfc:milk_vinegar"];

const reportPollution = (player, block) => {
    if (!block.entityData?.data.used) { return; };
    player.tell(`§aAbsorbed§7: ${block.entityData.data.used}`);
    if (block.entityData?.data.carbon) { player.tell(`§8Carbon§7: ${block.entityData.data.carbon}`); };
    if (block.entityData?.data.sulfur) { player.tell(`§eSulfur§7: ${block.entityData.data.sulfur}`); };
    return;
};

const brushCleaning = (player, block, item) => {
    player.server.scheduleRepeatingInTicks(20, ctx => {
        let ray = player.rayTrace(player.reachDistance);
        if (!ray.block || ray.block?.id != block.id) { ctx.clear(); return; };
        if (!player.usingItem || !block.entityData.data.used) { ctx.clear(); return; };
        if (player.mainHandItem.id != "minecraft:brush") { ctx.clear(); return; };
        
        if (block.entityData.data.carbon === undefined) {
            block.mergeEntityData({ data: { used: Math.max(block.entityData.data.used - 1, 0) } });
        } else {
            if (block.entityData.data.carbon <= 0) { return; };
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
        if (!["kubejs:charcoal_filter", "kubejs:chromium_filter"].includes(block.id)) { return; };
        block.popItemFromFace("tfc:soot", player.facing.getOpposite());
    });
};

const acidCleaning = (player, block, item) => {
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

        block.popItemFromFace(Item.of("tfc:powder/sulfur", available), player.facing.getOpposite()); 
        if (item.nbt.fluid.Amount <= 0) { delete item.nbt.fluid; };
};

BlockEvents.rightClicked("tfc:bellows", event => {
    const { player, block } = event;

    if (Math.abs(block.entityData.pushed - player.level.time) < 20) { return; };
    let direction = facingMap[block.properties.facing];
    if (!direction) { return; };

    let radius = {
        minX: Math.floor(block.x - 1),
        maxX: Math.ceil(block.x + 1),
        minY: Math.floor(block.y - 1),
        maxY: Math.ceil(block.y + 1),
        minZ: Math.floor(block.z - 1),
        maxZ: Math.ceil(block.z + 1)
    };

    if (direction[0] != 0) {
        if (direction[0] > 0) { radius.maxX += 8; }
        else { radius.minX -= 8; };
    } else if (direction[1] != 0) {
        if (direction[1] > 0) { radius.maxY += 8; }
        else { radius.minY -= 8; };
    } else if (direction[2] != 0) {
        if (direction[2] > 0) { radius.maxZ += 8; }
        else { radius.minZ -= 8; };
    };

    for (let x = radius.minX; x <= radius.maxX; x++) {
        for (let y = radius.minY; y <= radius.maxY; y++) {
            for (let z = radius.minZ; z <= radius.maxZ; z++) {
                let targetBlock = block.level.getBlock(x, y, z);
                if (!pollutionArray.includes(targetBlock.id)) { continue; };

                let newPos = targetBlock.getPos().offset(direction[0], direction[1], direction[2]);
                let newBlock = block.level.getBlock(newPos.x, newPos.y, newPos.z);
                if (newBlock.id != "minecraft:air") { continue; };

                newBlock.set(targetBlock.id);
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
    brushCleaning(player, block, item);
});

BlockEvents.rightClicked("kubejs:limewater_filter", event => {
    const { player, hand, block, item } = event;

    if (hand != "MAIN_HAND") { return; };
    if (!block.entityData.data.used) { return; };
    if (player.mainHandItem.empty) { reportPollution(player, block); return; };

    if (player.mainHandItem.id == "minecraft:brush") {
        brushCleaning(player, block, item);
    } else {
        acidCleaning(player, block, item);
    };
});

BlockEvents.rightClicked("kubejs:chromium_filter", event => {
    const { player, hand, block, item } = event;

    if (hand != "MAIN_HAND") { return; };
    if (!block.entityData.data.used) { return; };
    if (player.mainHandItem.empty) { reportPollution(player, block); return; };

    if (player.mainHandItem.id == "minecraft:brush") {
        brushCleaning(player, block, item);
    } else {
        acidCleaning(player, block, item);
    };
});

ServerEvents.blockLootTables(event => { event.modifyBlock("kubejs:reed_filter", loot => { loot.clearPools(); })});