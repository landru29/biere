import React from 'react';
import './App.scss';
import Data from './service/data';
import ReceipeComponent  from './components/receipe/receipe';
import 'semantic-ui-sass/semantic-ui.scss';

function App() {
  Data.electronListener();

  return (
    <div className="App">
      <ReceipeComponent></ReceipeComponent>
    </div>
  );
}

export default App;
