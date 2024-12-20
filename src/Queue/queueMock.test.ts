import { expect, test, describe, beforeEach } from "vitest";
import { type IAddMessageToQueue } from "./addMessageToQueue.js";
import {
  type IQueueHandler,
  type ISubscribeToQueue,
} from "./subscribeToQueue.js";

interface ICreateMockQueueResult {
  queues: Record<string, unknown[]>;
  subscribeToQueue: ISubscribeToQueue;
  addMessageToQueue: IAddMessageToQueue;
  waitForQueueToFinish: () => Promise<void>;
}

type ICreateMockQueue = () => ICreateMockQueueResult;

export const createQueueMock: ICreateMockQueue = () => {
  const queues: ICreateMockQueueResult["queues"] = {};
  const handlers: Record<string, IQueueHandler<unknown>> = {};
  const subscribeToQueue: ISubscribeToQueue = (topic, handler) => {
    handlers[topic] = handler as IQueueHandler<unknown>;
  };

  const addMessageToQueue: IAddMessageToQueue = async (topic, payload) => {
    if (!queues[topic]) {
      queues[topic] = [];
    }

    queues[topic].push(payload);
  };

  const waitForQueueToFinish = async (): Promise<void> => {
    const promises: Promise<unknown>[] = [];
    for (const topic in queues) {
      const queue = queues[topic];
      const handler = handlers[topic];
      if (!handler || !queue) {
        continue;
      }

      for (const message of queue) {
        const result = handler(message);
        if (result) {
          promises.push(result);
        }
      }
    }

    await Promise.all(promises);
  };

  return {
    subscribeToQueue,
    addMessageToQueue,
    waitForQueueToFinish,
    queues,
  };
};

describe("[Queue Mock]", () => {
  let addMessageToQueue: IAddMessageToQueue;
  let subscribeToQueue: ISubscribeToQueue;
  let queues: Record<string, unknown[]>;
  let waitForQueueToFinish: () => Promise<void>;

  beforeEach(() => {
    const mocks = createQueueMock();
    addMessageToQueue = mocks.addMessageToQueue;
    subscribeToQueue = mocks.subscribeToQueue;
    queues = mocks.queues;
    waitForQueueToFinish = mocks.waitForQueueToFinish;
  });

  test("messages are added to the queue", async () => {
    await addMessageToQueue("test", { message: "hello" });
    expect(queues).toMatchObject({ test: [{ message: "hello" }] });
  });

  test("messages in the queue are handled", async () => {
    subscribeToQueue("test", (message) => {
      handledMessages.push(message);
    });
    await addMessageToQueue("test", { message: "hello" });
    const handledMessages: unknown[] = [];
    await waitForQueueToFinish();
    expect(handledMessages).toMatchObject([{ message: "hello" }]);
  });
});
