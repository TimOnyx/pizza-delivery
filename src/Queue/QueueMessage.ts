export type IQueueMessageId = Flavor<number, "queue_message_id">;
export type IQueueMessageSearch = Flavor<string, "queue_message_search">;
export type IQueueTopic = Flavor<string, "queue_topic">;
export type IQueueMessageStatus = Flavor<0 | 1 | 2, "queue_message_status">;

export type IUpdateQueueMessageStatus = (
  id: IQueueMessageId,
  status: IQueueMessageStatus,
) => Promise<void>;

export interface IQueueMessage {
  id: IQueueMessageId;
  topic: IQueueTopic;
  search: IQueueMessageSearch;
  payload: string;
  status: IQueueMessageStatus;
  markAsSent: () => Promise<void>;
  markAsCompleted: () => Promise<void>;
}

export class QueueMessage implements IQueueMessage {
  constructor(
    public readonly id: IQueueMessage["id"],
    public readonly topic: IQueueMessage["topic"],
    public readonly search: IQueueMessage["search"],
    public readonly payload: IQueueMessage["payload"],
    private _status: IQueueMessage["status"],
    private updateStatus: IUpdateQueueMessageStatus,
  ) {}

  public get status(): IQueueMessage["status"] {
    return this._status;
  }

  public async markAsSent(): Promise<void> {
    this._status = 1;
    await this.updateStatus(this.id, this.status);
  }

  public async markAsCompleted(): Promise<void> {
    this._status = 2;
    await this.updateStatus(this.id, this.status);
  }
}
