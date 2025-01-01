'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageInputProps {
  value: string;
  onChange: (base64: string) => void;
  className?: string;
  placeholder?: string;
}

export function ImageInput({ value, onChange, className, placeholder }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onChange(result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            onChange(result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={cn('border p-4 rounded cursor-pointer', className)}
      onClick={triggerFileSelect}
      onPaste={handlePaste}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          triggerFileSelect();
        }
      }}
    >
      {value ? (
        <img src={value} alt="Uploaded" className="max-h-32 mx-auto" />
      ) : (
        <p className="text-center text-muted-foreground">
          {placeholder || 'Click or paste an image'}
        </p>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={inputRef}
        className="hidden"
      />
    </div>
  );
}
