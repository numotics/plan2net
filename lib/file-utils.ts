export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};
