import '@testing-library/jest-dom'

import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;



