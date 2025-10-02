"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  LockIcon,
  MoreVerticalIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react";

import { trpc } from "@/trpc/client";
import { videoUpdateSchema } from "@/db/schema";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { APP_URL, THUMBNAIL_FALLBACK } from "@/constants";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";

// ----------------------------------
// Props
// ----------------------------------
interface FormSectionProps {
  videoId: string;
}

// ----------------------------------
// Entry Wrapper (handles suspense/error)
// ----------------------------------
export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={"Loading..."}>
      <ErrorBoundary fallback={"Something went wrong"}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// ----------------------------------
// Main Form Logic
// ----------------------------------
export const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const router = useRouter();

  // Data fetching
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const utils = trpc.useUtils();

  // TODO : CHANGE IF NOT VERCEL
  const fullUrl = `${APP_URL}/videos/${videoId}`;

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // React Hook Form setup
  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video Deleted");
      router.push("/studio");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Thumnail restored");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  // Mutation
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video Data Updated");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Refreshed");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  // Form submit
  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data);
  };

  // ----------------------------------
  // JSX
  // ----------------------------------

  return (
    <>
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <Form {...form}>
        {/* Main form wrapper that handles validation and submission */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header section: Title, description, and action buttons */}
          <div className="flex items-center justify-between mb-6">
            {/* Left side: Page title and subtitle */}
            <div>
              <h1 className="text-2xl font-bold">Video Details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your Video Details Here
              </p>
            </div>

            {/* Right side: Save button and options menu */}
            <div className="flex items-center gap-x-2">
              {/* Primary save action (disabled while update is pending) */}
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>

              {/* Dropdown menu with additional actions (e.g., Delete) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"}>
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ id: videoId })}
                  >
                    <RefreshCwIcon className="size-4 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: videoId })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main form fields section (responsive grid layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left side: core input fields (title, description, category, etc.) */}
            <div className="space-y-8 lg:col-span-3">
              {/* Title field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Title
                        {/* TODO: Add AI generate button for title suggestion */}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Add a title for your video"
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              {/* Description field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Description
                        {/* TODO: Add AI generate button for description */}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          rows={10}
                          placeholder="Add a description for your video"
                          className="resize-none pr-10"
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              {/* Thumbnail field */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => {
                  return (
                    <FormItem>
                      <FormLabel>Thumbnail</FormLabel>\
                      <FormControl>
                        <div className="p-0.5 border border-dashed border-neutral-300 relative h-[84px] w-[153px] group ">
                          <Image
                            fill
                            alt="Thumbnail"
                            className="object-cover"
                            src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                          />

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                size={"icon"}
                                className="bg-black/50 hover:bg-black/80  absolute top-1 right-1 rounded  opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 size-7 "
                              >
                                <MoreVerticalIcon className="size-4 text-white" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" side="right">
                              <DropdownMenuItem
                                onClick={() => setThumbnailModalOpen(true)}
                              >
                                <ImagePlusIcon className="size-4 mr-1" />
                                Change
                              </DropdownMenuItem>
                              {/*2*/}
                              <DropdownMenuItem
                                onClick={() => {
                                  restoreThumbnail.mutate({ id: videoId });
                                }}
                              >
                                <RotateCcwIcon className="size-4 mr-1" />
                                Restore
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              {/* Category selection field */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => {
                            return (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Right side */}
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              {/* 1 */}
              <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  {/* Video Player */}
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6 ">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video Link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          onClick={onCopy}
                          disabled={isCopied}
                          size={"icon"}
                          className="shrink-0"
                          type="button"
                          variant={"ghost"}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/*  */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video Status
                      </p>
                      <p>{snakeCaseToTitle(video.muxStatus || "Preparing")}</p>
                    </div>
                  </div>
                  {/*  */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitle Status
                      </p>
                      <p>
                        {snakeCaseToTitle(
                          video.muxTrackStatus || "no_subtitles"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* 1 */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Visibilty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Visibilty Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center">
                              <Globe2Icon className="size-4 mr-2" />
                              Public
                            </div>
                          </SelectItem>

                          <SelectItem value="private">
                            <div className="flex items-center">
                              <LockIcon className="size-4 mr-2" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
