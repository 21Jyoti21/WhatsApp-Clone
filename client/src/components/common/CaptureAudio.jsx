import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { handleClientScriptLoad } from "next/script";
import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaPause,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRed = useRef(null);
  const waveFormRef = useRef(null);
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => {
          setTotalDuration(prevDuration + 1);
          return prevDuration + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    });
    setWaveform(wavesurfer);
    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });
    return () => {
      wavesurfer.destroy();
    };
  }, []);
  useEffect(() => {
    if (waveform) {
      handleStartRecording();
    }
  }, [waveform]);

  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);
  const handlePlayRecording = () => {
    if (waveform) {
      waveform.play();
      setIsPlaying(true);
    }
  };
  const handlePauseRecording = () => {
    if (waveform) {
      waveform.pause();
      setIsPlaying(false);
    }
  };
  const handleStopRecording = () => {
    if (mediaRecorderRed.current && isRecording) {
      mediaRecorderRed.current.stop();
      setIsRecording(false);
      waveform.stop();
    }
  };
  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRed.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg;codecs=opus" });
          const audioURL = URL.createObjectURL(blob);

          setRecordedAudio(new Audio(audioURL));
          if (waveform) {
            waveform.load(audioURL);
          }
          setRenderedAudio(blob);
        };
        mediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const sendRecording = async () => {
    hide(false);
    try {
      const tempId = `temp-audio-${Date.now()}`;

      const tempMessage = {
        id: tempId,
        senderId: userInfo.id,
        recieverId: currentChatUser.id,
        type: "audio",
        message: URL.createObjectURL(renderedAudio),
        messageStatus: "sending",
        createdAt: new Date().toISOString(),
      };
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: tempMessage,
        fromSelf: true,
      });
      const formData = new FormData();
      const audioFile = new File([renderedAudio], "recording.webm", {
        type: "audio/webm",
      });

      formData.append("audio", audioFile);
      formData.append("from", userInfo.id);
      formData.append("to", currentChatUser.id);

      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) {
        if (socket && typeof socket.emit === "function") {
          socket.emit("send-msg", {
            to: currentChatUser.id,
            from: userInfo.id,
            message: response.data.message,
          });
        }

        dispatch({
          type: reducerCases.REPLACE_MESSAGE,
          tempId,
          newMessage: response.data.message,
        });

        setRecordedAudio(null);
        setRenderedAudio(null);
        setIsRecording(false);
        setIsPlaying(false);
      }
      mediaRecorderRed.current?.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    } catch (err) {
      console.log(err);
    }
  };
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <div className="pt-1">
        <FaTrash className="text-panel-header-icon" onClick={() => hide()} />
      </div>
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg ">
        {isRecording ? (
          <div className="text-red-500 animate-pulse 2-60 text-center">
            Recording <span>{recordingDuration}</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay onClick={handlePlayRecording} />
                ) : (
                  <FaStop onClick={handlePauseRecording} />
                )}
              </>
            )}
          </div>
        )}
        <div className="w-60" ref={waveFormRef} hidden={isRecording} />
        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden />
      </div>
      <div className="mr-4">
        {!isRecording ? (
          <FaMicrophone
            className="text-red-500"
            onClick={handleStartRecording}
          />
        ) : (
          <FaPauseCircle
            className="text-red-500"
            onClick={handleStopRecording}
          />
        )}
      </div>
      <div>
        <MdSend
          className="text-panel-header-icon cursor-pointer mr-4"
          title="Send"
          onClick={sendRecording}
        />
      </div>
    </div>
  );
}
export default CaptureAudio;