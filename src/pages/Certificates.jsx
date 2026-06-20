import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Award, Printer, Edit3, Calendar, User, Mail, Phone, FileText } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import signatureImg from '../assets/signature.png';
import { DbService } from '../services/db.service';

const Certificates = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const [selectedTest, setSelectedTest] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const certificateRef = useRef(null);

    // Get recent high scores (e.g., > 30 WPM)
    const recentTests = React.useMemo(() => {
        const history = user?.stats?.history || [];
        return history.filter(test => test.wpm > 0).slice(-5).reverse();
    }, [user?.stats?.history]);

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        fatherName: '',
        email: user?.email || '',
        mobile: '',
        wpm: 0,
        accuracy: 0,
        date: new Date().toISOString().split('T')[0],
        issueDateTime: new Date().toISOString(),
        description: 'Successfully completed the professional typing assessment with distinction.',
        avatar: user?.avatar || '',
        certificateId: 'TMP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        verificationUrl: '',
        grossSpeed: 0,
        netSpeed: 0
    });

    // Check for passed state from CourseDetail
    useEffect(() => {
        if (location.state) {
            const { courseTitle, accuracy, completedDate, wpm, grossSpeed, netSpeed } = location.state;
            setFormData(prev => ({
                ...prev,
                accuracy: accuracy,
                wpm: wpm || prev.wpm,
                grossSpeed: grossSpeed || wpm || prev.grossSpeed,
                netSpeed: netSpeed || wpm || prev.netSpeed,
                date: completedDate ? new Date(completedDate).toISOString().split('T')[0] : prev.date,
                description: `Successfully completed the "${courseTitle}" assessment with distinction.`
            }));
        }
    }, [location.state]);

    // Auto-load best test if no state
    useEffect(() => {
        if (!location.state && recentTests.length > 0) {
            // Find best test (highest WPM with good accuracy)
            const bestTest = recentTests.reduce((prev, current) => {
                return (prev.wpm > current.wpm) ? prev : current;
            }, recentTests[0]);

            if (bestTest) {
                setFormData(prev => ({
                    ...prev,
                    wpm: bestTest.wpm,
                    grossSpeed: bestTest.grossSpeed || bestTest.wpm || 0,
                    netSpeed: bestTest.netSpeed || bestTest.wpm || 0,
                    accuracy: bestTest.accuracy,
                    date: new Date(bestTest.date).toISOString().split('T')[0],
                    description: 'Successfully completed the professional typing assessment with distinction.'
                }));
                setSelectedTest(bestTest);
            }
        }
    }, [location.state]);

    // Update form when a test is selected
    useEffect(() => {
        if (selectedTest) {
            setFormData(prev => ({
                ...prev,
                wpm: selectedTest.wpm,
                grossSpeed: selectedTest.grossSpeed || selectedTest.wpm || 0,
                netSpeed: selectedTest.netSpeed || selectedTest.wpm || 0,
                accuracy: selectedTest.accuracy,
                date: new Date(selectedTest.date).toISOString().split('T')[0],
                description: 'Successfully completed the professional typing assessment with distinction.'
            }));
        }
    }, [selectedTest]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save certificate to database (hybrid handles fallback)
    useEffect(() => {
        if (formData.certificateId && (formData.wpm > 0 || formData.grossSpeed > 0) && user?.id) {
            const saveCert = async () => {
                try {
                    await DbService.saveCertificate(user.id, {
                        certificateId: formData.certificateId,
                        code: formData.certificateId,
                        testId: selectedTest?.id || `test_${formData.date}`,
                        ...formData
                    });
                } catch (error) {
                    console.error("❌ Failed to save certificate:", error);
                }
            };
            saveCert();
        }
    }, [formData, user?.id, selectedTest]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Certificate Center</h1>
                    <p className="text-slate-500">Generate and download your typing achievements</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isEditing ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        {isEditing ? 'Editing Mode' : 'Manual Entry'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 print:block print:w-full">
                {/* Left Sidebar: Controls & Form (Hidden in Print) */}
                <div className="lg:col-span-1 space-y-6 print:hidden">
                    {/* Test Selection */}
                    {!isEditing && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                Select Achievement
                            </h3>
                            {recentTests.length > 0 ? (
                                <div className="space-y-3">
                                    {recentTests.map((test, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedTest(test)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTest === test
                                                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-slate-800">{test.wpm} WPM</span>
                                                <span className="text-xs text-slate-500">{new Date(test.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-slate-600">
                                                <span>{test.accuracy}% Accuracy</span>
                                                <span>{test.errors} Errors</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm text-center py-4">No recent tests found. Take a test to earn a certificate!</p>
                            )}
                        </div>
                    )}

                    {/* Manual Entry Form */}
                    {(isEditing || selectedTest) && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-left duration-300">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                Certificate Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">✏️ Editable</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Certificate ID</label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="certificateId"
                                            value={formData.certificateId}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed font-mono text-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">🔒 Auto-generated</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="fatherName"
                                            value={formData.fatherName}
                                            disabled
                                            placeholder="Auto-filled from profile"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">🔒 From profile</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="mobile"
                                                value={formData.mobile}
                                                disabled
                                                placeholder="From profile"
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 -mt-2">🔒 All locked - auto-filled</p>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">🔒 From account</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gross Speed (CPM)</label>
                                        <input
                                            type="number"
                                            name="grossSpeed"
                                            value={formData.grossSpeed}
                                            disabled
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Net Speed (WPM)</label>
                                        <input
                                            type="number"
                                            name="netSpeed"
                                            value={formData.netSpeed}
                                            disabled
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Accuracy (%)</label>
                                        <input
                                            type="number"
                                            name="accuracy"
                                            value={formData.accuracy}
                                            disabled
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed font-bold"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 -mt-2">🔒 From test results</p>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        disabled
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed resize-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">🔒 Auto-generated</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Certificate Preview */}
                <div className="lg:col-span-2">
                    <div className="sticky top-6">
                        <div className="flex justify-end gap-3 mb-4 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-medium"
                            >
                                <Printer className="w-5 h-5" />
                                Print / Download PDF
                            </button>
                        </div>

                        {/* Certificate Template */}
                        <div
                            ref={certificateRef}
                            className="certificate-container bg-white text-slate-900 shadow-2xl print:shadow-none aspect-[1.414/1] relative overflow-hidden"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            {/* Main Border Container */}
                            <div className="absolute inset-0 p-6 flex flex-col">
                                <div className="relative w-full h-full border-[3px] border-slate-900 flex flex-col p-1">
                                    <div className="relative w-full h-full border border-slate-900 flex flex-col p-6 bg-gold-gradient">

                                        {/* Corner Flourishes (SVG) */}
                                        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none text-slate-900">
                                            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                                                <path d="M5,5 L30,5 M5,5 L5,30 M10,10 L30,10 M10,10 L10,30" />
                                                <path d="M5,5 Q20,20 40,5" />
                                                <path d="M5,5 Q20,20 5,40" />
                                            </svg>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none text-slate-900 transform scale-x-[-1]">
                                            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                                                <path d="M5,5 L30,5 M5,5 L5,30 M10,10 L30,10 M10,10 L10,30" />
                                                <path d="M5,5 Q20,20 40,5" />
                                                <path d="M5,5 Q20,20 5,40" />
                                            </svg>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none text-slate-900 transform scale-y-[-1]">
                                            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                                                <path d="M5,5 L30,5 M5,5 L5,30 M10,10 L30,10 M10,10 L10,30" />
                                                <path d="M5,5 Q20,20 40,5" />
                                                <path d="M5,5 Q20,20 5,40" />
                                            </svg>
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none text-slate-900 transform scale-[-1]">
                                            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                                                <path d="M5,5 L30,5 M5,5 L5,30 M10,10 L30,10 M10,10 L10,30" />
                                                <path d="M5,5 Q20,20 40,5" />
                                                <path d="M5,5 Q20,20 5,40" />
                                            </svg>
                                        </div>

                                        {/* Center Watermark */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                                            <Award className="w-[400px] h-[400px] text-slate-900" />
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10 flex-1 flex flex-col items-center text-center justify-between py-4">

                                            {/* Header */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="h-px w-16 bg-slate-900"></div>
                                                    <div className="flex items-center gap-2">
                                                        <Award className="w-6 h-6 text-amber-600" />
                                                        <span className="text-xs font-bold tracking-[0.3em] uppercase text-slate-900">TypeMaster Pro</span>
                                                    </div>
                                                    <div className="h-px w-16 bg-slate-900"></div>
                                                </div>

                                                <h1 className="text-5xl font-black tracking-widest uppercase text-slate-900" style={{ fontFamily: "'Cinzel', serif" }}>
                                                    Certificate
                                                </h1>
                                                <h2 className="text-xl font-medium tracking-[0.4em] text-amber-700 uppercase">
                                                    of Achievement
                                                </h2>
                                            </div>

                                            {/* Body */}
                                            <div className="space-y-5 w-full max-w-4xl mx-auto mt-4">
                                                <p className="text-lg text-slate-600 italic font-medium font-serif">This certificate is proudly presented to</p>

                                                <div className="relative py-3">
                                                    <h3 className="text-6xl text-gold px-12 py-3 inline-block min-w-[400px] relative drop-shadow-sm" style={{ fontFamily: "'Pinyon Script', cursive" }}>
                                                        {formData.name || 'Your Name'}
                                                    </h3>
                                                    <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2"></div>
                                                </div>

                                                <div className="space-y-2">
                                                    {formData.fatherName && (
                                                        <p className="text-base text-slate-600">
                                                            S/O, D/O <span className="font-bold text-slate-800">{formData.fatherName}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-lg text-slate-700 leading-relaxed font-light max-w-2xl mx-auto">
                                                        {formData.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Section */}
                                            <div className="grid grid-cols-3 gap-6 mt-6 mb-6">
                                                <div className="text-center relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg transform rotate-2 opacity-100 group-hover:scale-105 transition-all"></div>
                                                    <div className="relative border-2 border-amber-700 bg-white p-3 min-w-[120px] rounded-lg shadow-md">
                                                        <p className="text-[9px] text-amber-800 uppercase tracking-widest mb-1 font-bold">Gross Speed</p>
                                                        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Cinzel', serif" }}>
                                                            {formData.grossSpeed} <span className="text-xs text-slate-500 font-sans font-normal">CPM</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-center relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg opacity-100 group-hover:scale-105 transition-all"></div>
                                                    <div className="relative border-2 border-indigo-700 bg-white p-3 min-w-[120px] rounded-lg shadow-md">
                                                        <p className="text-[9px] text-indigo-800 uppercase tracking-widest mb-1 font-bold">Net Speed</p>
                                                        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Cinzel', serif" }}>
                                                            {formData.netSpeed} <span className="text-xs text-slate-500 font-sans font-normal">WPM</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-center relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 rounded-lg transform -rotate-2 opacity-100 group-hover:scale-105 transition-all"></div>
                                                    <div className="relative border-2 border-green-700 bg-white p-3 min-w-[120px] rounded-lg shadow-md">
                                                        <p className="text-[9px] text-green-800 uppercase tracking-widest mb-1 font-bold">Accuracy</p>
                                                        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Cinzel', serif" }}>
                                                            {formData.accuracy}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="w-full flex justify-between items-end px-8 mt-auto pt-6 relative z-10">
                                                {/* Left Side - QR Code (Now in flow to prevent overlap) */}
                                                <div className="flex flex-col justify-end pb-2">
                                                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg border-2 border-indigo-600 shadow-lg">
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=1e293b&bgcolor=ffffff&data=${window.location.origin}/verify/${formData.certificateId}&margin=5`}
                                                            alt="Verification QR"
                                                            className="w-16 h-16 border-2 border-indigo-700 bg-white p-1 rounded"
                                                        />
                                                        <div className="text-left max-w-[180px]">
                                                            <p className="text-[9px] font-bold text-indigo-800 uppercase tracking-widest mb-0.5">Certificate ID</p>
                                                            <p className="text-[10px] font-mono font-black text-slate-900 tracking-tight mb-1">{formData.certificateId}</p>
                                                            <p className="text-[8px] font-semibold text-indigo-700 uppercase tracking-wider mb-0.5">🔗 Online Verification</p>
                                                            <a
                                                                href={`/verify/${formData.certificateId}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[8px] font-mono text-indigo-600 font-bold leading-tight break-all hover:underline cursor-pointer block"
                                                            >
                                                                {window.location.host}/verify/...
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Center - Seal */}
                                                <div className="relative mb-2">
                                                    <div className="w-28 h-28 rounded-full border-4 border-amber-600 flex items-center justify-center bg-white shadow-xl relative z-20">
                                                        <div className="absolute inset-1 border border-amber-600 rounded-full"></div>
                                                        <div className="text-center transform -rotate-12">
                                                            <Award className="w-10 h-10 text-amber-600 mx-auto mb-1" />
                                                            <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest">Official<br />Seal</p>
                                                        </div>
                                                    </div>
                                                    {/* Ribbon */}
                                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                                        <div className="w-5 h-10 bg-amber-700 transform rotate-12 origin-top"></div>
                                                        <div className="w-5 h-10 bg-amber-700 transform -rotate-12 origin-top"></div>
                                                    </div>
                                                </div>

                                                {/* Right Side - Date & Signature */}
                                                <div className="text-center pb-2">
                                                    {/* Date & Time moved here */}
                                                    <div className="mb-4 text-right">
                                                        <p className="text-[10px] text-slate-500 mb-0.5 font-mono uppercase tracking-wider font-bold">Date Issued</p>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {new Date(formData.issueDateTime || formData.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                    </div>

                                                    {/* Signature Image */}
                                                    <div className="relative flex flex-col items-center">
                                                        <img
                                                            src={signatureImg}
                                                            alt="Signature"
                                                            className="h-16 object-contain mb-[-10px] relative z-10"
                                                            style={{ filter: 'contrast(1.2)' }}
                                                        />
                                                        <div className="w-48 border-b-2 border-slate-900 mb-2"></div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized Signature</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Generated Timestamp Badge */}
                                            <div className="absolute bottom-1 right-5 text-[9px] text-white bg-slate-800 px-3 py-1 rounded font-mono tracking-wider shadow-md opacity-50 hover:opacity-100 transition-opacity">
                                                Generated: {new Date().toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Pinyon+Script&family=Great+Vibes&display=swap');
                    
                    .text-gold {
                        color: #b45309;
                        background: linear-gradient(to bottom, #f59e0b, #b45309);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    
                    .border-gold {
                        border-color: #b45309;
                    }

                    .bg-gold-gradient {
                        background: linear-gradient(135deg, #fffbeb 0%, #fff 50%, #fffbeb 100%);
                    }

                    @media print {
                        @page {
                            size: landscape;
                            margin: 0mm;
                        }
                        
                        body {
                            visibility: hidden;
                        }

                        /* Make the certificate visible and position it to fill the page */
                        .certificate-container {
                            visibility: visible;
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100vw !important;
                            height: 100vh !important;
                            z-index: 9999 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                            display: flex !important;
                            align-items: center;
                            justify-content: center;
                        }

                        /* Ensure all children of the certificate are visible */
                        .certificate-container * {
                            visibility: visible;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        .text-gold {
                            background: none !important;
                            color: #b45309 !important;
                            -webkit-text-fill-color: #b45309 !important;
                        }
                    }
                `}</style>
                </div>
            </div>
        </div>
    );
};

export default Certificates;

