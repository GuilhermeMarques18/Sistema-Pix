const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

const root = path.join(__dirname, '../src/app/features/extrato/pix-send');
const account = { id: 'source', status: 'ATIVA', availableBalance: 10, blockedBalance: 0, pixLimit: 1000 };
const calls = [];
let fail = false;
const service = {
  resolveRecipient: async () => ({ chave: 'key', tipo: 'EMAIL', contaDestinoId: 'target', nome: 'Pessoa', documentoMascarado: null }),
  schedulePix: async (payload) => { calls.push(['scheduled', payload]); if (fail === 'unknown') throw new Error('network'); if (fail) throw { isAxiosError: true, response: { status: 400 } }; return {}; },
  sendPix: async (payload) => { calls.push(['immediate', payload]); return { idTransacao: 'id' }; },
};
const mocks = {
  '@/app/core/auth/SessionProvider': { useSession: () => ({ account }) },
  '@/app/shared/services/user.service': { userService: { getMyAccount: async () => account } },
  '@/app/shared/lib/apiError': { getApiErrorMessage: () => 'Erro da API' },
  '@/app/shared/lib/pixKey': { normalizePixKey: (_, key) => key },
  '../services/pix-send.service': { pixSendService: service },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.hasOwn(mocks, request)) return mocks[request];
  return originalLoad.call(this, request, parent, isMain);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
require.extensions['.tsx'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
global.crypto = require('node:crypto').webcrypto;
const storage = new Map();
global.sessionStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
const { useSendPix } = require(path.join(root, 'hooks/useSendPix.ts'));

test('agendamento valida data futura e envia contrato separado sem exigir saldo atual', async () => {
  let flow;
  function Harness() { flow = useSendPix(undefined, true); return null; }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Harness)); });
  await act(async () => { await flow.submitKey('key', 'EMAIL'); });
  act(() => flow.submitValor(20, '', '2020-01-01T10:00'));
  assert.match(flow.error, /data e hora futuras/);
  assert.equal(flow.step, 'confirmar-conta');
  const future = new Date(Date.now() + 86400000);
  const local = new Date(future.getTime() - future.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  act(() => flow.submitValor(20, 'teste', local));
  assert.equal(flow.step, 'confirmar-valor');
  await act(async () => { await flow.submitSenha('123456'); });
  assert.equal(flow.step, 'sucesso');
  assert.equal(calls[0][0], 'scheduled');
  assert.equal(calls[0][1].scheduledAt, new Date(local).toISOString());
  assert.equal(calls[0][1].valor, '20.00');
  assert.equal(calls[0][1].descricao, 'teste');
  assert.ok(calls[0][1].idempotencyKey);
  renderer.unmount();
});

test('erro de agendamento permanece no fluxo e Pix imediato usa endpoint original', async () => {
  calls.length = 0;
  let flow;
  function Harness({ scheduled }) { flow = useSendPix(undefined, scheduled); return null; }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Harness, { scheduled: true })); });
  await act(async () => { await flow.submitKey('key', 'EMAIL'); });
  const future = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  act(() => flow.submitValor(1, '', future));
  fail = true;
  await act(async () => { await flow.submitSenha('123456'); });
  assert.equal(flow.error, 'Erro da API');
  assert.notEqual(flow.step, 'sucesso');
  fail = false;
  renderer.unmount();
  await act(async () => { renderer = create(React.createElement(Harness, { scheduled: false })); });
  await act(async () => { await flow.submitKey('key', 'EMAIL'); });
  act(() => flow.submitValor(1, ''));
  await act(async () => { await flow.submitSenha('123456'); });
  assert.equal(calls[1][0], 'immediate');
  assert.equal(calls[1][1].scheduledAt, undefined);
  assert.equal(flow.step, 'sucesso');
  renderer.unmount();
});

test('resultado incerto permite replay após a data e reabertura, preservando o pedido', async () => {
  calls.length = 0;
  let flow;
  function Harness() { flow = useSendPix(undefined, true); return null; }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Harness)); });
  await act(async () => { await flow.submitKey('key', 'EMAIL'); });
  act(() => flow.submitValor(1, '', new Date(Date.now() + 86400000).toISOString().slice(0, 16)));
  fail = 'unknown';
  await act(async () => { await flow.submitSenha('123456'); });
  assert.equal(flow.outcomeUnknown, true);
  assert.equal(JSON.stringify([...storage.values()]).includes('123456'), false);
  const original = calls[0][1];
  renderer.unmount();
  const now = Date.now;
  Date.now = () => Date.parse(original.scheduledAt) + 60000;
  await act(async () => { renderer = create(React.createElement(Harness)); });
  assert.equal(flow.step, 'digitar-senha');
  assert.equal(flow.outcomeUnknown, true);
  fail = true;
  await act(async () => { await flow.submitSenha('123456'); });
  assert.equal(flow.outcomeUnknown, true);
  assert.equal(storage.size, 1);
  fail = false;
  await act(async () => { await flow.submitSenha('123456'); });
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[1][1], original);
  assert.deepEqual(calls[2][1], original);
  assert.equal(flow.step, 'sucesso');
  assert.equal(storage.size, 0);
  Date.now = now;
  renderer.unmount();
  storage.clear();
});

test('serviço de agendamento envia os campos para o endpoint combinado', async () => {
  let request;
  mocks['@/app/core/http'] = { api: { post: async (url, payload) => { request = { url, payload }; return { data: {} }; } } };
  const { pixSendService } = require(path.join(root, 'services/pix-send.service.ts'));
  const payload = { chavePix: 'key', tipoChave: 'EMAIL', contaDestinoId: 'target', valor: '1.00', descricao: null, password: '123456', idempotencyKey: 'id', scheduledAt: '2030-01-01T10:00:00.000Z' };
  await pixSendService.schedulePix(payload);
  assert.equal(request.url, '/api/pix/scheduled-transactions');
  assert.deepEqual(request.payload, payload);
});

test('tela de senha permite tentar novamente um agendamento incerto', async () => {
  mocks['@/app/shared/components/ui'] = { BackButton: 'button' };
  mocks['@/app/shared/components/ui/button'] = { Button: 'button' };
  mocks['@/app/shared/components/ui/input'] = { Input: 'input' };
  const { StepDigitarSenha } = require(path.join(root, 'components/StepDigitarSenha.tsx'));
  let submitted;
  let renderer;
  await act(async () => { renderer = create(React.createElement(StepDigitarSenha, {
    onConfirm: async (password) => { submitted = password; }, onBack: () => {}, onClose: () => {},
    isLoading: false, outcomeUnknown: true, error: null, scheduled: true,
  })); });
  act(() => renderer.root.findByType('input').props.onChange({ target: { value: '123456' } }));
  const button = renderer.root.findAllByType('button').find((item) => item.props.type === 'submit');
  assert.equal(button.props.disabled, false);
  assert.equal(button.children.join(''), 'Consultar ou concluir agendamento');
  await act(async () => { renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }); });
  assert.equal(submitted, '123456');
  assert.equal(renderer.root.findByType('input').props.value, '');
  renderer.unmount();
});

test('PIX imediato envia localização do navegador quando autorizada', async () => {
  calls.length = 0;
  fail = false;
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      geolocation: {
        getCurrentPosition(success) {
          success({ coords: { latitude: -23.55, longitude: -46.63, accuracy: 18 } });
        },
      },
    },
  });
  let flow;
  function Harness() { flow = useSendPix(); return null; }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Harness)); });
  await act(async () => { await flow.submitKey('key', 'EMAIL'); });
  act(() => flow.submitValor(1, 'teste'));
  await act(async () => { await flow.submitSenha('123456'); });
  assert.deepEqual(calls[0][1].location, {
    latitude: -23.55, longitude: -46.63, accuracyMeters: 18, source: 'BROWSER',
  });
  assert.equal(flow.locationStatus, 'captured');
  renderer.unmount();
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else delete globalThis.navigator;
});

test('PIX agendado continua sem localização quando a permissão é negada', async () => {
  calls.length = 0;
  fail = false;
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      geolocation: {
        getCurrentPosition(_success, failure) {
          failure({ code: 1 });
        },
      },
    },
  });
  let flow;
  function Harness() { flow = useSendPix(undefined, true); return null; }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Harness)); });
  await act(async () => { await flow.submitKey('key', 'EMAIL'); });
  act(() => flow.submitValor(1, '', new Date(Date.now() + 86400000).toISOString().slice(0, 16)));
  await act(async () => { await flow.submitSenha('123456'); });
  assert.equal(calls[0][0], 'scheduled');
  assert.equal(calls[0][1].location, undefined);
  assert.equal(flow.locationStatus, 'denied');
  assert.match(flow.locationMessage, /PIX continuará normalmente/);
  renderer.unmount();
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else delete globalThis.navigator;
});