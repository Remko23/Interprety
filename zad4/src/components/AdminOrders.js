import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('wszystkie');
    const [error, setError] = useState(null);

    // Pobierz statusy z Twojego API, aby wiedzieć jakie ID przypisać przyciskom
    // Zakładamy na podstawie Zad3: 1: NOWE, 2: ZREALIZOWANE, 3: ANULOWANE
    const STATUS_ZREALIZOWANE = 2;
    const STATUS_ANULOWANE = 3;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3000/orders');
            setOrders(response.data);
        } catch (err) {
            setError("Błąd podczas pobierania zamówień.");
        }
    };

    const updateOrderStatus = async (orderId, newStatusId) => {
        try {
            await axios.put(`http://localhost:3000/orders/${orderId}`, {
                status_id: newStatusId
            });
            fetchOrders(); // Odśwież listę po zmianie
        } catch (err) {
            setError(err.response?.data?.message || "Nie udało się zmienić statusu.");
        }
    };

    // Filtrowanie zamówień wg stanu
    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'wszystkie') return true;
        return order.status_id === parseInt(statusFilter);
    });

    return (
        <div>
            <h2 className="mb-4">Panel Administratora - Zamówienia</h2>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            <Form.Group className="mb-3" style={{ maxWidth: '300px' }}>
                <Form.Label>Filtruj wg stanu:</Form.Label>
                <Form.Select onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="wszystkie">Wszystkie</option>
                    <option value="1">Nowe (Niezrealizowane)</option>
                    <option value="2">Zrealizowane</option>
                    <option value="3">Anulowane</option>
                </Form.Select>
            </Form.Group>

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>Data zatwierdzenia</th>
                        <th>Wartość</th>
                        <th>Towary (Sztuki)</th>
                        <th>Stan</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td>{new Date(order.date).toLocaleString()}</td>
                            <td>{order.total_price} zł</td>
                            <td>
                                <ul className="list-unstyled mb-0">
                                    {order.items && order.items.map(item => (
                                        <li key={item.id}>
                                            <small>• {item.product_name} (x{item.quantity})</small>
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td>
                                <Badge bg={order.status_id === 1 ? "primary" : order.status_id === 2 ? "success" : "secondary"}>
                                    {order.status_name || `ID: ${order.status_id}`}
                                </Badge>
                            </td>
                            <td>
                                {order.status_id === 1 && (
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            onClick={() => updateOrderStatus(order.id, STATUS_ZREALIZOWANE)}
                                        >
                                            Zrealizuj
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => updateOrderStatus(order.id, STATUS_ANULOWANE)}
                                        >
                                            Anuluj
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default AdminOrders;