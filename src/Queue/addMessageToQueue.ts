import type { IQueueTopic } from "./QueueMessage.js";

export type IAddMessageToQueue = <I>(
  topic: IQueueTopic,
  payload: I,
) => Promise<void>;
