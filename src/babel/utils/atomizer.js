const fnv1a = require('fnv1a');

const id = seed => 'x' + fnv1a(seed).toString(36);
const hyphenate = s => s.replace(/[A-Z]|^ms/g, '-$&').toLowerCase();

const createRule = (key, value, media) => {
  const hyphenated = hyphenate(key);
  const cssText = hyphenated + ':' + value;
  return {
    key: hyphenated,
    value,
    media,
    cssText: media ? media + '{' + cssText + '}' : cssText,
  };
};

const AT_REG = /^@/;
const AMP = /&/g;

const parse = (obj, children = '', media = '') => {
  const rules = [];

  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === undefined) continue;
    switch (typeof value) {
      case 'object':
        if (AT_REG.test(key)) {
          rules.push(...parse(value, children, key));
        } else {
          const child = key.replace(AMP, '');
          rules.push(...parse(value, children + child, media));
        }
        continue;
      case 'number':
      case 'string':
        const className = id(key + value + children + media);
        const rule = createRule(key, value, media);
        rules.push([className, rule]);
    }
  }

  return rules;
};

module.exports = (obj = {}) => parse(obj);