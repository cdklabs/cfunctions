
export type SnapTest<T> = () => T;

export function snap<T>(fn: SnapTest<T>) {
  return () => {
    let result: any = fn();
    if (typeof(result) === 'object' && 'toJson' in result && typeof(result.toJson) === 'function') {
      result = result.toJson();
    }

    expect(result).toMatchSnapshot();
  };
}

export function fails(fn: SnapTest<void>, error: RegExp) {
  return () => {
    expect(() => fn()).toThrow(error);
  };
}