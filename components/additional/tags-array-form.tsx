import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '../ui/form';
import {
  useFieldArray,
  UseFormReturn,
  Path,
  ArrayPath,
  FieldArray,
} from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

type TagsArrayFormProps<T extends { tags: string[] }> = {
  form: UseFormReturn<T>;
};

const TagsArrayForm = <T extends { tags: string[] }>({
  form,
}: TagsArrayFormProps<T>) => {
  const fieldName = 'tags' as const;

  const { append, remove, fields } = useFieldArray<T, ArrayPath<T>>({
    control: form.control,
    name: fieldName as ArrayPath<T>,
  });

  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed) {
      append(trimmed as unknown as FieldArray<T, ArrayPath<T>>);
      setNewTag('');
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldName as unknown as Path<T>}
      render={() => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 bg-primary px-2 py-1 rounded-full"
                  >
                    <span>
                      {form.getValues(`${fieldName}.${index}` as Path<T>)}
                    </span>
                    <button type="button" onClick={() => remove(index)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TagsArrayForm;
