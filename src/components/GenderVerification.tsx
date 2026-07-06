"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Gender } from "@/types/user";

interface GenderVerificationProps {
  gender: Gender;
  onCapture: (photoBlob: Blob) => void;
  onBack: () => void;
}

type Phase = "ready" | "countdown" | "captured";

export function GenderVerification({
  gender,
  onCapture,
  onBack,
}: GenderVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("ready");
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const genderLabel = gender === "kadin" ? "Kadın" : "Erkek";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setError("Kamera erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown === 0) {
      capturePhoto();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        setPreviewUrl(URL.createObjectURL(blob));
        setPhase("captured");
      },
      "image/jpeg",
      0.85
    );
  };

  const handleStartCountdown = () => {
    setCountdown(5);
    setPhase("countdown");
  };

  const handleRetake = async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhase("ready");
    setCountdown(5);
    setCameraReady(false);
    await startCamera();
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.85
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-[var(--foreground)]">Cinsiyet Doğrulama</h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Seçilen cinsiyet: <span className="font-medium text-[var(--primary)]">{genderLabel}</span>
        </p>
        <p className="text-xs text-[var(--muted)] mt-2">
          Yüzünüz net görünecek şekilde kameraya bakın. 5 saniye geri sayım sonrası fotoğraf çekilecektir.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
        {phase === "captured" && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Doğrulama fotoğrafı" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            {phase === "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-7xl sm:text-8xl font-bold text-white animate-pulse">
                  {countdown}
                </span>
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {phase === "ready" && (
          <>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--muted)] font-medium hover:bg-gray-50 transition-colors"
            >
              Geri
            </button>
            <button
              type="button"
              onClick={handleStartCountdown}
              disabled={!cameraReady || !!error}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors"
            >
              Fotoğraf Çek
            </button>
          </>
        )}

        {phase === "countdown" && (
          <button
            type="button"
            disabled
            className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-medium opacity-70"
          >
            Çekiliyor... {countdown}
          </button>
        )}

        {phase === "captured" && (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--muted)] font-medium hover:bg-gray-50 transition-colors"
            >
              Tekrar Çek
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              Onayla
            </button>
          </>
        )}
      </div>
    </div>
  );
}
