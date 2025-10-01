import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type VideoGetOneOutput =
  inferRouterOutputs<AppRouter>["videos"]["getOne"];

// TODO : Change to Videos Getmany
export type VideoGetManytOutput =
  inferRouterOutputs<AppRouter>["suggestions"]["getMany"];
