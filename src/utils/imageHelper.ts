/**
 * Helper to process and compress user avatar images to lightweight Base64 data URLs
 */
export const resizeImageToBase64 = (
  file: File,
  maxWidth = 256,
  maxHeight = 256,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            width = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for resizing'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generates a default pastel avatar URL using initials or a friendly avatar generator
 */
export const getDefaultAvatarUrl = (nameOrId: string): string => {
  const seed = encodeURIComponent(nameOrId.trim() || 'User');
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=ffd5dc,d1fae5,e0e7ff`;
};
