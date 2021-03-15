export function enumerable(value: boolean): any {
    return function(target: any, propertyKey: string): void {
        let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (descriptor.enumerable !== value) {
            descriptor.enumerable = value;
            Object.defineProperty(target, propertyKey, descriptor);
        }
    };
}
