require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Attendee = require('./src/models/Attendee');
const Event = require('./src/models/Event');
const Ticket = require('./src/models/Ticket');

const seedData = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';
  console.log(`[Seed] Connecting to MongoDB at: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await Attendee.deleteMany({});
    await Event.deleteMany({});
    await Ticket.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // Hash default password
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync('password123', salt);

    // Seed Attendees
    const rahul = await Attendee.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 9876543210',
      password,
      role: 'attendee'
    });

    const alice = await Attendee.create({
      name: 'Alice Organizer',
      email: 'alice@eventhub.com',
      phone: '+91 9123456780',
      password,
      role: 'organizer'
    });

    const admin = await Attendee.create({
      name: 'System Admin',
      email: 'admin@eventhub.com',
      phone: '+91 9000000000',
      password,
      role: 'admin'
    });

    console.log(`[Seed] Created ${3} attendees/organizers`);

    // Seed Events
    const events = await Event.create([
      {
        title: 'TechX Conf 2026',
        category: 'Technology',
        date: new Date('2026-11-15T09:00:00Z'),
        venue: 'CSPIT Auditorium, CHARUSAT',
        ticketsAvailable: 45,
        price: 499,
        description: 'Premier annual developer, cloud and AI engineering summit.'
      },
      {
        title: 'Neon Music Festival',
        category: 'Music',
        date: new Date('2026-11-20T18:00:00Z'),
        venue: 'Open Grounds, Ahmedabad',
        ticketsAvailable: 120,
        price: 899,
        description: 'Live electronic & indie concert featuring top artists and bands.'
      },
      {
        title: 'Startup Pitch Fest',
        category: 'Business',
        date: new Date('2026-12-05T10:00:00Z'),
        venue: 'Innovation Hub, Vadodara',
        ticketsAvailable: 8,
        price: 299,
        description: 'Pitch your business ideas and product prototypes to angel investors.'
      },
      {
        title: 'Web3 & AI Workshop (Sold Out)',
        category: 'Workshop',
        date: new Date('2026-10-30T14:00:00Z'),
        venue: 'Lab 402, IT Dept',
        ticketsAvailable: 0,
        price: 150,
        description: 'Hands-on smart contract & LLM engineering workshop.'
      }
    ]);

    console.log(`[Seed] Created ${events.length} events (including sold-out event)`);

    // Seed Initial Ticket
    const sampleTicket = await Ticket.create({
      attendeeId: rahul._id,
      eventId: events[0]._id,
      quantity: 2,
      bookingDate: new Date(),
      status: 'booked'
    });

    console.log(`[Seed] Created sample ticket for ${rahul.name}`);
    console.log('\nSeed successful! Test Credentials:');
    console.log('Attendee: rahul@example.com / password123');
    console.log('Organizer: alice@eventhub.com / password123');
    console.log('Admin: admin@eventhub.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    console.log('\nNote: If local MongoDB is offline, the backend automatically uses the bundled in-memory seed dataset.');
    process.exit(0);
  }
};

seedData();
