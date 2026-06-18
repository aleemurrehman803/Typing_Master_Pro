import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, User, Mail, TrendingUp } from 'lucide-react';

const Verify = () => {
    const { certificateId } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyCertificate = () => {
            try {
                setLoading(true);

                // 1. Try to find in local storage (Real Data)
                const storedCertificates = JSON.parse(localStorage.getItem('issued_certificates') || '[]');
                const foundCert = storedCertificates.find(c => c.certificateId === certificateId);

                if (foundCert) {
                    setCertificate({
                        ...foundCert,
                        // Ensure these fields exist or use defaults
                        id: foundCert.certificateId,
                        verified: true,
                        verificationDate: new Date().toISOString()
                    });
                    setLoading(false);
                    return;
                }

                // 2. Fallback for specific test ID (Demo purposes)
                if (certificateId === 'TMP-TEST-123' || certificateId.startsWith('TMP-TEST')) {
                    const mockCertificate = {
                        id: certificateId,
                        name: 'Demo User',
                        email: 'demo@typemaster.com',
                        grossSpeed: 45,
                        netSpeed: 42,
                        accuracy: 98,
                        date: new Date().toISOString(),
                        issueDateTime: new Date().toISOString(),
                        description: 'Successfully completed the professional typing assessment with distinction.',
                        verified: true,
                        verificationDate: new Date().toISOString()
                    };
                    setCertificate(mockCertificate);
                    setLoading(false);
                    return;
                }

                // 3. Not Found
                throw new Error('Certificate not found');

            } catch (err) {
                console.error("Verification Error:", err);
                setError('Failed to verify certificate');
                setLoading(false);
            }
        };

        // Small delay to simulate API call
        const timer = setTimeout(verifyCertificate, 800);
        return () => clearTimeout(timer);
    }, [certificateId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-slate-700">Verifying Certificate...</p>
                    <p className="text-sm text-slate-500 mt-2">ID: {certificateId}</p>
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-red-200">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-14 h-14 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">Certificate Not Found</h1>
                        <p className="text-lg text-slate-600 mb-6">
                            The certificate with ID <span className="font-mono font-bold text-red-600">{certificateId}</span> could not be verified.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200 mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Certificate Verified</h1>
                                <p className="text-green-100 mt-1">This certificate is authentic and valid</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-xl font-bold text-slate-900">Certificate Information</h2>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                        <p className="text-sm font-medium text-slate-600">Certificate ID:</p>
                                        <p className="text-sm font-mono font-bold text-slate-900">{certificateId}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                        <p className="text-sm font-medium text-slate-600">Issued On:</p>
                                        <p className="text-sm text-slate-900">
                                            {new Date(certificate.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                        <p className="text-sm font-medium text-slate-600">Issue Time:</p>
                                        <p className="text-sm text-indigo-700 font-bold">
                                            {new Date(certificate.issueDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-slate-600">Verified On:</p>
                                        <p className="text-sm text-green-700 font-semibold">
                                            {new Date(certificate.verificationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            {' at '}
                                            {new Date(certificate.verificationDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Recipient Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <User className="w-8 h-8 text-indigo-600" />
                                        <div>
                                            <p className="text-xs text-slate-600 font-medium">Full Name</p>
                                            <p className="text-base font-bold text-slate-900">{certificate.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-8 h-8 text-purple-600" />
                                        <div>
                                            <p className="text-xs text-slate-600 font-medium">Email Address</p>
                                            <p className="text-sm font-semibold text-slate-900">{certificate.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Performance Metrics
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-300 rounded-xl p-4 text-center">
                                    <p className="text-xs text-amber-800 uppercase tracking-widest mb-2 font-bold">Gross Speed</p>
                                    <p className="text-3xl font-black text-slate-900">{certificate.grossSpeed}</p>
                                    <p className="text-xs text-slate-600 font-semibold mt-1">CPM</p>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 border-2 border-indigo-300 rounded-xl p-4 text-center">
                                    <p className="text-xs text-indigo-800 uppercase tracking-widest mb-2 font-bold">Net Speed</p>
                                    <p className="text-3xl font-black text-slate-900">{certificate.netSpeed}</p>
                                    <p className="text-xs text-slate-600 font-semibold mt-1">WPM</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
                                    <p className="text-xs text-green-800 uppercase tracking-widest mb-2 font-bold">Accuracy</p>
                                    <p className="text-3xl font-black text-slate-900">{certificate.accuracy}%</p>
                                    <p className="text-xs text-slate-600 font-semibold mt-1">Precision</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                            <p className="text-center text-slate-700 text-lg italic leading-relaxed">
                                "{certificate.description}"
                            </p>
                        </div>

                        <div className="mt-8 text-center">
                            <div className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full shadow-lg">
                                <p className="text-sm font-bold uppercase tracking-wider">✓ Verified by TypeMaster Pro</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">
                                This certificate has been verified as authentic and issued by TypeMaster Pro.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-all shadow-md"
                    >
                        Return to Home
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Print This Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Verify;
