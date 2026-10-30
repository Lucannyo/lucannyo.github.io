const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() {
    this.attributes = {};
    this.dataset = {};
    this.children = [];
    const values = new Set();
    this.classList = {
      add: value => values.add(value),
      remove: value => values.delete(value),
      contains: value => values.has(value),
      toggle: value => values.has(value) ? (values.delete(value), false) : (values.add(value), true)
    };
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') String(value).split(' ').forEach(this.classList.add);
  }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) { delete this.attributes[name]; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, listener) { this[name] = listener; }
  querySelectorAll(selector) { return this.children.filter(child => selector === '.slice' && child.classList.contains('slice')); }
}

const ids = Object.fromEntries(['slices', 'dice', 'resultCopy', 'roll', 'quantity', 'selectionStatus'].map(id => [id, new Element()]));
ids.quantity.value = '1';
const choices = [4, 6, 8, 10, 12, 20].map(sides => {
  const button = new Element();
  button.dataset.sides = sides;
  return button;
});
const document = {
  querySelector: selector => ids[selector.slice(1)],
  querySelectorAll: () => choices,
  createElementNS: () => new Element(),
  createElement: () => new Element(),
  createTextNode: text => ({ textContent: text })
};
const frames = [];
let randomState = 7;
const context = vm.createContext({
  document,
  Math: Object.assign(Object.create(Math), { random: () => (randomState = (randomState * 1664525 + 1013904223) >>> 0) / 4294967296 }),
  performance: { now: () => 0 },
  requestAnimationFrame: callback => frames.push(callback)
});
const html = fs.readFileSync('index.html', 'utf8');
assert.match(html, /id="quantity"[^>]*min="1"[^>]*max="10"/);
assert.match(html, /id="selectionStatus"/);
vm.runInContext(fs.readFileSync('app.js', 'utf8'), context);

const slices = ids.slices.querySelectorAll('.slice');
assert.equal(slices.length, 8);
slices[2].click();
assert.deepEqual(slices.map(slice => slice.getAttribute('aria-pressed')), ['false', 'false', 'true', 'true', 'true', 'true', 'true', 'true']);
assert.equal(ids.selectionStatus.textContent, 'Setores selecionados: 3, 4, 5, 6, 7, 8.');
slices[7].keydown({ key: 'Enter', preventDefault() {} });
assert.deepEqual(slices.map(slice => slice.getAttribute('aria-pressed')), ['false', 'false', 'false', 'false', 'false', 'false', 'false', 'true']);
slices[2].click();

const a = { x: 150, y: 160, vx: 2, vy: 0 };
const b = { x: 190, y: 160, vx: -2, vy: 0 };
vm.runInContext('separate', context)(a, b);
assert.ok(b.x - a.x >= 54, 'colliding dice separate');
assert.ok(a.vx < 0 && b.vx > 0, 'colliding dice rebound');

for (const button of choices) {
  button.click();
  for (let total = 1; total <= 10; total++) {
    ids.quantity.value = String(total);
    ids.quantity.change();
    ids.roll.click();
    assert.equal(ids.dice.children.length, total);
    assert.equal(ids.roll.disabled, true);
    for (let time = 17; frames.length && time < 4000; time += 17) {
      frames.shift()(time);
      const positions = ids.dice.children.map(die => {
        const [, x, y] = die.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
        for (let side = 0; side < 8; side++) {
          const angle = (-90 + side * 45) * Math.PI / 180;
          const distance = (x - 160) * Math.cos(angle) + (y - 160) * Math.sin(angle);
          assert.ok(distance <= 148 * Math.cos(Math.PI / 8) - 27 + 0.01, 'die stays inside octagon');
        }
        return [Number(x), Number(y)];
      });
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const distance = Math.hypot(positions[i][0] - positions[j][0], positions[i][1] - positions[j][1]);
          assert.ok(distance >= 53.5, `dice ${i}, ${j} stay separate at ${time} ms: ${distance}`);
        }
      }
    }
    assert.equal(frames.length, 0);
    assert.equal(ids.roll.disabled, false);
    assert.equal(slices[3].classList.contains('selected'), true, 'selection persists');
    assert.ok(slices.some(slice => slice.classList.contains('landed')));
    for (const die of ids.dice.children) {
      const value = Number(die.children[1].textContent);
      assert.ok(value >= 1 && value <= button.dataset.sides);
      const [, x, y] = die.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
      const sector = vm.runInContext('sectorAt', context)(Number(x), Number(y));
      assert.equal(slices[sector - 1].classList.contains('landed'), true);
      assert.equal(die.classList.contains('hit'), sector >= 3, 'only dice in selected sectors stand out');
    }
  }
}

slices[7].click();
assert.ok(ids.dice.children.every(die => die.classList.contains('hit') === (Number(die.dataset.sector) === 8)), 'changing selection updates existing dice');

ids.quantity.value = '10';
ids.roll.click();
for (let time = 100; frames.length && time <= 2800; time += 100) frames.shift()(time);
assert.equal(frames.length, 0, 'slow frames must not stretch the roll beyond its duration');

ids.quantity.value = '42';
ids.quantity.change();
assert.equal(ids.quantity.value, 10);
console.log('Six die types, 1–10 dice, sector selection, wall and die collisions pass.');
