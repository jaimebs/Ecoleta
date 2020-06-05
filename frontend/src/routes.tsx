import React from 'react';
import {Route, BrowserRouter} from 'react-router-dom';

import Home from './pages/Home';
import Point from './pages/Point';

const Routes = () =>{
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={Point} path="/point"/>
    </BrowserRouter>
  )
}

export default Routes;