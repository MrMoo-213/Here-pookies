import k from "../kaplayCtx.js";  
import { makeSonic } from "../sonic/sonic.js";

export default function mainMenu() {
    if(!k.getData("best-score")) k.setData("best-score", 0);
    k.onButtonPress("jump", () => k.go("game"));

    const gamespeed = 4000;
    const bgPieceWidth = 1920;
    const bgPieces = [
        k.add([
            k.sprite("chemical-bg"),
            k.pos(0,0),
            k.scale(2),
            k.opacity(0.8),
        ]),
        k.add([
            k.sprite("chemical-bg"),
            k.pos(bgPieceWidth*2 , 0),
            k.scale(2),
            k.opacity(0.8),
        ]),

    ];

    const platformWidth = 1280;
    const platform = [
        k.add([
            k.sprite("platforms"),
            k.pos(0, 450),
            k.scale(4)
        ]),
        k.add([
            k.sprite("platforms"),
            k.pos(platformWidth*4, 450),
            k.scale(4)
        ]),
    ];

    k.add([
        k.text("FLAPPY BIRD X TEMPLE RUN lite", {font: "mania", size: 100}),
        k.pos(k.center().x, 200),
        k.anchor("center"),
    ]);

    k.add([
        k.text("Press Space to Play", {font: "mania", size: 50}),
        k.pos(k.center().x, k.center().y - 200),
        k.anchor("center"),
    ]);

    

    makeSonic(k.vec2(200,745));

    k.onUpdate(() => {
        if(bgPieces[1].pos.x < 0){
            bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth*2, 0);
            bgPieces.push(bgPieces.shift());
        }

        bgPieces[0].move(-100,0);
        bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth*2, 0);

        if(platform[1].pos.x < 0){
            platform[0].moveTo(platform[1].pos.x + platform[1].width*4, 450);
            platform.push(platform.shift());
        }

        platform[0].move(-gamespeed,0);
        platform[1].moveTo(platform[0].pos.x + platform[1].width*4, 450);
        

    })

    

    

    
}


    