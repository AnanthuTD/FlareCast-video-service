export interface IEventConsumer {
  subscribe(topics: string[], handler: (topic: string, data: any) => Promise<void>): Promise<void>;
  pause(value: { topic: string; partition?: number }[]): void;
  resume(value: { topic: string; partition?: number }[]): void;
}