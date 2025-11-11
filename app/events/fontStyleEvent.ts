export interface FontStyleEventConfig {
  size?: number; // 绝对字体大小（像素）
  scale?: number; // 相对缩放比例，基数是1（如1.1表示放大10%）
  color?: string; // 颜色
}

type FontStyleEventCallback = (config: FontStyleEventConfig) => void;

class FontStyleEvent {
  private eventMap: Map<string, FontStyleEventCallback[]> = new Map();

  on(eventName: string, callback: FontStyleEventCallback) {
    const callbacks = this.eventMap.get(eventName) || [];
    callbacks.push(callback);
    this.eventMap.set(eventName, callbacks);
  }

  off(eventName: string) {
    this.eventMap.delete(eventName);
  }

  emit(eventName: string, config: FontStyleEventConfig) {
    const callbacks = this.eventMap.get(eventName) || [];
    callbacks.forEach((callback) => {
      callback(config);
    });
  }

  getTextEnums(): string[] {
    return Array.from(this.eventMap.keys()).map((key) => key.split("-")[1]);
  }
}

const FontStyleEventCenter = new FontStyleEvent();

export { FontStyleEventCenter };

