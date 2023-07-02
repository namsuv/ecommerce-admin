"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Billboard } from "@prisma/client"
import axios, { AxiosError } from "axios"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AlertModal } from "@/components/modals/alert-modal"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { UploadButton } from "@/lib/uploadthing"
import { BillBoardValidator } from "@/lib/validators/billboard"
import { useMutation } from "@tanstack/react-query"
import { Heading } from "../heading"

import "@uploadthing/react/styles.css"
import Image from "next/image"

type FormData = z.infer<typeof BillBoardValidator>

interface BillboardFormProps {
  billboard: Billboard | null;
};

export const BillboardForm: React.FC<BillboardFormProps> = ({
  billboard
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const title = billboard ? 'Edit billboard' : 'Create billboard';
  const description = billboard ? 'Edit a billboard.' : 'Add a new billboard';
  const toastMessage = billboard ? 'Billboard updated.' : 'Billboard created.';
  const action = billboard ? 'Save changes' : 'Create';

  const form = useForm<FormData>({
    resolver: zodResolver(BillBoardValidator),
    defaultValues: billboard || {
      label: '',
      imageUrl: ''
    }
  });

  const { mutate: saveBillBoard, isLoading } = useMutation({
    mutationFn: async ({ imageUrl, label }: FormData) => {
      const payload: FormData = { imageUrl, label };

      if (billboard) {
        const { data } = await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, payload);
        return data
      } else {
        const { data } = await axios.post(`/api/${params.storeId}/billboards`, payload);
        return data
      }
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: 'billboard already taken.',
            description: 'Please choose another billboard.',
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
      router.push(`/${params.storeId}/billboards`);
      router.refresh()

      return toast({
        description: toastMessage
      })
    },
  })

  const { mutate: onDelete, isLoading: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
    },
    onError: () => {
      return toast({
        variant: 'destructive',
        description: 'Make sure you removed all categories using this billboard first.'
      });
    },
    onSuccess: () => {
      setOpen(false);
      router.push(`/${params.storeId}/billboards`);
      router.refresh()

      return toast({
        description: 'Billboard deleted.'
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
        {billboard && (
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
        <form onSubmit={form.handleSubmit(e => saveBillBoard(e))} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background image</FormLabel>
                {field.value && <div className='relative w-full min-h-[15rem]'>
                  <Image alt='image' className='object-contain' fill src={field.value} />
                </div>}
                <FormControl>
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      field.onChange(res?.[0].fileUrl ?? '')
                    }}
                    onUploadError={(error: Error) => {
                      // Do something with the error.
                      console.log(`ERROR! ${error.message}`);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Billboard label" {...field} />
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