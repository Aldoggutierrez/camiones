import { defineStore } from 'pinia'
import { ref, computed } from "vue";
import { Geolocation, Position } from '@capacitor/geolocation';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { Marker } from "mapbox-gl";

interface route {
    file:string,
    id:number,
    name:string
  }

export const useStore = defineStore('main', () => {
    const interval = ref()
    const routes = ref<route[]>([])
    const location = ref<Position>()
    const loading = ref(false)
    const geoJson = ref<FeatureCollection<Geometry, GeoJsonProperties>>()
    const selectedRoute = ref<route>()
    const markers = ref<Marker[]>([])
    const lastUpdate = ref()
    async function  getRoutes(){
        const data = await fetch('./assets/routes.json')
        const json = await data.json()
        routes.value = json
    }
    function filterRoutes(search:string) {
        if (search == "") getRoutes()
        else{
            const results = routes.value.filter((route,index) => {
                return route.name.includes(search)
            })
            routes.value = results
        }
    }
    async function getLocation(){
        location.value = await Geolocation.getCurrentPosition();
    }
    async function getRouteLine(id: string | string[] | undefined){
        if (id) {
            const data = await fetch(`./assets/GeoJSON/${id}.json`)
            const json = await data.json()
            geoJson.value = json
        }
    }
return {interval,routes,location,loading,geoJson,selectedRoute,lastUpdate,markers,filterRoutes,getRoutes,getLocation,getRouteLine}
})