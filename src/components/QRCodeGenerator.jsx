import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check } from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "QR Code Generator",
    "appDescription": "Generate QR codes for URLs, text, and contact information",
    "urlTab": "URL",
    "textTab": "Text",
    "contactTab": "Contact",
    "enterUrl": "Enter URL",
    "enterText": "Enter Text",
    "contactInformation": "Contact Information",
    "websiteUrl": "Website URL",
    "urlPlaceholder": "example.com or https://example.com",
    "urlHelp": "Enter a website URL. If you don't include http://, we'll add https:// automatically.",
    "textContent": "Text Content",
    "textPlaceholder": "Enter any text to generate QR code...",
    "firstName": "First Name",
    "firstNamePlaceholder": "John",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Doe",
    "phoneNumber": "Phone Number",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Email Address",
    "emailPlaceholder": "john.doe@example.com",
    "organization": "Organization",
    "organizationPlaceholder": "Company Name",
    "website": "Website",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "Clear All Fields",
    "generatedQrCode": "Generated QR Code",
    "scanQrCode": "Scan this QR code with your device",
    "fillFormPrompt": "Fill in the form to generate your QR code",
    "download": "Download",
    "copyData": "Copy Data",
    "copied": "Copied!",
    "qrCodeData": "QR Code Data:",
    "footerText": "Generate QR codes instantly • No data stored • Free to use",
    "qrCodeAlt": "Generated QR Code"
  },
  "vi-VN": {
    "appTitle": "Trình tạo mã QR",
    "appDescription": "Tạo mã QR cho URL, văn bản và thông tin liên hệ",
    "urlTab": "Đường dẫn",
    "textTab": "Văn bản",
    "contactTab": "Liên hệ",
    "enterUrl": "Nhập đường dẫn",
    "enterText": "Nhập văn bản",
    "contactInformation": "Thông tin liên hệ",
    "websiteUrl": "Đường dẫn trang web",
    "urlPlaceholder": "example.com hoặc https://example.com",
    "urlHelp": "Nhập địa chỉ website. Nếu bạn không thêm http://, chúng tôi sẽ tự động thêm https://.",
    "textContent": "Nội dung văn bản",
    "textPlaceholder": "Nhập bất kỳ văn bản nào để tạo mã QR...",
    "firstName": "Tên",
    "firstNamePlaceholder": "Nguyễn",
    "lastName": "Họ",
    "lastNamePlaceholder": "Văn A",
    "phoneNumber": "Số điện thoại",
    "phonePlaceholder": "+84 912 345 678",
    "emailAddress": "Địa chỉ Email",
    "emailPlaceholder": "nguyenvana@example.com",
    "organization": "Tổ chức",
    "organizationPlaceholder": "Tên công ty",
    "website": "Trang web",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "Xóa tất cả",
    "generatedQrCode": "Mã QR đã tạo",
    "scanQrCode": "Quét mã QR này bằng thiết bị của bạn",
    "fillFormPrompt": "Điền vào biểu mẫu để tạo mã QR",
    "download": "Tải xuống",
    "copyData": "Sao chép dữ liệu",
    "copied": "Đã sao chép!",
    "qrCodeData": "Dữ liệu mã QR:",
    "footerText": "Tạo mã QR ngay lập tức • Không lưu trữ dữ liệu • Miễn phí",
    "qrCodeAlt": "Mã QR đã tạo"
  }
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef(null);
  const [locale, setLocale] = useState(findMatchingLocale(browserLocale));
  const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;
  
  // Form states for different types
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  // QR Code generation using QRious library via CDN
  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      // Load QRious library dynamically
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => {
          createQR(text);
        };
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (error) {
      console.error('Error loading QR library:', error);
      // Fallback to Google Charts API
      generateFallbackQR(text);
    }
  };

  const createQR = (text) => {
    if (!qrContainerRef.current) return;
    
    try {
      // Clear previous QR code
      qrContainerRef.current.innerHTML = '';
      
      // Create canvas element
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);
      
      // Generate QR code
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: 300,
        background: 'white',
        foreground: 'black',
        level: 'H',
        mime: 'image/png'
      });
      
      // Style the canvas
      canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
      canvas.style.maxWidth = '300px';
      canvas.style.height = 'auto';
      
    } catch (error) {
      console.error('Error creating QR code:', error);
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text) => {
    if (!qrContainerRef.current) return;
    
    // Clear previous content
    qrContainerRef.current.innerHTML = '';
    
    // Create img element for fallback
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.alt = t('qrCodeAlt');
    img.className = 'w-full h-auto rounded-xl shadow-lg bg-white p-4';
    img.style.maxWidth = '300px';
    img.style.height = 'auto';
    
    // Add error handling for the fallback image
    img.onerror = () => {
      // If Google Charts also fails, try QR Server API
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&format=png&margin=10`;
    };
    
    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
CHARSET:UTF-8
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
ORG:${contact.organization}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.url}
END:VCARD`;
    return vcard;
  };

  useEffect(() => {
    let data = '';
    
    switch (activeTab) {
      case 'url':
        data = formatUrl(urlInput);
        break;
      case 'text':
        data = textInput;
        break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
      default:
        data = '';
    }
    
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = () => {
    if (!qrData) return;
    
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');
    
    if (canvas) {
      // Download from canvas
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      // Download from image
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = img.src;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const tabs = [
    { id: 'contact', label: t('contactTab'), icon: User },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'url', label: t('urlTab'), icon: Link } 
  ];

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden font-sans">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-600/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl mb-6 border border-white/10 shadow-lg">
                <QrCode className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-100 via-gray-300 to-gray-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
                {t('appTitle')}
            </h1>
            <p className="text-gray-300 text-xl font-light">{t('appDescription')}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            {/* Tab Navigation */}
            <div className="border-b border-white/10">
                <nav className="flex">
                {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                        activeTab === tab.id
                            ? 'text-white border-b-2 border-white/80 bg-white/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <IconComponent className="w-4 h-4" />
                        {tab.label}
                    </button>
                    );
                })}
                </nav>
            </div>

            <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-200 mb-4">
                    {activeTab === 'url' && t('enterUrl')}
                    {activeTab === 'text' && t('enterText')}
                    {activeTab === 'contact' && t('contactInformation')}
                    </h2>

                    {/* URL Input */}
                    {activeTab === 'url' && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <label className="block text-sm font-medium text-white/90 mb-3">
                        {t('websiteUrl')}
                        </label>
                        <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={t('urlPlaceholder')}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                        {t('urlHelp')}
                        </p>
                    </div>
                    )}

                    {/* Text Input */}
                    {activeTab === 'text' && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <label className="block text-sm font-medium text-white/90 mb-3">
                        {t('textContent')}
                        </label>
                        <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={t('textPlaceholder')}
                        rows={4}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400 resize-none"
                        />
                    </div>
                    )}

                    {/* Contact Input */}
                    {activeTab === 'contact' && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                            {t('firstName')}
                            </label>
                            <input
                            type="text"
                            value={contactInfo.firstName}
                            onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                            placeholder={t('firstNamePlaceholder')}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                            {t('lastName')}
                            </label>
                            <input
                            type="text"
                            value={contactInfo.lastName}
                            onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                            placeholder={t('lastNamePlaceholder')}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400"
                            />
                        </div>
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            {t('phoneNumber')}
                        </label>
                        <input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                            placeholder={t('phonePlaceholder')}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            {t('emailAddress')}
                        </label>
                        <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                            placeholder={t('emailPlaceholder')}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            {t('organization')}
                        </label>
                        <input
                            type="text"
                            value={contactInfo.organization}
                            onChange={(e) => setContactInfo({...contactInfo, organization: e.target.value})}
                            placeholder={t('organizationPlaceholder')}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400"
                        />
                        </div>
                        
                        <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            {t('website')}
                        </label>
                        <input
                            type="url"
                            value={contactInfo.url}
                            onChange={(e) => setContactInfo({...contactInfo, url: e.target.value})}
                            placeholder={t('websitePlaceholder')}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-gray-400/50 focus:border-white/30 transition-all duration-300 text-white placeholder-gray-400"
                        />
                        </div>
                    </div>
                    )}

                    <button
                    onClick={resetForm}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl text-white/90 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium border border-white/20 hover:border-white/30"
                    >
                    {t('clearAllFields')}
                    </button>
                </div>

                {/* QR Code Display Section */}
                <div className="flex flex-col items-center space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-200">{t('generatedQrCode')}</h2>
                    
                    <div className="bg-white/5 rounded-2xl p-8 w-full max-w-sm border border-white/10 backdrop-blur-xl">
                    {qrData ? (
                        <div className="text-center">
                        <div ref={qrContainerRef} className="flex justify-center">
                            {/* QR code will be dynamically inserted here */}
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                            {t('scanQrCode')}
                        </p>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                        <QrCode className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">
                            {t('fillFormPrompt')}
                        </p>
                        </div>
                    )}
                    </div>

                    {qrData && (
                    <div className="flex gap-4 w-full max-w-sm">
                        <button
                        onClick={downloadQRCode}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600/50 text-white rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-medium shadow-lg"
                        >
                        <Download className="w-4 h-4" />
                        {t('download')}
                        </button>
                        
                        <button
                        onClick={copyToClipboard}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-gray-200 rounded-xl hover:bg-white/20 transition-all duration-200 font-medium"
                        >
                        {copied ? (
                            <>
                            <Check className="w-4 h-4 text-green-400" />
                            {t('copied')}
                            </>
                        ) : (
                            <>
                            <Copy className="w-4 h-4" />
                            {t('copyData')}
                            </>
                        )}
                        </button>
                    </div>
                    )}

                    {qrData && (
                    <div className="w-full max-w-sm">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">{t('qrCodeData')}</h3>
                        <div className="bg-white/10 rounded-lg p-3 text-xs text-gray-300 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-words">{qrData}</pre>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>
            </div>

            <div className="text-center mt-8 text-gray-500 text-sm">
                <p>{t('footerText')}</p>
                <button
                    onClick={() => setLocale(locale === "en-US" ? "vi-VN" : "en-US")}
                    className="underline text-gray-400 hover:text-white transition-colors mt-2"
                >
                    {locale === "en-US" ? "English" : "Tiếng Việt"}
                </button>
            </div>
        </div>
        </div>
    );
};

export default QRCodeGenerator;