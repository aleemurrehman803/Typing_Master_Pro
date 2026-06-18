import React from 'react';
import { Award } from 'lucide-react';

/**
 * Certificate Component
 * Renders a printable/downloadable certificate for high-performing users.
 * 
import React from 'react';
import { Award } from 'lucide-react';

/**
 * Certificate Component
 * Renders a printable/downloadable certificate for high-performing users.
 * 
 * @param {string} userName - Name of the user.
 * @param {number} wpm - WPM score.
 * @param {number} accuracy - Accuracy percentage.
 * @param {string} date - Date of achievement.
 */
const Certificate = ({ userName, wpm, accuracy, date }) => {
    // Use state to generate a stable ID once on mount
    const [certificateId] = React.useState(() => Math.random().toString(36).substr(2, 9).toUpperCase());

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border-4 border-indigo-100 max-w-3xl mx-auto text-center relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-100 rounded-br-full opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-100 rounded-tl-full opacity-50"></div>

            <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-100 p-4 rounded-full">
                        <Award className="w-16 h-16 text-indigo-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-serif font-bold text-slate-800 mb-2">Certificate of Achievement</h1>
                <p className="text-slate-500 mb-8">This certifies that</p>

                {/* User Name */}
                <h2 className="text-3xl font-bold text-indigo-600 mb-8 border-b-2 border-slate-100 pb-4 inline-block px-12">
                    {userName}
                </h2>

                <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                    Has successfully completed the typing assessment with professional excellence, demonstrating the following proficiency:
                </p>

                {/* Stats */}
                <div className="flex justify-center gap-12 mb-12">
                    <div className="text-center">
                        <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Typing Speed</p>
                        <p className="text-4xl font-bold text-slate-800">{wpm} <span className="text-lg text-slate-500">WPM</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Accuracy</p>
                        <p className="text-4xl font-bold text-slate-800">{accuracy}%</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end text-sm text-slate-400 border-t border-slate-100 pt-6">
                    <div>
                        <p>Certificate ID: {certificateId}</p>
                    </div>
                    <div className="text-right">
                        <p>Date: {new Date(date).toLocaleDateString()}</p>
                        <p className="font-bold text-indigo-600 mt-1">TypeMaster Pro</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
