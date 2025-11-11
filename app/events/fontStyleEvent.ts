export interface FontStyleEventConfig {
  size?: number; // 绝对字体大小（像素）
  scale?: number; // 相对缩放比例，基数是1（如1.1表示放大10%）
  color?: string; // 颜色
  weight?: string | number; // 字重，如 "bold", "normal", 或数字 100-900
}

type FontStyleEventCallback = (config: FontStyleEventConfig) => void;

class FontStyleEvent {
  private eventMap: Map<string, FontStyleEventCallback[]> = new Map();

  on(eventName: string, callback: FontStyleEventCallback) {
    const callbacks = this.eventMap.get(eventName) || [];
    // 避免重复注册相同的回调
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
      this.eventMap.set(eventName, callbacks);
    }
  }

  off(eventName: string, callback?: FontStyleEventCallback) {
    if (callback) {
      // 删除特定的回调函数
      const callbacks = this.eventMap.get(eventName) || [];
      const filteredCallbacks = callbacks.filter((cb) => cb !== callback);
      if (filteredCallbacks.length === 0) {
        this.eventMap.delete(eventName);
      } else {
        this.eventMap.set(eventName, filteredCallbacks);
      }
    } else {
      // 删除该事件的所有回调
      this.eventMap.delete(eventName);
    }
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
