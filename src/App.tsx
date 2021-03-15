import React from 'react';
import './App.scss';
import Instance from './service/electron';
import Data from './service/data';
import ReceipeComponent  from './components/receipe/receipe';
import 'semantic-ui-sass/semantic-ui.scss';

function App() {
  if (Instance.isElectron()) {
    Data.listenOpenFile();
  }

  return (
    <div className="App">
      <ReceipeComponent></ReceipeComponent>
    </div>
  );
}

export default App;
