"use client"

import * as z from "zod"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Trash } from "lucide-react"
import { Size } from "@prisma/client"
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
import { SizeValidator } from "@/lib/validators/size"
import { useMutation } from "@tanstack/react-query"
import { Heading } from "@/components/heading"
import { toast } from "@/hooks/use-toast"

type FormData = z.infer<typeof SizeValidator>

interface SizeFormProps {
  initialData: Size | null;
};

export const SizeForm: React.FC<SizeFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const title = initialData ? 'Edit size' : 'Create size';
  const description = initialData ? 'Edit a size.' : 'Add a new size';
  const toastMessage = initialData ? 'Size updated.' : 'Size created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<FormData>({
    resolver: zodResolver(SizeValidator),
    defaultValues: initialData || {
      name: ''
    }
  });

  const { mutate: saveSize, isLoading } = useMutation({
    mutationFn: async ({ name, value }: FormData) => {
      const payload: FormData = { name, value };

      if (initialData) {
        const { data } = await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, payload);
        return data
      } else {
        const { data } = await axios.post(`/api/${params.storeId}/sizes`, payload);
        return data
      }
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: 'size already taken.',
            description: 'Please choose another size.',
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
      router.push(`/${params.storeId}/sizes`);
      router.refresh()

      return toast({
        description: toastMessage
      })
    },
  })

  const { mutate: onDelete, isLoading: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);
    },
    onError: () => {
      return toast({
        description: 'Make sure you removed all products using this size first.',
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      setOpen(false);
      router.push(`/${params.storeId}/sizes`);
      router.refresh()

      return toast({
        description: 'Size deleted.'
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
        <form onSubmit={form.handleSubmit(e => saveSize(e))} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Size name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Size value" {...field} />
                  </FormControl>
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