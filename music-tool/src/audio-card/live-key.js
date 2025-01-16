import { useState, useRef } from "react";
import axios from "axios";

export const useLiveKeyDetection = (waveSurferRefs, fileUrl, index) => {
  const [liveKey, setLiveKey] = useState("N/A");
  const [liveConfidence, setLiveConfidence] = useState(0);
  const intervalRef = useRef(null);

  const extractAudioSegment = async (url, currentTime) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const startSample = Math.floor(currentTime * audioBuffer.sampleRate);
      const endSample = Math.min(startSample + audioBuffer.sampleRate * 2, audioBuffer.length);

      if (startSample >= audioBuffer.length || startSample < 0) {
        console.error("Invalid segment time range");
        return [];
      }

      return Array.from(audioBuffer.getChannelData(0).slice(startSample, endSample));
    } catch (error) {
      console.error("Error extracting audio segment:", error);
      return [];
    }
  };

  const startKeyDetection = () => {
    stopKeyDetection();

    intervalRef.current = setInterval(async () => {
      const waveSurfer = waveSurferRefs.current[index];
      if (!waveSurfer || !waveSurfer.isPlaying()) {
        stopKeyDetection();
        return;
      }

      const currentTime = waveSurfer.getCurrentTime();
      const segment = await extractAudioSegment(fileUrl, currentTime);

      if (segment.length === 0) {
        console.error("Empty audio segment, skipping key detection");
        return;
      }

      try {
        const response = await axios.post("http://localhost:5000/analyze_segment", {
          segment,
          sr: 44100,
        });
        console.log("Key Detection Response:", response.data);
        setLiveKey(response.data.key || "N/A");
        setLiveConfidence(response.data.confidence || 0);
      } catch (error) {
        console.error("Error detecting key:", error.response?.data || error.message);
      }
    }, 1000);
  };

  const stopKeyDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("Key detection stopped.");
    }
  };

  const handleTimelineSeek = async (seekRatio) => {
    const waveSurfer = waveSurferRefs.current[index];
    if (!waveSurfer) return;

    const currentTime = seekRatio * waveSurfer.getDuration();
    const segment = await extractAudioSegment(fileUrl, currentTime);

    if (segment.length === 0) {
      console.error("Empty audio segment during seek, skipping key detection");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/analyze_segment", {
        segment,
        sr: 44100,
      });
      console.log("Key Detection Response (Seek):", response.data);
      setLiveKey(response.data.key || "N/A");
      setLiveConfidence(response.data.confidence || 0);
    } catch (error) {
      console.error("Error detecting key on seek:", error.response?.data || error.message);
    }
  };

  return {
    liveKey,
    liveConfidence,
    startKeyDetection,
    stopKeyDetection,
    handleTimelineSeek,
  };
};
