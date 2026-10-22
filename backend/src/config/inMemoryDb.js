const bcrypt = require('bcryptjs');

// In-Memory Database store used if local MongoDB daemon is unavailable
const inMemoryData = {
  attendees: [],
  events: [],
  tickets: []
};

let nextId = 1000;
const generateId = () => {
  nextId++;
  return '65a00000000000000000' + nextId.toString(16).padStart(4, '0');
};

const initInMemoryData = () => {
  if (inMemoryData.attendees.length > 0) return;

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);

  const attendee1 = {
    _id: generateId(),
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 9876543210',
    password: hashedPassword,
    role: 'attendee',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const organizer1 = {
    _id: generateId(),
    name: 'Alice Organizer',
    email: 'alice@eventhub.com',
    phone: '+91 9123456780',
    password: hashedPassword,
    role: 'organizer',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  inMemoryData.attendees.push(attendee1, organizer1);

  const event1 = {
    _id: generateId(),
    title: 'TechX Conf 2026',
    category: 'Technology',
    date: new Date('2026-11-15T09:00:00Z'),
    venue: 'CSPIT Auditorium, CHARUSAT',
    ticketsAvailable: 45,
    price: 499,
    description: 'Premier annual developer and AI summit.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const event2 = {
    _id: generateId(),
    title: 'Neon Music Festival',
    category: 'Music',
    date: new Date('2026-11-20T18:00:00Z'),
    venue: 'Open Grounds, Ahmedabad',
    ticketsAvailable: 120,
    price: 899,
    description: 'Live electronic & indie concert featuring top artists.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const event3 = {
    _id: generateId(),
    title: 'Startup Pitch Fest',
    category: 'Business',
    date: new Date('2026-12-05T10:00:00Z'),
    venue: 'Innovation Hub, Vadodara',
    ticketsAvailable: 8,
    price: 299,
    description: 'Pitch your business ideas to prominent angel investors.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const event4 = {
    _id: generateId(),
    title: 'Web3 & AI Workshop (Sold Out)',
    category: 'Workshop',
    date: new Date('2026-10-30T14:00:00Z'),
    venue: 'Lab 402, IT Dept',
    ticketsAvailable: 0,
    price: 150,
    description: 'Hands-on smart contract & LLM engineering workshop.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  inMemoryData.events.push(event1, event2, event3, event4);

  const ticket1 = {
    _id: generateId(),
    attendeeId: attendee1._id,
    eventId: event1._id,
    quantity: 2,
    bookingDate: new Date(),
    status: 'booked',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  inMemoryData.tickets.push(ticket1);
};

// Initialize default seed
initInMemoryData();

module.exports = {
  inMemoryData,
  generateId,
  initInMemoryData
};
