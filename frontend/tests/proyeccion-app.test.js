global.window = global;

describe('prepararProyeccion', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    require('../js/proyeccion-app.js');
  });

  test('proceso exitoso llama a dependencias y retorna proyeccion', async () => {
    window.obtenerAvanceParaCarrera = jest.fn().mockResolvedValue([{ period: '2020', course: 'A', status: 'APROBADO' }]);
    window.obtenerMallas = jest.fn().mockResolvedValue([{ codigo: 'A', asignatura: 'A', nivel: 1 }]);
    window.limpiarMalla = jest.fn().mockImplementation(m => m);
    window.procesarDatos = jest.fn().mockReturnValue({ ramosAprobados: [{ course: 'A' }], ramosPendientes: [] });
    window.crearProyeccion = jest.fn().mockReturnValue({ semestres: [] });

    const res = await window.prepararProyeccion('222', 'C1', '2024', 28);

    expect(window.obtenerAvanceParaCarrera).toHaveBeenCalledWith('222', 'C1');
    expect(window.obtenerMallas).toHaveBeenCalledWith('C1', '2024');
    expect(window.limpiarMalla).toHaveBeenCalled();
    expect(window.procesarDatos).toHaveBeenCalled();
    expect(window.crearProyeccion).toHaveBeenCalled();
    expect(res).toEqual({ semestres: [] });
  });

  test('propaga errores cuando fallo en dependencias', async () => {
    window.obtenerAvanceParaCarrera = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(window.prepararProyeccion('222', 'C1')).rejects.toThrow('fail');
  });
});
