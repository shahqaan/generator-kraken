/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2016 PayPal                                                  │
 │                                                                             │
 │hh ,'""`.                                                                    │
 │  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
 │  |(@)(@)|  you may not use this file except in compliance with the License. │
 │  )  __  (  You may obtain a copy of the License at                          │
 │ /,'))((`.\                                                                  │
 │(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
 │ `\ `)(' /'                                                                  │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/
/*global describe, it*/

'use strict';


var assert = require('assert'),
    testutil = require('./util'),
    resolve = require('resolve'),
    path = require('path');


describe('kraken:app', function () {
    // Disable timeout since we're doing a full install
    this.timeout(0);

    it('scaffolded application can run the build task', function (done) {
        var base = testutil.makeBase('app');

        base.options['skip-install'] = false;
        base.prompt.i18n = 'i18n';

        testutil.run(base, function (err) {
            if (err) {
                return done(err);
            }
            var build = require('child_process').spawn('npm', ['run', 'all'], {stdio: 'inherit'});
            build.on('close', function(code) {
                assert.strictEqual(code, 0);
                done(err);
            });
        });
    });

    it('scaffolded application with makara 2 can run the build task', function (done) {
        var base = testutil.makeBase('app');

        base.options['skip-install'] = false;
        base.prompt.templateModule = 'makara';
        base.prompt.i18n = 'i18n';

        testutil.run(base, function (err) {
            if (err) {
                return done(err);
            }
            var build = require('child_process').spawn('npm', ['run', 'all'], {stdio: 'inherit'});
            build.on('close', function(code) {
                assert.strictEqual(code, 0);
                done(err);
            });
        });
    });

    it('scaffolded application with makara 2 can run the build task and test in production mode', function (done) {
        var base = testutil.makeBase('app');

        base.options['skip-install'] = false;
        base.prompt.templateModule = 'makara';
        base.prompt.i18n = 'i18n';

        var env = {};
        for (var v in process.env) {
            env[v] = process.env[v];
        }

        env.NODE_ENV = 'production';

        testutil.run(base, function (err) {
            if (err) {
                return done(err);
            }
            var build = require('child_process').spawn('npm', ['run', 'all'], {stdio: 'inherit', env: env});
            build.on('close', function(code) {
                assert.strictEqual(code, 0);
                done(err);
            });
        });
    });
    it('scaffolded application with no bower using requirejs runs postinstall task', function (done) {
        var base = testutil.makeBase('app');

        base.options['skip-install'] = false;
        base.prompt.templateModule = 'makara';
        base.prompt.i18n = 'i18n';
        base.prompt.componentPackager = false;
        base.prompt.jsModule = 'requirejs';
        
        var env = {};
        for (var v in process.env) {
            env[v] = process.env[v];
        }

        testutil.run(base, function (err) {
            if (err) {
                return done(err);
            }
            var build = require('child_process').spawn('npm', ['run', 'all'], {stdio: 'inherit', env: env});

            build.on('close', function (code) {
                assert.file([
                    'public/components/requirejs/require.js',
                    'tasks/copy-browser-modules.js'
                ]);
                assert.noFile([
                    '.bowerrc'
                ]);
                assert.fileContent([
                    ['package.json', new RegExp(/(browserPackage)/)],
                    ['package.json', new RegExp(/(overrides)/)],
                    ['Gruntfile.js', new RegExp(/(postinstall.+copy\-browser\-modules)/)]
                ]);
                assert.strictEqual(code, 0);
                done(err);
            });
        });
    });
    it('scaffolded application does not suffer from dll hell with dust-helpers', function (done) {
        var base = testutil.makeBase('app');

        base.options['skip-install'] = false;
        base.prompt.templateModule = 'dustjs';

        testutil.run(base, function (err) {

            var basedir = process.cwd();
            var dustPath = resolve.sync('dustjs-linkedin', {basedir: basedir});
            var helpersPath = resolve.sync('dustjs-helpers', {basedir: basedir});
            var helpersDir = path.dirname(helpersPath);
            var helpersDustPath = resolve.sync('dustjs-linkedin', {basedir: helpersDir});

            assert(dustPath === helpersDustPath);
            done(err);
        });
    });

});
