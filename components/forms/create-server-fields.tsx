import React from 'react';
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { serverCategories } from '../modals/create-server-modal';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

type CreateServerFieldsProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
};

const CreateServerFields = <T extends FieldValues>({
  form,
}: CreateServerFieldsProps<T>) => {
  return (
    <div className="space-y-3">
      <FormField
        name={'serverName' as Path<T>}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Server name</FormLabel>
            <FormControl>
              <Input placeholder="chatflow server" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name={'category' as Path<T>}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {serverCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default CreateServerFields;
