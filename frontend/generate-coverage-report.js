const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const obtenerTotalTests = () => {
  let total = 0;
  const testsDir = path.join(__dirname, 'tests');
  
  if (!fs.existsSync(testsDir)) {
    return 0;
  }

  const archivos = fs.readdirSync(testsDir);
  archivos.forEach(archivo => {
    if (archivo.endsWith('.test.js')) {
      const contenido = fs.readFileSync(path.join(testsDir, archivo), 'utf8');
      const matches = contenido.match(/test\s*\(/g);
      if (matches) {
        total += matches.length;
      }
    }
  });

  return total;
};

const ejecutarTestsConCobertura = () => {
  try {
    execSync('npm test -- --coverage --silent', {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return true;
  } catch (error) {
    return true;
  }
};

const leerCobertura = () => {
  const coveragePath = path.join(__dirname, 'coverage', 'coverage-final.json');
  
  if (!fs.existsSync(coveragePath)) {
    return null;
  }

  const archivosCore = [
    'index-script.js',
    'main-menu-script.js',
    'perfil-usuario-script.js',
    'simulacion-prox-semestre.js',
    'dashboard-ross.js',
    'historico-script.js',
    'historico-estadisticas.js'
  ];

  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  const archivos = {};
  let totalStatements = 0;
  let totalStatementsCubiertos = 0;
  let totalBranches = 0;
  let totalBranchesCubiertos = 0;
  let totalFunctions = 0;
  let totalFunctionsCubiertos = 0;
  let totalLines = 0;
  let totalLinesCubiertos = 0;

  Object.keys(coverageData).forEach(filePath => {
    const relPath = filePath.replace(__dirname + path.sep, '').replace(/\\/g, '/');
    
    const archivoCore = archivosCore.find(nombre => relPath.includes(`js/${nombre}`));
    if (archivoCore) {
      const coverage = coverageData[filePath];
      const s = coverage.s;
      const b = coverage.b || {};
      const f = coverage.f;
      const l = coverage.l || {};
      
      const statements = Object.keys(s).length;
      const statementsCubiertos = Object.values(s).filter(v => v > 0).length;
      
      const branches = Object.keys(b).reduce((acc, key) => acc + b[key].length, 0);
      const branchesCubiertos = Object.keys(b).reduce((acc, key) => 
        acc + b[key].filter(v => v > 0).length, 0
      );
      
      const functions = Object.keys(f).length;
      const functionsCubiertos = Object.values(f).filter(v => v > 0).length;
      
      const statementMap = coverage.statementMap || {};
      const lineNumbers = new Set();
      const linesCubiertosSet = new Set();
      Object.keys(statementMap).forEach(key => {
        const stmt = statementMap[key];
        if (stmt && stmt.start) {
          const lineNum = stmt.start.line;
          lineNumbers.add(lineNum);
          if (s[key] > 0) {
            linesCubiertosSet.add(lineNum);
          }
        }
      });
      const lines = lineNumbers.size;
      const linesCubiertos = linesCubiertosSet.size;

      const porcentajeStatements = statements > 0 ? ((statementsCubiertos / statements) * 100).toFixed(2) : 0;
      const porcentajeBranches = branches > 0 ? ((branchesCubiertos / branches) * 100).toFixed(2) : 0;
      const porcentajeFunctions = functions > 0 ? ((functionsCubiertos / functions) * 100).toFixed(2) : 0;
      const porcentajeLines = lines > 0 ? ((linesCubiertos / lines) * 100).toFixed(2) : 0;
      
      archivos[archivoCore] = {
        statements: {
          total: statements,
          cubiertos: statementsCubiertos,
          porcentaje: parseFloat(porcentajeStatements)
        },
        branches: {
          total: branches,
          cubiertos: branchesCubiertos,
          porcentaje: parseFloat(porcentajeBranches)
        },
        functions: {
          total: functions,
          cubiertos: functionsCubiertos,
          porcentaje: parseFloat(porcentajeFunctions)
        },
        lines: {
          total: lines,
          cubiertos: linesCubiertos,
          porcentaje: parseFloat(porcentajeLines)
        }
      };

      totalStatements += statements;
      totalStatementsCubiertos += statementsCubiertos;
      totalBranches += branches;
      totalBranchesCubiertos += branchesCubiertos;
      totalFunctions += functions;
      totalFunctionsCubiertos += functionsCubiertos;
      totalLines += lines;
      totalLinesCubiertos += linesCubiertos;
    }
  });

  const porcentajeTotalStatements = totalStatements > 0 ? ((totalStatementsCubiertos / totalStatements) * 100).toFixed(2) : 0;
  const porcentajeTotalBranches = totalBranches > 0 ? ((totalBranchesCubiertos / totalBranches) * 100).toFixed(2) : 0;
  const porcentajeTotalFunctions = totalFunctions > 0 ? ((totalFunctionsCubiertos / totalFunctions) * 100).toFixed(2) : 0;
  const porcentajeTotalLines = totalLines > 0 ? ((totalLinesCubiertos / totalLines) * 100).toFixed(2) : 0;

  return {
    archivos,
    resumen: {
      statements: {
        total: totalStatements,
        cubiertos: totalStatementsCubiertos,
        porcentaje: parseFloat(porcentajeTotalStatements)
      },
      branches: {
        total: totalBranches,
        cubiertos: totalBranchesCubiertos,
        porcentaje: parseFloat(porcentajeTotalBranches)
      },
      functions: {
        total: totalFunctions,
        cubiertos: totalFunctionsCubiertos,
        porcentaje: parseFloat(porcentajeTotalFunctions)
      },
      lines: {
        total: totalLines,
        cubiertos: totalLinesCubiertos,
        porcentaje: parseFloat(porcentajeTotalLines)
      }
    }
  };
};

if (ejecutarTestsConCobertura()) {
  const cobertura = leerCobertura();
  const totalTests = obtenerTotalTests();
  
  if (cobertura) {
    const reporte = {
      fecha: new Date().toISOString().split('T')[0],
      totalTests: totalTests,
      cobertura: cobertura.resumen,
      archivos: cobertura.archivos
    };

    const contenidoJSON = JSON.stringify(reporte, null, 2);
    fs.writeFileSync(path.join(__dirname, 'coverage-report.json'), contenidoJSON, 'utf8');

    let detalleArchivos = '';
    Object.keys(cobertura.archivos).sort().forEach(nombreArchivo => {
      const datos = cobertura.archivos[nombreArchivo];
      detalleArchivos += `${nombreArchivo}
  Statements: ${datos.statements.cubiertos}/${datos.statements.total} (${datos.statements.porcentaje}%)
  Branches: ${datos.branches.cubiertos}/${datos.branches.total} (${datos.branches.porcentaje}%)
  Functions: ${datos.functions.cubiertos}/${datos.functions.total} (${datos.functions.porcentaje}%)
  Lines: ${datos.lines.cubiertos}/${datos.lines.total} (${datos.lines.porcentaje}%)

`;
    });

    const contenidoTXT = `Reporte de Cobertura de Código
Fecha: ${reporte.fecha}

Resumen
Total de tests: ${reporte.totalTests}
Statements: ${cobertura.resumen.statements.cubiertos}/${cobertura.resumen.statements.total} (${cobertura.resumen.statements.porcentaje}%)
Branches: ${cobertura.resumen.branches.cubiertos}/${cobertura.resumen.branches.total} (${cobertura.resumen.branches.porcentaje}%)
Functions: ${cobertura.resumen.functions.cubiertos}/${cobertura.resumen.functions.total} (${cobertura.resumen.functions.porcentaje}%)
Lines: ${cobertura.resumen.lines.cubiertos}/${cobertura.resumen.lines.total} (${cobertura.resumen.lines.porcentaje}%)

Detalle por archivo
${detalleArchivos}`;

    fs.writeFileSync(path.join(__dirname, 'coverage-report.txt'), contenidoTXT, 'utf8');

    console.log('Reporte generado: coverage-report.json, coverage-report.txt');
    console.log(`Cobertura Statements: ${cobertura.resumen.statements.porcentaje}%`);
    console.log(`Cobertura Branches: ${cobertura.resumen.branches.porcentaje}%`);
    console.log(`Cobertura Functions: ${cobertura.resumen.functions.porcentaje}%`);
    console.log(`Cobertura Lines: ${cobertura.resumen.lines.porcentaje}%`);
  } else {
    console.error('No se pudo leer el archivo de cobertura');
  }
} else {
  console.error('Error al ejecutar tests con cobertura');
}
