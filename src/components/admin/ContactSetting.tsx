'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit, X, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import SettingCard from './SettingCard';

interface ContactConfig {
  address: string;
  emails: string[];
  phone: string;
  fax: string;
}

function ContactSetting() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactConfig | null>(null);
  
  // 편집 중인 데이터
  const [editAddress, setEditAddress] = useState('');
  const [editEmails, setEditEmails] = useState<string[]>([]);
  const [editPhone, setEditPhone] = useState('');
  const [editFax, setEditFax] = useState('');

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/contact');
      const data = await response.json();

      if (data.success && data.data) {
        setContactInfo(data.data);
      }
    } catch (error) {
      console.error('Contact 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (contactInfo) {
      setEditAddress(contactInfo.address);
      setEditEmails([...contactInfo.emails]);
      setEditPhone(contactInfo.phone);
      setEditFax(contactInfo.fax);
    } else {
      setEditAddress('');
      setEditEmails(['']);
      setEditPhone('');
      setEditFax('');
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditAddress('');
    setEditEmails([]);
    setEditPhone('');
    setEditFax('');
  };

  const handleAddEmail = () => {
    setEditEmails([...editEmails, '']);
  };

  const handleRemoveEmail = (index: number) => {
    setEditEmails(editEmails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...editEmails];
    newEmails[index] = value;
    setEditEmails(newEmails);
  };

  const handleSave = async () => {
    // 유효성 검증
    if (!editAddress.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    const validEmails = editEmails.filter(email => email.trim());
    if (validEmails.length === 0) {
      alert('최소 하나의 이메일을 입력해주세요.');
      return;
    }

    if (!editPhone.trim()) {
      alert('대표 번호를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch('/api/admin/settings/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: editAddress.trim(),
          emails: validEmails.map(email => email.trim()),
          phone: editPhone.trim(),
          fax: editFax.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setContactInfo(data.data);
        setIsEditing(false);
        alert('Contact 정보가 저장되었습니다.');
      } else {
        alert(data.error || 'Contact 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Contact 정보 저장 오류:', error);
      alert('Contact 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingCard
        icon={<Mail className="w-6 h-6 text-white" />}
        title="연락처 정보"
        description="회사 연락처, 이메일, 주소를 관리합니다"
        status="active"
        iconGradient="from-green-500 to-green-600"
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
      icon={<Mail className="w-6 h-6 text-white" />}
      title="연락처 정보"
      description="회사 연락처, 이메일, 주소를 관리합니다"
      status={contactInfo ? 'active' : 'inactive'}
      statusText={contactInfo ? '활성' : '정보 없음'}
      iconGradient="from-green-500 to-green-600"
    >
      {!isEditing ? (
        // View Mode
        <div className="space-y-4">
          {contactInfo ? (
            <div className="space-y-3">
              {/* 주소 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">주소</p>
                    <p className="text-sm text-gray-900">{contactInfo.address}</p>
                  </div>
                </div>
              </div>

              {/* 이메일 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-2">이메일</p>
                    <div className="space-y-1">
                      {contactInfo.emails.map((email, index) => (
                        <p key={index} className="text-sm text-gray-900">
                          {email}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 전화번호 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">대표 번호</p>
                      <p className="text-sm text-gray-900">{contactInfo.phone}</p>
                    </div>
                  </div>
                </div>

                {contactInfo.fax && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">팩스</p>
                        <p className="text-sm text-gray-900">{contactInfo.fax}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-4">등록된 연락처 정보가 없습니다</p>
            </div>
          )}

          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>{contactInfo ? '수정' : '등록'}</span>
          </button>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-4">
          {/* 주소 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="예: 서울특별시 강남구 테헤란로 123, 4층"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>

          {/* 이메일 입력 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                이메일 <span className="text-red-500">*</span>
              </label>
              <button
                onClick={handleAddEmail}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
              >
                <Plus className="w-3 h-3" />
                <span>추가</span>
              </button>
            </div>
            <div className="space-y-2">
              {editEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="example@company.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  {editEmails.length > 1 && (
                    <button
                      onClick={() => handleRemoveEmail(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 전화번호 입력 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표 번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="02-1234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팩스
              </label>
              <input
                type="tel"
                value={editFax}
                onChange={(e) => setEditFax(e.target.value)}
                placeholder="02-1234-5679"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>취소</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>저장 중...</span>
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

export default ContactSetting;