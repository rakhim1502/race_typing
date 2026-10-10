import { RaceEngine } from '../server/engine/RaceEngine.ts';
import { store } from '../server/storage/store.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log('\n--- TYPERACER ARENA BACKEND & ENGINE TESTS ---\n');

  // Test 1: Typing Progress Validation
  const text = 'Harakatda baraka bor.';
  const start = 100000;
  const now = start + 30000; // 30 seconds elapsed = 0.5 minutes

  const validProgress = RaceEngine.validateProgress(text, 'Harakatda', 0, start, now);
  assert(validProgress.isValid === true, 'Valid prefix is accepted');
  assert(validProgress.correctChars === 9, 'Correct chars counted accurately');
  assert(validProgress.progress > 0 && validProgress.progress < 100, 'Progress calculated between 0 and 100');
  // 9 chars / 5 = 1.8 words / 0.5 minutes = 3.6 WPM => rounded 4 WPM
  assert(validProgress.wpm >= 3, 'WPM is calculated based on elapsed time');

  // Test 2: Finish condition
  const finishProgress = RaceEngine.validateProgress(text, text, 0, start, now);
  assert(finishProgress.isFinished === true, 'Exact full text triggers isFinished = true');
  assert(finishProgress.progress === 100, 'Finished progress is exactly 100%');
  assert(finishProgress.accuracy === 100, 'Zero errors yields 100% accuracy');

  // Test 3: Accuracy with errors
  const errProgress = RaceEngine.validateProgress(text, 'Harakatda', 3, start, now);
  assert(errProgress.accuracy < 100, 'Errors decrease accuracy percentage');
  assert(errProgress.accuracy > 50, 'Accuracy correctly reflects keystroke ratio');

  // Test 4: Mismatch rejection
  const wrongProgress = RaceEngine.validateProgress(text, 'WrongText', 0, start, now);
  assert(wrongProgress.correctChars === 0, 'Completely wrong input stops correctChars at 0');

  // Test 5: Input exceeding text length rejected
  const overProgress = RaceEngine.validateProgress(text, text + ' Extra characters', 0, start, now);
  assert(overProgress.isValid === false, 'Input exceeding reference length is marked invalid');

  // Test 6: Auth and User store
  const testUser = `speed_${Date.now()}`;
  const regResult = await store.register(testUser, 'secretPass123', 'car-purple');
  assert(regResult.user.username === testUser, 'User registered successfully');
  assert(regResult.user.carId === 'car-purple', 'Selected car stored');
  assert(typeof regResult.token === 'string', 'JWT token generated');

  // Test 7: Duplicate username rejected
  let duplicateRejected = false;
  try {
    await store.register(testUser, 'anotherPass');
  } catch {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'Duplicate username is rejected');

  // Test 8: Login verification
  const loginResult = await store.login(testUser, 'secretPass123');
  assert(loginResult.user.id === regResult.user.id, 'User login succeeds with correct password');

  // Test 9: Atomic Race Results & Stats Update
  const mockRoomId = `test_room_${Date.now()}`;
  store.saveRaceResults(mockRoomId, [
    {
      rank: 1,
      userId: regResult.user.id,
      username: regResult.user.username,
      isGuest: false,
      carId: 'car-purple',
      wpm: 85,
      rawWpm: 87,
      accuracy: 98,
      errorCount: 1,
      finishTimeMs: 15400,
    },
  ]);

  const updatedProfile = store.getUserById(regResult.user.id);
  assert(updatedProfile?.racesCompleted === 1, 'Total races counter incremented to 1');
  assert(updatedProfile?.racesWon === 1, 'Wins counter incremented to 1 for rank 1');
  assert(updatedProfile?.bestWpm === 85, 'Best WPM recorded correctly');

  // Test 10: Duplicate race result prevention
  store.saveRaceResults(mockRoomId, [
    {
      rank: 1,
      userId: regResult.user.id,
      username: regResult.user.username,
      isGuest: false,
      carId: 'car-purple',
      wpm: 85,
      rawWpm: 87,
      accuracy: 98,
      errorCount: 1,
      finishTimeMs: 15400,
    },
  ]);
  const checkDuplicate = store.getUserById(regResult.user.id);
  assert(checkDuplicate?.racesCompleted === 1, 'Duplicate race result was safely ignored');

  console.log('\n🎉 ALL 10 TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
