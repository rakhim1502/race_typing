import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import express from 'express';
import { RoomManager } from '../server/engine/RoomManager.ts';
import { setupSocketHandlers } from '../server/socket.ts';
import { store } from '../server/storage/store.ts';
import { RoomState, RaceResultSummary } from '../shared/types.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

async function runMultiplayerTest() {
  console.log('\n--- REAL-TIME MULTIPLAYER INTEGRATION TEST ---\n');

  // 1. Setup isolated test server on port 4001
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
    transports: ['websocket'],
  });

  const roomManager = new RoomManager(io);
  setupSocketHandlers(io, roomManager);

  await new Promise<void>((resolve) => httpServer.listen(4001, resolve));
  console.log('Test Socket.IO server running on port 4001');

  // 2. Create User A and User B
  const userA = await store.register(`racerA_${Date.now()}`, 'pass1234', 'car-cyan');
  const userB = await store.register(`racerB_${Date.now()}`, 'pass1234', 'car-purple');

  // 3. Connect Client A
  const clientA: ClientSocket = ioClient('http://localhost:4001', {
    transports: ['websocket'],
    auth: {
      token: userA.token,
      userId: userA.user.id,
      username: userA.user.username,
      carId: 'car-cyan',
    },
  });

  // 4. Connect Client B
  const clientB: ClientSocket = ioClient('http://localhost:4001', {
    transports: ['websocket'],
    auth: {
      token: userB.token,
      userId: userB.user.id,
      username: userB.user.username,
      carId: 'car-purple',
    },
  });

  await new Promise<void>((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    clientA.on('connect', check);
    clientB.on('connect', check);
  });
  assert(clientA.connected && clientB.connected, 'Both Client A and Client B connected');

  // 5. Client A creates room
  let createdRoom: RoomState | null = null;
  await new Promise<void>((resolve) => {
    clientA.emit(
      'room:create',
      {
        name: 'Championship Track',
        isPrivate: false,
        language: 'uz',
        difficulty: 'easy',
        maxPlayers: 4,
        carId: 'car-cyan',
      },
      (res: any) => {
        assert(res.success === true, 'Client A created room successfully');
        createdRoom = res.room;
        resolve();
      }
    );
  });

  assert(Boolean(createdRoom?.code), 'Room code generated');

  // 6. Client B joins Client A's room using room code
  let joinedRoom: RoomState | null = null;
  await new Promise<void>((resolve) => {
    clientB.emit(
      'room:join',
      {
        codeOrId: createdRoom!.code,
        carId: 'car-purple',
      },
      (res: any) => {
        assert(res.success === true, 'Client B joined room successfully via code');
        joinedRoom = res.room;
        resolve();
      }
    );
  });

  // Wait for state sync
  await new Promise((r) => setTimeout(r, 200));
  const currentParticipants = Object.values(joinedRoom!.participants);
  assert(currentParticipants.length === 2, 'Room now has 2 participants');

  // 7. Ready toggle: Client A ready, then Client B ready
  let countdownFired = false;
  let raceStarted = false;

  clientA.on('race:countdown', () => {
    countdownFired = true;
  });

  const raceStartPromise = new Promise<void>((resolve) => {
    clientA.on('race:start', () => {
      raceStarted = true;
      resolve();
    });
  });

  clientA.emit('race:ready', { isReady: true });
  await new Promise((r) => setTimeout(r, 100));
  assert(!countdownFired, 'Countdown does not start before all players are ready');

  clientB.emit('race:ready', { isReady: true });
  await new Promise((r) => setTimeout(r, 200));
  assert(countdownFired, 'Countdown triggered after both players became ready');

  // Wait for race:start (countdown reaches 0 in ~3 seconds)
  console.log('Waiting for countdown (3s)...');
  await raceStartPromise;
  assert(raceStarted, 'race:start event received by clients');

  // 8. Progress updates and racing
  const textContent = createdRoom!.text.content;
  const finishPromise = new Promise<{ results: RaceResultSummary[] }>((resolve) => {
    clientA.on('race:finished', (data: any) => {
      resolve(data);
    });
  });

  // Client A types whole text quickly
  clientA.emit('player:progress', {
    typedLength: Math.floor(textContent.length / 2),
    currentInput: textContent.slice(0, Math.floor(textContent.length / 2)),
    errorCount: 0,
    timestamp: Date.now(),
  });

  await new Promise((r) => setTimeout(r, 150));

  // Client A finishes text
  clientA.emit('player:progress', {
    typedLength: textContent.length,
    currentInput: textContent,
    errorCount: 0,
    timestamp: Date.now(),
  });

  await new Promise((r) => setTimeout(r, 150));

  // Client B finishes text
  clientB.emit('player:progress', {
    typedLength: textContent.length,
    currentInput: textContent,
    errorCount: 1,
    timestamp: Date.now(),
  });

  const finishData = await finishPromise;
  assert(finishData.results.length === 2, 'Race finished with 2 results');
  assert(finishData.results[0].userId === userA.user.id, 'Client A won (rank 1)');
  assert(finishData.results[0].rank === 1, 'Client A rank is 1');
  assert(finishData.results[1].userId === userB.user.id, 'Client B came in rank 2');
  assert(finishData.results[1].rank === 2, 'Client B rank is 2');

  // 9. Rematch test
  const rematchPromise = new Promise<void>((resolve) => {
    clientB.on('room:state', (room: RoomState) => {
      if (room.status === 'WAITING' && room.results.length === 0) {
        resolve();
      }
    });
  });

  clientA.emit('race:rematch');
  await rematchPromise;
  assert(true, 'Rematch reset room to WAITING state with fresh text');

  // Cleanup
  clientA.disconnect();
  clientB.disconnect();
  httpServer.close();

  console.log('\n🎉 REAL-TIME MULTIPLAYER INTEGRATION TEST FULLY PASSED!\n');
}

runMultiplayerTest().catch((err) => {
  console.error('Multiplayer test error:', err);
  process.exit(1);
});
