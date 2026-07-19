import k from "../kaplayCtx.js";

export function makeMotobug(pos){
    return k.add([
        k.sprite("motobug", {anims: "run"}),
        k.scale(4),
        k.area(), 
        k.anchor("center"),
        k.pos(pos),
        k.offscreen(),
        "enemy",
    ]);
}




