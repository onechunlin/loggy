export interface AIAssistantEventConfig {
  query?: string; // 初始查询文本
  immediate?: boolean; // 是否立即执行
}

export enum AIAssistantEventName {
  OpenAssistant = "openAssistant",
}

type AIAssistantEventCallback = (config: AIAssistantEventConfig) => void;

class AIAssistantEvent {
  private eventMap: Map<AIAssistantEventName, AIAssistantEventCallback[]> =
    new Map();

  on(eventName: AIAssistantEventName, callback: AIAssistantEventCallback) {
    const callbacks = this.eventMap.get(eventName) || [];
    callbacks.push(callback);
    this.eventMap.set(eventName, callbacks);
  }

  off(eventName: AIAssistantEventName) {
    this.eventMap.delete(eventName);
  }

  emit(eventName: AIAssistantEventName, config: AIAssistantEventConfig) {
    const callbacks = this.eventMap.get(eventName) || [];
    callbacks.forEach((callback) => {
      callback(config);
    });
  }
}

const AIAssistantEventCenter = new AIAssistantEvent();

export { AIAssistantEventCenter };
