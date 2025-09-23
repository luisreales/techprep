import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

interface ExcelDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClearFile: () => void;
  loading?: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
};

export const ExcelDropzone: React.FC<ExcelDropzoneProps> = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  loading = false,
  error
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled: loading
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const rejectionErrors = fileRejections.map(rejection => 
    rejection.errors.map(error => error.message).join(', ')
  );

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <Upload className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop file here' : 'Upload file'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports .xlsx, .xls, and .csv files up to {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Excel file'}
                </p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={onClearFile}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* File Rejection Errors */}
      {rejectionErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">File Upload Error</h4>
              <ul className="mt-1 text-sm text-red-700">
                {rejectionErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* General Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Format Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Excel Format Requirements</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Required columns:</strong> Topic, Level, Type, Text, Options, Correct, OfficialAnswer</p>
          <p><strong>Level values:</strong> basic, intermediate, advanced</p>
          <p><strong>Type values:</strong> single_choice, multi_choice, written</p>
          <p><strong>Options format:</strong> A) Option 1;B) Option 2;C) Option 3</p>
          <p><strong>Correct format:</strong> A (single_choice) or A;C (multi_choice)</p>
          <p><strong>Written questions:</strong> OfficialAnswer required, Options/Correct ignored</p>
        </div>
      </div>
    </div>
  );
};