## pollution filters
kubejs scripts that adds pollution of the realms compatible filters for early game terrafirmacraft.

example video: https://www.youtube.com/watch?v=D7lAIOUmb2w

these scripts are set up for players who want a more immersive way to manage pollution.  
currently they're using placeholder textures and don't have crafting recipes.

## requirements
to use these scripts, you'll need:  
Minecraft Forge 1.20.1, TerraFirmaCraft, FirmaLife, Pollution of the Realms, Advanced Chimneys, and KubeJS

## features
these filters help reduce pollution from crafting and smelting, giving you multiple options depending on your tech level and available resources.

tfc bellows can now push pollution and items.  
right click a filter block with an empty hand to check how much pollution it has stored (if any).  
brush filters to remove soot or residue.  
some filters can be cleaned using vinegar in a tfc-compatible fluid container.  
all filters except for reed can be broken and replaced to clean it, but you lose the resources.  

## filter types
*reed filter*  
absorbs carbon only.  
holds up to 4 charges per block.  
flammable, does not drop itself when broken.

*charcoal filter*  
absorbs carbon and dust.  
can be brushed clean to get soot.  
holds up to 8 charges per block.

*limewater filter*  
absorbs sulfur only.  
right click with vinegar in a fluid container to get sulfur powder.  
can be brushed clean for no resources.  
holds up to 8 charges per block.

*chromium filter*  
absorbs carbon, dust, and sulfur.  
brush for soot, or use vinegar for sulfur powder.  
holds up to 16 total charges across all pollution types added up.

*wicker screen*  
absorbs dust only.  
only takes from the top, and rarely drops flux on the bottom.  
flammable.

*salt crystal*  
slowly checks for nearby pollution and snow layers in an 11x11x11 space.  
removes pollution in a 3x3 space. removes snow in a 5x5 space.  
consumes itself on use.

*cork block*  
pops into an item in the opposite direction that pollution was detected at.  
flammable.

*gas pump*  
pushes pollution to another end of a pipe.   
when connected to gas pipes it tries to find the closest gas pump that's facing the opposite direction. holding shift and placing it into the pipes makes it input, placing it facing away from the pipe make it output.  
output side requires open air.  
16 block range max.

*gas router*  
pushes pollution in the opposite direction that it was detected at.  
prevents pollution backflow by storing and blacklisting the last active output side.

*gas pipe*  
connects gas pumps to each other.

*venturi*  
automatically pushes bellows it is faced into if it has a tfc compatible heat source underneath it.  
the push speed is dependent on the temperature of the heat source.
