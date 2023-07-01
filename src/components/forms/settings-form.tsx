"use client"

import * as z from "zod"
import axios, { AxiosError } from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Trash } from "lucide-react"
import { Store } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

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
import { Heading } from "@/components/heading"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { SettingsValidator } from "@/lib/validators/settings"
import { Separator } from "../ui/separator"
import { AlertModal } from "../modals/alert-modal"
import { ApiAlert } from "../api-alert"

interface SettingsFormProps {
  store: Store;
};

type FormData = z.infer<typeof SettingsValidator>

export const SettingsForm: React.FC<SettingsFormProps> = ({
  store
}) => {
  const params = useParams();
  const router = useRouter();
  // const origin = useOrigin();

  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(SettingsValidator),
    defaultValues: store
  })

  const { mutate: updateStore, isLoading } = useMutation({
    mutationFn: async ({ name }: FormData) => {
      const payload: FormData = { name }

      const { data } = await axios.patch(`/api/stores/${params.storeId}`, payload)
      return data
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: 'store already taken.',
            description: 'Please choose another store.',
            variant: 'destructive',
          })
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your store was not updated. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        description: 'Store updated.',
      })
      router.refresh()
    },
  })

  const { mutate: deleteStore, isLoading: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/stores/${params.storeId}`)
    },
    onError: () => {
      return toast({
        description: 'Make sure you removed all products and categories first.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      setOpen(false);
      router.push('/');
      router.refresh()

      return toast({
        description: 'Store deleted.',
      })
    },
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Store settings" description="Manage store preferences" />
        <Button
          disabled={isLoading}
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(e => updateStore(e))} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Store name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        variant="public"
        description={`${origin}/api/${params.storeId}`}
      />
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={deleteStore}
        loading={isLoadingDelete}
      />
    </>
  );
};