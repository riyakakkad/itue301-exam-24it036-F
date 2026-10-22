/**
 * Automated Verification Script for ITUE301 SET-F: EventHub Backend APIs
 * Tests all 5 required endpoints under /api/v1 with assertions
 */
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log(`\n======================================================`);
  console.log(` Running EventHub ITUE301 SET-F Automated API Tests`);
  console.log(` Target Server: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(` [PASS] ${testName}`);
      passed++;
    } else {
      console.error(` [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // Test 1: POST /api/v1/auth/login (Success)
    console.log('--- Task 3.1: POST /api/v1/auth/login ---');
    const loginRes = await request('POST', '/api/v1/auth/login', {
      email: 'rahul@example.com',
      password: 'password123'
    });
    assert(loginRes.status === 200, `Login returns HTTP 200 (Got: ${loginRes.status})`);
    assert(loginRes.body.token && loginRes.body.attendee, 'Login response contains JWT token and attendee info');
    assert(loginRes.body.attendee.role === 'attendee', `Attendee role is 'attendee' (Got: ${loginRes.body.attendee?.role})`);

    const attendeeToken = loginRes.body.token;

    // Test 1b: POST /api/v1/auth/login (Invalid credentials -> 401)
    const badLoginRes = await request('POST', '/api/v1/auth/login', {
      email: 'rahul@example.com',
      password: 'wrongpassword'
    });
    assert(badLoginRes.status === 401, `Invalid login returns HTTP 401 (Got: ${badLoginRes.status})`);

    // Test 2: GET /api/v1/events (Public)
    console.log('\n--- Task 3.2: GET /api/v1/events ---');
    const eventsRes = await request('GET', '/api/v1/events');
    assert(eventsRes.status === 200, `GET /events returns HTTP 200 (Got: ${eventsRes.status})`);
    assert(Array.isArray(eventsRes.body.events) && eventsRes.body.events.length > 0, `Events array returned with count: ${eventsRes.body.events?.length}`);

    const availableEvent = eventsRes.body.events.find((e) => e.ticketsAvailable > 0);
    const soldOutEvent = eventsRes.body.events.find((e) => e.ticketsAvailable === 0);

    assert(availableEvent !== undefined, `Found active event: '${availableEvent?.title}' with ${availableEvent?.ticketsAvailable} tickets`);
    assert(soldOutEvent !== undefined, `Found sold-out event: '${soldOutEvent?.title}'`);

    // Test 3: POST /api/v1/tickets (Missing Auth -> 401)
    console.log('\n--- Task 3.3: POST /api/v1/tickets ---');
    const noAuthTicket = await request('POST', '/api/v1/tickets', {
      eventId: availableEvent._id,
      quantity: 1
    });
    assert(noAuthTicket.status === 401, `Booking without Bearer token returns HTTP 401 authGuard rejection`);

    // Test 3b: POST /api/v1/tickets (Validation Failure: Exceeding tickets -> 400)
    const excessTickets = await request(
      'POST',
      '/api/v1/tickets',
      {
        eventId: availableEvent._id,
        quantity: availableEvent.ticketsAvailable + 999
      },
      attendeeToken
    );
    assert(excessTickets.status === 400, `Booking more tickets than available returns HTTP 400 validation error (Got: ${excessTickets.status})`);
    assert(excessTickets.body.message.includes('Booking failed') || excessTickets.body.message.includes('available'), 'Meaningful error message returned without exposing raw stack trace');

    // Test 3c: POST /api/v1/tickets (Valid Booking -> 201)
    const bookQty = 2;
    const initialAvailable = availableEvent.ticketsAvailable;
    const bookRes = await request(
      'POST',
      '/api/v1/tickets',
      {
        eventId: availableEvent._id,
        quantity: bookQty
      },
      attendeeToken
    );
    assert(bookRes.status === 201, `Successful booking returns HTTP 201 (Got: ${bookRes.status})`);
    assert(bookRes.body.ticket && bookRes.body.ticket.quantity === bookQty, `Ticket created with quantity ${bookQty}`);
    assert(bookRes.body.remainingTickets === initialAvailable - bookQty, `ticketsAvailable decremented correctly to ${bookRes.body.remainingTickets}`);

    const createdTicketId = bookRes.body.ticket._id;

    // Test 4: GET /api/v1/tickets/my (Protected, Populated references)
    console.log('\n--- Task 3.4: GET /api/v1/tickets/my ---');
    const myTicketsRes = await request('GET', '/api/v1/tickets/my', null, attendeeToken);
    assert(myTicketsRes.status === 200, `GET /tickets/my returns HTTP 200 (Got: ${myTicketsRes.status})`);
    assert(Array.isArray(myTicketsRes.body.tickets) && myTicketsRes.body.tickets.length > 0, `My tickets list returned with count: ${myTicketsRes.body.tickets?.length}`);

    const userTicket = myTicketsRes.body.tickets.find((t) => t._id.toString() === createdTicketId.toString()) || myTicketsRes.body.tickets[0];
    assert(userTicket.attendeeId && userTicket.attendeeId.name && userTicket.attendeeId.email, `attendeeId populated with name ('${userTicket.attendeeId?.name}') and email`);
    assert(userTicket.eventId && userTicket.eventId.title && userTicket.eventId.venue, `eventId populated with title ('${userTicket.eventId?.title}'), date, and venue`);

    // Test 5: PATCH /api/v1/tickets/:id/status (Protected)
    console.log('\n--- Task 3.5: PATCH /api/v1/tickets/:id/status ---');
    const updateRes = await request(
      'PATCH',
      `/api/v1/tickets/${userTicket._id}/status`,
      { status: 'cancelled' },
      attendeeToken
    );
    assert(updateRes.status === 200, `Update status to 'cancelled' returns HTTP 200 (Got: ${updateRes.status})`);
    assert(updateRes.body.ticket.status === 'cancelled', `Ticket status updated to 'cancelled'`);

    // Check that tickets were released back
    const eventsAfterCancel = await request('GET', '/api/v1/events');
    const eventAfterCancel = eventsAfterCancel.body.events.find((e) => e._id.toString() === availableEvent._id.toString());
    assert(eventAfterCancel.ticketsAvailable === initialAvailable, `Cancelled tickets restored to ticketsAvailable (${eventAfterCancel.ticketsAvailable})`);

    console.log(`\n======================================================`);
    console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed === 0) {
      console.log(' All 5 Express REST API endpoints verified successfully!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
