import { describe, expect, it } from 'vitest';
import { createSeed } from './seed';
import { reducer, publicMessages, hasSafetyAlert } from './store';

describe('service demo business boundaries', () => {
  it('does not execute a proposal before approval', () => {
    const initial = createSeed();
    expect(reducer(initial, { type: 'EXECUTE', caseId: 'c1' })).toEqual(initial);
  });
  it('keeps approval separate from execution and produces only one receipt', () => {
    let state = reducer(createSeed(), { type: 'JOIN', caseId: 'c1' });
    state = reducer(state, { type: 'PROPOSE', caseId: 'c1' });
    state = reducer(state, { type: 'APPROVE', caseId: 'c1' });
    expect(state.cases[0].action?.status).toBe('APPROVED');
    expect(state.cases[0].action?.receipt).toBeUndefined();
    state = reducer(state, { type: 'EXECUTE', caseId: 'c1' });
    expect(state.cases[0].action?.receipt).toMatch(/^DEMO-/);
    expect(reducer(state, { type: 'EXECUTE', caseId: 'c1' })).toEqual(state);
  });
  it('never executes a rejected action', () => {
    let state = reducer(createSeed(), { type: 'JOIN', caseId: 'c1' });
    state = reducer(state, { type: 'PROPOSE', caseId: 'c1' });
    state = reducer(state, { type: 'REJECT', caseId: 'c1' });
    expect(reducer(state, { type: 'EXECUTE', caseId: 'c1' })).toEqual(state);
  });
  it('filters internal notes from customer messages', () => {
    const state = reducer(createSeed(), { type: 'MESSAGE', caseId: 'c1', role: 'staff', visibility: 'internal', text: '内部核验条件' });
    expect(state.cases[0].messages.some(m => m.text === '内部核验条件')).toBe(true);
    expect(publicMessages(state.cases[0]).some(m => m.text === '内部核验条件')).toBe(false);
  });
  it('blocks public AI replies after human collaboration begins', () => {
    const state = reducer(createSeed(), { type: 'JOIN', caseId: 'c1' });
    expect(reducer(state, { type: 'MESSAGE', caseId: 'c1', role: 'ai', visibility: 'public', text: '未经审核的草稿' })).toEqual(state);
  });
  it('does not archive an unverified outcome', () => {
    expect(reducer(createSeed(), { type: 'VERIFY', caseId: 'c1', solved: true }).cases[0].stage).not.toBe('resolved');
  });
  it('allows the customer to reopen a result that failed verification', () => {
    let state = reducer(createSeed(), { type: 'JOIN', caseId: 'c1' });
    for (const type of ['PROPOSE', 'APPROVE', 'EXECUTE'] as const) state = reducer(state, { type, caseId: 'c1' });
    state = reducer(state, { type: 'VERIFY', caseId: 'c1', solved: false });
    expect(state.cases[0].stage).toBe('collaborating');
    expect(state.cases[0].activity.at(-1)?.text).toContain('继续服务');
  });
  it.each(['CO_SERVICE', 'HUMAN_LEAD'] as const)('recognizes customer safety reports in %s without publishing an AI reply', mode => {
    let state = reducer(createSeed(), { type: 'MODE', caseId: 'c1', mode });
    const before = state.cases[0].messages.filter(m => m.role === 'ai').length;
    state = reducer(state, { type: 'MESSAGE', caseId: 'c1', role: 'customer', visibility: 'public', text: '设备突然发热，还出现了异味。' });
    expect(hasSafetyAlert(state.cases[0])).toBe(true);
    expect(state.cases[0].messages.filter(m => m.role === 'ai').length).toBe(before);
  });
  it('does not mistake an explicit denial for a positive safety report', () => {
    expect(hasSafetyAlert(createSeed().cases[0])).toBe(false);
    const state = reducer(createSeed(), { type: 'MESSAGE', caseId: 'c1', role: 'customer', visibility: 'public', text: '没有异常发热、鼓包或异味，接口正常。' });
    expect(hasSafetyAlert(state.cases[0])).toBe(false);
  });
});
