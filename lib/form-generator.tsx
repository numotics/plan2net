'use client';

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
import React from 'react';


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

/**
 * Creates a form component from a Zod schema with built-in validation and styling
 * @template T - Zod schema type
 * @param {FormConfig<T>} config - Form configuration object
 * @returns {React.FC} A React component that renders the form
 * @example
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email()
 * });
 * 
 * const UserForm = createZodForm({
 *   schema: userSchema,
 *   fields: {
 *     name: { label: 'Name' },
 *     email: { label: 'Email', type: 'email' }
 *   },
 *   onSubmit: (values) => console.log(values)
 * });
 */

export function createZodForm<T extends z.ZodObject<any, any>>({
  schema,
  fields,
  onSubmit,
}: FormConfig<T>) {
  return function GeneratedForm({ children }: { children: React.ReactNode; }) {
    const form = useForm<z.infer<T>>({
      resolver: zodResolver(schema),
      defaultValues: Object.keys(fields).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as any),
    });

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
                      <Input
                        className={config.icon ? 'pl-10' : ''}
                        placeholder={config.placeholder}
                        type={config.type}
                        {...field}
                      />
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