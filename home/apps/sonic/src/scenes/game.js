import k from "../kaplayCtx.js";
import { makeMotobug } from "../sonic/motobug.js";
import { makeRing } from "../sonic/ring.js";
import { makeSonic } from "../sonic/sonic.js";
export default function game(){
    k.setGravity(3100);
    const citySfx = k.play("city", {volume: 0.2, loop: true});

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
            k.pos(bgPieceWidth, 0), 
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
            k.pos(platformWidth, 450),
            k.scale(4)
        ]),
    ];

    let score =0; 
    let scoreMultiplier = 0;

    const scoreText = k.add([
        k.text("SCORE : 0", {font: "mania", size: 72}),
        k.pos(20,20),
    ])
    

    const sonic = makeSonic(k.vec2(200, 745));
    sonic.setControls();
    sonic.setEvents();

    sonic.onCollide("ring", (ring)=>{
        k.play("ring", {volume: 0.5})
        k.destroy(ring);
        score++;
        scoreText.text = `SCORE : ${score}`;
        sonic.ringCollectUI.text = "+1";
        k.wait(1, ()=> {sonic.ringCollectUI.text = ""});
    });

    sonic.onCollide("enemy", (enemy)=>{
        

        if(!sonic.isGrounded()) {
            k.play("destroy", {volume: 0.5});
            k.play("hyperRing", {volume: 0.5});
            k.destroy(enemy) 
            sonic.play("jump");
            sonic.jump();
            scoreMultiplier += 1;
            score += 10 * scoreMultiplier;
            scoreText.text = `SCORE : ${score}`;
            if (scoreMultiplier===1)sonic.ringCollectUI.text = "+10"
            if (scoreMultiplier>1) sonic.ringCollectUI.text = `x${scoreMultiplier}`
            k.wait(1, ()=> {sonic.ringCollectUI.text = ""}); 

            return;
        }
        
        k.play("hurt", {volume: 0.5});
        k.setData("current-score", score);
        k.go("gameover", { citySfx });


    });

    

    let gamespeed = 300;
    k.loop(1, ()=> {
        gamespeed += 50;

    });


    const spawnMotoBug = () => {
        const motobug = makeMotobug(k.vec2(1950, 773 ));
        motobug.onUpdate(() => {
            if(gamespeed < 3000 ){
                motobug.move(-(gamespeed + 300), 0);
                return;
            }

            motobug.move(-gamespeed, 0);

        });

        motobug.onExitScreen(() => {
            if(motobug.pos.x < 0) k.destroy(motobug);
        });

        const waitTime = k.rand(0.5, 2.5);
        k.wait(waitTime, spawnMotoBug);
    };

    spawnMotoBug();

    const spawnring = () => {
        const ring = makeRing(k.vec2(1950, 745 ));
        ring.onUpdate(() => {
            ring.move(-gamespeed, 0);
            
        }) ;

        ring.onExitScreen(() => {
            if(ring.pos.x < 0) k.destroy(ring);
        });

        const waitTime = k.rand(0.5, 3);
        k.wait(waitTime, spawnring);
    };

    spawnring();

    k.add([
        k.rect(1920, 300),
        k.opacity(0),
        k.area(),
        k.pos(0, 832),
        k.body({isStatic: true}),
    ]);



    k.onUpdate(()=> {

        if(sonic.isGrounded()){
            scoreMultiplier =0;
        }

        if(bgPieces[1].pos.x < 0){
            bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth*2, 0);
            bgPieces.push(bgPieces.shift());
        }

        bgPieces[0].move(-100,0);
        bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth*2, 0);

        if(platform[1].pos.x < 0){
            platform[0].moveTo(platform[1].pos.x + platformWidth*4, 450);
            platform.push(platform.shift());
        }

        platform[0].move(-gamespeed,0);
        platform[1].moveTo(platform[0].pos.x + platformWidth*4, 450);

    });



}