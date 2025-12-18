describe('mockups.js behaviour', () => {
  test('emite warning al cargar', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    require('../js/mockups.js');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
