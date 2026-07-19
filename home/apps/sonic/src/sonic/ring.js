import k from "../kaplayCtx.js";

export function makeRing(pos){
    return k.add([
        k.sprite("ring", {anims: "run"}),
        k.scale(4),
        k.area(), 
        k.anchor("center"),
        k.pos(pos),
        k.offscreen(),
        "ring",
    ]);
}