import { Logger } from '@core';
import { DecoratorFactory } from 'brisk-ts-extends/decorator';

/**
 * 日志 装饰器工厂
 * @returns
 */
export function Log(region?: symbol): Function {
  return new DecoratorFactory()
    .setPropertyCallback((target, key) => {
      Reflect.defineProperty(target, key, {
        enumerable: true,
        configurable: false,
        get() {
          return Logger.getInstance(region);
        },
      });
    })
    .getDecorator();
}
