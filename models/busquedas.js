const fs = require('fs');

const axios = require('axios');


class Busqueda {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerBD();      
    }

    get historialCapitalizado() {

        return this.historial.map( lugar => {
            let palabra = lugar.split(' ');
            palabra = palabra.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabra.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWeather() {
        return  {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }


    async ciudad ( lugar = '' ) {

        try {
            // peticion http
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await intance.get();

            //const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/barra.json?access_token=pk.eyJ1Ijoiamhvbm5hdGFuc3VhcmV6IiwiYSI6ImNrdGpicm53aTFhaDAyb29sejRzbG1sOWQifQ.vqR6xolmAI758BS27WEotg&limit=5&language=es');
            
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
    
        } catch (error) {
            return []; 
        }
    }

    async climaLugar( lat, lon ) {

        try {

            const intance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
                params: { ...this.paramsWeather, lat, lon }
            });

            const resp = await intance.get();
            const { weather, main } = resp.data;
            
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (error) {
            console.log( error );            
        }
    }

    agregarHistorial( lugar = '' ) {
        
        if ( this.historial.includes( lugar.toLocaleLowerCase() ) ) {
            return;
        }

        this.historial = this.historial.splice(0, 5);

        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar en DB
        this.guardarBD();
    }

    guardarBD() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ));
    }

    leerBD() {
        
        if ( !fs.existsSync( this.dbPath ) ) return;
    
        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' });        
        const data = JSON.parse( info );
        
        this.historial = data.historial;
 
    }

}

module.exports = Busqueda;