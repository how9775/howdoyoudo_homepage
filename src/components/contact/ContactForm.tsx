'use client';

import React, { useState, FormEvent } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  '행사 문의',
  '일반 문의',
  '기타',
];

interface FormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  privacyAgreed: boolean;
  // Honeypot (봇 방지용 - 화면에는 보이지 않음)
  website: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    privacyAgreed: false,
    website: '', // Honeypot
  });

  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          honeypot: formData.website, // Honeypot 전송
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setSuccessMessage(data.message);
        // 폼 초기화
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: '',
          privacyAgreed: false,
          website: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(data.error || '문의 전송에 실패했습니다.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">문의하기</h2>
        <p className="text-gray-600">
          문의사항을 남겨주시면 빠른 시일 내에 답변드리겠습니다.
        </p>
      </div>

      {/* 성공 메시지 */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">전송 완료</h3>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">전송 실패</h3>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2열 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="space-y-6">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="홍길동"
                disabled={status === 'loading'}
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                문의 카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                disabled={status === 'loading'}
              >
                <option value="">카테고리를 선택해주세요</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="example@email.com"
                disabled={status === 'loading'}
              />
              <p className="mt-1 text-xs text-gray-500">답변을 받으실 이메일 주소를 입력해주세요.</p>
            </div>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="문의 제목을 입력해주세요 (최소 5자)"
                disabled={status === 'loading'}
              />
            </div>

            {/* 내용 */}
            <div className="flex-1">
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                문의 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={2000}
                rows={9}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="문의 내용을 자세히 작성해주세요 (최소 10자, 최대 2000자)"
                disabled={status === 'loading'}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.message.length} / 2000
              </p>
            </div>
          </div>
        </div>

        {/* Honeypot*/}
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* 개인정보 동의 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="privacyAgreed"
              checked={formData.privacyAgreed}
              onChange={handleChange}
              required
              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={status === 'loading'}
            />
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">개인정보 수집 및 이용 동의</span>
              <span className="text-red-500 ml-1">*</span>
              <br />
              <span className="text-xs text-gray-600 mt-1 block">
                문의 답변을 위해 이름과 이메일 주소를 수집하며, 답변 완료 후 즉시 파기됩니다.
              </span>
            </span>
          </label>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={status === 'loading' || !formData.privacyAgreed}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>전송 중...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>문의 보내기</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}