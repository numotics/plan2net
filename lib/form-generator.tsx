'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Path, useForm } from 'react-hook-form';
import { z } from 'zod';
import { LucideIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ImageInput } from '@/components/ui/ImageInput'; // Import the ImageInput component

interface FieldConfig {
  label: string;
  placeholder?: string;
  icon?: LucideIcon;
  type?: string;
}

interface FormConfig<T extends z.ZodObject<any, any>> {
  schema: T;
  fields: Record<keyof z.infer<T>, FieldConfig>;
  onSubmit: (values: z.infer<T>) => void;
}

export function createZodForm<T extends z.ZodObject<any, any>>({
  schema,
  fields,
  onSubmit,
}: FormConfig<T>) {
  return function GeneratedForm({ children }: { children: React.ReactNode }) {
    const form = useForm<z.infer<T>>({
      resolver: zodResolver(schema),
      defaultValues: Object.keys(fields).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as any),
    });

    const [base64Image, setBase64Image] = useState<string | null>(null);

    const handleImageUpload = (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        //@ts-ignore
        setBase64Image(reader.result as string);
        //@ts-ignore
        form.setValue("icon", reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {Object.entries(fields).map(([name, config]) => (
            <FormField
              key={name}
              control={form.control}
              name={name as Path<z.infer<T>>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{config.label}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      {config.icon && (
                        <config.icon className="absolute left-3 top-1/2 h-5 w-5 text-muted-foreground" />
                      )}
                      {config.type === 'image' ? (
                        <ImageInput
                          value={field.value}
                          onChange={(base64) => form.setValue(name as Path<z.infer<T>>, base64)}
                          placeholder="Click or paste an image"
                        />
                      ) : (
                        <Input
                          className={config.icon ? 'pl-10' : ''}
                          placeholder={config.placeholder}
                          type={config.type}
                          {...field}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="h-4"></div>
          <div className="w-full flex flex-col">
            {children}
          </div>
          <slot />
        </form>
      </Form>
    );
  };
}