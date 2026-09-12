import assert from 'node:assert/strict';
import Database from 'better-sqlite3';

export async function testExamHttp({ origin, cookie, participantCookie, databasePath }) {
  // Only the caller's disposable smoke database; never the operator's database.
  const db = new Database(databasePath);
  try {
    const question = db.prepare('SELECT * FROM question_versions LIMIT 1').get();
    assert.ok(question);
    const content = JSON.parse(question.content);
    db.prepare("UPDATE question_versions SET status = 'published' WHERE id = ?").run(question.id);
    db.prepare("UPDATE user SET email_verified = 1 WHERE email = 'participant@smoke.test'").run();
    const post = (path, body, session = cookie) =>
      fetch(origin + path, {
        method: 'POST',
        redirect: 'manual',
        headers: { Cookie: session, Origin: origin, Accept: 'text/html' },
        body: new URLSearchParams(body)
      });
    const fields = {
      title: 'HTTP practice package',
      examType: content.exam_type,
      formation: '',
      targetYear: '2027',
      reference: 'Synthetic practice fixture only',
      durationMinutes: '10',
      [content.subtest_code]: '1',
      versionIds: question.id
    };
    assert.equal((await post('/admin/packages?/create', fields, participantCookie)).status, 403);
    const created = await post('/admin/packages?/create', fields);
    assert.equal(created.status, 303, await created.clone().text());
    const packageId = new URL(created.headers.get('location'), origin).searchParams.get('created');
    assert.equal((await fetch(origin + '/paket/' + packageId)).status, 404);
    assert.equal((await post('/admin/packages?/publish', { id: packageId })).status, 200);
    assert.equal((await fetch(origin + '/paket/' + packageId)).status, 200);
    assert.equal((await post('/paket/' + packageId + '?/start', {}, '')).status, 303);
    const started = await post('/paket/' + packageId + '?/start', {}, participantCookie);
    assert.equal(started.status, 303, await started.clone().text());
    const attemptPath = started.headers.get('location');
    assert.equal(
      (await post('/paket/' + packageId + '?/start', {}, participantCookie)).headers.get('location'),
      attemptPath
    );
    assert.equal((await fetch(origin + attemptPath, { headers: { Cookie: cookie } })).status, 404);
    const preview = await fetch(origin + attemptPath, { headers: { Cookie: participantCookie } });
    const html = await preview.text();
    assert.equal(preview.status, 200);
    assert.ok(!html.includes(content.explanation_md));
    assert.ok(!html.includes('correct_option_code'));
    assert.match(preview.headers.get('cache-control'), /no-store/);
    const item = db.prepare('SELECT id FROM exam_items WHERE package_id = ?').get(packageId);
    const option = db
      .prepare('SELECT * FROM exam_options WHERE item_id = ? ORDER BY score DESC LIMIT 1')
      .get(item.id);
    const save = (body, requestOrigin = origin, session = participantCookie) =>
      fetch(origin + attemptPath + '/save', {
        method: 'POST',
        headers: { Cookie: session, Origin: requestOrigin, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    const answer = { itemId: item.id, optionId: option.id, revision: 1 };
    assert.equal((await save(null)).status, 400);
    assert.equal((await save(answer, 'https://attacker.invalid')).status, 403);
    assert.equal((await save(answer, origin, cookie)).status, 404);
    assert.equal((await save({ ...answer, optionId: 'foreign-option' })).status, 400);
    assert.equal((await save(answer)).status, 200);
    assert.equal((await save(answer)).status, 409);
    const saved = db
      .prepare('SELECT * FROM exam_attempts WHERE id = ?')
      .get(attemptPath.split('/').pop());
    assert.equal(JSON.parse(saved.answers)[item.id], option.id);
    assert.equal((await post(attemptPath, {}, participantCookie)).status, 303);
    assert.equal((await post(attemptPath, {}, participantCookie)).status, 303);
    const result = await fetch(origin + attemptPath, { headers: { Cookie: participantCookie } });
    assert.match(await result.text(), /Hasil latihan/);
    const scored = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(saved.id);
    assert.equal(JSON.parse(scored.result).total, option.score);
    assert.equal((await save({ ...answer, revision: 2 })).status, 409);
    const history = await fetch(origin + '/dashboard', { headers: { Cookie: participantCookie } });
    const historyHtml = await history.text();
    assert.match(historyHtml, /HTTP practice package/);
    assert.ok(!historyHtml.includes('Belum ada riwayat ujian'));
    // Exercise the actual checkout actions, not only direct service calls.
    db.prepare("INSERT INTO products(id,title,price_idr,access_days,active,created_at) VALUES('http-product','HTTP paid trial',25000,30,1,1)").run();
    db.prepare("INSERT INTO product_packages(id,product_id,package_id) VALUES('http-link','http-product',?)").run(packageId);
    const purchase = () => post('/paket/' + packageId + '?/buy', { productId: 'http-product' }, participantCookie);
    const bought = await purchase();
    assert.equal(bought.status, 303, await bought.clone().text());
    const checkoutPath = bought.headers.get('location');
    assert.match(checkoutPath, /^\/pembayaran\//);
    assert.equal((await purchase()).headers.get('location'), checkoutPath);
    const purchasesPage = await fetch(origin + '/dashboard', { headers: { Cookie: participantCookie } });
    assert.equal(purchasesPage.status, 200);
    assert.match(purchasesPage.headers.get('cache-control'), /no-store/);
    assert.ok((await purchasesPage.text()).includes(checkoutPath));
    const otherDashboard = await fetch(origin + '/dashboard', { headers: { Cookie: cookie } });
    assert.equal(otherDashboard.status, 200);
    assert.ok(!(await otherDashboard.text()).includes(checkoutPath));

    assert.equal((await fetch(origin + checkoutPath, { headers: { Cookie: participantCookie } })).status, 200);
    assert.equal((await fetch(origin + checkoutPath, { headers: { Cookie: cookie } })).status, 404);
    assert.equal((await post('/paket/' + packageId + '?/start', {}, participantCookie)).status, 402);
    const proof = await post(checkoutPath + '?/proof', { reference: 'HTTP-TRANSFER-001', senderName: 'HTTP Tester', amountIdr: '25000', paidAt: new Date().toISOString() }, participantCookie);
    assert.equal(proof.status, 200, await proof.clone().text());
    const payment = db.prepare('SELECT * FROM payments WHERE order_id=?').get(checkoutPath.split('/').pop());
    assert.equal(payment.status, 'review_required');
    const approved = await post('/admin/payments?/review', { paymentId: payment.id, approved: 'true' });
    assert.equal(approved.status, 200, await approved.clone().text());
    assert.equal(db.prepare('SELECT status FROM payments WHERE id=?').get(payment.id).status, 'succeeded');
    assert.equal((await post('/paket/' + packageId + '?/start', {}, participantCookie)).status, 303);
    console.log('Checkout HTTP: purchase, retry, ownership, proof, admin approval and paid exam access passed.');
    const archive = { id: packageId, reason: 'Edisi pengujian sudah ditutup' };
    assert.equal((await post('/admin/packages?/archive', archive, participantCookie)).status, 403);
    assert.equal((await post('/admin/packages?/archive', archive)).status, 200);
    assert.equal((await fetch(origin + '/paket/' + packageId)).status, 404);
    assert.equal(
      (await fetch(origin + attemptPath, { headers: { Cookie: participantCookie } })).status,
      200
    );
    assert.equal((await post('/profil', { name: 'Tester', province: 'bali' }, '')).status, 303);
    assert.equal(
      (await post('/profil', { name: 'Tester', province: 'not-valid' }, participantCookie)).status,
      400
    );
    assert.equal(
      (await post('/profil', { name: 'Tester', province: 'bali' }, participantCookie)).status,
      200
    );
    const competitionDraft = await post('/admin/packages?/create', {
      ...fields,
      title: 'Competition fixture'
    });
    const competitionId = new URL(
      competitionDraft.headers.get('location'),
      origin
    ).searchParams.get('created');
    await post('/admin/packages?/publish', { id: competitionId });
    const competitionFields = {
      id: competitionId,
      endsAt: new Date(Date.now() + 600000).toISOString()
    };
    assert.equal(
      (await post('/admin/packages?/competition', competitionFields, participantCookie)).status,
      403
    );
    assert.equal((await post('/admin/packages?/competition', competitionFields)).status, 200);
    const rankingPath = '/ranking/' + competitionId;
    assert.equal((await fetch(origin + rankingPath, { redirect: 'manual' })).status, 303);
    assert.equal(
      (await fetch(origin + rankingPath, { headers: { Cookie: participantCookie } })).status,
      403
    );
    const joined = await post(
      '/paket/' + competitionId + '?/start',
      { alias: 'PublicAlias', visible: 'on' },
      participantCookie
    );
    assert.equal(joined.status, 303, await joined.clone().text());
    const competitionAttempt = joined.headers.get('location');
    assert.equal((await post(competitionAttempt, {}, participantCookie)).status, 303);
    const hiddenReview = await fetch(origin + competitionAttempt, {
      headers: { Cookie: participantCookie }
    });
    assert.ok(!(await hiddenReview.text()).includes(content.explanation_md));
    const board = await fetch(origin + rankingPath, { headers: { Cookie: participantCookie } });
    assert.equal(board.status, 200);
    assert.match(await board.text(), /PublicAlias/);
    await post('/profil', { name: 'Tester', province: 'riau' }, participantCookie);
    const regional = await fetch(origin + rankingPath + '?province=bali', {
      headers: { Cookie: participantCookie }
    });
    assert.match(await regional.text(), /PublicAlias/);
    const otherRegion = await fetch(origin + rankingPath + '?province=riau', {
      headers: { Cookie: participantCookie }
    });
    assert.ok(!(await otherRegion.text()).includes('PublicAlias'));
    assert.equal((await post(rankingPath + '?/hide', {}, participantCookie)).status, 303);
    const hiddenBoard = await fetch(origin + rankingPath, {
      headers: { Cookie: participantCookie }
    });
    assert.ok(!(await hiddenBoard.text()).includes('PublicAlias'));
    console.log(
      'Ranking HTTP: admin activation, member-only access, alias consent, sealed review and immediate opt-out passed.'
    );
    console.log(
      'Exam HTTP: admin package publishing, participant start/resume, ownership, hidden keys, save/revision/CSRF, submit retry and dashboard history passed.'
    );
  } finally {
    db.close();
  }
}
