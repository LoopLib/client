import { useState, useRef } from "react";
import axios from "axios";

// Custom hook for live key detection from an audio file using waveform data
export const useLiveKeyDetection = (waveSurferRefs, fileUrl, index) => {
  // State to store the detected musical key and its confidence level
  const [liveKey, setLiveKey] = useState("N/A");
  const [liveConfidence, setLiveConfidence] = useState(0);

  // Ref to hold the interval for periodic key detection
  const intervalRef = useRef(null);

  // Extract a short segment (2 seconds) of audio data from the file at a given time
  const extractAudioSegment = async (url, currentTime) => {
    try {
      // Fetch audio file and decode it into an AudioBuffer
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Calculate sample range for 2-second segment starting at currentTime
      const startSample = Math.floor(currentTime * audioBuffer.sampleRate);
      const endSample = Math.min(startSample + audioBuffer.sampleRate * 2, audioBuffer.length);

      // Handle out-of-bounds conditions
      if (startSample >= audioBuffer.length || startSample < 0) {
        console.error("Invalid segment time range");
        return [];
      }

      // Return segment as a plain array from the first channel (mono)
      return Array.from(audioBuffer.getChannelData(0).slice(startSample, endSample));
    } catch (error) {
      console.error("Error extracting audio segment:", error);
      return [];
    }
  };

  // Start periodic key detection every second while the audio is playing
  const startKeyDetection = () => {
    // Stop any existing key detection interval
    stopKeyDetection();

    intervalRef.current = setInterval(async () => {
      const waveSurfer = waveSurferRefs.current[index];

      // Exit if waveform is unavailable or audio is no longer playing
      if (!waveSurfer || !waveSurfer.isPlaying()) {
        stopKeyDetection();
        return;
      }

      const currentTime = waveSurfer.getCurrentTime();

      // Extract audio segment around the current time
      const segment = await extractAudioSegment(fileUrl, currentTime);

      if (segment.length === 0) {
        console.error("Empty audio segment, skipping key detection");
        return;
      }

      try {
        // Send segment to backend for key analysis
        const response = await axios.post("http://localhost:5000/analyze_segment", {
          segment,
          sr: 44100, // Assume standard sample rate
        });

        console.log("Key Detection Response:", response.data);

        // Update state with detected key and confidence
        setLiveKey(response.data.key || "N/A");
        setLiveConfidence(response.data.confidence || 0);
      } catch (error) {
        console.error("Error detecting key:", error.response?.data || error.message);
      }
    }, 1000); // Detect key every second
  };

  // Stop the key detection interval if running
  const stopKeyDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("Key detection stopped.");
    }
  };

  // Manually trigger key detection when user seeks the waveform
  const handleTimelineSeek = async (seekRatio) => {
    const waveSurfer = waveSurferRefs.current[index];
    if (!waveSurfer) return;

    // Calculate new current time based on seek position (0.0 to 1.0)
    const currentTime = seekRatio * waveSurfer.getDuration();

    // Extract segment at new time position
    const segment = await extractAudioSegment(fileUrl, currentTime);

    if (segment.length === 0) {
      console.error("Empty audio segment during seek, skipping key detection");
      return;
    }

    try {
      // Send new segment to backend for analysis after seek
      const response = await axios.post("http://localhost:5000/analyze_segment", {
        segment,
        sr: 44100,
      });

      console.log("Key Detection Response (Seek):", response.data);

      // Update state with new detection results
      setLiveKey(response.data.key || "N/A");
      setLiveConfidence(response.data.confidence || 0);
    } catch (error) {
      console.error("Error detecting key on seek:", error.response?.data || error.message);
    }
  };

  // Return values and methods to the component using this hook
  return {
    liveKey,
    liveConfidence,
    startKeyDetection,
    stopKeyDetection,
    handleTimelineSeek,
  };
};
