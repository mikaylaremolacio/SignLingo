const video = document.querySelector(".input_video");
const canvas = document.querySelector(".output_canvas");
const ctx = canvas.getContext("2d");
const letterBox = document.getElementById("letter");
const startButton = document.getElementById("startButton");
const countdownBox = document.getElementById("countdown");

let detectionMode = "idle";
let latestLandmarks = null;

const { Finger, FingerCurl, FingerDirection, GestureDescription, GestureEstimator } = window.fp;

// Hand overlay drawing
const fingerJoints = {
  thumb: [0,1,2,3,4],
  index: [0,5,6,7,8],
  mid: [0,9,10,11,12],
  ring: [0,13,14,15,16],
  pinky: [0,17,18,19,20]
};

function drawHand(predictions){
  if(!predictions || predictions.length===0) return;
  predictions.forEach(pred=>{
    const landmarks = pred.landmarks;
    Object.keys(fingerJoints).forEach(finger=>{
      for(let i=0;i<fingerJoints[finger].length-1;i++){
        const first=fingerJoints[finger][i];
        const second=fingerJoints[finger][i+1];
        ctx.beginPath();
        ctx.moveTo(landmarks[first].x*canvas.width, landmarks[first].y*canvas.height);
        ctx.lineTo(landmarks[second].x*canvas.width, landmarks[second].y*canvas.height);
        ctx.strokeStyle="gold";
        ctx.lineWidth=2;
        ctx.stroke();
      }
    });
    landmarks.forEach(lm=>{
      ctx.beginPath();
      ctx.arc(lm.x*canvas.width, lm.y*canvas.height, 5, 0, 2*Math.PI);
      ctx.fillStyle="navy";
      ctx.fill();
    });
  });
}

// ---------------- A-Z Gestures ----------------
const knownGestures = [];

const alphabetDecimal = {
  C: [0,1,1,1,1],       // Thumb: open, Fingers: curled
  B: [1,0,0,0,0],       // Thumb: folded across palm, Fingers: open
  Z: [0,0.5,0.5,0.5,0.5], // Open C shape
  Q: [1,0,1,1,1],       // Index up, others curled
  E: [1,1,1,1,1],       // All curled
  F: [0,0,0,1,1],       // Thumb and index make circle, others relaxed
  G: [0,0,1,1,1],       // Thumb and index horizontal, others curled
  H: [1,0,0,1,1],       // Index + middle horizontal, others curled
  I: [1,1,1,1,0],       // Pinky up, others curled
  J: [1,1,1,1,0],       // Pinky draws a J motion
  K: [0,0,0,1,1],       // Index + middle up, thumb out
  L: [0,0,1,1,1],       // Index + thumb form L, others curled
  M: [1,1,1,1,1],       // All curled, thumb under 3 fingers
  N: [1,1,1,1,1],       // All curled, thumb under 2 fingers
  O: [0,0,0,0,0],       // Circle shape
  R: [0,0,0,1,1],       // K upside down
  D: [0,0,1,1,1],       // G upside down
  P: [1,0,0,1,1],       // Index + middle crossed
  S: [1,1,1,1,1],       // Fist
  T: [1,1,1,1,1],       // Thumb under index
  U: [1,0,0,1,1],       // Index + middle up
  V: [1,0,0,1,1],       // Index + middle up, V shape
  W: [1,0,0,0,1],       // Index + middle + ring up
  X: [1,1,1,1,1],       // Index bent, others curled
  Y: [0,0,1,1,0],       // Thumb + pinky extended
  A: [0,0,0,1,1]        // Index draws Z
};


// Create gestures efficiently
Object.keys(alphabetDecimal).forEach(letter=>{
  const gesture = new GestureDescription(letter);
  ["Thumb","Index","Middle","Ring","Pinky"].forEach((finger,i)=>{
    gesture.addCurl(Finger[finger], alphabetDecimal[letter][i], 1.0);
    gesture.addDirection(Finger[finger], FingerDirection.VerticalUp, 0.5);
  });
  knownGestures.push(gesture);
});

const GE = new GestureEstimator(knownGestures);

// MediaPipe Hands
const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
hands.setOptions({ maxNumHands:1, modelComplexity:1, minDetectionConfidence:0.7, minTrackingConfidence:0.7 });

hands.onResults(results=>{
  latestLandmarks = results.multiHandLandmarks && results.multiHandLandmarks.length>0 ? results.multiHandLandmarks[0] : null;
});

// Camera
const camera = new Camera(video,{
  onFrame: async ()=> await hands.send({image: video}),
  width:640, height:480
});
camera.start();

// Non-blocking render loop
function renderLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(video,0,0,canvas.width,canvas.height);

  if(latestLandmarks){
    drawHand([{landmarks: latestLandmarks}], ctx);

    if(detectionMode==="detecting"){
      // Run gesture estimation asynchronously
      Promise.resolve().then(()=>{
        const landmarks = latestLandmarks.map(p=>[p.x,p.y,p.z]);
        const est = GE.estimate(landmarks, 1);
        if(est.gestures.length>0){
          const best = est.gestures.reduce((p,c)=>p.score>c.score?p:c);
          letterBox.textContent = best.name;
        } else letterBox.textContent = "No gesture";
      });

      // Display live decimal curls
      const curls = ["Thumb","Index","Middle","Ring","Pinky"].map((finger,i)=>{
        const base = latestLandmarks[i*4];
        const tip = latestLandmarks[i*4+3];
        const dist = Math.min(Math.sqrt((tip.x-base.x)**2 + (tip.y-base.y)**2)*2, 1);
        return `${finger}:${dist.toFixed(2)}`;
      });
      ctx.fillStyle="white";
      ctx.font="14px monospace";
      ctx.fillText(curls.join(" | "), 10, 20);
    }
  } else if(detectionMode==="detecting"){
    letterBox.textContent = "No hand detected";
  }

  requestAnimationFrame(renderLoop);
}

renderLoop();

// Start detection
startButton.addEventListener("click", ()=>{
  if(detectionMode!=="idle") return;
  detectionMode="detecting";
  startButton.disabled=true;
  countdownBox.textContent="Detecting... Hold your sign";
});
