<script lang="ts" setup>
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, alertController, IonLoading } from '@ionic/vue';
import mapboxgl from 'mapbox-gl';
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';
import axios from "axios";
import { Geolocation, Position } from '@capacitor/geolocation';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

interface busInterface {
    r_lat: number,
    r_lon: number,
    r_hora: string,
    r_economico: number
}

const route = useRoute();

const { file } = route.params

const geoJson = ref<FeatureCollection<Geometry, GeoJsonProperties>>()
const markers = ref<mapboxgl.Marker[]>([])
const location = ref<Position>()
const loading = ref(false)
const interval = ref()

const getRoutes = async (file: string | string[] | undefined) => {
    if (file) {
        const data = await fetch(`./assets/GeoJSON/${file}`)
        const json = await data.json()
        geoJson.value = json
    }
}

getRoutes(file);

const mapa = ref<HTMLDivElement>()

onMounted(async () => {
    location.value = await Geolocation.getCurrentPosition();

    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxkb2d0eiIsImEiOiJjbDl1YmZkcnEwZmV6M25xeWtnZmQ0eGo4In0.cQAskiO8GStVGV29fI9dTg';
    if (!mapa.value) return
    const map = new mapboxgl.Map({
        container: mapa.value,
        style: 'mapbox://styles/mapbox/streets-v11?optimize=true',
        center: [location.value.coords.longitude, location.value.coords.latitude],
        zoom: 12,
        maxZoom: 22,
        attributionControl: false
    });

    map.on('style.load', () => {
        map.resize()
    });

    map.on('load', () => {
        map.resize()
        if (file && geoJson.value) {
            map.addSource('route', {
                'type': 'geojson',
                'data': geoJson.value
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#2A34F0',
                    'line-width': 7
                }
            });
            if (file) {
                getBuses(map)
                interval.value = setInterval(() => {
                    getBuses(map)
                }, 30000)
            }
        }
    });
})

const getBuses = async (map: mapboxgl.Map) => {
    loading.value = true
    const { data } = await axios.post('https://apiapp.tarjetaferia.com.mx/obtenerCamiones', {
        id_ruta: file.slice(0, -5),
        lat: 25.677269657380343,
        lon: -100.28281688690186
    })

    if (data.message != 'Operación realizada correctamente') {
        const alert = await alertController.create({
            header: 'Oops!',
            message: data.message,
            buttons: ['OK'],
        });
        loading.value = false
        await alert.present();
        return
    }
    const buses: busInterface[] = data.data
    if (markers.value.length) {
        markers.value.forEach((marker, index) => {
            marker.remove()
            markers.value.splice(index, 1)
        })
    }
    buses.forEach((bus, index) => {
        const markerHeight = 50;
        const markerRadius = 10;
        const linearOffset = 25;
        const popupOffsets = {
            'top': [0, 0],
            'top-left': [0, 0],
            'top-right': [0, 0],
            'bottom': [0, -markerHeight],
            'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
            'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
            'left': [markerRadius, (markerHeight - markerRadius) * -1],
            'right': [-markerRadius, (markerHeight - markerRadius) * -1]
        };
        const popup = new mapboxgl.Popup({ offset: popupOffsets, closeButton: false }).setHTML(`<div class="p-3 rounded"><p><span class="font-bold">Economico:</span> ${bus.r_economico}</p><p><span class="font-bold">Hora:</span> ${bus.r_hora}</p>`)
        const el = document.createElement('div');
        const width = 40;
        const height = 40;
        el.className = 'marker';
        el.style.backgroundImage = 'url(./assets/marker_bus.png)';
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.backgroundSize = '100%';
        markers.value[index] = new mapboxgl.Marker(el).setLngLat([bus.r_lon, bus.r_lat]).setPopup(popup).addTo(map);
    })
    loading.value = false
}
</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Mapa de camiones</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <div id="mapa" ref="mapa"></div>
            <ion-loading :is-open="loading" message="Cargando Camiones"></ion-loading>
        </ion-content>
    </ion-page>
</template>

<style>
#mapa {
    min-height: 100%;
    height: 100%;
}

/* .p-3 {
    padding: 0.75rem;
}

.font-bold {
    font-weight: 700;
}

.rounded {
    border-radius: 0.75rem;
} */
.mapboxgl-ctrl-logo {
    display: none !important;
}
</style>