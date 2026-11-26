const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

const calls = [];
const service = {
  list: async (filters) => {
    calls.push(filters);
    const login = filters.category === 'LOGIN';
    return {
      content: [{
        id: 'event-1',
        category: filters.category,
        eventType: login ? 'LOGIN_FAILED' : 'PIX_SENT',
        status: login ? 'FAILURE' : 'SUCCESS',
        description: login ? 'Tentativa de login malsucedida.' : 'Transferência Pix realizada.',
        ipAddress: '203.0.113.8',
        userAgent: 'SistemaPixTest/1.0',
        createdAt: '2026-01-10T12:00:00Z',
      }],
      number: filters.page,
      first: true,
      last: true,
      totalPages: 1,
      totalElements: 1,
    };
  },
};
const mocks = {
  '@/app/shared/components/ui/button': { Button: 'button' },
  '@/app/shared/components/ui/input': { Input: 'input' },
  '@/app/shared/components/ui/page-header': {
    PageHeader: ({ title, subtitle }) => React.createElement('header', null, title, subtitle),
  },
  '@/app/shared/lib/apiError': { getApiErrorMessage: () => 'Erro ao carregar' },
  '../services/activityHistory.service': { activityHistoryService: service },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.hasOwn(mocks, request)) return mocks[request];
  return originalLoad.call(this, request, parent, isMain);
};
require.extensions['.ts'] = (module, filename) => module._compile(
  ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  filename,
);
require.extensions['.tsx'] = (module, filename) => module._compile(
  ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText,
  filename,
);

const pagePath = path.join(__dirname, '../src/app/features/activity-history/pages/ActivityHistoryPage.tsx');
const { ActivityHistoryPage } = require(pagePath);

test('mostra status e origem do histórico e permite alternar para atividades', async () => {
  calls.length = 0;
  let renderer;
  await act(async () => { renderer = create(React.createElement(ActivityHistoryPage)); });

  const initialText = JSON.stringify(renderer.toJSON());
  assert.match(initialText, /Tentativa de login malsucedida/);
  assert.match(initialText, /203\.0\.113\.8/);
  assert.match(initialText, /SistemaPixTest\/1\.0/);
  assert.match(initialText, /Falhou/);

  const activitiesTab = renderer.root.findAllByType('button')
    .find((button) => button.children.join('') === 'Atividades');
  await act(async () => { activitiesTab.props.onClick(); });
  assert.equal(calls.at(-1).category, 'ACTIVITY');
  assert.match(JSON.stringify(renderer.toJSON()), /Transferência Pix realizada/);
  renderer.unmount();
});
