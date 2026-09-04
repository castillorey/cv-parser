const install = () => {
  if (
    typeof ReadableStream === "undefined" ||
    !ReadableStream.prototype ||
    typeof ReadableStream.prototype[Symbol.asyncIterator] === "function"
  ) {
    return;
  }

  const makeIterator = (stream, { preventCancel = false } = {}) => {
    const reader = stream.getReader();
    const iterator = {
      async next() {
        try {
          const result = await reader.read();
          if (result.done) reader.releaseLock();
          return result;
        } catch (err) {
          reader.releaseLock();
          throw err;
        }
      },
      async return(value) {
        if (!preventCancel) {
          const cancel = reader.cancel(value);
          reader.releaseLock();
          await cancel;
        } else {
          reader.releaseLock();
        }
        return { done: true, value };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
    return iterator;
  };

  const values = function (options) {
    return makeIterator(this, options);
  };

  Object.defineProperties(ReadableStream.prototype, {
    values: { value: values, configurable: true, writable: true },
    [Symbol.asyncIterator]: { value: values, configurable: true, writable: true },
  });
};

install();