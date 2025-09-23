import React from 'react';
import { AdminImportDialog } from '@/components/admin/import/AdminImportDialog';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {

  return (
    <AdminImportDialog
      isOpen={isOpen}
      onClose={onClose}
      onImportComplete={onImportComplete}
    />
  );
};

export default ImportQuestionsModal;