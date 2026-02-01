import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import * as fp from "fingerpose";
import './component.css';

export default function ASLDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [letter, setLetter] = useState("–");
  const [countdownText, setCountdownText] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const detectionMode = useRef("idle");
  const latestLandmarks = useRef(null);

  const detectionWindow = 2000;
  const countdownTime = 5;

  const ctxRef = useRef(null);
  const cameraRef = useRef(null);

  // ---------------- Drawing ----------------
  const fingerJoints = {
    thumb: [0, 1, 2, 3, 4],
    index: [0, 5, 6, 7, 8],
    mid: [0, 9, 10, 11, 12],
    ring: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
  };

  function drawHand(predictions) {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!predictions || !ctx) return;

    predictions.forEach((pred) => {
      const landmarks = pred.landmarks;

      Object.values(fingerJoints).forEach((points) => {
        for (let i = 0; i < points.length - 1; i++) {
          const a = landmarks[points[i]];
          const b = landmarks[points[i + 1]];
          ctx.beginPath();
          ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
          ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
          ctx.strokeStyle = "gold";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      landmarks.forEach((lm) => {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "navy";
        ctx.fill();
      });
    });
  }

  // ---------------- Gestures ----------------
  const knownGestures = useRef([]);

  useEffect(() => {
    const alphabetDecimal = {
      C: [0, 1, 1, 1, 1],
      B: [1, 0, 0, 0, 0],
      Z: [0, 0.5, 0.5, 0.5, 0.5],
      Q: [1, 0, 1, 1, 1],
      E: [1, 1, 1, 1, 1],
      F: [0, 0, 0, 1, 1],
      G: [0, 0, 1, 1, 1],
      H: [1, 0, 0, 1, 1],
      I: [1, 1, 1, 1, 0],
      J: [1, 1, 1, 1, 0],
      K: [0, 0, 0, 1, 1],
      L: [0, 0, 1, 1, 1],
      M: [1, 1, 1, 1, 1],
      N: [1, 1, 1, 1, 1],
      O: [0, 0, 0, 0, 0],
      R: [0, 0, 0, 1, 1],
      D: [0, 0, 1, 1, 1],
      P: [1, 0, 0, 1, 1],
      S: [1, 1, 1, 1, 1],
      T: [1, 1, 1, 1, 1],
      U: [1, 0, 0, 1, 1],
      V: [1, 0, 0, 1, 1],
      W: [1, 0, 0, 0, 1],
      X: [1, 1, 1, 1, 1],
      Y: [0, 0, 1, 1, 0],
      A: [0, 0, 0, 1, 1],
    };

    knownGestures.current = Object.keys(alphabetDecimal).map((letter) => {
      const g = new fp.GestureDescription(letter);
      ["Thumb", "Index", "Middle", "Ring", "Pinky"].forEach((finger, i) => {
        g.addCurl(fp.Finger[finger], alphabetDecimal[letter][i], 1.0);
        g.addDirection(fp.Finger[finger], fp.FingerDirection.VerticalUp, 0.5);
      });
      return g;
    });
  }, []);

  const GE = useRef(null);
  if (!GE.current && knownGestures.current.length) {
    GE.current = new fp.GestureEstimator(knownGestures.current);
  }

  // ---------------- MediaPipe ----------------
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext("2d");

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      latestLandmarks.current =
        results.multiHandLandmarks?.[0] || null;
    });

    cameraRef.current = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    cameraRef.current.start();

    const renderLoop = () => {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (latestLandmarks.current) {
        drawHand([{ landmarks: latestLandmarks.current }]);

        if (detectionMode.current === "detecting" && GE.current) {
          const landmarks = latestLandmarks.current.map((p) => [
            p.x,
            p.y,
            p.z,
          ]);
          const est = GE.current.estimate(landmarks, 1);

          if (est.gestures.length > 0) {
            const best = est.gestures.reduce((a, b) =>
              a.score > b.score ? a : b
            );
            setLetter(best.name);
          } else {
            setLetter("No gesture");
          }
        }
      } else if (detectionMode.current === "detecting") {
        setLetter("No hand detected");
      }

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }, []);

  // ---------------- Detection ----------------
  function startDetection() {
    if (detectionMode.current !== "idle") return;

    detectionMode.current = "countdown";
    setLetter("–");
    setIsRunning(true);

    let t = countdownTime;
    setCountdownText(`Get ready: ${t}`);

    const interval = setInterval(() => {
      t--;
      if (t > 0) {
        setCountdownText(`Get ready: ${t}`);
      } else {
        clearInterval(interval);
        setCountdownText("Detecting...");
        detectionMode.current = "detecting";

        setTimeout(() => {
          detectionMode.current = "idle";
          setCountdownText("");
          setIsRunning(false);
        }, detectionWindow);
      }
    }, 1000);
  }

  return (
    <>
      <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>

        <img src={`../handimage/A.svg`} width={300}></img>

        <video ref={videoRef} style={{ display: "none" }} />
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          style={{ border: "1px solid black", borderRadius: "10px" }}
        />

        <button
          onClick={startDetection}
          disabled={isRunning}
          className="learnButton"
          style={{
            backgroundColor:
              detectionMode.current === "detecting"
                ? letter === "A"
                  ? "green"
                  : "red"
                : "",
            color: "white",
            transition: "background-color 0.3s",
          }}
        >
          {detectionMode.current === "idle"
            ? "Start Detection"
            : detectionMode.current === "countdown"
              ? countdownText
              : letter}
        </button>

      </div>
    </>
  );
}
