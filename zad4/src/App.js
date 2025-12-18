import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import ProductList from './components/ProductList';
import OrderForm from './components/OrderForm';
import AdminOrders from './components/AdminOrders';

function App() {
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Sklep Online</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Produkty</Nav.Link>
            <Nav.Link as={Link} to="/cart">Koszyk / Zamówienie</Nav.Link>
            <Nav.Link as={Link} to="/admin">Panel Admina</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/cart" element={<OrderForm />} />
          <Route path="/admin" element={<AdminOrders />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;