import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';

test('payment migrations enforce money, references, retry uniqueness and verified events', () => {
  const { db, sqlite } = openDatabase(':memory:');
  try {
    migrateDatabase(db);
    migrateDatabase(db);
    sqlite
      .prepare('INSERT INTO user(id,name,email,created_at,updated_at) VALUES(?,?,?,?,?)')
      .run('u', 'Tester', 'schema@test.invalid', 1, 1);
    const product = sqlite.prepare(
      'INSERT INTO products(id,title,price_idr,access_days,created_at) VALUES(?,?,?,?,?)'
    );
    assert.throws(() => product.run('bad', 'Invalid', -1, 30, 1));
    assert.throws(() => product.run('fraction', 'Invalid', 1.5, 30, 1));
    product.run('p', 'Paket', 10000, 30, 1);
    const order = sqlite.prepare(
      "INSERT INTO orders(id,user_id,product_id,product_title,amount_idr,access_days,idempotency_key,request_hash,created_at,expires_at) VALUES(?,?,?,'Paket',10000,30,?,'hash',1,100)"
    );
    order.run('o', 'u', 'p', 'retry-1');
    assert.throws(() => order.run('o2', 'u', 'p', 'retry-1'));
    assert.throws(() => order.run('o3', 'missing', 'p', 'retry-2'));
    const payment = sqlite.prepare(
      "INSERT INTO payments(id,order_id,provider,merchant_account,external_id,idempotency_key,amount_idr,created_at,updated_at) VALUES(?,'o','test','merchant',?,?,10000,1,1)"
    );
    payment.run('pay', 'remote-1', 'payment-1');
    assert.throws(() => payment.run('pay2', 'remote-1', 'payment-2'));
    const event = sqlite.prepare(
      "INSERT INTO payment_events(id,provider,environment,merchant_account,event_key,payment_id,payload_hash,verified,status,received_at) VALUES(?,'test','sandbox','merchant',?,'pay','hash',?,?,1)"
    );
    assert.throws(() => event.run('bad-event', 'e0', 0, 'processed'));
    event.run('event', 'e1', 1, 'processed');
    assert.throws(() => event.run('event2', 'e1', 1, 'processed'));
    sqlite
      .prepare(
        "INSERT INTO exam_packages(id,title,exam_type,formation,target_year,reference,duration_minutes,quotas,created_at) VALUES('exam','Test','CPNS','',2027,'provisional',10,'{}',1)"
      )
      .run();
    sqlite
      .prepare("INSERT INTO order_packages(id,order_id,package_id) VALUES('op','o','exam')")
      .run();
    const grant = sqlite.prepare(
      "INSERT INTO access_grants(id,order_package_id,starts_at,expires_at,created_at) VALUES(?,'op',1,?,1)"
    );
    assert.throws(() => grant.run('bad-grant', 1));
    grant.run('g', 100);
    assert.throws(() => grant.run('g2', 200));
    assert.deepEqual(sqlite.pragma('foreign_key_check'), []);
  } finally {
    sqlite.close();
  }
});
