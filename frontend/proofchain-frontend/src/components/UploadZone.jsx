import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadZone = ({ onImageUpload, isLoading }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && !isLoading) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setFileName(file.name);
      onImageUpload(file, previewUrl);
    }
  }, [onImageUpload, isLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileName(null);
    onImageUpload(null, null);
  };

  return (
    <div style={{ maxWidth: '42rem', margin: '0 auto', width: '100%' }}>
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
        style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={preview} 
              alt="Preview" 
              className="preview-image"
            />
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>{fileName}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Click or drag to replace</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#4b5563', fontWeight: '500' }}>
              {isDragActive ? 'Drop the screenshot here' : 'Drag & drop payment screenshot here'}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>or click to select</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
      {preview && !isLoading && (
        <button onClick={clearPreview} className="remove-btn">
          Remove
        </button>
      )}
    </div>
  );
};

export default UploadZone;