/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as friend_request from "../friend_request.js";
import type * as http from "../http.js";
import type * as messages_channel_messages from "../messages/channel_messages.js";
import type * as messages_conversation from "../messages/conversation.js";
import type * as messages_conversation_messages from "../messages/conversation_messages.js";
import type * as server_channel from "../server/channel.js";
import type * as server_roles from "../server/roles.js";
import type * as server_server from "../server/server.js";
import type * as server_social_media from "../server/social_media.js";
import type * as status from "../status.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  friend_request: typeof friend_request;
  http: typeof http;
  "messages/channel_messages": typeof messages_channel_messages;
  "messages/conversation": typeof messages_conversation;
  "messages/conversation_messages": typeof messages_conversation_messages;
  "server/channel": typeof server_channel;
  "server/roles": typeof server_roles;
  "server/server": typeof server_server;
  "server/social_media": typeof server_social_media;
  status: typeof status;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
