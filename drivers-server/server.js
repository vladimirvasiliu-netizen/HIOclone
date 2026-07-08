/*
 * Server Express standalone pentru resursa "curieri" (drivers).
 * Datele sunt tinute intr-un array in memorie (se reseteaza la restart).
 * Ruleaza independent de backend-ul NestJS, pe portul 4000.
 *
 *   npm install
 *   npm run dev      # cu auto-reload (node --watch)
 *   npm start        # rulare simpla
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // permite apeluri din frontend-ul Vite (alt port)
app.use(express.json()); // parseaza body-ul JSON pentru POST

// "Baza de date" in memorie.
let drivers = [
  { id: 1, name: 'Andrei Popescu', vehicle: 'Scuter', status: 'online', deliveriesToday: 12 },
  { id: 2, name: 'Maria Ionescu', vehicle: 'Bicicleta', status: 'busy', deliveriesToday: 8 },
  { id: 3, name: 'Cristian Dumitru', vehicle: 'Masina', status: 'offline', deliveriesToday: 0 },
  { id: 4, name: 'Elena Radu', vehicle: 'Scuter', status: 'online', deliveriesToday: 15 },
  { id: 5, name: 'Alexandru Stan', vehicle: 'Bicicleta', status: 'online', deliveriesToday: 6 },
  { id: 6, name: 'Ioana Munteanu', vehicle: 'Pe jos', status: 'busy', deliveriesToday: 4 },
  { id: 7, name: 'Bogdan Constantin', vehicle: 'Masina', status: 'offline', deliveriesToday: 2 },
  { id: 8, name: 'Ana Marinescu', vehicle: 'Scuter', status: 'online', deliveriesToday: 11 },
  { id: 9, name: 'Florin Gheorghe', vehicle: 'Bicicleta', status: 'busy', deliveriesToday: 9 },
  { id: 10, name: 'Diana Petrescu', vehicle: 'Masina', status: 'online', deliveriesToday: 7 },
  { id: 11, name: 'Radu Voicu', vehicle: 'Scuter', status: 'offline', deliveriesToday: 1 },
  { id: 12, name: 'Gabriela Sandu', vehicle: 'Bicicleta', status: 'online', deliveriesToday: 13 },
];
let nextId = drivers.length + 1;

// GET /drivers - lista tuturor curierilor.
app.get('/drivers', (_req, res) => {
  res.json(drivers);
});

// POST /drivers - creeaza un curier nou. Body: { name, vehicle, status?, deliveriesToday? }
app.post('/drivers', (req, res) => {
  const { name, vehicle, status, deliveriesToday } = req.body || {};
  if (!name || !vehicle) {
    return res.status(400).json({ message: 'Campurile "name" si "vehicle" sunt obligatorii.' });
  }
  const driver = {
    id: nextId++,
    name,
    vehicle,
    status: status || 'online',
    deliveriesToday: Number(deliveriesToday) || 0,
  };
  drivers.push(driver);
  res.status(201).json(driver);
});

// DELETE /drivers/:id - sterge un curier dupa id.
app.delete('/drivers/:id', (req, res) => {
  const id = Number(req.params.id);
  const sizeBefore = drivers.length;
  drivers = drivers.filter((d) => d.id !== id);
  if (drivers.length === sizeBefore) {
    return res.status(404).json({ message: 'Curier inexistent.' });
  }
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Drivers API ruleaza pe http://localhost:${PORT}`);
});
