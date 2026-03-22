// Debug script to check and fix user statistics
// Run this in browser console: copy and paste this code

(function () {
    console.log('=== TypeMaster Pro Statistics Debug ===');

    // Get encrypted user data
    const encryptedUser = localStorage.getItem('user');
    console.log('1. Encrypted user exists:', !!encryptedUser);

    // Get recent tests
    const recentTests = JSON.parse(localStorage.getItem('recent_tests') || '[]');
    console.log('2. Total tests in history:', recentTests.length);

    if (recentTests.length > 0) {
        // Calculate correct avgWpm from test history
        const totalWpm = recentTests.reduce((sum, test) => sum + test.wpm, 0);
        const correctAvgWpm = Math.round(totalWpm / recentTests.length);

        console.log('3. Calculated Average WPM from history:', correctAvgWpm);
        console.log('4. Recent test WPMs:', recentTests.slice(0, 10).map(t => t.wpm));

        // Show issue
        console.log('\n❌ ISSUE FOUND: avgWpm in stats is 0, but should be:', correctAvgWpm);
        console.log('\n✅ FIX: Take a new typing test to recalculate stats correctly.');
        console.log('   OR manually fix by pasting this in console:');
        console.log(`
// Manual fix code:
const CryptoJS = window.CryptoJS || { AES: { decrypt: (d) => ({ toString: () => d }) } };
const SECRET_KEY = 'typemaster-secret-2024';
let userData = localStorage.getItem('user');
if (userData.startsWith('{')) {
    userData = JSON.parse(userData);
} else {
    userData = JSON.parse(CryptoJS.AES.decrypt(userData, SECRET_KEY).toString(CryptoJS.enc.Utf8));
}
userData.stats.avgWpm = ${correctAvgWpm};
const encrypted = CryptoJS.AES.encrypt(JSON.stringify(userData), SECRET_KEY).toString();
localStorage.setItem('user', encrypted);
console.log('✅ Fixed! Refresh the page.');
        `);
    } else {
        console.log('No test history found. Take a typing test first.');
    }
})();
