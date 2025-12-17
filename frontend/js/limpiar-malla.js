(function() {
    'use strict';
    function limpiarMalla(ramos) {
        const codigosDisponibles = new Set(ramos.map(r => r.codigo));
        const mallaLimpia = [];

        ramos.forEach(ramo => {
            const prereqs = ramo.prereq ? ramo.prereq.split(',').map(p => p.trim()) : [];
            const prereqsValidos = prereqs.filter(prereq => codigosDisponibles.has(prereq));
            const newRamo ={
                codigo: ramo.codigo,
                asignatura: ramo.asignatura,
                creditos: ramo.creditos,
                nivel: ramo.nivel,
                prereq: prereqsValidos.join(',')
            }
            mallaLimpia.push(newRamo);
        });

        return mallaLimpia;
    }

    window.limpiarMalla = limpiarMalla;
})();