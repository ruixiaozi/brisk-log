import { getLogger } from '../core/logger';
import { DecoratorFactory } from 'brisk-ts-extends';

/**
 * 日志 装饰器工厂
 * @returns
 */
export function Log(region?: symbol, namespace?: symbol): Function {
  return new DecoratorFactory()
    .setPropertyCallback((target, key) => {
      Reflect.defineProperty(target, key, {
        enumerable: true,
        configurable: false,
        get() {
          return getLogger(region, namespace);
        },
      });
    })
    .getDecorator();
}
