import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, Loader2, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import { validatePhoto } from '../../utils/photoValidation';
import { useSaveCallerUserProfile, useUploadProfilePicture } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import ProfileAvatar from './ProfileAvatar';
import { DENTAL_PRESETS } from '../../constants/dentalPresets';
import { getPresetTileColors } from '../../utils/presetTileColors';

interface AvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AvatarModal({ open, onOpenChange }: AvatarModalProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const uploadProfilePictureMutation = useUploadProfilePicture();
  const [uploading, setUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    const validationError = validatePhoto(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);
      
      const uploadedBlob = await uploadProfilePictureMutation.mutateAsync(blob);
      
      await saveProfileMutation.mutateAsync({
        ...userProfile,
        profilePicture: uploadedBlob,
        presetAvatarId: undefined,
      });
      
      toast.success('Profile picture uploaded successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectPreset = async (presetId: number) => {
    if (!userProfile) return;

    try {
      await saveProfileMutation.mutateAsync({
        ...userProfile,
        presetAvatarId: BigInt(presetId),
        profilePicture: undefined,
      });
      
      toast.success('Avatar selected successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to select avatar');
    }
  };

  const isPresetSelected = (presetId: number): boolean => {
    return !userProfile?.profilePicture && userProfile?.presetAvatarId === BigInt(presetId);
  };

  const handleImageError = (presetId: number) => {
    setImageErrors((prev) => new Set(prev).add(presetId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Change Avatar</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload a custom picture or choose from our dental-themed preset avatars
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center gap-4">
            <Label className="text-foreground">Current Avatar</Label>
            <ProfileAvatar
              profilePicture={userProfile?.profilePicture}
              presetAvatarId={userProfile?.presetAvatarId}
              initials={userProfile?.initials || ''}
              username={userProfile?.username || ''}
              size="xl"
            />
          </div>

          <Separator className="bg-border" />

          {/* Upload Custom Picture */}
          <div className="space-y-3">
            <Label className="text-foreground">Upload Custom Picture</Label>
            <p className="text-sm text-muted-foreground">
              JPEG or PNG, max 6MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleUploadClick}
              disabled={uploading || saveProfileMutation.isPending}
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/40"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
            </Button>
          </div>

          <Separator className="bg-border" />

          {/* Preset Avatars Grid */}
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Choose Preset Avatar</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Select from {DENTAL_PRESETS.length} dental-themed icons
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 pb-4">
              {DENTAL_PRESETS.map((preset) => {
                const colors = getPresetTileColors(preset.id);
                const selected = isPresetSelected(preset.id);
                const hasError = imageErrors.has(preset.id);

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    disabled={saveProfileMutation.isPending}
                    className="relative group flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: selected ? 'var(--primary)' : colors.borderColor,
                      backgroundColor: selected ? 'oklch(var(--primary) / 0.15)' : colors.backgroundColor,
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = colors.hoverBorderColor;
                        e.currentTarget.style.backgroundColor = colors.hoverBackgroundColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = colors.borderColor;
                        e.currentTarget.style.backgroundColor = colors.backgroundColor;
                      }
                    }}
                    title={preset.description}
                  >
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      {hasError ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                          <span className="text-xs text-muted-foreground text-center px-1">
                            Image unavailable
                          </span>
                        </div>
                      ) : (
                        <img
                          src={preset.path}
                          alt={preset.name}
                          className="w-full h-full object-contain rounded-md"
                          onError={() => handleImageError(preset.id)}
                        />
                      )}
                      {selected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-md">
                          <Check className="h-8 w-8 text-primary" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-center text-muted-foreground group-hover:text-foreground line-clamp-2">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
