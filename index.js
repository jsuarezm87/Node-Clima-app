require('dotenv').config({path:'./.env'});


const { inquirerMenu, pausa, leerInput, listarLugares } = require('./helpers/inquirer');
const Busqueda = require('./models/busquedas');


const main = async() => {

    const busqueda = new Busqueda();
    
    let opt;

    do {

        opt = await inquirerMenu();

        switch ( opt ) {
            case 1: 
                // Mostrar mensaje
                const termino = await leerInput('Ciudad: ');

                 // Buscar los lugares
                const lugares = await busqueda.ciudad( termino );

                // Selecionar el lugar
                const id = await listarLugares( lugares );
                if ( id === '0' ) continue;         

                const lugarSel = lugares.find( l => l.id === id );         
                
                // Guardar en DB
                busqueda.agregarHistorial( lugarSel.nombre );

                // Clima
                const clima = await busqueda.climaLugar( lugarSel.lat, lugarSel.lng );

                // Mostrar resultados
                console.log('\n Información de la ciudad \n'.green);
                console.log('Ciudad:', lugarSel.nombre.green );
                console.log('Lat:', lugarSel.lat );
                console.log('Lng:', lugarSel.lng );
                console.log('Temperatura:', clima.temp );
                console.log('Mínima:', clima.min );
                console.log('Máxima:', clima.max );
                console.log('Como está el clima:', clima.desc.green );
            break;

            case 2: 
                // Historial de busqueda

                busqueda.historialCapitalizado.forEach( (lugar, i) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log( `${ idx } ${ lugar }` );
                });
                
            break;
        }

        if ( opt !== 0 ) await pausa();

    } while ( opt !== 0 );
}

main();