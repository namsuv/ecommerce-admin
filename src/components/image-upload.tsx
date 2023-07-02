import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { useDropzone, FileWithPath, DropzoneProps } from 'react-dropzone';
import { Button } from './ui/button';

interface ImageUploadProps extends DropzoneProps {
  onImageUpload: (files: FileWithPath[]) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, ...restProps }) => {
  const [files, setFiles] = useState<(FileWithPath & { preview: string })[]>([])

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      // Do something with the accepted files (e.g., upload to a server)
      if (acceptedFiles?.length) {
        setFiles(previousFiles => [
          // If allowing multiple files
          // ...previousFiles,
          ...acceptedFiles.map(file =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
          )
        ])
      }

      if (onImageUpload) {
        onImageUpload(acceptedFiles);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    ...restProps
  });

  return (
    <>
      <ul className='mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
        {files.map(file => (
          <li key={file.name} className='relative h-fit rounded-md'>
            <Image
              src={file.preview}
              alt={file.name}
              width={100}
              height={100}
              onLoad={() => {
                URL.revokeObjectURL(file.preview)
              }}
              className='h-full w-full rounded-md object-contain'
            />
            <p className='mt-2 text-[12px] font-medium text-stone-500'>
              {file.name}
            </p>
          </li>
        ))}
      </ul>

      <div
        {...getRootProps()}
        className={`w-full flex items-center justify-start ${isDragActive ? 'bg-gray-100' : 'bg-white'
          }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-gray-600">Drop the files here...</p>
        ) : (
          <Button
            className='mt-6'
            type="button"
            // disabled={disabled}
            variant="secondary"
          // onClick={onClick}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Upload an Image
          </Button>
        )}
      </div>
    </>
  );
};

export default ImageUpload;
