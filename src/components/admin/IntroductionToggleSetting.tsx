'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import SettingCard from './SettingCard';

function IntroductionToggleSetting() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isShown, setIsShown] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/general');
      const data = await response.json();

      if (data.success && data.data) {
        setIsShown(data.data.introductionFileShown);
      }
    } catch (error) {
      console.error('설정 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setSaving(true);
      const newValue = !isShown;

      const response = await fetch('/api/admin/settings/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          introductionFileShown: newValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsShown(newValue);
        alert('설정이 저장되었습니다.');
      } else {
        alert(data.error || '설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingCard
        icon={<Eye className="w-6 h-6 text-white" />}
        title="회사소개서 버튼 표시"
        description="메인 페이지에서 회사소개서 버튼의 표시 여부를 설정합니다"
        status="active"
        iconGradient="from-purple-500 to-purple-600"
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
      icon={isShown ? <Eye className="w-6 h-6 text-white" /> : <EyeOff className="w-6 h-6 text-white" />}
      title="회사소개서 버튼 표시"
      description="메인 페이지에서 회사소개서 버튼의 표시 여부를 설정합니다"
      status={isShown ? "active" : "inactive"}
      statusText={isShown ? "표시 중" : "숨김"}
      iconGradient="from-purple-500 to-purple-600"
    >
      <div className="space-y-4">
        {/* 현재 상태 표시 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isShown ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isShown ? '회사소개서 버튼이 표시되고 있습니다' : '회사소개서 버튼이 숨겨져 있습니다'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  메인 페이지의 Hero 섹션에서 버튼 표시 여부가 적용됩니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 토글 버튼 */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">버튼 표시 설정</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isShown ? '버튼을 숨기려면 토글을 끄세요' : '버튼을 표시하려면 토글을 켜세요'}
            </p>
          </div>
          
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`
              relative inline-flex h-7 w-14 items-center rounded-full transition-colors
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isShown ? 'bg-gray-600' : 'bg-gray-300'}
            `}
          >
            {saving && (
              <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white animate-spin" />
            )}
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                ${isShown ? 'translate-x-8' : 'translate-x-1'}
                ${saving ? 'opacity-0' : 'opacity-100'}
              `}
            />
          </button>
        </div>
      </div>
    </SettingCard>
  );
}

export default IntroductionToggleSetting;