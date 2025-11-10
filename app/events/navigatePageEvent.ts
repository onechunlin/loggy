export interface NavigatePageEventConfig {
  pagePath: string;
}

export enum NavigatePageEventName {
  NavigateToPage = "navigateToPage",
}

class NavigatePageEvent {
  private eventMap: Map<NavigatePageEventName, Function[]> = new Map();

  on(eventName: NavigatePageEventName, callback: Function) {
    const callbacks = this.eventMap.get(eventName) || [];
    callbacks.push(callback);
    this.eventMap.set(eventName, callbacks);
  }

  off(eventName: NavigatePageEventName) {
    this.eventMap.delete(eventName);
  }

  emit(eventName: NavigatePageEventName, config: NavigatePageEventConfig) {
    const callbacks = this.eventMap.get(eventName) || [];
    callbacks.forEach((callback) => {
      callback(config);
    });
  }
}

const NavigatePageEventCenter = new NavigatePageEvent();

export { NavigatePageEventCenter };

