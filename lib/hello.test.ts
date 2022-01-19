describe('Simple test', (): void => {
  it('should render a simple text', (): void => {
    expect('Hello world').toContain('Hello');
  });
});

export {};
