import { ApiError } from './jolpica/api-error';
import { errorKindOf, loadStateOf } from './load-state';

describe('loadStateOf', () => {
  it('is loading while a request has not produced a result', () => {
    expect(loadStateOf('idle')).toBe('loading');
    expect(loadStateOf('loading')).toBe('loading');
    expect(loadStateOf('reloading')).toBe('loading');
  });

  it('is ready once there is a result', () => {
    expect(loadStateOf('resolved')).toBe('ready');
    expect(loadStateOf('local')).toBe('ready');
  });

  it('is error when the request failed', () => {
    expect(loadStateOf('error')).toBe('error');
  });
});

describe('errorKindOf', () => {
  it('is null when there is no error', () => {
    expect(errorKindOf(undefined)).toBeNull();
    expect(errorKindOf(null)).toBeNull();
  });

  it('is the kind of an API error', () => {
    expect(errorKindOf(new ApiError('rate-limited', 429))).toBe('rate-limited');
    expect(errorKindOf(new ApiError('network'))).toBe('network');
  });

  it('is a generic http error for anything else', () => {
    expect(errorKindOf(new Error('boom'))).toBe('http');
  });
});
