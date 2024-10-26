import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PoseLandmarker, FilesetResolver } from 'https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0';
import ParticleSystem from '../ParticleSystem/ParticleSystem';

const PoseDetection = () => {
  const [landmarks, setLandmarks] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });

      // Set up webcam stream
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      });

      // Detect landmarks
      const detect = () => {
        if (videoRef.current.readyState >= 2) {
          poseLandmarker.detectForVideo(videoRef.current, performance.now(), (result) => {
            if (result.landmarks && result.landmarks.length > 0) {
              setLandmarks(result.landmarks);
            }
          });
        }
        requestAnimationFrame(detect);
      };
      detect();
    };

    createPoseLandmarker();
  }, []);

  return (
    <>
      <video ref={videoRef} style={{ display: 'none' }} />
      <Canvas style={{ width: '100vw', height: '100vh', background: 'black' }}> {/* Set background to black */}
        <ambientLight />
        <ParticleSystem landmarks={landmarks} /> {/* Pass landmarks to ParticleSystem */}
      </Canvas>
    </>
  );
};

export default PoseDetection;
