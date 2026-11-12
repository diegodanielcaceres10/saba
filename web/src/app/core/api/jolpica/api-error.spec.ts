import { ApiError } from './api-error';

describe('ApiError', () => {
  it('names the kind of failure and the status when there is one', () => {
    expect(new ApiError('network').message).toBe('Data API request failed: network');
    expect(new ApiError('http', 503).message).toBe('Data API request failed: http (503)');
  });

  it('adds the detail to the message, so a log line says what went wrong', () => {
    const error = new ApiError('invalid-response', undefined, { detail: 'driver standing #3' });

    expect(error.message).toBe('Data API request failed: invalid-response — driver standing #3');
    expect(error.detail).toBe('driver standing #3');
  });

  it('has no detail unless one is given', () => {
    expect(new ApiError('network').detail).toBeUndefined();
  });

  it('keeps the error that caused it', () => {
    const cause = new Error('boom');

    expect(new ApiError('http', undefined, { cause }).cause).toBe(cause);
  });
});
