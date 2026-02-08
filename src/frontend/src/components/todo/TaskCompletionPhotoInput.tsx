import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useCamera } from '../../camera/useCamera';
import { validatePhoto } from '../../utils/photoValidation';
import { toast } from 'sonner';

interface TaskCompletionPhotoInputProps {
  onPhotoSelected: (file: File | null, previewUrl: string | null) => void;
  selectedFile: File | null;
  previewUrl: string | null;
}

export default function TaskCompletionPhotoInput({
  onPhotoSelected,
  selectedFile,
  previewUrl,
}: TaskCompletionPhotoInputProps) {
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    quality: 0.9,
    format: 'image/jpeg',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validatePhoto(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onPhotoSelected(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCamera = async () => {
    setShowCamera(true);
    const success = await startCamera();
    if (!success) {
      setShowCamera(false);
    }
  };

  const handleCloseCamera = async () => {
    await stopCamera();
    setShowCamera(false);
  };

  const handleCapture = async () => {
    const capturedFile = await capturePhoto();
    if (capturedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoSelected(capturedFile, reader.result as string);
        handleCloseCamera();
      };
      reader.readAsDataURL(capturedFile);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoSelected(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (showCamera) {
    return (
      <div className="space-y-3">
        <Label>Photo (optional)</Label>
        <div className="space-y-3">
          <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            {cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          {cameraError && (
            <p className="text-sm text-destructive">
              Camera error: {cameraError.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCapture}
              disabled={!isActive || cameraLoading}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseCamera}
              disabled={cameraLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className="space-y-2">
        <Label>Photo (optional)</Label>
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemovePhoto}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="photo">Photo (optional)</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            id="photo"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>
        {isSupported && (
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenCamera}
            disabled={cameraLoading}
          >
            <Camera className="mr-2 h-4 w-4" />
            Camera
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        JPEG or PNG, max 2MB
      </p>
    </div>
  );
}
