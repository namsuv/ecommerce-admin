"use client"

import * as z from "zod"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Trash } from "lucide-react"
import { Color } from "@prisma/client"
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
import { ColorValidator } from "@/lib/validators/color"
import { useMutation } from "@tanstack/react-query"
import { Heading } from "@/components/heading"
import { toast } from "@/hooks/use-toast"

type FormData = z.infer<typeof ColorValidator>

interface ColorFormProps {
  initialData: Color | null;
};

export const ColorForm: React.FC<ColorFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const title = initialData ? 'Edit color' : 'Create color';
  const description = initialData ? 'Edit a color.' : 'Add a new color';
  const toastMessage = initialData ? 'Color updated.' : 'Color created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<FormData>({
    resolver: zodResolver(ColorValidator),
    defaultValues: initialData || {
      name: ''
    }
  });

  const { mutate: saveColor, isLoading } = useMutation({
    mutationFn: async ({ name, value }: FormData) => {
      const payload: FormData = { name, value };

      if (initialData) {
        const { data } = await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, payload);
        return data
      } else {
        const { data } = await axios.post(`/api/${params.storeId}/colors`, payload);
        return data
      }
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: 'color already taken.',
            description: 'Please choose another color.',
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
      router.push(`/${params.storeId}/colors`);
      router.refresh()

      return toast({
        description: toastMessage
      })
    },
  })

  const { mutate: onDelete, isLoading: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
    },
    onError: () => {
      return toast({
        description: 'Make sure you removed all products using this color first.',
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      setOpen(false);
      router.push(`/${params.storeId}/colors`);
      router.refresh()

      return toast({
        description: 'Color deleted.'
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
        <form onSubmit={form.handleSubmit(e => saveColor(e))} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Color name" {...field} />
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
                    <div className="flex items-center gap-x-4">
                      <Input disabled={isLoading} placeholder="Color value" {...field} />
                      <div
                        className="border p-4 rounded-full"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
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