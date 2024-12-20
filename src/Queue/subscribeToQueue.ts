import type { IQueueTopic } from "./QueueMessage.js";

export type IQueueHandler<M> = (message: M) => Promise<void> | void;

export type ISubscribeToQueue = <M>(
  topic: IQueueTopic,
  handler: IQueueHandler<M>,
) => void;

