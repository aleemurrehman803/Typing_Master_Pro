/**
 * Image processing utilities
 */

/**
 * Compresses an image file to a base64 string with a maximum size constraint.
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width of the output image
 * @param {number} quality - JPEG quality (0 to 1)
 * @returns {Promise<string>} - Resolves with the base64 string
 */
export const compressImage = (file, maxWidth = 300, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
