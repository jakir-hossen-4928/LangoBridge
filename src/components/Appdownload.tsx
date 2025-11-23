import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';

function AppDownload() {
  const { translate, selectedLanguage } = useVocabulary();
  const [showInstructions, setShowInstructions] = useState(false);

  const apkUrl = import.meta.env.VITE_APP_DOWNLOAD_URL || 'https://drive.google.com/uc?export=download&id=1U32gbn4HId72uF9gymsOmNcftFjCmQQB';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header Section */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {translate('downloadApp')}
        </h1>

        {/* Download Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 transition-transform hover:scale-[1.02] group">
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <svg
                className="w-16 h-16 text-primary group-hover:animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>

            {apkUrl ? (
              <a
                href={apkUrl}
                download="LangoBridge.apk"
                className="w-full max-w-xs bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6 mr-2 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {translate('downloadLink')}
              </a>
            ) : (
              <p className="text-red-500">
                {selectedLanguage === 'bangla'
                  ? 'ডাউনলোড লিঙ্ক উপলব্ধ নয়। পরে আবার চেষ্টা করুন।'
                  : 'Download link is not available. Please try again later.'}
              </p>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedLanguage === 'bangla' ? 'সর্বশেষ ভার্সন' : '최신 버전'} v1.0.0
              </span>
              <span className="text-blue-500 animate-pulse">⬤</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title={selectedLanguage === 'bangla' ? 'নিরাপদ ইনস্টল' : '안전한 설치'}
            text={selectedLanguage === 'bangla' ? 'যাচাইকৃত নিরাপদ APK ফাইল' : '검증된 안전한 APK 파일'}
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title={selectedLanguage === 'bangla' ? 'দ্রুত আপডেট' : '정기 업데이트'}
            text={selectedLanguage === 'bangla' ? 'নিয়মিত উন্নয়ন ও আপডেট' : '정기적인 개선 및 업데이트'}
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title={selectedLanguage === 'bangla' ? 'বিজ্ঞাপন মুক্ত' : '광고 없음'}
            text={selectedLanguage === 'bangla' ? 'কোন বিরক্তিকর বিজ্ঞাপন নেই' : '성가신 광고 없음'}
          />
        </div>

        {/* Installation Instructions */}
        <div className="mb-12">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-primary hover:text-secondary font-medium flex items-center mx-auto mb-4"
          >
            {translate('installationGuide')}
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${showInstructions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showInstructions && (
            <div className="bg-white p-6 rounded-lg shadow-inner text-left animate-fade-in">
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {selectedLanguage === 'bangla' ? 'ইনস্টলেশন নির্দেশিকা' : '설치 가이드'}
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>{selectedLanguage === 'bangla' ? 'ডাউনলোড বাটনে ক্লিক করুন' : '다운로드 버튼을 클릭하세요'}</li>
                <li>{selectedLanguage === 'bangla' ? 'ফাইল ম্যানেজারে APK ফাইলটি খুঁজুন' : '파일 관리자에서 APK 파일을 찾으세요'}</li>
                <li>{selectedLanguage === 'bangla' ? 'ইনস্টল করার জন্য ট্যাপ করুন' : '탭하여 애플리케이션을 설치하세요'}</li>
                <li>{selectedLanguage === 'bangla' ? 'অজানা উৎস থেকে ইনস্টল করার অনুমতি দিন' : '알 수 없는 출처에서의 설치를 허용하세요'}</li>
              </ol>
            </div>
          )}
        </div>

        {/* Compatibility Note */}
        <div className="text-sm text-gray-500">
          <p>
            {selectedLanguage === 'bangla'
              ? 'অ্যান্ড্রয়্ড 8.0 এবং তার উপরের ভার্সন সমর্থিত'
              : '안드로이드 8.0 이상 지원'}
          </p>
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({ icon, title, text }) => (
  <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <div className="flex flex-col items-center space-y-3">
      <div className="p-3 bg-primary/10 rounded-full text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  </div>
);

export default AppDownload;