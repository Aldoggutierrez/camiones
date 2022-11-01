<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="inbox-list">
            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item lines="none" :detail="false" class="hydrated">
                <ion-icon slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
  
          <ion-list id="labels-list">
            <ion-list-header>Rutas</ion-list-header>
            <ion-searchbar placeholder="Buscar Ruta" :value="search" @ion-input="search = $event.target.value;"></ion-searchbar>
            <ion-menu-toggle :auto-hide="false" v-for="(route, index) in store.routes" :key="index">
              <ion-item lines="none" @click="selectRoute(route)" :class="{ selected: parseInt($route.params.id as string) == route.id }">
                <ion-icon slot="start" :ios="busOutline" :md="busSharp"></ion-icon>
                <ion-label>{{ route.name }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonRouterOutlet, IonSplitPane, useIonRouter, IonSearchbar } from '@ionic/vue';
import { defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { mapOutline, mapSharp, busOutline, busSharp } from 'ionicons/icons';
import { useStore } from "./stores/mainStore";


interface route {
    file:string,
    id:number,
    name:string
  }

export default defineComponent({
  name: 'App',
  components: {
    IonApp, 
    IonContent, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonListHeader, 
    IonMenu, 
    IonMenuToggle, 
    IonRouterOutlet, 
    IonSplitPane,
    IonSearchbar
  },
  setup() {
    const ionRouter = useIonRouter();
    const route = useRoute();
    const store = useStore()

    const search = ref()
    const appPages = [
      {
        title: 'Mapa',
        url: '/map',
        iosIcon: mapOutline,
        mdIcon: mapSharp
      }
    ];

    const selectRoute = async(route:route) => {
      store.selectedRoute = route
      ionRouter.push(`/map/${route.id}`);
    }
    
    console.log(route.path);

    watch(search,(value) => {
      store.filterRoutes(value)
    })

    store.getRoutes()
    return { 
      appPages, 
      selectRoute,
      busOutline,
      busSharp,
      search,
      store,
      isSelected: (url: string) => url === route.path ? 'selected' : '',
    }
  }
});
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;

  margin-bottom: 18px;

  color: #757575;

  min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
