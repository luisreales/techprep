import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Upload, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { ExcelDropzone } from './ExcelDropzone';
import { ImportPreviewTable } from './ImportPreviewTable';
import { ImportStats } from './ImportStats';
import { ImportErrorPanel } from './ImportErrorPanel';
import { 
  ImportValidationResponse, 
  ImportCommitResponse, 
  ParsedRow, 
  ImportSummary,
  excelRowSchema 
} from '@/schemas/importSchema';
import { http } from '@/utils/axios';
import * as XLSX from 'xlsx';

interface AdminImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

enum ImportStep {
  UPLOAD = 'upload',
  PREVIEW = 'preview',
  VALIDATE = 'validate',
  CONFIRM = 'confirm'
}

export const AdminImportDialog: React.FC<AdminImportDialogProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [currentStep, setCurrentStep] = useState<ImportStep>(ImportStep.UPLOAD);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Parse Excel/CSV file locally for immediate preview
  const parseFile = async (file: File): Promise<ParsedRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const isCSV = file.name.toLowerCase().endsWith('.csv');
          let workbook;
          let jsonData;

          if (isCSV) {
            // For CSV files, read as text and parse
            const text = new TextDecoder().decode(e.target?.result as ArrayBuffer);
            workbook = XLSX.read(text, { type: 'string' });
          } else {
            // For Excel files, read as binary
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            workbook = XLSX.read(data, { type: 'array' });
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip header row and convert to objects
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const parsedRows: ParsedRow[] = rows.map((row, index) => {
            const rowData: any = {};
            headers.forEach((header, colIndex) => {
              rowData[header] = row[colIndex] || '';
            });

            // Validate with Zod schema
            const result = excelRowSchema.safeParse(rowData);
            
            return {
              row: index + 2, // Excel row number (1-based, +1 for header)
              parsed: result.success ? result.data : rowData,
              errors: result.success ? [] : result.error.errors.map(err => ({
                row: index + 2,
                field: err.path[0]?.toString() || 'unknown',
                message: err.message
              })),
              isValid: result.success
            };
          });

          resolve(parsedRows);
        } catch (error) {
          reject(new Error('Failed to parse file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Calculate summary from parsed data
  const calculateSummary = (data: ParsedRow[]): ImportSummary => {
    const valid = data.filter(row => row.isValid).length;
    const invalid = data.length - valid;
    
    const byType = {
      single_choice: data.filter(row => row.parsed.Type === 'single_choice').length,
      multi_choice: data.filter(row => row.parsed.Type === 'multi_choice').length,
      written: data.filter(row => row.parsed.Type === 'written').length
    };

    return {
      total: data.length,
      valid,
      invalid,
      byType
    };
  };

  // Validation mutation (sends to backend)
  const validateMutation = useMutation({
    mutationFn: async (file: File): Promise<ImportValidationResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await http.post('/admin/imports/questions/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setImportId(data.data.importId);
      setCurrentStep(ImportStep.CONFIRM);
    }
  });

  // Commit mutation
  const commitMutation = useMutation({
    mutationFn: async (importId: string): Promise<ImportCommitResponse> => {
      const response = await http.post(`/admin/imports/questions/commit?importId=${importId}`);
      return response.data;
    },
    onSuccess: () => {
      onImportComplete();
      handleClose();
    }
  });

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    
    try {
      // Parse locally for immediate preview
      const parsedData = await parseFile(file);
      setPreviewData(parsedData);
      setSummary(calculateSummary(parsedData));
      setCurrentStep(ImportStep.PREVIEW);
    } catch (error) {
      setUploadError('Failed to parse file. Please check the format.');
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setSummary(null);
    setUploadError(null);
    setImportId(null);
    setCurrentStep(ImportStep.UPLOAD);
  };

  const handleValidate = () => {
    if (selectedFile) {
      validateMutation.mutate(selectedFile);
      setCurrentStep(ImportStep.VALIDATE);
    }
  };

  const handleCommit = () => {
    if (importId) {
      commitMutation.mutate(importId);
    }
  };

  const handleClose = () => {
    handleClearFile();
    onClose();
  };

  const canProceedToValidation = summary && summary.valid > 0;
  const isLoading = validateMutation.isPending || commitMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      {/* Dialog */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import Questions</h2>
              <p className="text-sm text-gray-500">Upload and validate Excel or CSV files with question data</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              {[
                { step: ImportStep.UPLOAD, icon: Upload, label: 'Upload File' },
                { step: ImportStep.PREVIEW, icon: Eye, label: 'Preview Data' },
                { step: ImportStep.VALIDATE, icon: AlertTriangle, label: 'Validate' },
                { step: ImportStep.CONFIRM, icon: CheckCircle, label: 'Confirm Import' }
              ].map(({ step, icon: Icon, label }, index) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center space-x-2 ${
                    currentStep === step ? 'text-blue-600' : 
                    (index < Object.values(ImportStep).indexOf(currentStep)) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-px ${
                      index < Object.values(ImportStep).indexOf(currentStep) ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {currentStep === ImportStep.UPLOAD && (
              <ExcelDropzone
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClearFile={handleClearFile}
                error={uploadError}
              />
            )}

            {currentStep === ImportStep.PREVIEW && (
              <div className="space-y-6">
                {summary && <ImportStats summary={summary} />}
                <ImportPreviewTable data={previewData} />
                <ImportErrorPanel data={previewData} />
              </div>
            )}

            {currentStep === ImportStep.VALIDATE && (
              <div className="text-center py-8">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Validating Data</h3>
                <p className="text-gray-600">Server is validating your Excel data...</p>
              </div>
            )}

            {currentStep === ImportStep.CONFIRM && (
              <div className="space-y-6">
                {summary && <ImportStats summary={summary} />}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">Ready to Import</h3>
                      <p className="text-blue-800 mt-1">
                        Your data has been validated and is ready to be imported into the database.
                      </p>
                      {summary && summary.valid > 0 && (
                        <p className="text-blue-700 text-sm mt-2">
                          {summary.valid} questions will be imported. {summary.invalid > 0 && `${summary.invalid} invalid rows will be skipped.`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedFile && `Selected: ${selectedFile.name}`}
              {summary && ` • ${summary.total} rows • ${summary.valid} valid`}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              
              {currentStep === ImportStep.PREVIEW && (
                <button
                  onClick={handleValidate}
                  disabled={!canProceedToValidation || isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Validate Data
                </button>
              )}
              
              {currentStep === ImportStep.CONFIRM && (
                <button
                  onClick={handleCommit}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {commitMutation.isPending && (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Confirm Import
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};