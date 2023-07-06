"use client";

import { useUploadThing } from "@/lib/uploadthing";
// Note: `useUploadThing` is IMPORTED FROM YOUR CODEBASE using the `generateReactHelpers` function
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { DropzoneProps, FileWithPath } from "react-dropzone";
import { UploadFileType } from "uploadthing/client";
import { Button } from "./ui/button";
import { ImagePlus } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps extends DropzoneProps {
  onImageUpload: (files: FileUpload[]) => void;
  values: { url: string }[];
};

export type FileUpload = {
  fileUrl: string;
  fileKey: string;
}

export function Uploader({ values, onImageUpload, accept, multiple, ...restProps }: ImageUploadProps) {
  const [files, setFiles] = useState<FileUpload[]>(values && values.length > 0 ? values.map(f => ({ fileUrl: f.url ?? '', fileKey: new Date() + '' })) : []);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      setFiles(previous => [...previous, ...res ?? []])
      if (onImageUpload) {
        onImageUpload([...files, ...res ?? []]);
      }
    },
    onUploadError: (err) => {
      console.log(err)
    },
  });

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    startUpload(acceptedFiles)
  }, [startUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple,
    ...restProps
  });

  return (
    <>
      <ul className='mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
        {files.map(file => (
          <li key={file.fileKey} className='relative h-fit rounded-md'>
            <Image
              src={file.fileUrl}
              alt={file.fileKey}
              width={100}
              height={100}
              onLoad={() => {
                URL.revokeObjectURL(file.fileUrl)
              }}
              className='h-full w-full rounded-md object-contain'
            />
          </li>
        ))}
      </ul>

      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {/* <div>
          {files.length > 0 && (
            <button onClick={() => startUpload(files)}>
              Upload {files.length} files
            </button>
          )}
        </div> */}
        <Button
          className='mt-6'
          type="button"
          disabled={isUploading}
          variant="secondary"
        // onClick={onClick}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Upload an Image
        </Button>
      </div>
    </>
  );
}