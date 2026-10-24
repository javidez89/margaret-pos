const assert = require('node:assert/strict');
const fs = require('node:fs');
const harness = require('./helpers/financial-harness.cjs');

let assertions = 0;
const startedAt = Date.now();
function eq(actual, expected, message) { assertions++; assert.equal(actual, expected, message); }
// Oracle: integer cents and quotient/remainder allocation. It never calls application math helpers.
const cents = n => BigInt(Math.round(n * 100));
function allocate(value, units, stock) {
  const numerator = value * BigInt(units), divisor = BigInt(stock);
  const quotient = numerator / divisor, remainder = numerator % divisor;
  return quotient + (2n * remainder >= divisor ? 1n : 0n);
}
async function rejectsUnchanged(h, action, message) {
  const before = JSON.stringify(h.api.db()), persisted = h.stored();
  await assert.rejects(action, undefined, message); assertions++;
  eq(JSON.stringify(h.api.db()), before, message + ': memoria intacta');
  eq(h.stored(), persisted, message + ': persistencia intacta');
}
function products() {
  return [
    { id: 1, name: 'Cerveza lata QA', category: 'Cervezas', container: 'Lata', price: 4100.01, packPrice: 112000.07, packEligible: true },
    { id: 2, name: 'Cerveza botella QA', category: 'Cervezas', container: 'Botella', price: 4500.03, packPrice: 125000.11, packEligible: true },
    { id: 3, name: 'Licor QA', category: 'Licores', price: 58000.09, packPrice: 0, packEligible: false },
    { id: 4, name: 'Complemento QA', category: 'Complementos', price: 3400.13, packPrice: 0, packEligible: false }
  ].map(p => ({ ...p, stock: 0, cost: 0, costPending: true, barcode: 'QA-' + p.id, packBarcode: p.packEligible ? 'QA-P-' + p.id : '' }));
}
function setup(h) {
  const a = h.api, d = a.db(); a.setUser('admin');
  d.products = products(); d.sales = []; d.shiftArchive = []; d.voucherRegistry = {};
  d.users.find(u => u.id === 'vendedor1').document = 'QA-SYNTHETIC-1';
  d.users.find(u => u.id === 'vendedor2').document = 'QA-SYNTHETIC-2';
  d.shift = { id: 1, date: '2024-01-01', label: 'QA', start: '07:00', end: '15:00', members: ['vendedor1', 'vendedor2'], owner: 'vendedor1', state: 'Programado', base: 0 };
  a.persist();
}
async function open(a, day, second = false) {
  a.setUser('admin'); const s = a.db().shift;
  await a.saveShiftConfiguration(s.id, { label: second ? 'Tarde QA' : 'Mañana QA', date: day, start: second ? '15:00' : '07:00', end: second ? '23:00' : '15:00', members: ['vendedor1', 'vendedor2'], owner: 'vendedor1' }, true);
  a.setUser('vendedor1'); await a.openApprovedShift(s.id, 1000000.01);
}

async function boundaries() {
  const h = await harness(), a = h.api; setup(h); await open(a, '2024-01-01');
  const purchase = { requestId: 'boundary-buy', product: 1, format: 'pack', qty: 1, cost: 100.01, date: '2024-01-01', supplier: '' };
  a.setUser('admin'); await a.purchase(purchase);
  await rejectsUnchanged(h, () => a.purchase(purchase), 'Compra duplicada');
  for (const [field, values] of Object.entries({ qty: [0, -1, 0.5, NaN, Infinity, 1000001], cost: [0, -1, NaN, Infinity, 0.001], date: ['2024-02-30', '2024-13-01', 'incorrecta'], format: ['other'] })) {
    for (const value of values) await rejectsUnchanged(h, () => a.purchase({ ...purchase, requestId: 'bad-buy', [field]: value }), 'Compra inválida ' + field + '=' + value);
  }
  a.setUser('vendedor1');
  for (const qty of [-1, 0.5, NaN, Infinity, 31]) await rejectsUnchanged(h, () => a.registerShiftSale({ shiftId: 1, cart: { '1:unit': qty }, method: 'Transferencia' }), 'Cantidad de venta inválida ' + qty);
  await rejectsUnchanged(h, () => a.registerShiftSale({ shiftId: 1, cart: { '1:unit': 1, '1:pack': 1 }, method: 'Transferencia' }), 'Unidad y paca comparten existencias');
  for (const value of [-5, 0, NaN, Infinity, 1.001]) {
    a.db().products[0].price = value; a.persist();
    await rejectsUnchanged(h, () => a.registerShiftSale({ shiftId: 1, cart: { '1:unit': 1 }, method: 'Transferencia' }), 'Precio inválido ' + value);
  }
  a.db().products[0].price = 4.03; a.db().products[0].packPrice = 199.99; a.persist();
  await rejectsUnchanged(h, () => a.registerShiftSale({ shiftId: 1, cart: { '1:unit': 1 }, method: 'Efectivo', received: 4.02 }), 'Cobro insuficiente');
  const saleInput = { requestId: 'one-sale', shiftId: 1, cart: { '1:pack': 1 }, method: 'Efectivo', received: 200 };
  const sale = await a.registerShiftSale(saleInput);
  eq(sale.change, 0.01, 'Cambio exacto'); eq(sale.costTotal, 100.01, 'Costo de paca completa');
  await rejectsUnchanged(h, () => a.registerShiftSale(saleInput), 'Mismo cobro no se repite');
  let refunded = 0n, recovered = 0n;
  // Thirty separate partial refunds must exactly equal the original sale and original cost.
  for (let n = 0; n < 30; n++) {
    a.setUser('vendedor1'); let r = await a.requestReturn(sale.id, [{ lineIndex: 0, qty: 1 }], 'QA reparto de centavos', 'Transferencia', true);
    a.setUser('gerente'); a.approveReturn(r.id, true); r = await a.payReturn(r.id, 'Transferencia', 'QA-' + n);
    refunded += cents(r.total); recovered += cents(r.costRecovered);
  }
  eq(refunded, 19999n, 'Treinta parciales devuelven exactamente el precio de la paca');
  eq(recovered, 10001n, 'Treinta parciales recuperan exactamente su costo');
  eq(cents(a.db().products[0].inventoryValue), 10001n, 'Valor de inventario conservado');
  eq(a.db().products[0].stock, 30, 'Treinta unidades reintegradas');
  await rejectsUnchanged(h, () => a.requestReturn(sale.id, [{ lineIndex: 0, qty: 1 }], 'Exceso', 'Transferencia'), 'No devolver más que lo vendido');
  const last = a.db().returns.at(-1);
  await rejectsUnchanged(h, () => a.payReturn(last.id, 'Transferencia', 'replay'), 'No reembolsar dos veces');
  eq((await a.verifyVoucherCode(sale.voucher.auth.code)).valid, true, 'Hash de venta original permanece válido');

  a.setUser('admin');
  const expense = { requestId: 'expense-1', shiftId: 1, date: '2024-01-01', concept: 'Transporte', detail: 'QA', amount: 0.1, source: 'Caja del turno' };
  await a.expense(expense); await a.expense({ ...expense, requestId: 'expense-2', amount: 0.2 });
  eq(a.expected(), 1000199.7, 'Caja exacta con 0,10 + 0,20');
  for (const amount of [-10, 0, NaN, Infinity, 0.001, 1000000001]) await rejectsUnchanged(h, () => a.expense({ ...expense, requestId: 'bad-expense', amount }), 'Gasto inválido ' + amount);
  await rejectsUnchanged(h, () => a.expense({ ...expense, requestId: 'bad-date', date: '2023-12-31' }), 'Gasto de caja fuera del día actual');
  await rejectsUnchanged(h, () => a.expense({ ...expense, requestId: 'no-cash', amount: 99999999 }), 'Gasto mayor que saldo');
  await rejectsUnchanged(h, () => a.expense(expense), 'Gasto duplicado');
  const payroll = { requestId: 'payroll-1', employee: 'vendedor1', date: '2024-01-01', from: '2024-01-01', to: '2024-01-15', base: 100.1, additions: 20.2, deductions: 10.3, method: 'Transferencia', reference: 'QA' };
  const beforeCash = a.expected(), pay = await a.payroll(payroll);
  eq(pay.total, 110, 'Neto nómina = base + adiciones - deducciones'); eq(a.expected(), beforeCash, 'Nómina fuera de caja');
  eq(a.db().expenses.filter(e => e.payrollId === pay.id).length, 1, 'Nómina genera un solo gasto');
  await rejectsUnchanged(h, () => a.payroll(payroll), 'Nómina duplicada');
  await rejectsUnchanged(h, () => a.payroll({ ...payroll, requestId: 'overlap', from: '2024-01-15', to: '2024-01-30' }), 'Periodos de nómina superpuestos');
  for (const change of [{ base: NaN }, { additions: -1 }, { deductions: 9999 }, { from: '2024-02-30' }]) await rejectsUnchanged(h, () => a.payroll({ ...payroll, requestId: 'bad-payroll', from: '2024-02-01', to: '2024-02-15', ...change }), 'Nómina inválida');
  for (const [name, action] of [
    ['compra', () => a.purchase({ ...purchase, requestId: 'failure-buy' })],
    ['gasto', () => a.expense({ ...expense, requestId: 'failure-expense' })],
    ['nómina', () => a.payroll({ ...payroll, requestId: 'failure-payroll', from: '2024-02-01', to: '2024-02-15' })],
    ['venta', () => a.registerShiftSale({ shiftId: 1, cart: { '1:unit': 1 }, method: 'Transferencia' })]
  ]) { h.failWrite(); await rejectsUnchanged(h, action, 'Fallo al guardar ' + name); }
  a.setUser('vendedor2');
  await rejectsUnchanged(h, () => a.purchase({ ...purchase, requestId: 'forbidden-buy' }), 'Vendedor no compra');
  await rejectsUnchanged(h, () => a.payroll({ ...payroll, requestId: 'forbidden-payroll' }), 'Vendedor no paga nómina');
  return { cases: assertions, partialRefunds: 30 };
}

async function history() {
  const h = await harness(), a = h.api; setup(h);
  let rng = 20261023;
  const random = n => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng % n; };
  const model = new Map(products().map(p => [p.id, { stock: 0, value: 0n, bought: 0, sold: 0, returned: 0, buyValue: 0n, soldValue: 0n, returnedValue: 0n, price: cents(p.price), pack: cents(p.packPrice) }]));
  const events = [], sales = [], shifts = [], refundCounts = { full: 0, partial: 0, damaged: 0, priorPeriod: 0 }, days = [], months = new Set();
  let sequence = 0, fullReturnCounter = 0;
  const token = prefix => prefix + '-' + (++sequence);
  function inventoryCheck() {
    for (const [id, expected] of model) {
      const actual = a.db().products.find(p => p.id === id);
      eq(actual.stock, expected.stock, 'Stock por referencia ' + id);
      eq(actual.stock, expected.bought - expected.sold + expected.returned, 'Entradas - salidas + reintegros ' + id);
      eq(cents(actual.inventoryValue || 0), expected.value, 'Valor de inventario ' + id);
      eq(expected.value, expected.buyValue - expected.soldValue + expected.returnedValue, 'Conservación de costo ' + id);
    }
  }
  async function refund(original, day, cash, partial, restock) {
    const available = original.lines.map((line, lineIndex) => ({ line, lineIndex })).filter(({ line }) => line.qty > line.returned);
    if (!available.length) return;
    const selected = partial ? available.slice(0, 1) : available;
    const lines = selected.map(({ line, lineIndex }) => ({ lineIndex, qty: partial ? 1 : line.qty - line.returned }));
    let total = 0n, recovery = 0n;
    const allocations = lines.map(({ lineIndex, qty }) => {
      const line = original.lines[lineIndex], last = qty === line.qty - line.returned;
      const amount = last ? line.amount - line.refunded : allocate(line.amount, qty, line.qty);
      const cost = last ? line.cost - line.recovered : allocate(line.cost, qty, line.qty);
      total += amount; if (restock) recovery += cost;
      return { line, qty, amount, cost };
    });
    const method = cash ? 'Efectivo' : 'Transferencia', before = a.expected();
    a.setUser(original.seller); const r = await a.requestReturn(original.id, lines, 'QA devolución simulada', method, restock);
    eq(cents(r.total), total, 'Importe devolución contra precio histórico');
    a.setUser('gerente'); a.approveReturn(r.id, restock); eq(a.expected(), before, 'Aprobación no mueve dinero');
    const paid = await a.payReturn(r.id, method, cash ? '' : token('transfer'));
    eq(cents(paid.costRecovered), recovery, 'Costo recuperado histórico');
    for (const part of allocations) {
      part.line.returned += part.qty; part.line.refunded += part.amount; part.line.recovered += part.cost;
      if (restock) { const p = model.get(part.line.product); p.stock += part.qty; p.returned += part.qty; p.value += part.cost; p.returnedValue += part.cost; }
    }
    events.push({ type: 'refund', day, actor: original.seller, amount: total, cost: recovery, cash: cash ? total : 0n, shift: a.db().shift.id });
    refundCounts[partial ? 'partial' : 'full']++; if (!restock) refundCounts.damaged++;
    if (day.slice(0, 7) !== original.day.slice(0, 7)) refundCounts.priorPeriod++;
    eq((await a.verifyVoucherCode(paid.voucher.auth.code)).valid, true, 'Hash devolución');
  }
  for (let dayIndex = 0; dayIndex < 400; dayIndex++) {
    const day = new Date(Date.UTC(2024, 0, 1 + dayIndex)).toISOString().slice(0, 10); days.push(day); months.add(day.slice(0, 7));
    h.at(day + 'T12:00:00Z');
    a.setUser('admin');
    for (const [id, p] of model) if (p.stock < 180) {
      const pack = id < 3 && random(2) === 0, qty = pack ? 9 + random(4) : 270 + random(90);
      const cost = id === 3 ? 35000n * 100n + BigInt(random(9999)) : pack ? 75000n * 100n + BigInt(random(9999)) : 2100n * 100n + BigInt(random(9999));
      const total = cost * BigInt(qty), units = qty * (pack ? 30 : 1);
      const bought = await a.purchase({ requestId: token('buy'), product: id, format: pack ? 'pack' : 'unit', qty, cost: Number(cost) / 100, date: day, supplier: '' });
      eq(cents(bought.total), total, 'Compra cantidad × costo'); eq(bought.units, units, 'Conversión de compra a unidades');
      p.stock += units; p.bought += units; p.value += total; p.buyValue += total;
      events.push({ type: 'purchase', day, actor: 'admin', amount: total, cost: 0n });
    }
    for (let turn = 0; turn < 2; turn++) {
      h.at(day + (turn ? 'T21:00:00Z' : 'T13:00:00Z')); await open(a, day, !!turn);
      const shiftId = a.db().shift.id;
      for (let n = 0; n < 2; n++) {
        const seller = n ? 'vendedor2' : 'vendedor1', cart = {}, requested = [];
        const productIds = [...model.keys()]; // Fixed order; choose without duplicate keys.
        const first = random(4), count = 1 + random(3);
        for (let k = 0; k < count; k++) {
          const id = productIds[(first + k) % 4], pack = id < 3 && random(5) === 0, qty = 1 + random(pack ? 2 : 4);
          cart[id + ':' + (pack ? 'pack' : 'unit')] = qty; requested.push({ id, pack, qty });
        }
        const method = ['Efectivo', 'Transferencia', 'Tarjeta'][random(3)];
        let total = 0n, costTotal = 0n;
        const lines = requested.map(row => {
          const p = model.get(row.id), units = row.qty * (row.pack ? 30 : 1), amount = (row.pack ? p.pack : p.price) * BigInt(row.qty), cost = allocate(p.value, units, p.stock);
          p.stock -= units; p.sold += units; p.value -= cost; p.soldValue += cost; total += amount; costTotal += cost;
          return { product: row.id, qty: units, amount, cost, returned: 0, refunded: 0n, recovered: 0n };
        });
        a.setUser(seller); const actual = await a.registerShiftSale({ requestId: token('sale'), shiftId, cart, method, received: Number(total + 150037n) / 100 });
        eq(cents(actual.total), total, 'Total venta'); eq(cents(actual.costTotal), costTotal, 'Costo vendido');
        eq(cents(actual.change), method === 'Efectivo' ? 150037n : 0n, 'Cambio según medio');
        eq(cents(actual.voucher.total), total, 'Total voucher'); eq(actual.date, day, 'Fecha Colombia');
        const record = { id: actual.id, seller, day, lines }; sales.push(record);
        events.push({ type: 'sale', day, actor: seller, amount: total, cost: costTotal, cash: method === 'Efectivo' ? total : 0n, shift: shiftId });
        if (dayIndex % 47 === 0 && n === 0) await refund(record, day, false, false, true);
      }
      if ((dayIndex * 2 + turn) % 9 === 0 && sales.length > 28) {
        const original = sales[Math.max(0, sales.length - 29)];
        await refund(original, day, turn === 1, ++fullReturnCounter % 3 !== 0, fullReturnCounter % 4 !== 0);
      }
      a.setUser(turn ? 'gerente' : 'admin'); const amount = BigInt(50000 + random(800000));
      await a.expense({ requestId: token('expense'), shiftId, date: day, concept: 'Transporte', detail: 'QA aleatorio reproducible', amount: Number(amount) / 100, source: turn ? 'Caja del turno' : 'Fuera de caja' });
      events.push({ type: 'expense', day, actor: turn ? 'gerente' : 'admin', amount, cash: turn ? amount : 0n, shift: shiftId });
      if (!turn && ['15', '28'].includes(day.slice(8))) {
        const employee = day.slice(8) === '15' ? 'vendedor1' : 'vendedor2', base = 75000001n, additions = BigInt(random(2000000)), deductions = BigInt(random(900000));
        const pay = await a.payroll({ requestId: token('payroll'), employee, date: day, from: day.slice(0, 8) + (employee === 'vendedor1' ? '01' : '16'), to: day, base: Number(base) / 100, additions: Number(additions) / 100, deductions: Number(deductions) / 100, method: 'Transferencia', reference: 'QA' });
        const net = base + additions - deductions; eq(cents(pay.total), net, 'Nómina en historial');
        events.push({ type: 'expense', day, actor: 'admin', amount: net, cash: 0n, shift: null });
      }
      const current = events.filter(e => e.shift === shiftId);
      const cash = 100000001n + current.reduce((n, e) => n + (e.type === 'sale' ? e.cash : -(e.cash || 0n)), 0n);
      eq(cents(a.expected()), cash, 'Caja por movimiento real de efectivo');
      eq(cents(a.shiftAmounts(a.db().shift).expected), cash, 'Resumen de turno');
      a.setUser('vendedor1'); const difference = BigInt(random(3) - 1) * 100n;
      await a.closeCurrentShift(shiftId, Number(cash + difference) / 100, difference ? 'QA diferencia de conteo' : 'QA cuadrado');
      a.setUser('gerente'); await a.reviewShiftClosure(shiftId, true);
      eq(cents(a.db().shift.closure.expected), cash, 'Cierre preserva esperado');
      eq(cents(a.db().shift.closure.count) - cash, difference, 'Sobrante/faltante de cierre');
      shifts.push({ id: shiftId, cash }); await a.programNextShift(shiftId);
      inventoryCheck();
    }
    if (dayIndex % 50 === 49) console.log('Historial financiero: ' + (dayIndex + 1) + '/400 días');
  }
  function expectedReport(filter) {
    const valid = e => (filter.user === 'all' || filter.user === e.actor) && (filter.period === 'global' || filter.period === 'day' && e.day === filter.date || filter.period === 'month' && e.day.slice(0, 7) === filter.month || filter.period === 'half' && e.day.slice(0, 7) === filter.month && (Number(e.day.slice(8)) <= 15 ? '1' : '2') === filter.half);
    const rows = events.filter(valid), sum = (type, key = 'amount') => rows.filter(e => e.type === type).reduce((n, e) => n + e[key], 0n);
    const sales = sum('sale'), refunds = sum('refund'), cost = sum('sale', 'cost') - sum('refund', 'cost'), expenses = sum('expense'), investment = sum('purchase'), netSales = sales - refunds, gross = netSales - cost;
    return { sales, refunds, cost, expenses, investment, netSales, gross, net: gross - expenses };
  }
  let reportCount = 0;
  for (const user of ['all', 'admin', 'gerente', 'vendedor1', 'vendedor2']) {
    const filters = [{ period: 'global', user }, ...days.map(date => ({ period: 'day', date, user })), ...[...months].flatMap(month => [{ period: 'month', month, user }, { period: 'half', month, half: '1', user }, { period: 'half', month, half: '2', user }])];
    for (const filter of filters) {
      a.setFilter(filter); const actual = a.reportMetrics(a.reportData()), expected = expectedReport(filter);
      for (const key of Object.keys(expected)) eq(cents(actual[key]), expected[key], 'Reporte ' + JSON.stringify(filter) + ' · ' + key);
      eq(actual.missing, 0, 'Costos conocidos en escenario'); reportCount++;
    }
  }
  // UTC midnight still belongs to the prior Colombian day; leap day is included by daily/monthly checks.
  h.at('2025-02-04T02:00:00Z'); await open(a, '2025-02-03'); a.setUser('vendedor1');
  const midnight = await a.registerShiftSale({ shiftId: a.db().shift.id, cart: { '4:unit': 1 }, method: 'Transferencia' });
  eq(midnight.date, '2025-02-03', 'Medianoche UTC no cambia el día de Colombia');
  a.setUser('admin');
  const backup = await a.makeBackup(), inspected = await a.inspectBackup(JSON.stringify(backup));
  eq(JSON.stringify(inspected.data), JSON.stringify(a.db()), 'Respaldo íntegro del historial largo');
  return { seed: 20261023, from: days[0], to: days.at(-1), days: days.length, months: months.size, shifts: shifts.length, sales: sales.length, purchases: events.filter(e => e.type === 'purchase').length, expensesIncludingPayroll: events.filter(e => e.type === 'expense').length, payroll: a.db().payroll.length, refunds: refundCounts, reports: reportCount, totalsCents: Object.fromEntries(Object.entries(expectedReport({ period: 'global', user: 'all' })).map(([k, v]) => [k, v.toString()])), differenceCents: 0 };
}
(async () => {
  const edge = await boundaries(), long = await history();
  const result = { passed: true, elapsedSeconds: Math.round((Date.now() - startedAt) / 1000), assertions, boundaries: edge, history: long };
  fs.mkdirSync('.artifacts/test-results', { recursive: true });
  fs.writeFileSync('.artifacts/test-results/financial-audit.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exit(1); });
