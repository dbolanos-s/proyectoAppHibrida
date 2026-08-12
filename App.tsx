import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { todayOutline, gridOutline, bookOutline } from 'ionicons/icons';

import Hoy from './pages/Hoy';
import Horario from './pages/Horario';
import Materias from './pages/Materias';
import DetalleBloque from './pages/DetalleBloque';
import DetalleMateria from './pages/DetalleMateria';
import { ProveedorDatos } from './hooks/useDatos';

/* Estilos obligatorios de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';
import './theme/copol.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <ProveedorDatos>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/hoy" component={Hoy} />
            <Route exact path="/horario" component={Horario} />
            <Route exact path="/materias" component={Materias} />
            <Route exact path="/clase/:bloqueId" component={DetalleBloque} />
            <Route exact path="/materia/:materiaId" component={DetalleMateria} />
            <Route exact path="/">
              <Redirect to="/hoy" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="hoy" href="/hoy">
              <IonIcon aria-hidden="true" icon={todayOutline} />
              <IonLabel>Hoy</IonLabel>
            </IonTabButton>
            <IonTabButton tab="horario" href="/horario">
              <IonIcon aria-hidden="true" icon={gridOutline} />
              <IonLabel>Horario</IonLabel>
            </IonTabButton>
            <IonTabButton tab="materias" href="/materias">
              <IonIcon aria-hidden="true" icon={bookOutline} />
              <IonLabel>Materias</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </ProveedorDatos>
  </IonApp>
);

export default App;
