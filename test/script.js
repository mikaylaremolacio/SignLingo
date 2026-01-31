// ----------------- HTML Elements -----------------
const video = document.querySelector(".input_video");
const canvas = document.querySelector(".output_canvas");
const ctx = canvas.getContext("2d");
const letterBox = document.getElementById("letter");
const startButton = document.getElementById("startButton");
const countdownBox = document.getElementById("countdown");

//video feed init
video.addEventListener("loadedmetadata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

// detection state
let isDetecting = false;
let detectionMode = "idle"; // "idle", "countdown", "detecting"
let detectedLetters = [];

// asl logic
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// determine which fingers are up
function getFingerStates(lm, isRight) {
  const tips = [4, 8, 12, 16, 20];
  const pips = [3, 6, 10, 14, 18];
  return {
    thumb: isRight ? lm[tips[0]].x > lm[pips[0]].x : lm[tips[0]].x < lm[pips[0]].x, 
    index: lm[tips[1]].y < lm[pips[1]].y,
    middle: lm[tips[2]].y < lm[pips[2]].y,
    ring: lm[tips[3]].y < lm[pips[3]].y,
    pinky: lm[tips[4]].y < lm[pips[4]].y
  };
}

// letter detection
function detectASLLetter(lm, isRight, motionBuffer = []) {
    const f = getFingerStates(lm, isRight);
    const thumbIndex = dist(lm[4], lm[8]);
    const palm = dist(lm[0], lm[9]);

    if (!f.index && !f.middle && !f.ring && !f.pinky && f.thumb) return "A";
    if (f.index && f.middle && f.ring && f.pinky && !f.thumb) return "B";
    if (thumbIndex > palm * 0.35 && f.index && f.middle && f.ring && f.pinky) return "C";
    if (f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) return "D";
    if (!f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) return "E";
    if (f.index && f.middle && !f.ring && !f.pinky && f.thumb) return "F";
    if (f.index && !f.middle && !f.ring && !f.pinky && f.thumb) return "G";
    if (f.index && f.middle && !f.ring && !f.pinky && !f.thumb) return "H";
    if (!f.index && !f.middle && !f.ring && f.pinky && !f.thumb) return "I";
    if (f.index && f.thumb && f.middle && !f.ring && !f.pinky && lm[8].y > lm[6].y) return "K";
    if (f.index && f.thumb && !f.middle && !f.ring && !f.pinky) return "L";
    if (!f.index && !f.middle && !f.ring && f.pinky && !f.thumb) return "M";
    if (!f.index && !f.middle && f.ring && f.pinky && !f.thumb) return "N";
    if (thumbIndex < palm * 0.2 && f.index && f.middle && f.ring && f.pinky && f.thumb) return "O";
    if (f.index && f.middle && f.thumb && lm[8].y > lm[6].y) return "P";
    if (f.index && f.thumb && lm[8].y > lm[6].y) return "Q";
    if (f.index && f.middle && dist(lm[8], lm[12]) < palm * 0.15) return "R";
    if (!f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) return "S";
    if (!f.index && !f.middle && !f.ring && !f.pinky && f.thumb) return "T";
    if (f.index && f.middle && !f.ring && !f.pinky) return "U";
    if (f.index && f.middle && dist(lm[8], lm[12]) > palm * 0.2) return "V";
    if (f.index && f.middle && f.ring && !f.pinky) return "W";
    if (f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) return "X";
    if (f.thumb && f.pinky && !f.index && !f.middle && !f.ring) return "Y";

    // attempt on motion letters
    if (motionBuffer.length >= 3) {
        const dy = motionBuffer[motionBuffer.length-1][8].y - motionBuffer[0][8].y;
        if (dy > 0.05 && f.pinky) return "J";

        const dx1 = motionBuffer[1][8].x - motionBuffer[0][8].x;
        const dx2 = motionBuffer[2][8].x - motionBuffer[1][8].x;
        if (dx1 * dx2 < 0) return "Z";
    }

    return null;
}

startButton.addEventListener("click", async () => {
  if (detectionMode !== "idle") return;
  
  startButton.disabled = true;
  detectedLetters = [];
  
  // 5 second countdown
  detectionMode = "countdown";
  for (let i = 5; i > 0; i--) {
    countdownBox.textContent = `Get ready: ${i}`;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 2 second detection period
  detectionMode = "detecting";
  countdownBox.textContent = "Detecting...";
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // result
  detectionMode = "idle";
  countdownBox.textContent = "";
  
  if (detectedLetters.length > 0) {
    const letterCount = {};
    detectedLetters.forEach(letter => {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    });
    const mostCommon = Object.keys(letterCount).reduce((a, b) => 
      letterCount[a] > letterCount[b] ? a : b
    );
    letterBox.textContent = mostCommon;
  } else {
    letterBox.textContent = "No hand detected";
  }
  
  startButton.disabled = false;
});

const ws = new WebSocket("ws://localhost:5500");
let lastSentLetter = "";
ws.onopen = () => console.log("WebSocket connected");
ws.onerror = (e) => console.error("WebSocket error:", e);

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const lm = results.multiHandLandmarks[i];
      const isRight = results.multiHandedness[i].label === "Right";

      drawConnectors(ctx, lm, HAND_CONNECTIONS, { color: "#00FF00" });
      drawLandmarks(ctx, lm, { color: "#FF0000" });

      const letter = detectASLLetter(lm, isRight);
      
      // only detect during detection mode
      if (detectionMode === "detecting" && letter) {
        detectedLetters.push(letter);
      }
      
      // show current letter during countdown/detection
      if (detectionMode !== "idle" && letter) {
        letterBox.textContent = letter;
      }
    }
  }
});

let isProcessing = false;
function detectLoop() {
  if (!isProcessing && video.readyState === video.HAVE_ENOUGH_DATA) {
    isProcessing = true;
    hands.send({ image: video }).finally(() => { isProcessing = false; });
  }
  requestAnimationFrame(detectLoop);
}

// start camera stream
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    detectLoop();
  } catch (err) {
    console.error("Camera error:", err);
    alert("Cannot access camera. Make sure permissions are granted.");
  }
}

startCamera();