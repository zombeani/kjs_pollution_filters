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
        let ray = player.rayTrace(player.reachDistance);
        if (!ray.block || ray.block?.id != block.id) { ctx.clear(); return; };
        if (!block.entityData.data.used) { ctx.clear(); return; };
        if (player.mainHandItem.id != "minecraft:brush") { ctx.clear(); return; };
        if (!player.usingItem) { ctx.clear(); return; };
        if (player.cooldowns.isOnCooldown(item)) { ctx.clear(); return; };
        player.addItemCooldown(item, 20);

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

        item.damageValue += 1; if (item.damageValue >= item.maxDamage) { item.shrink(1); };
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
    global.bellowPush(block);
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
ServerEvents.tags("minecraft:block", event => { event.add("tfc:forge_invisible_whitelist", "kubejs:venturi"); });