import React from 'react';
import { Container } from 'react-bootstrap';
import './App.css';
import UrlShortener from './pages/UrlShortener';

function App() {
  return (
    <Container className="p-0 h-100" fluid>
      <UrlShortener/>
    </Container>
  );
}

export default App;
