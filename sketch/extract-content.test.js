(function(url, list, callback) {
    var A = {
        filter: Array.filter || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != "function") {
                throw new TypeError('A.filter: not a function');
            }
            var rv = new Array();
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self) {
                    var val = self[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, self)) rv.push(val);
                }
            }
            return rv;
        },
        reduce: Array.reduce || function(self, fun/*, initial*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw TypeError('A.reduce: not a function ');
            }
            var i = 0;
            var prev;
            if (arguments.length > argi) {
                var rv = arguments[argi++];
            } else {
                do {
                    if (i in self) {
                        rv = self[i++];
                        break;
                    }
                    if (++i >= len) {
                        throw new TypeError('A.reduce: empty array');
                    }
                } while (true);
            }
            for (; i < len; i++) {
                if (i in self) rv = fun.call(null, rv, self[i], i, self);
            }
            return rv;
        }
    };

    var Libs = function(/*[url,] context*/) {
        var i = 0;
        var self = {
            url: (typeof arguments[i]=='string' && arguments[i++]) || '',
            l: arguments[i] || (function(){return this;}).apply(null)
        };

        self.load = function(src/*, cache*/) {
            tag = document.createElement('script');
            tag.type = 'text/javascript';
            var del = src.match(/\?/) ? '&' : '?';
            tag.src = arguments[1] ? src : src + del + encodeURI(new Date());
            document.getElementsByTagName('head')[0].appendChild(tag);
        };

        self.loadEach = function(/*[dir,] arr, callback, cache*/) {
            var i=0;
            var dir = (typeof arguments[i]=='string' && arguments[i++])
                || self.url;
            var arr = arguments[i++];
            var f = arguments[i++] || function(){};
            if (!arr.length) { f(self.l); return; }
            var cache = arguments[i++];
            var [script, cond] = arr.shift();
            self.load(dir + script, cache);
            self.wait(cond instanceof Array ? cond : [cond],
                      function(){self.loadEach(dir,arr,f,cache)});
        };

        self.wait = function(conds, callback/*, timeout*/) {
            var t = arguments[2] || 100;
            self._wait(conds, callback, self.l, t, 0);
        };

        self._wait = function(conds, callback, l, tt, t) {
            var f = function(v) {
                var r = function(p,c){return p && p[c];};
                return typeof v=='function'
                    ? v(l) : A.reduce(v.split('.'), r,l);
            };
            if (conds.every(f)) {
                callback(l);
            } else if (t++ < tt) {
                var next = function(){self._wait(conds,callback,l,tt,t);};
                window.setTimeout(next, 100);
            } else {
                var reason = A.filter(conds, function(item){return !f(item);});
                throw('Libs.wait: timeout - ' + reason.toString() + ' failed');
            }
        };

        return self;
    };

    var i=0;
    new Libs(url, null).loadEach(list, callback);
})('http://labs.orezdnu.org/js/', [
    [ 'extract-content.js', 'WWW.LayeredExtractor' ]
], function(l) {
    var Util = {
        inherit: function(child,parent) {
            var obj = child || {};
            for (var prop in parent) {
                if (typeof obj[prop] == 'undefined') {
                    obj[prop] = parent[prop];
                }
            }
            return obj;
        },
        countMatch: function(text, regex) {
            return text.split(regex).length - 1;
            //             var n=0;
            //             for (var i=0;;) {
            //                 i = text.search(regex);
            //                 if (i < 0) break;
            //                 n++;
            //                 text = text.substr(i+1);
            //             }
            //             return n;
        },
        dump: function(obj) {
            if (typeof obj == 'undefined')  return 'undefined';
            if (typeof obj == 'string') return '"' + obj + '"';
            if (typeof obj != 'object') return ''+obj;
            if (obj === null) return 'null';
            if (obj instanceof Array) {
                return '['
                    + obj.map(function(v){return 'obj'/*Util.dump(v)*/;}).join(',')
                    + ']';
            } else {
                var arr = [];
                for (var prop in obj) {
                    arr.push(prop + ':' + 'obj'/*Util.dump(obj[prop])*/);
                }
                return '{' + arr.join(',') + '}';
            }
        }
    };

    var A = {
        indexOf: Array.indexOf || function(self, elt/*, from*/) {
            var argi = 2;
            var len = self.length;
            var from = Number(arguments[argi++]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) from += len;
            for (; from < len; from++) {
                if (from in self && self[from] === elt) return from;
            }
            return -1;
        },
        filter: Array.filter || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != "function") {
                throw new TypeError('A.filter: not a function');
            }
            var rv = new Array();
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self) {
                    var val = self[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, self)) rv.push(val);
                }
            }
            return rv;
        },
        forEach: Array.forEach ||  function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw new TypeError('A.forEach: not a function');
            }
            var thisp = arguments[argi++];
            for (var i=0; i < len; i++) {
                if (i in self) fun.call(thisp, self[i], i, self);
            }
        },
        every: Array.every || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw new TypeError('A.every: not a function');
            }
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self &&
                    !fun.call(thisp, self[i], i, self)) {
                    return false;
                }
            }
            return true;
        },
        map: Array.map || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw new TypeError('A.map: not a function');
            }
            var rv = new Array(len);
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self) {
                    rv[i] = fun.call(thisp, self[i], i, self);
                }
            }
            return rv;
        },
        some: Array.some || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != "function") {
                throw new TypeError('A.some: not a function');
            }
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self &&
                    fun.call(thisp, self[i], i, self)) {
                    return true;
                }
            }
            return false;
        },
        reduce: Array.reduce || function(self, fun/*, initial*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw TypeError('A.reduce: not a function ');
            }
            var i = 0;
            var prev;
            if (arguments.length > argi) {
                var rv = arguments[argi++];
            } else {
                do {
                    if (i in self) {
                        rv = self[i++];
                        break;
                    }
                    if (++i >= len) {
                        throw new TypeError('A.reduce: empty array');
                    }
                } while (true);
            }
            for (; i < len; i++) {
                if (i in self) rv = fun.call(null, rv, self[i], i, self);
            }
            return rv;
        },
        zip: function(self) {
            if (self[0] instanceof Array) {
                var l = self[0].length;
                var len = self.length;
                var z = new Array(l);
                for (var i=0; i < l; i++) {
                    z[i] = [];
                    for (var j=0; j < len; j++) {
                        z[i].push(self[j][i]);
                    }
                }
                return z;
            }
            return [];
        },
        first: function(self) {
            return self ? self[0] : null;
        },
        last: function(self) {
            return self ? self[self.length-1] : null;
        },
        push: function(self, other) {
            return Array.prototype.push.apply(self, other);
        }
    };

    var DOM = {
        getElementStyle: function(elem, prop) {
            var style = elem.style ? elem.style[prop] : null;
            if (!style) {
                var dv = document.defaultView;
                if (dv && dv.getComputedStyle) {
                    try {
                        var styles = dv.getComputedStyle(elem, null);
                    } catch(e) {
                        return null;
                    }
                    prop = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                    style = styles ? styles.getPropertyValue(prop) : null;
                } else if (elem.currentStyle) {
                    style = elem.currentStyle[prop];
                }
            }
            return style;
        },
        text: function(node) {
            if (typeof node.textContent != 'undefined') {
                return node.textContent;
            } else if (node.nodeName == '#text') {
                return node.nodeValue;
            } else if (typeof node.innerText != 'undefined') {
                return node.innerText; // IE
            }
        },
        ancestors: function(e) {
            var body = e.ownerDocument.body;
            var r = [];
            var it = e;
            while (it != body) {
                r.push(it);
                it = it.parentNode;
            }
            r.push(body);
            return r; // [e .. document.body]
        },
        commonAncestor: function(e1, e2) {
            var a1 = DOM.ancestors(e1).reverse();
            var a2 = DOM.ancestors(e2).reverse();
            var r = null;
            for (var i=0; a1[i] && a2[i] && a1[i] == a2[i]; i++) {
                r = a1[i];
            }
            return r;
        },
        countMatchTagAttr: function(node, tag, attr, regexs) {
            var test = function(v){ return v.test(node[attr]); };
            if ((node.tagName||'').toLowerCase()==tag && A.some(regexs,test)) {
                return 1;
            }
            var n=0;
            var children = node.childNodes;
            for (var i=0, len=children.length; i < len; i++) {
                n += DOM.countMatchTagAttr(children[i], tag, attr, regexs);
            }
            return n;
        },
        matchTag: function(node, pat) {
            return A.some(pat, function(v){
                if (typeof v == 'string') {
                    return v == (node.tagName||'').toLowerCase();
                } else if (v instanceof Array) {
                    return v[0] == (node.tagName||'').toLowerCase()
                        && DOM.matchAttr(node, v[1]);
                } else {
                    return false;
                }
            });
        },
        matchAttr: function(node, pat) {
            var test = function(pat, val) {
                if (typeof pat == 'string') {
                    return pat == val;
                } else if (pat instanceof RegExp) {
                    return pat.test(val);
                } else if (pat instanceof Array) {
                    return A.some(pat,function(v){return test(v,val);});
                } else if (pat instanceof Object) {
                    for (var prop in pat) {
                        var n = node[prop];
                        if (n && DOM.matchAttr(n, pat[prop])) {
                            return true;
                        }
                    }
                }
                return false;
            };
            for (var prop in pat) {
                var attr = node[prop];
                var ar = pat[prop];
                if (attr) {
                    return test(ar, attr);
                }
            }
            return false;
        },
        matchStyle: function(node, pat) {
            var test = function(pat, val) {
                if (typeof pat == 'string') {
                    return pat == val;
                } else if (pat instanceof RegExp) {
                    return pat.test(val);
                } else if (pat instanceof Array) {
                    return A.some(pat,function(v){return test(v,val);});
                }
                return false;
            };
            for (var prop in pat) {
                if (test(pat[prop], DOM.getElementStyle(node, prop))) {
                    return true;
                }
            }
            return false;
        }
    };

    if (typeof l.extractContentTest == 'undefined') {
        var extractContentTest = {};
    }
    var debug = l.extractContentTest.debug;

    l.extractContentTest.extractContent = function(d) {
        if (!d.body) return null;

        if (l.extractContentTest.only == 'Heuristics') {
            // test only Heuristics handler
            var ex = new WWW.LayeredExtractor.Handler.Heuristics();
            ex.extract(d);
            var blocks = ex.blocks || [ ex.content.asLeaves() ];
            var div = d.createElement('div');
            var ul = d.createElement('ul');
            A.forEach(blocks, function(b) {
                var li = d.createElement('li');
                li.appendChild(d.createTextNode(b.score));
                var ul2 = d.createElement('ul');
                A.forEach(b.leaves, function(v){
                    v = v.node;
                    var s = v.tagName || DOM.text(v) || Util.dump(v);
                    s = s.replace(/\s+/g, '');
                    var li2 = d.createElement('li');
                    s = v.nodeName + ': ' + (s.length ? s : '<empty>');
                    li2.appendChild(d.createTextNode(s));
                    ul2.appendChild(li2);
                });
                li.appendChild(ul2);
                ul.appendChild(li);
            });
            div.appendChild(ul);
            return div;
        }

        /* TEST for layred handlers */

        var ex = new WWW.LayeredExtractor;
//         ex.addHandler( ex.factory.getHandler('Description') );
//         ex.addHandler( ex.factory.getHandler('Scraper'));
//         ex.addHandler( ex.factory.getHandler('GoogleAdsence') );
        ex.addHandler( ex.factory.getHandler('Heuristics') );
        var res = ex.extract(d);

        if (!res.isSuccess) {
            return d.createTextNode('failed');
        } else if (!debug) {
            if (l.extractContentTest.asText) {
                return d.createTextNode(res.content.asText());
            }
            var node = res.content.asNode();
            if (node != d.body) {
                return node.cloneNode(true);
            }
        } else { // debug
            var blocks = res.engine.blocks || [ res.content.asLeaves() ];
            var div = d.createElement('div');
            var ul = d.createElement('ul');
            A.forEach(blocks, function(b) {
                var li = d.createElement('li');
                li.appendChild(d.createTextNode(b.score));
                var ul2 = d.createElement('ul');
                A.forEach(b.leaves, function(v){
                    v = v.node;
                    var s = v.tagName || DOM.text(v) || Util.dump(v);
                    s = s.replace(/\s+/g, '');
                    var li2 = d.createElement('li');
                    s = v.nodeName + ': ' + (s.length ? s : '<empty>');
                    li2.appendChild(d.createTextNode(s));
                    ul2.appendChild(li2);
                });
                li.appendChild(ul2);
                ul.appendChild(li);
            });
            div.appendChild(ul);
            return div;
        }
    };

    l.extractContentTest.doTest = function() {
        var e = l.extractContentTest.extractContent(document);
        var b = document.body;
        while (b.firstChild) {
            b.removeChild(b.firstChild);
        }
        b.appendChild(e);
    };

    if (l.extractContentTest.auto) {
        l.extractContentTest.doTest();
    }
});