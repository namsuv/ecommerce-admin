"use client"

import * as z from "zod"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Trash } from "lucide-react"
import { Billboard, Category } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/modals/alert-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Heading } from "../../../../../components/heading"
import { CategoryValidator } from "@/lib/validators/category"
import { useMutation } from "@tanstack/react-query"

type FormData = z.infer<typeof CategoryValidator>

interface CategoryFormProps {
  initialData: Category | null;
  billboards: Billboard[];
};

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  billboards
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const title = initialData ? 'Edit category' : 'Create category';
  const description = initialData ? 'Edit a category.' : 'Add a new category';
  const toastMessage = initialData ? 'Category updated.' : 'Category created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<FormData>({
    resolver: zodResolver(CategoryValidator),
    defaultValues: initialData || {
      name: '',
      billboardId: '',
    }
  });

  const { mutate: saveCategory, isLoading } = useMutation({
    mutationFn: async ({ billboardId, name }: FormData) => {
      const payload: FormData = { billboardId, name };

      if (initialData) {
        const { data } = await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, payload);
        return data
      } else {
        const { data } = await axios.post(`/api/${params.storeId}/categories`, payload);
        return data
      }
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: 'category already taken.',
            description: 'Please choose another category.',
            variant: 'destructive',
          })
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: `${toastMessage} fail. Please try again.`,
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      router.push(`/${params.storeId}/categories`);
      router.refresh()

      return toast({
        description: toastMessage
      })
    },
  })

  const { mutate: onDelete, isLoading: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
    },
    onError: () => {
      return toast({
        description: 'Make sure you removed all products using this category first.',
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      setOpen(false);
      router.push(`/${params.storeId}/categories`);
      router.refresh()

      return toast({
        description: 'Category deleted.'
      });
    },
  })

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoadingDelete}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={isLoading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(e => saveCategory(e))} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select disabled={isLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a billboard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>{billboard.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};