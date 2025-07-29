import React, { useState, useCallback } from 'react';
import { Upload, FileText, Camera, Folder, X, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileSelect, maxSize = 10 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  // 파일 유효성 검사
  const validateFile = (file) => {
    if (!file) return '파일을 선택해주세요.';
    
    if (file.type !== 'application/pdf') {
      return 'PDF 파일만 업로드 가능합니다.';
    }
    
    if (file.size > maxSize) {
      return `파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 가능합니다.`;
    }
    
    return null;
  };

  // 파일 처리
  const handleFile = useCallback((file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadStatus('uploading');
    setUploadProgress(0);

    // 업로드 시뮬레이션 (실제로는 API 호출)
    const uploadSimulation = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadStatus('success');
          if (onFileSelect) {
            onFileSelect(file);
          }
        }
        setUploadProgress(Math.round(progress));
      }, 200);
    };

    uploadSimulation();
  }, [maxSize, onFileSelect]);

  // 드래그 앤 드롭 핸들러
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // 파일 제거
  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setError('');
  };

  // 카메라 촬영 (모바일 전용)
  const handleCameraCapture = () => {
    // 실제 구현에서는 카메라 API 사용
    alert('카메라 기능은 모바일 앱에서 지원됩니다.');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 메인 업로드 영역 */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* 업로드 상태별 UI */}
        {uploadStatus === 'idle' && (
          <>
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              PDF 파일을 업로드하세요
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              파일을 드래그하여 놓거나 아래 버튼을 클릭하세요
            </p>
            
            {/* 업로드 버튼들 */}
            <div className="flex flex-wrap justify-center gap-4">
              <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Folder className="w-5 h-5" />
                파일 선택
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleCameraCapture}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
                카메라 촬영
              </button>
            </div>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              파일 업로드 중...
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {selectedFile?.name}
            </p>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {uploadProgress}% 완료
            </p>
          </>
        )}

        {uploadStatus === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">
              업로드 완료!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {selectedFile?.name}
            </p>
            <button
              onClick={removeFile}
              className="flex items-center gap-2 mx-auto px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              다른 파일 선택
            </button>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-300">
              업로드 실패
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
            <button
              onClick={removeFile}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </>
        )}
      </div>

      {/* 파일 정보 */}
      {selectedFile && uploadStatus === 'success' && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-red-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 지원 형식 안내 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          지원 형식: PDF • 최대 크기: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>
    </div>
  );
};

export default FileUpload;

