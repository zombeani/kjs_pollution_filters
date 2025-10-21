const sootSet = new Set(["adpother:carbon", "adpother:dust"]);
const pollutionSet = new Set(["adpother:carbon", "adpother:sulfur", "adpother:dust"]);
const ran = () => global.intRan(-5, 5);

StartupEvents.registry("minecraft:block", event => {
    event.create("kubejs:reed_filter")
        .hardness(1.0)
        .resistance(0.5)
        .opaque(true)
        .material("wood")
        .tagBlock("minecraft:mineable/hoe")
        .soundType(SoundType.BIG_DRIPLEAF)
        .blockEntity(block => {
            block.initialData({used: 0})
            block.serverTick(100, 0, ctx => {
                const { block } = ctx;

                if (Math.random() < 0.5) { return; };
                if (block.entityData.data.used >= 4) { return; };

                for (let direction of Object.keys(Direction.ALL)) {
                    let targetBlock = block.offset(direction);
                    if (targetBlock.id != "adpother:carbon") { continue; };
                    block.mergeEntityData({ data: { used: Math.min(block.entityData.data.used + 1, 4) } });
                    targetBlock.set("minecraft:air"); return;
                };
            });
        })
        .textureAll("tfc:block/thatch")
        .displayName("Reed Filter");

    event.create("kubejs:charcoal_filter")
        .hardness(2.0)
        .resistance(3.0)
        .opaque(true)
        .tagBlock("minecraft:mineable/pickaxe")
        .soundType(SoundType.CALCITE)
        .blockEntity(block => {
            block.initialData({used: 0})
            block.serverTick(200, 0, ctx => {
                const { block } = ctx;

                if (Math.random() < 0.5) { return; };
                if (block.entityData.data.used >= 8) { return; };

                for (let direction of Object.keys(Direction.ALL)) {
                    let targetBlock = block.offset(direction);
                    if (!sootSet.has(String(targetBlock.id))) { continue; };
                    block.mergeEntityData({ data: { used: Math.min(block.entityData.data.used + 1, 8) } });
                    targetBlock.set("minecraft:air"); return;
                };
            });
        })
        .textureAll("minecraft:block/coal_block")
        .displayName("Charcoal Filter");

    event.create("kubejs:limewater_filter")
        .hardness(2.0)
        .resistance(3.0)
        .opaque(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .soundType(SoundType.CALCITE)
        .blockEntity(block => {
            block.initialData({used: 0})
            block.serverTick(200, 0, ctx => {
                const { block } = ctx;

                if (Math.random() < 0.5) { return; };
                if (block.entityData.data.used >= 8) { return; };

                for (let direction of Object.keys(Direction.ALL)) {
                    let targetBlock = block.offset(direction);
                    if (targetBlock.id != "adpother:sulfur") { continue; };
                    block.mergeEntityData({ data: { used: Math.min(block.entityData.data.used + 1, 8) } });
                    targetBlock.set("minecraft:air"); return;
                };
            });
        })
        .textureAll("create:block/palettes/stone_types/limestone")
        .displayName("Limewater Filter");

    event.create("kubejs:chromium_filter")
        .hardness(3.0)
        .resistance(3.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .soundType(SoundType.DRIPSTONE_BLOCK)
        .blockEntity(block => {
            block.initialData({used: 0, carbon: 0, sulfur: 0})
            block.serverTick(100, 0, ctx => {
                const { block } = ctx;

                if (Math.random() < 0.5) { return; };
                if (block.entityData.data.used >= 16) { return; };

                for (let direction of Object.keys(Direction.ALL)) {
                    let targetBlock = block.offset(direction);
                    if (!pollutionSet.has(String(targetBlock.id))) { continue; };

                    let carbonData = block.entityData.data.carbon;
                    let sulfurData = block.entityData.data.sulfur;

                    if (targetBlock.id == "adpother:carbon") {
                        carbonData = Math.min(block.entityData.data.carbon + 1, 16);
                    } else if (targetBlock.id == "adpother:sulfur") { 
                        sulfurData = Math.min(block.entityData.data.sulfur + 1, 16);
                    };

                    let combined = Math.min(carbonData + sulfurData, 16);

                    block.mergeEntityData({ data: { carbon: carbonData, sulfur: sulfurData, used: combined } });
                    targetBlock.set("minecraft:air"); return;
                };
            });
        })
        .textureAll("minecraft:block/iron_block")
        .displayName("Chromium Filter");

    event.create("kubejs:wicker_screen")
        .hardness(1.0)
        .resistance(0.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/axe')
        .soundType(SoundType.BAMBOO_WOOD)
        .blockEntity(block => {
            block.serverTick(200, 0, ctx => {
                const { block } = ctx;

                let upBlock = block.offset(0, 1, 0);
                if (upBlock.id != "adpother:dust") { return; };
                upBlock.set("minecraft:air");
                if (Math.random() < 0.95) { return; };
                block.popItemFromFace("tfc:powder/flux", "down");
            });
        })
        .textureAll("minecraft:block/oak_planks")
        .displayName("Wicker Screen");

    event.create("kubejs:salt_crystal")
        .hardness(2.0)
        .resistance(1.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .soundType(SoundType.CALCITE)
        .blockEntity(block => {
            block.serverTick(200, 0, ctx => {
                const { block } = ctx;

                if (Math.random() < 0.5) { return; };
                let spot = block.offset(ran(), ran(), ran());
                if (!pollutionSet.has(String(spot.id))) { return; };
                let aabb = AABB.ofSize(spot.pos, 3, 3, 3);
                let cleared = false;
                
                for (let x = Math.floor(aabb.minX); x <= Math.ceil(aabb.maxX); x++) {
                    for (let y = Math.floor(aabb.minY); y <= Math.ceil(aabb.maxY); y++) {
                        for (let z = Math.floor(aabb.minZ); z <= Math.ceil(aabb.maxZ); z++) {
                            let targetBlock = block.level.getBlock(x, y, z);
                            if (!pollutionSet.has(String(targetBlock.id))) { continue; };
                            targetBlock.set("minecraft:air"); cleared = true;
                        };
                    };
                };

                if (cleared) { block.set("minecraft:air"); };
            });
        })
        .textureAll("tfc:block/ore/halite")
        .displayName("Salt Crystal");

    event.create("kubejs:cork_block")
        .hardness(1.0)
        .resistance(0.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/axe')
        .soundType(SoundType.WOOD)
        .blockEntity(block => {
            block.serverTick(60, 0, ctx => {
                const { block } = ctx;

                for (let direction of Object.keys(Direction.ALL)) {
                    let targetBlock = block.offset(direction);
                    if (!pollutionSet.has(String(targetBlock.id))) { continue; };
                    block.level.playSound(null, block.x, block.y, block.z, "minecraft:block.lava.pop", "players", 1, global.ran(0.33, 0.66));
                    block.set("minecraft:air"); return;
                };
            });
        })
        .textureAll("tfc:block/wattle/unstained_wattle")
        .displayName("Cork Block");

    event.create("kubejs:gas_valve")
        .hardness(3.0)
        .resistance(1.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .soundType(SoundType.METAL)
        .blockEntity(block => {
            block.serverTick(60, 0, ctx => {
                const { block } = ctx;

                let scheduled = false;
                for (let direction of Object.keys(Direction.ALL)) {
                    if (scheduled) { return; };
                    let targetBlock = block.offset(direction);
                    if (!pollutionSet.has(String(targetBlock.id))) { continue; };
                    block.level.playSound(null, block.x, block.y, block.z, "minecraft:block.lava.pop", "players", 1, global.ran(0.33, 0.66));
                    block.set("minecraft:air"); let targetPos = targetBlock.pos; let tries = 10; scheduled = true;

                    block.level.server.scheduleRepeatingInTicks(60, sch => {
                        tries -= 1;
                        let currentBlock = block.level.getBlock(block.x, block.y, block.z);
                        let newBlock = block.level.getBlock(targetPos.x, targetPos.y, targetPos.z);
                        if (tries <= 0) { block.popItem("kubejs:gas_valve"); sch.clear(); return; };
                        if (currentBlock.id != "minecraft:air" || newBlock.id != "minecraft:air") { return; };
                        block.set("kubejs:gas_valve"); sch.clear(); return;
                    });
                };
            });
        })
        .textureAll("tfc:block/metal/block/nickel")
        .displayName("Gas Valve");
});

const midFlameArray = ["kubejs:reed_filter", "kubejs:wicker_screen", "kubejs:cork_block"];

BlockEvents.modification(event => {
    midFlameArray.forEach(entry => {
        event.modify("minecraft:fire", block => {
            block.setFlammable(entry, 30, 60);
        });
    });
});