<script lang="ts" setup>
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, alertController, IonLoading, IonItem, IonLabel } from '@ionic/vue';
import mapboxgl from 'mapbox-gl';
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';
import axios from "axios";
import { useStore } from "../stores/mainStore";

interface busInterface {
    r_lat: number,
    r_lon: number,
    r_hora: string,
    r_economico: number
}

const route = useRoute();
const store = useStore()
const { id } = route.params

const markers = ref<mapboxgl.Marker[]>([])

store.getRouteLine(id);

const mapa = ref<HTMLDivElement>()

onMounted(async () => {
    await store.getLocation()

    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxkb2d0eiIsImEiOiJjbDl1YmZkcnEwZmV6M25xeWtnZmQ0eGo4In0.cQAskiO8GStVGV29fI9dTg';

    if (!mapa.value || store.location == undefined) {
        const alert = await alertController.create({
            header: 'Oops!',
            message: 'No se Pudo obtener la localización',
            buttons: ['OK'],
        });
        await alert.present();
        return
    }
    const map = new mapboxgl.Map({
        container: mapa.value,
        style: 'mapbox://styles/mapbox/streets-v11?optimize=true',
        center: [store.location.coords.longitude, store.location.coords.latitude],
        zoom: 12,
        maxZoom: 22,
        attributionControl: false
    });

    map.on('style.load', () => {
        map.resize()
    });

    map.on('load', () => {
        map.resize()
        if (id && store.geoJson) {
            map.addSource('route', {
                'type': 'geojson',
                'data': store.geoJson
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

            getBuses(map)

            if (store.interval != undefined) clearInterval(store.interval)
            else {
                store.interval = setInterval(() => {
                    getBusesLoading(map)
                }, 30000)
            }
        }
    });
})

const getBuses = async (map: mapboxgl.Map) => {
    store.loading = true
    const { data } = await axios.post('https://apiapp.tarjetaferia.com.mx/obtenerCamiones', {
        id_ruta: id,
        lat: store.location?.coords.latitude,
        lon: store.location?.coords.longitude
    })

    if (data.message != 'Operación realizada correctamente') {
        const alert = await alertController.create({
            header: 'Oops!',
            message: data.message,
            buttons: ['OK'],
        });
        store.loading = false
        await alert.present();
        return
    }
    const buses: busInterface[] = data.data
    if (store.markers.length) {
        store.markers.forEach((marker, index) => {
            marker.remove()
        })
        store.markers = []
    }
    buses.forEach((bus, index) => {
        const markerHeight = 50;
        const markerRadius = 10;
        const linearOffset = 25;
        const popupOffsets: mapboxgl.Offset = {
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
        store.markers[index] = new mapboxgl.Marker(el).setLngLat([bus.r_lon, bus.r_lat]).setPopup(popup).addTo(map);
    })
    store.lastUpdate = new Date().toLocaleTimeString()
    store.loading = false
}

const getBusesLoading = async (map: mapboxgl.Map) => {
    const { data } = await axios.post('https://apiapp.tarjetaferia.com.mx/obtenerCamiones', {
        id_ruta: id,
        lat: store.location?.coords.latitude,
        lon: store.location?.coords.longitude
    })

    if (data.message != 'Operación realizada correctamente') {
        const alert = await alertController.create({
            header: 'Oops!',
            message: 'No se pudo actualizar la lista de camiones',
            buttons: ['OK'],
        });
        store.loading = false
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
        const popupOffsets: mapboxgl.Offset = {
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
    store.lastUpdate = new Date().toLocaleTimeString()
    console.log(store.lastUpdate);
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
            <ion-item>
                <ion-label>
                    <h1>{{ store.selectedRoute?.name }}</h1>
                    <p v-if="store.lastUpdate">ultima actualización{{ store.lastUpdate }}</p>
                </ion-label>
            </ion-item>
            <div id="mapa" ref="mapa"></div>
            <ion-loading :is-open="store.loading" message="Cargando Camiones"></ion-loading>
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