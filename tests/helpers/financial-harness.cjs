const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const tail = 'ensurePeople();prepareColposProfile();clearInventoryForTesting();await loadCatalogScenario();await ensureVoucherCodes();await shortenVoucherCodes();startDailyBackups();login();if(catalogLoadError)notify(catalogLoadError,true);})();';
module.exports = async function harness() {
  const input = fs.readFileSync('.build/demo-check.js', 'utf8');
  if (!input.includes(tail)) throw Error('Inicio de aplicación inesperado');
  let clock = Date.parse('2024-01-01T13:00:00Z'), fault = false;
  class TestDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
  }
  const store = new Map();
  const context = {
    crypto: webcrypto, TextEncoder, Uint8Array, Intl, Date: TestDate, Math, JSON, Map, Set, console,
    localStorage: {
      getItem: key => store.get(key) || null,
      setItem: (key, value) => { if (fault) { fault = false; throw Error('Fallo simulado de almacenamiento'); } store.set(key, value); }
    },
    document: { querySelector: () => ({ textContent: '', className: '', hidden: true }) },
    setTimeout: () => 0, clearTimeout() {}
  };
  context.globalThis = context;
  vm.createContext(context);
  // Exercise the application's functions; only skip UI startup and automatic catalog seeding.
  const program = input.replace(tail, `globalThis.api={
    init:()=>{ensurePeople();db.expenses=[];db.purchases=[];db.payroll=[];db.returns=[];db.logs=[];db.backupPolicy={enabled:false};rememberSharedState();persist();},
    db:()=>db,setUser:id=>{user=db.users.find(u=>u.id===id);user.mustChangePassword=false;},persist,
    registerShiftSale,requestReturn,approveReturn,rejectReturn,payReturn,expected,shiftAmounts,
    saveShiftConfiguration,openApprovedShift,closeCurrentShift,reviewShiftClosure,programNextShift,
    reportData,reportMetrics,reportRange,setFilter:f=>reportFilter=f,captureVoucher,sealVoucher,verifyVoucherCode,
    purchase:input=>registerPurchase(input),expense:input=>registerExpense(input),payroll:input=>registerPayroll(input),
    makeBackup,inspectBackup,restoreBackup,
    gateBeforeSeal:wait=>{const original=sealVoucher;sealVoucher=async(...args)=>{await wait();return original(...args);};}
  };})();`);
  await vm.runInContext(program, context);
  const api = context.api;
  api.init();
  return { api, at: value => { clock = Date.parse(value); }, failWrite: () => { fault = true; },
    stored: () => store.get('margaret-demo-v1') };
};
