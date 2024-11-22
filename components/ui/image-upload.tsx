"use client";

import Image from "next/image";
import * as React from "react";
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cn, convertToJpgExtension, formatBytes } from "@/lib/utils";
import useGroupImageTabStore from "@/store/group-image-tab-store";
import { useMutation } from "@tanstack/react-query";
import { FileText, Upload, X } from "lucide-react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Spinner } from "./spinner";

type FileWithPreview = File & { preview: string };

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: FileWithPreview[];

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (file: File) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps["accept"];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps["maxSize"];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps["maxFiles"];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;

  /**
   * Aspect Ratio of react crop.
   * @type number
   * @default 1
   * @example aspect
   */
  aspect?: number;

  /**
   * Toast Loading message.
   * @type string
   * @default "Uploading avatar..."
   * @example toastMessage
   */
  toastLoadingMessage?: string;

  /**
   * Toast Success message.
   * @type string
   * @default "Avatar uploaded..."
   * @example toastMessage
   */
  toastSuccessMessage?: string;

  /**
   * Circular crop option.
   * @type boolean
   * @default false
   * @example circularCrop
   */
  circularCrop?: boolean;
}

export function ImageUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = {
      "image/*": [],
    },
    maxSize = 1024 * 1024 * 2,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    aspect = 1,
    toastLoadingMessage = "Uploading avatar...",
    toastSuccessMessage = "Avatar uploaded successfully",
    circularCrop = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [crop, setCrop] = React.useState<Crop>();
  const [croppedImage, setCroppedImage] = React.useState<File>();

  const { mutate: handleImageUpload } = useMutation({
    mutationFn: onUpload,
    onMutate: () => {
      const toastId = toast.loading(toastLoadingMessage);
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      setFiles([]);
      return toast.success(toastSuccessMessage, {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      setFiles([]);
      console.error(error);
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }

      if (updatedFiles.length > 0 && updatedFiles.length <= maxFileCount)
        setDialogOpen(true);
    },

    [files, maxFileCount, multiple, handleImageUpload, setFiles],
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImage = await getCroppedImg(
        imgRef.current,
        crop,
        convertToJpgExtension(files?.[0].name),
      );
      setCroppedImage(croppedImage);
    }
  }

  async function onCrop() {
    setDialogOpen(false);
    if (onUpload && croppedImage) {
      handleImageUpload(croppedImage);
    }
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  return (
    <div className="relative flex flex-1 flex-col gap-6 overflow-hidden">
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <Dropzone
          onDrop={onDrop}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFileCount}
          multiple={maxFileCount > 1 || multiple}
          disabled={isDisabled}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={cn(
                "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isDragActive && "border-muted-foreground/50",
                isDisabled && "pointer-events-none opacity-60",
                className,
              )}
              {...dropzoneProps}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="size-7 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    Drop the image here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="size-7 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col gap-px">
                    <p className="font-medium text-muted-foreground">
                      Drag {`'n'`} drop image here, or click to select image
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      You can upload
                      {maxFileCount > 1
                        ? ` ${maxFileCount === Infinity ? "multiple" : maxFileCount}
                      images (up to ${formatBytes(maxSize)} each)`
                        : ` a image with ${formatBytes(maxSize)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Dropzone>
        <DialogContent
          onClose={() => setFiles([])}
          onEscapeKeyDown={(e) => {
            setFiles([]);
          }}
          onInteractOutside={(e) => {
            setFiles([]);
          }}
        >
          <DialogHeader>
            <DialogTitle>Crop photo</DialogTitle>
            <DialogDescription>
              Adjust the size of the grid to crop your image.
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex max-h-full max-w-full items-center justify-center overflow-hidden rounded-lg p-4"
            style={{
              backgroundImage:
                "linear-gradient(45deg, rgb(176, 176, 176) 25%, transparent 25%), linear-gradient(-45deg, rgb(176, 176, 176) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(176, 176, 176) 75%), linear-gradient(-45deg, transparent 75%, rgb(176, 176, 176) 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
            }}
          >
            <ReactCrop
              circularCrop={circularCrop}
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => onCropComplete(c)}
              aspect={aspect}
            >
              <Avatar className="size-full rounded-none">
                <AvatarImage
                  ref={imgRef}
                  className="aspect-auto !max-h-[277px] max-w-full rounded-none object-cover"
                  alt="Image Cropper Shell"
                  src={files?.[0]?.preview}
                  onLoad={onImageLoad}
                />
                <AvatarFallback className="size-full min-h-[460px] min-w-[277px] rounded-none">
                  <Spinner
                    loadingSpanClassName="bg-primary"
                    className="size-6"
                  />
                </AvatarFallback>
              </Avatar>
            </ReactCrop>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="reset"
                className="md:w-fit"
                variant={"outline"}
                onClick={() => {
                  setFiles([]);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="md:w-fit" onClick={onCrop}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {files?.length ? (
        <ScrollArea className="h-fit w-full px-3">
          <div className="flex max-h-48 flex-col gap-4">
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

export function BackgroundImageUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = {
      "image/*": [],
    },
    maxSize = 1024 * 1024 * 2,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const aspect = 20 / 9;

  const files = useGroupImageTabStore.use.files();
  const setFiles = useGroupImageTabStore.use.setFiles();

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [crop, setCrop] = React.useState<Crop>();
  const [croppedImage, setCroppedImage] = React.useState<File>();

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }

      if (updatedFiles.length > 0 && updatedFiles.length <= maxFileCount)
        setDialogOpen(true);
    },

    [files, maxFileCount, multiple, setFiles],
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImage = await getCroppedImg(
        imgRef.current,
        crop,
        convertToJpgExtension(files?.[0].name),
      );
      setCroppedImage(croppedImage);
    }
  }

  async function onCrop() {
    setDialogOpen(false);
    const croppedImageWithPreview = Object.assign(croppedImage!, {
      preview: URL.createObjectURL(croppedImage!),
    });
    setFiles([croppedImageWithPreview]);
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  return (
    <div className="relative flex flex-1 flex-col gap-6 overflow-hidden">
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <Dropzone
          onDrop={onDrop}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFileCount}
          multiple={maxFileCount > 1 || multiple}
          disabled={isDisabled}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={cn(
                "group relative grid w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isDragActive && "border-muted-foreground/50",
                isDisabled && "pointer-events-none opacity-60",
                files?.length ? "h-[9.5rem]" : "h-56",
                className,
              )}
              {...dropzoneProps}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  {!isDisabled && (
                    <div className="rounded-full border border-dashed p-3">
                      <Upload
                        className="size-7 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <p className="font-medium text-muted-foreground">
                    Drop the image here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  {!isDisabled && (
                    <div className="rounded-full border border-dashed p-3">
                      <Upload
                        className="size-7 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-px">
                    <p className="font-medium text-muted-foreground">
                      Drag {`'n'`} drop image here, or click to select image
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      You can upload
                      {maxFileCount > 1
                        ? ` ${maxFileCount === Infinity ? "multiple" : maxFileCount}
                      images (up to ${formatBytes(maxSize)} each)`
                        : ` a image with ${formatBytes(maxSize)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Dropzone>
        <DialogContent
          onClose={() => setFiles([])}
          onEscapeKeyDown={(e) => {
            setFiles([]);
          }}
          onInteractOutside={(e) => {
            setFiles([]);
          }}
        >
          <DialogHeader>
            <DialogTitle>Crop photo</DialogTitle>
            <DialogDescription>
              Adjust the size of the grid to crop your image.
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex max-h-full max-w-full items-center justify-center overflow-hidden rounded-lg p-4"
            style={{
              backgroundImage:
                "linear-gradient(45deg, rgb(176, 176, 176) 25%, transparent 25%), linear-gradient(-45deg, rgb(176, 176, 176) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(176, 176, 176) 75%), linear-gradient(-45deg, transparent 75%, rgb(176, 176, 176) 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
            }}
          >
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => onCropComplete(c)}
              aspect={aspect}
            >
              <Avatar className="size-full rounded-none">
                <AvatarImage
                  ref={imgRef}
                  className="aspect-auto !max-h-[277px] max-w-full rounded-none object-cover"
                  alt="Image Cropper Shell"
                  src={files?.[0]?.preview}
                  onLoad={onImageLoad}
                />
                <AvatarFallback className="size-full min-h-[460px] min-w-[277px] rounded-none">
                  <Spinner
                    loadingSpanClassName="bg-primary"
                    className="size-6"
                  />
                </AvatarFallback>
              </Avatar>
            </ReactCrop>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="reset"
                className="md:w-fit"
                variant={"outline"}
                onClick={() => {
                  setFiles([]);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="md:w-fit" onClick={onCrop}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {files?.length ? (
        <ScrollArea className="h-fit w-full">
          <div className="flex max-h-48 flex-col gap-4">
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string = "cropped.png",
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Unable to get canvas context"));
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to Blob conversion failed"));
          return;
        }
        const file = new File([blob], fileName, { type: "image/jpg" });
        resolve(file);
      },
      "image/jpeg",
      0.5,
    );
  });
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 text-sm font-medium text-foreground/80">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={onRemove}
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string";
}

interface FilePreviewProps {
  file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
  if (file.type.startsWith("image/")) {
    return (
      <Image
        src={file.preview}
        alt={file.name}
        width={48}
        height={48}
        loading="lazy"
        className="aspect-square shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
  );
}

// Helper function to center the crop
export function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 50,
        height: 50,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}
