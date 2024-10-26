import React, { useRef, useEffect } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

const VideoMask = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const offscreenCanvasRef = useRef(null); // Off-screen canvas

    useEffect(() => {
        const setupCamera = async () => {
            const video = videoRef.current;
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    resolve(video);
                };
            });
            video.play();
        };

        const applyMask = async () => {
            const net = await bodyPix.load();
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const offscreenCanvas = offscreenCanvasRef.current;
            const offscreenCtx = offscreenCanvas.getContext('2d');

            const detect = async () => {
                // Perform segmentation with improved parameters
                const segmentation = await net.segmentPerson(video, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.6,
                    outputStride: 8
                });

                // Create a colored mask
                const mask = new ImageData(video.videoWidth, video.videoHeight);
                const color = [255, 0, 0, 128]; // RGBA for red color with transparency

                for (let i = 0; i < segmentation.data.length; i++) {
                    const maskValue = segmentation.data[i];
                    // Change the color of the mask based on the segmentation
                    if (maskValue > 0) { // If the pixel is part of the person
                        mask.data[i * 4] = color[0];     // R
                        mask.data[i * 4 + 1] = color[1]; // G
                        mask.data[i * 4 + 2] = color[2]; // B
                        mask.data[i * 4 + 3] = color[3]; // A
                    } else {
                        mask.data[i * 4 + 3] = 0; // Transparent
                    }
                }

                // Draw the video frame to the off-screen canvas
                offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
                offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
                offscreenCtx.putImageData(mask, 0, 0);

                // Apply a blur to the off-screen canvas for smoothing (optional)
                // Uncomment the next line to add a blur effect
                // offscreenCtx.filter = 'blur(2px)';
                // offscreenCtx.drawImage(offscreenCanvas, 0, 0);

                // Draw the off-screen canvas to the main canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(offscreenCanvas, 0, 0);

                requestAnimationFrame(detect);
            };

            detect();
        };

        setupCamera().then(applyMask);
    }, []);

    return (
        <>
            <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} autoPlay muted />
            <canvas ref={canvasRef} width="1280" height="960" />
            <canvas ref={offscreenCanvasRef} width="1280" height="960" style={{ display: 'none' }} />
        </>
    );
};

export default VideoMask;
