#!/usr/bin/env node
'use strict';
// Cầu nối 2.0: máy đã lắp hook SessionStart trỏ vào đường dẫn cũ (07-cai-dat/muc-may/) vẫn chạy.
// Bản thật ở 07-install/machine/. Chạy lại `node 07-install/machine/cai-muc-may.cjs --ap-dung` để trỏ thẳng; bỏ cầu nối ở 3.0.0.
require('../../07-install/machine/kiem-project-harness.cjs');
