import React from 'react';
import { UploadFile } from '../../types';
import { FileItem } from './file-item';

interface FileListProps {
  files: UploadFile[];
  onRemoveFile: (fileId: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileItem 
          key={file.id} 
          file={file} 
          onRemove={() => onRemoveFile(file.id)} 
        />
      ))}
    </div>
  );
};