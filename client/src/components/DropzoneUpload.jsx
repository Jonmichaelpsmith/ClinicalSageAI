import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadDoc } from "../hooks/useDocuShare";
import { toast } from "react-hot-toast";

export default function DropzoneUpload({ onComplete }) {
  const onDrop = useCallback(async (files) => {
    for (const f of files) {
      toast.promise(uploadDoc(f), {
        loading: `Uploading ${f.name}…`,
        success: `${f.name} uploaded!`,
        error: `${f.name} failed ⚠️`,
      });
    }
    onComplete?.();
  }, [onComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': [] } });

  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isDragActive ? 'bg-indigo-50' : 'bg-white'}` }>
      <input {...getInputProps()} />
      <p className="text-gray-600">Drag & drop PDFs here, or click to browse</p>
    </div>
  );
}