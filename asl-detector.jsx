import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

export default function ASLDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const wsRef = useRef(null);
  const detectedLettersRef = useRef([]);
  const isProcessingRef = useRef(false);
  
  const [letter, setLetter] = useState('—');
  const [countdown, setCountdown] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [detectionMode, setDetectionMode] = useState('idle'); // 'idle', 'countdown', 'detecting'

  // ASL Detection Functions
  const dist = (a, b) => {
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const getFingerStates = (lm, isRight) => {
    const tips = [4, 8, 12, 16, 20];
    const pips = [3, 6, 10, 14, 18];
    return {
      thumb: isRight ? lm[tips[0]].x > lm[pips[0]].x : lm[tips[0]].x < lm[pips[0]].x,
      index: lm[tips[1]].y < lm[pips[1]].y,
      middle: lm[tips[2]].y < lm[pips[2]].y,
      ring: lm[tips[3]].y < lm[pips[3]].y,
      pinky: lm[tips[4]].y < lm[pips[4]].y
    };
  };

  const detectASLLetter = (lm, isRight, motionBuffer = []) => {
    const f = getFingerStates(lm, isRight);
    const thumbIndex = dist(lm[4], lm[8]);
    const palm = dist(lm[0], lm[9]);

    // Static Letters
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

    // Motion Letters
    if (motionBuffer.length >= 3) {
      const dy = motionBuffer[motionBuffer.length - 1][8].y - motionBuffer[0][8].y;
      if (dy > 0.05 && f.pinky) return "J";

      const dx1 = motionBuffer[1][8].x - motionBuffer[0][8].x;
      const dx2 = motionBuffer[2][8].x - motionBuffer[1][8].x;
      if (dx1 * dx2 < 0) return "Z";
    }

    return null;
  };

  // Button Handler
  const handleStartDetection = async () => {
    if (detectionMode !== 'idle') return;

    setIsButtonDisabled(true);
    detectedLettersRef.current = [];

    // 5 second countdown
    setDetectionMode('countdown');
    for (let i = 5; i > 0; i--) {
      setCountdown(`Get ready: ${i}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 2 second detection period
    setDetectionMode('detecting');
    setCountdown('Detecting...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Show result
    setDetectionMode('idle');
    setCountdown('');

    if (detectedLettersRef.current.length > 0) {
      // Get most common letter detected
      const letterCount = {};
      detectedLettersRef.current.forEach(letter => {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
      });
      const mostCommon = Object.keys(letterCount).reduce((a, b) =>
        letterCount[a] > letterCount[b] ? a : b
      );
      setLetter(mostCommon);
    } else {
      setLetter('No hand detected');
    }

    setIsButtonDisabled(false);
  };

  // Initialize MediaPipe Hands and Camera
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Initialize WebSocket
    wsRef.current = new WebSocket('ws://localhost:5500');
    wsRef.current.onopen = () => console.log('WebSocket connected');
    wsRef.current.onerror = (e) => console.error('WebSocket error:', e);

    // Initialize MediaPipe Hands
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
          const isRight = results.multiHandedness[i].label === 'Right';

          drawConnectors(ctx, lm, HAND_CONNECTIONS, { color: '#00FF00' });
          drawLandmarks(ctx, lm, { color: '#FF0000' });

          const detectedLetter = detectASLLetter(lm, isRight);

          // Only collect letters during detection phase
          if (detectionMode === 'detecting' && detectedLetter) {
            detectedLettersRef.current.push(detectedLetter);
          }

          // Show current letter during countdown/detection
          if (detectionMode !== 'idle' && detectedLetter) {
            setLetter(detectedLetter);
          }
        }
      }
    });

    handsRef.current = hands;

    // Start camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();

        video.addEventListener('loadedmetadata', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        });

        // Detection loop
        const detectLoop = () => {
          if (!isProcessingRef.current && video.readyState === video.HAVE_ENOUGH_DATA) {
            isProcessingRef.current = true;
            hands.send({ image: video }).finally(() => {
              isProcessingRef.current = false;
            });
          }
          requestAnimationFrame(detectLoop);
        };

        detectLoop();
      } catch (err) {
        console.error('Camera error:', err);
        alert('Cannot access camera. Make sure permissions are granted.');
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [detectionMode]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ASL Letter Detector</h1>

      <div style={styles.videoContainer}>
        <video ref={videoRef} style={styles.video} />
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>

      <div style={styles.controls}>
        <button
          onClick={handleStartDetection}
          disabled={isButtonDisabled}
          style={{
            ...styles.button,
            ...(isButtonDisabled ? styles.buttonDisabled : {})
          }}
        >
          Start Detection
        </button>
        <div style={styles.countdown}>{countdown}</div>
      </div>

      <div style={styles.letterDisplay}>
        <div style={styles.letterLabel}>Detected Letter:</div>
        <div style={styles.letter}>{letter}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh'
  },
  title: {
    color: '#333'
  },
  videoContainer: {
    position: 'relative',
    margin: '20px 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  video: {
    display: 'none'
  },
  canvas: {
    borderRadius: '8px',
    maxWidth: '100%',
    height: 'auto'
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    margin: '20px 0'
  },
  button: {
    padding: '15px 40px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed'
  },
  countdown: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ff6b6b',
    minHeight: '30px'
  },
  letterDisplay: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  letterLabel: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '10px'
  },
  letter: {
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#2196F3',
    minWidth: '100px',
    display: 'inline-block'
  }
};
