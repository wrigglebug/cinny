import {
  MultiToken,
  Options,
  State,
  createTokenClass,
  find,
  init,
  multi,
  options as baseOptions,
  regexp,
  registerCustomProtocol,
  registerPlugin,
  registerTokenPlugin,
  reset,
  stringToArray,
  test,
  text,
  tokenize,
} from 'linkifyjs/dist/linkify.mjs';

export const options = {
  ...baseOptions,
  assign: Object.assign,
};

export {
  MultiToken,
  Options,
  State,
  createTokenClass,
  find,
  init,
  multi,
  regexp,
  registerCustomProtocol,
  registerPlugin,
  registerTokenPlugin,
  reset,
  stringToArray,
  test,
  text,
  tokenize,
};

export type { IntermediateRepresentation, OptFn, Opts } from 'linkifyjs/dist/linkify.d.mts';
