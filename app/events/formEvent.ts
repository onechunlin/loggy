export type FormEventConfig = Record<string, any>;

interface FormItem {
  name: string;
  label?: string;
  type?: string;
  options?: Array<{ value: string; label: string }>;
}

type FormEventCallback = (config: FormEventConfig) => void;

class FormEvent {
  private eventMap: Map<string, FormEventCallback[]> = new Map();
  private formId2ItemsMap: Map<string, FormItem[]> = new Map();

  on(formId: string, callback: FormEventCallback) {
    const callbacks = this.eventMap.get(formId) || [];
    callbacks.push(callback);
    this.eventMap.set(formId, callbacks);
  }

  off(formId: string) {
    this.eventMap.delete(formId);
  }

  emit(formId: string, config: FormEventConfig) {
    const callbacks = this.eventMap.get(formId) || [];
    callbacks.forEach((callback) => {
      callback(config);
    });
  }

  registerItems(formId: string, items: FormItem[]) {
    this.formId2ItemsMap.set(formId, items);
  }

  getFormIds(): string[] {
    return Array.from(this.formId2ItemsMap.keys());
  }

  getItems(formId: string): FormItem[] {
    return this.formId2ItemsMap.get(formId) || [];
  }

  unregisterItems(formId: string) {
    this.formId2ItemsMap.delete(formId);
  }
}

const FormEventCenter = new FormEvent();

export { FormEventCenter };
