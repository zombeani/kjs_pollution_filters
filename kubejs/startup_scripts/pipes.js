/** @param {Internal.BlockContainerJS} block **/
const checkPipes = (block, maxDepth) => {
    let visited = new Set();
    let queue = [{ block: block, depth: 0 }];

    const step = (i) => {
        if (queue.length === 0) { return; };
        let { block: currentBlock, depth } = queue.shift();
        let id = `${currentBlock.x},${currentBlock.y},${currentBlock.z}`;
        if (visited.has(id)) { return; };
        visited.add(id);

        if (depth >= maxDepth) { return; };

        for (let direction of Object.keys(Direction.ALL)) {
            let targetBlock = currentBlock.offset(direction);
            if (!["kubejs:gas_pump", "kubejs:gas_pipe"].includes(targetBlock.id)) { continue; };
            if (targetBlock.id == "kubejs:gas_pump") {
                let targetFacing = targetBlock.properties.facing;
                let targetDirection = Direction[targetFacing];
                let newBlock = targetBlock.offset(targetDirection);
                if (newBlock.id != "minecraft:air") { continue; };
                block.mergeEntityData({ data: { x: targetBlock.x, y: targetBlock.y, z: targetBlock.z } }); return;
            };

            block.level.server.scheduleInTicks(i + global.intRan(1, 3), ctx => { queue.push({ block: targetBlock, depth: depth + 1 }); step(i + 1); });
        };
    }; step(0);
};

StartupEvents.registry("minecraft:block", event => {
    event.create("kubejs:gas_pipe")
        .hardness(3.0)
        .resistance(1.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .soundType(SoundType.METAL)
        .textureAll("kubejs:block/gas_pipe");

    event.create("kubejs:gas_router")
        .hardness(3.0)
        .resistance(1.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .soundType(SoundType.METAL)
        .textureAll("kubejs:block/gas_router")
        .blockEntity(block => {
            block.initialData({direction: ""});
            block.serverTick(60, 0, ctx => {
                const { block } = ctx;

                for (let direction of Object.keys(Direction.ALL)) {
                    if (block.entityData.data.direction == direction) { return; };
                    let targetBlock = block.offset(direction);
                    if (!pollutionSet.has(String(targetBlock.id))) { continue; };
                    block.mergeEntityData({ data: { direction: String(Direction.ALL[direction].opposite) } });
                    let vec = { x: block.x - targetBlock.x, y: block.y - targetBlock.y, z: block.z - targetBlock.z };
                    let opposite = block.offset(vec.x, vec.y, vec.z);
                    if (opposite.id != "minecraft:air") { return; };
                    opposite.set(targetBlock.id, { density: targetBlock.properties.density }); targetBlock.set("minecraft:air"); return;
                };
            });
        });

    event.create("kubejs:gas_pump")
        .hardness(3.0)
        .resistance(1.5)
        .opaque(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .soundType(SoundType.METAL)
        .textureAll("kubejs:block/gas_pump_side")
        .textureSide("up", "kubejs:block/gas_pump_top")
        .textureSide("down", "kubejs:block/gas_pump_bottom")
        .property(BlockProperties.FACING)
        .placementState(state => { state.setValue(BlockProperties.FACING, !state.player.shiftKeyDown ? state.nearestLookingDirection.opposite : state.nearestLookingDirection); return state; })
        .blockEntity(block => {
            block.initialData({ x: 0, y: 0, z: 0 });
            block.serverTick(60, 0, ctx => {
                const { block } = ctx;

                let frontBlock = block.offset(Direction[block.properties.facing]);
                let backBlock = block.offset(Direction[block.properties.facing].opposite);

                if (frontBlock.id == "kubejs:gas_pipe") {
                    let data = block.entityData.data;
                    let outputBlock = block.level.getBlock(data.x, data.y, data.z);
                    if (outputBlock.id != "kubejs:gas_pump") { checkPipes(block, 18); return; };

                    for (let direction of Object.keys(Direction.ALL)) {
                        if (direction == Direction[block.properties.facing]) { continue; };
                        let targetBlock = block.offset(direction);
                        if (!pollutionSet.has(String(targetBlock.id))) { continue; };

                        for (let newDirection of Object.keys(Direction.ALL)) {
                            if (newDirection == Direction[outputBlock.properties.facing]) { continue; };
                            let newBlock = outputBlock.offset(newDirection);
                            if (newBlock.id != "minecraft:air") { continue; };

                            newBlock.set(targetBlock.id, { density: targetBlock.properties.density });
                            targetBlock.set("minecraft:air"); return;
                        };

                        return;
                    };

                    if (block.entityData?.cycle) {
                        if (block.entityData.cycle % 2) { return; };
                        checkPipes(block, 18);
                    } else {
                        checkPipes(block, 18);
                    };
                }; //input side

                if (backBlock.id != "kubejs:gas_pipe") { return; };
                // output side
            });
        });
});