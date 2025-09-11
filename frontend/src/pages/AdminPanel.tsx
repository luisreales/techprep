import React, { useState } from 'react';

interface PreviewQuestion {
  row: number;
  question: string;
  status: 'valid' | 'error';
  errorMessage?: string;
}

const AdminPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([
    {
      row: 1,
      question: 'Valid question entry',
      status: 'valid'
    },
    {
      row: 2,
      question: 'Valid question entry',
      status: 'valid'
    },
    {
      row: 3,
      question: 'Missing required field',
      status: 'error',
      errorMessage: 'Missing required field'
    },
    {
      row: 4,
      question: 'Valid question entry',
      status: 'valid'
    },
    {
      row: 5,
      question: 'Valid question entry',
      status: 'valid'
    }
  ]);

  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Here you would normally parse the file and update the preview
    console.log('File selected:', file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('excel') || file.type.includes('spreadsheet') || 
          file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        handleFileSelect(file);
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    // Here you would implement the actual import logic
    console.log('Importing file:', selectedFile.name);
    alert('Import functionality would be implemented here');
  };

  const validQuestions = previewQuestions.filter(q => q.status === 'valid').length;
  const errorQuestions = previewQuestions.filter(q => q.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex flex-col min-h-screen justify-between">
        {/* Header */}
        <header className="flex items-center border-b border-gray-200 bg-white px-4 py-3">
          <button className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-800">Import Data</h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Upload Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800">Upload Excel File</h2>
            <p className="mt-1 text-gray-600">Select an Excel file to import your data.</p>
            
            <div 
              className={`mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} bg-white p-8 text-center transition-colors`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <span className="material-symbols-outlined text-5xl text-gray-400">upload_file</span>
              <p className="mt-4 text-gray-600">
                <label className="font-semibold text-blue-600 cursor-pointer hover:text-blue-700">
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileInputChange}
                  />
                  Click to upload
                </label> or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">XLSX, XLS (max. 10MB)</p>
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </section>

          {/* Preview Section */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Preview</h2>
              <span className="text-sm font-medium text-gray-500">
                Showing {previewQuestions.length} of {previewQuestions.length} rows
              </span>
            </div>
            <p className="mt-1 text-gray-600">
              Previewing the first {previewQuestions.length} rows. Errors will be highlighted.
            </p>
            
            {/* Summary */}
            <div className="mt-2 flex gap-4 text-sm">
              <span className="text-green-600">✓ {validQuestions} valid</span>
              <span className="text-red-600">✗ {errorQuestions} errors</span>
            </div>

            <div className="mt-4 flow-root">
              <div className="-mx-6 -my-2 overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500" scope="col">
                            Row
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500" scope="col">
                            Question
                          </th>
                          <th className="relative px-6 py-3" scope="col">
                            <span className="sr-only">Status</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {previewQuestions.map((question) => (
                          <tr 
                            key={question.row} 
                            className={question.status === 'error' ? 'bg-red-50' : ''}
                          >
                            <td className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${question.status === 'error' ? 'text-red-900' : 'text-gray-900'}`}>
                              {question.row}
                            </td>
                            <td className={`px-6 py-4 text-sm ${question.status === 'error' ? 'text-red-900' : 'text-gray-700'}`}>
                              <div>
                                {question.question}
                                {question.errorMessage && (
                                  <div className="text-xs text-red-600 mt-1">
                                    Error: {question.errorMessage}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <div className={`flex items-center justify-end ${question.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                                <span className="material-symbols-outlined text-xl">
                                  {question.status === 'valid' ? 'check_circle' : 'error'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer with Import Button */}
        <footer className="sticky bottom-0 border-t border-gray-200 bg-white/80 p-4 backdrop-blur-sm">
          <button 
            onClick={handleImport}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={!selectedFile || errorQuestions > 0}
          >
            <span className="material-symbols-outlined">file_upload</span>
            <span>Import Data</span>
          </button>
          {errorQuestions > 0 && (
            <p className="mt-2 text-center text-sm text-red-600">
              Please fix all errors before importing
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default AdminPanel;