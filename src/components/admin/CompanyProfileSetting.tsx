'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Eye, Edit, X, Check, Download, Loader2 } from 'lucide-react';
import SettingCard from './SettingCard';

interface FileInfo {
  name: string;
  size: string;
  updatedAt: string;
  url?: string;
  key?: string;
}

function CompanyProfileSetting() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 마운트시 파일 정보 로드
  useEffect(() => {
    loadFileInfo();
  }, []);

  const loadFileInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/introduction');
      const data = await response.json();

      if (data.success && data.data) {
        setFileInfo(data.data);
      } else {
        setFileInfo(null);
      }
    } catch (error) {
      console.error('파일 정보 로드 오류:', error);
      setFileInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // PDF 파일만 허용
      if (file.type !== 'application/pdf') {
        alert('PDF 파일만 업로드 가능합니다.');
        return;
      }
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하만 가능합니다.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/admin/settings/introduction', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data) {
        setFileInfo(data.data);
        setSelectedFile(null);
        setIsEditing(false);
        alert('파일이 성공적으로 업로드되었습니다.');
      } else {
        alert(data.error || '파일 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleDownload = () => {
    if (fileInfo?.url) {
      const link = document.createElement('a');
      link.href = fileInfo.url;
      link.download = fileInfo.name;
      link.click();
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <SettingCard
        icon={<FileText className="w-6 h-6 text-white" />}
        title="회사소개서"
        description="회사소개 PDF 파일을 업로드하고 관리합니다"
        status="active"
        iconGradient="from-blue-500 to-blue-600"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">로딩 중...</span>
        </div>
      </SettingCard>
    );
  }

  return (
    <SettingCard
      icon={<FileText className="w-6 h-6 text-white" />}
      title="회사소개서"
      description="회사소개 PDF 파일을 업로드하고 관리합니다"
      status={fileInfo ? "active" : "inactive"}
      statusText={fileInfo ? "활성" : "파일 없음"}
      iconGradient="from-blue-500 to-blue-600"
    >
      {!isEditing ? (
        // View Mode
        <div className="space-y-4">
          {fileInfo ? (
            <>
              {/* File Info */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>현재 파일: {fileInfo.name}</span>
                <span>•</span>
                <span>{fileInfo.size}</span>
                <span>•</span>
                <span>최근 업데이트: {fileInfo.updatedAt}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>다운로드</span>
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>파일 변경</span>
                </button>
              </div>
            </>
          ) : (
            // 파일이 없을 때
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-4">업로드된 파일이 없습니다.</p>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mx-auto"
              >
                <Upload className="w-4 h-4" />
                <span>파일 업로드</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-4">
          {/* File Upload Area */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div
              onClick={handleUploadClick}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="w-8 h-8 text-gray-400" />
                {selectedFile ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">
                      클릭하여 파일 선택
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF 파일만 가능 (최대 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Current File Info */}
          {fileInfo && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">현재 파일</p>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <span>{fileInfo.name}</span>
                <span>•</span>
                <span>{fileInfo.size}</span>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                새 파일을 업로드하면 현재 파일이 삭제됩니다.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>취소</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>업로드 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>저장</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </SettingCard>
  );
}

export default CompanyProfileSetting;