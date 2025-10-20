const sootArray = ["adpother:carbon", "adpother:dust"];
const pollutionArray = ["adpother:carbon", "adpother:dust", "adpother:sulfur"];

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
                    if (!sootArray.includes(targetBlock.id)) { continue; };
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
                    if (!pollutionArray.includes(targetBlock.id)) { continue; };

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
        .textureAll("create:block/brass_block")
        .displayName("Chromium Filter");
});

BlockEvents.modification(event => { event.modify("minecraft:fire", block => { block.setFlammable("kubejs:reed_filter", 30, 60); }); });