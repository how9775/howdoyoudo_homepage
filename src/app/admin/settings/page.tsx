'use client';

import CompanyProfileSetting from '@/components/admin/CompanyProfileSetting';
import ContactSetting from '@/components/admin/ContactSetting';
import IntroductionToggleSetting from '@/components/admin/IntroductionToggleSetting';
import React from 'react';

function SettingsPage() {
  return (
    <div className='min-h-screen'>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">환경 설정</h1>
          <p className="text-gray-600">사이트의 각종 설정을 관리합니다</p>
        </div>

        {/* Settings List */}
        <div className="space-y-4">
          {/* 회사소개서 설정 */}
          <CompanyProfileSetting />
          <IntroductionToggleSetting/>
          <ContactSetting/>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;