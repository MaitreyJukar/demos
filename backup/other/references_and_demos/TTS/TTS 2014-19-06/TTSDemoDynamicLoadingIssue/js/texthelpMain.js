/*!	SWFObject v2.2 <http://code.google.com/p/swfobject/> is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> !*/
var g_strAmp = "&";
var swfobject = function () {
    var D = "undefined",
        r = "object",
        S = "Shockwave Flash",
        W = "ShockwaveFlash.ShockwaveFlash",
        q = "application/x-shockwave-flash",
        R = "SWFObjectExprInst",
        x = "onreadystatechange",
        O = window,
        j = document,
        t = navigator,
        T = false,
        U = [h],
        o = [],
        N = [],
        I = [],
        l, Q, E, B, J = false,
        a = false,
        n, G, m = true,
        M = function () {
            var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D,
                ah = t.userAgent.toLowerCase(),
                Y = t.platform.toLowerCase(),
                ae = Y ? /win/.test(Y) : /win/.test(ah),
                ac = Y ? /mac/.test(Y) : /mac/.test(ah),
                af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
                X = !+"\v1",
                ag = [0, 0, 0],
                ab = null;
            if (typeof t.plugins != D && typeof t.plugins[S] == r) {
                ab = t.plugins[S].description;
                if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
                    T = true;
                    X = false;
                    ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                    ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
                    ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                    ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
                }
            } else {
                if (typeof O.ActiveXObject != D) {
                    try {
                        var ad = new ActiveXObject(W);
                        if (ad) {
                            ab = ad.GetVariable("$version");
                            if (ab) {
                                X = true;
                                ab = ab.split(" ")[1].split(",");
                                ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                            }
                        }
                    } catch (Z) {}
                }
            }
            return {
                w3: aa,
                pv: ag,
                wk: af,
                ie: X,
                win: ae,
                mac: ac
            }
        }(),
        k = function () {
            if (!M.w3) {
                return
            }
            if ((typeof j.readyState != D && j.readyState == "complete") || (typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
                f()
            }
            if (!J) {
                if (typeof j.addEventListener != D) {
                    j.addEventListener("DOMContentLoaded", f, false)
                }
                if (M.ie && M.win) {
                    j.attachEvent(x, function () {
                        if (j.readyState == "complete") {
                            j.detachEvent(x, arguments.callee);
                            f()
                        }
                    });
                    if (O == top) {
                        (function () {
                            if (J) {
                                return
                            }
                            try {
                                j.documentElement.doScroll("left")
                            } catch (X) {
                                setTimeout(arguments.callee, 0);
                                return
                            }
                            f()
                        })()
                    }
                }
                if (M.wk) {
                    (function () {
                        if (J) {
                            return
                        }
                        if (!/loaded|complete/.test(j.readyState)) {
                            setTimeout(arguments.callee, 0);
                            return
                        }
                        f()
                    })()
                }
                s(f)
            }
        }();

    function f() {
        if (J) {
            return
        }
        try {
            var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
            Z.parentNode.removeChild(Z)
        } catch (aa) {
            return
        }
        J = true;
        var X = U.length;
        for (var Y = 0; Y < X; Y++) {
            U[Y]()
        }
    }

    function K(X) {
        if (J) {
            X()
        } else {
            U[U.length] = X
        }
    }

    function s(Y) {
        if (typeof O.addEventListener != D) {
            O.addEventListener("load", Y, false)
        } else {
            if (typeof j.addEventListener != D) {
                j.addEventListener("load", Y, false)
            } else {
                if (typeof O.attachEvent != D) {
                    i(O, "onload", Y)
                } else {
                    if (typeof O.onload == "function") {
                        var X = O.onload;
                        O.onload = function () {
                            X();
                            Y()
                        }
                    } else {
                        O.onload = Y
                    }
                }
            }
        }
    }

    function h() {
        if (T) {
            V()
        } else {
            H()
        }
    }

    function V() {
        var X = j.getElementsByTagName("body")[0];
        var aa = C(r);
        aa.setAttribute("type", q);
        var Z = X.appendChild(aa);
        if (Z) {
            var Y = 0;
            (function () {
                if (typeof Z.GetVariable != D) {
                    var ab = Z.GetVariable("$version");
                    if (ab) {
                        ab = ab.split(" ")[1].split(",");
                        M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                    }
                } else {
                    if (Y < 10) {
                        Y++;
                        setTimeout(arguments.callee, 10);
                        return
                    }
                }
                X.removeChild(aa);
                Z = null;
                H()
            })()
        } else {
            H()
        }
    }

    function H() {
        var ag = o.length;
        if (ag > 0) {
            for (var af = 0; af < ag; af++) {
                var Y = o[af].id;
                var ab = o[af].callbackFn;
                var aa = {
                    success: false,
                    id: Y
                };
                if (M.pv[0] > 0) {
                    var ae = c(Y);
                    if (ae) {
                        if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                            w(Y, true);
                            if (ab) {
                                aa.success = true;
                                aa.ref = z(Y);
                                ab(aa)
                            }
                        } else {
                            if (o[af].expressInstall && A()) {
                                var ai = {};
                                ai.data = o[af].expressInstall;
                                ai.width = ae.getAttribute("width") || "0";
                                ai.height = ae.getAttribute("height") || "0";
                                if (ae.getAttribute("class")) {
                                    ai.styleclass = ae.getAttribute("class")
                                }
                                if (ae.getAttribute("align")) {
                                    ai.align = ae.getAttribute("align")
                                }
                                var ah = {};
                                var X = ae.getElementsByTagName("param");
                                var ac = X.length;
                                for (var ad = 0; ad < ac; ad++) {
                                    if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                                        ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                                    }
                                }
                                P(ai, ah, Y, ab)
                            } else {
                                p(ae);
                                if (ab) {
                                    ab(aa)
                                }
                            }
                        }
                    }
                } else {
                    w(Y, true);
                    if (ab) {
                        var Z = z(Y);
                        if (Z && typeof Z.SetVariable != D) {
                            aa.success = true;
                            aa.ref = Z
                        }
                        ab(aa)
                    }
                }
            }
        }
    }

    function z(aa) {
        var X = null;
        var Y = c(aa);
        if (Y && Y.nodeName == "OBJECT") {
            if (typeof Y.SetVariable != D) {
                X = Y
            } else {
                var Z = Y.getElementsByTagName(r)[0];
                if (Z) {
                    X = Z
                }
            }
        }
        return X
    }

    function A() {
        return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
    }

    function P(aa, ab, X, Z) {
        a = true;
        E = Z || null;
        B = {
            success: false,
            id: X
        };
        var ae = c(X);
        if (ae) {
            if (ae.nodeName == "OBJECT") {
                l = g(ae);
                Q = null
            } else {
                l = ae;
                Q = X
            }
            aa.id = R;
            if (typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
                aa.width = "310"
            }
            if (typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
                aa.height = "137"
            }
            j.title = j.title.slice(0, 47) + " - Flash Player Installation";
            var ad = M.ie && M.win ? "ActiveX" : "PlugIn",
                ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + g_strAmp + "MMplayerType=" + ad + g_strAmp + "MMdoctitle=" + j.title;
            if (typeof ab.flashvars != D) {
                ab.flashvars += g_strAmp + ac
            } else {
                ab.flashvars = ac
            } if (M.ie && M.win && ae.readyState != 4) {
                var Y = C("div");
                X += "SWFObjectNew";
                Y.setAttribute("id", X);
                ae.parentNode.insertBefore(Y, ae);
                ae.style.display = "none";
                (function () {
                    if (ae.readyState == 4) {
                        ae.parentNode.removeChild(ae)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            }
            u(aa, ab, X)
        }
    }

    function p(Y) {
        if (M.ie && M.win && Y.readyState != 4) {
            var X = C("div");
            Y.parentNode.insertBefore(X, Y);
            X.parentNode.replaceChild(g(Y), X);
            Y.style.display = "none";
            (function () {
                if (Y.readyState == 4) {
                    Y.parentNode.removeChild(Y)
                } else {
                    setTimeout(arguments.callee, 10)
                }
            })()
        } else {
            Y.parentNode.replaceChild(g(Y), Y)
        }
    }

    function g(ab) {
        var aa = C("div");
        if (M.win && M.ie) {
            aa.innerHTML = ab.innerHTML
        } else {
            var Y = ab.getElementsByTagName(r)[0];
            if (Y) {
                var ad = Y.childNodes;
                if (ad) {
                    var X = ad.length;
                    for (var Z = 0; Z < X; Z++) {
                        if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                            aa.appendChild(ad[Z].cloneNode(true))
                        }
                    }
                }
            }
        }
        return aa
    }

    function u(ai, ag, Y) {
        var X, aa = c(Y);
        if (M.wk && M.wk < 312) {
            return X
        }
        if (aa) {
            if (typeof ai.id == D) {
                ai.id = Y
            }
            if (M.ie && M.win) {
                var ah = "";
                for (var ae in ai) {
                    if (ai[ae] != Object.prototype[ae]) {
                        if (ae.toLowerCase() == "data") {
                            ag.movie = ai[ae]
                        } else {
                            if (ae.toLowerCase() == "styleclass") {
                                ah += ' class="' + ai[ae] + '"'
                            } else {
                                if (ae.toLowerCase() != "classid") {
                                    ah += " " + ae + '="' + ai[ae] + '"'
                                }
                            }
                        }
                    }
                }
                var af = "";
                for (var ad in ag) {
                    if (ag[ad] != Object.prototype[ad]) {
                        af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
                    }
                }
                aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
                N[N.length] = ai.id;
                X = c(ai.id)
            } else {
                var Z = C(r);
                Z.setAttribute("type", q);
                for (var ac in ai) {
                    if (ai[ac] != Object.prototype[ac]) {
                        if (ac.toLowerCase() == "styleclass") {
                            Z.setAttribute("class", ai[ac])
                        } else {
                            if (ac.toLowerCase() != "classid") {
                                Z.setAttribute(ac, ai[ac])
                            }
                        }
                    }
                }
                for (var ab in ag) {
                    if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                        e(Z, ab, ag[ab])
                    }
                }
                aa.parentNode.replaceChild(Z, aa);
                X = Z
            }
        }
        return X
    }

    function e(Z, X, Y) {
        var aa = C("param");
        aa.setAttribute("name", X);
        aa.setAttribute("value", Y);
        Z.appendChild(aa)
    }

    function y(Y) {
        var X = c(Y);
        if (X && X.nodeName == "OBJECT") {
            if (M.ie && M.win) {
                X.style.display = "none";
                (function () {
                    if (X.readyState == 4) {
                        b(Y)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            } else {
                X.parentNode.removeChild(X)
            }
        }
    }

    function b(Z) {
        var Y = c(Z);
        if (Y) {
            for (var X in Y) {
                if (typeof Y[X] == "function") {
                    Y[X] = null
                }
            }
            Y.parentNode.removeChild(Y)
        }
    }

    function c(Z) {
        var X = null;
        try {
            X = j.getElementById(Z)
        } catch (Y) {}
        return X
    }

    function C(X) {
        return j.createElement(X)
    }

    function i(Z, X, Y) {
        Z.attachEvent(X, Y);
        I[I.length] = [Z, X, Y]
    }

    function F(Z) {
        var Y = M.pv,
            X = Z.split(".");
        X[0] = parseInt(X[0], 10);
        X[1] = parseInt(X[1], 10) || 0;
        X[2] = parseInt(X[2], 10) || 0;
        return (Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
    }

    function v(ac, Y, ad, ab) {
        if (M.ie && M.mac) {
            return
        }
        var aa = j.getElementsByTagName("head")[0];
        if (!aa) {
            return
        }
        var X = (ad && typeof ad == "string") ? ad : "screen";
        if (ab) {
            n = null;
            G = null
        }
        if (!n || G != X) {
            var Z = C("style");
            Z.setAttribute("type", "text/css");
            Z.setAttribute("media", X);
            n = aa.appendChild(Z);
            if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
                n = j.styleSheets[j.styleSheets.length - 1]
            }
            G = X
        }
        if (M.ie && M.win) {
            if (n && typeof n.addRule == r) {
                n.addRule(ac, Y)
            }
        } else {
            if (n && typeof j.createTextNode != D) {
                n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
            }
        }
    }

    function w(Z, X) {
        if (!m) {
            return
        }
        var Y = X ? "visible" : "hidden";
        if (J && c(Z)) {
            c(Z).style.visibility = Y
        } else {
            v("#" + Z, "visibility:" + Y)
        }
    }

    function L(Y) {
        var Z = /[\\\"<>\.;]/;
        var X = Z.exec(Y) != null;
        return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
    }
    var d = function () {
        if (M.ie && M.win) {
            window.attachEvent("onunload", function () {
                var ac = I.length;
                for (var ab = 0; ab < ac; ab++) {
                    I[ab][0].detachEvent(I[ab][1], I[ab][2])
                }
                var Z = N.length;
                for (var aa = 0; aa < Z; aa++) {
                    y(N[aa])
                }
                for (var Y in M) {
                    M[Y] = null
                }
                M = null;
                for (var X in swfobject) {
                    swfobject[X] = null
                }
                swfobject = null
            })
        }
    }();
    return {
        registerObject: function (ab, X, aa, Z) {
            if (M.w3 && ab && X) {
                var Y = {};
                Y.id = ab;
                Y.swfVersion = X;
                Y.expressInstall = aa;
                Y.callbackFn = Z;
                o[o.length] = Y;
                w(ab, false)
            } else {
                if (Z) {
                    Z({
                        success: false,
                        id: ab
                    })
                }
            }
        },
        getObjectById: function (X) {
            if (M.w3) {
                return z(X)
            }
        },
        embedSWF: function (ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
            var X = {
                success: false,
                id: ah
            };
            if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
                w(ah, false);
                K(function () {
                    ae += "";
                    ag += "";
                    var aj = {};
                    if (af && typeof af === r) {
                        for (var al in af) {
                            aj[al] = af[al]
                        }
                    }
                    aj.data = ab;
                    aj.width = ae;
                    aj.height = ag;
                    var am = {};
                    if (ad && typeof ad === r) {
                        for (var ak in ad) {
                            am[ak] = ad[ak]
                        }
                    }
                    if (Z && typeof Z === r) {
                        for (var ai in Z) {
                            if (typeof am.flashvars != D) {
                                am.flashvars += g_strAmp + ai + "=" + Z[ai]
                            } else {
                                am.flashvars = ai + "=" + Z[ai]
                            }
                        }
                    }
                    if (F(Y)) {
                        var an = u(aj, am, ah);
                        if (aj.id == ah) {
                            w(ah, true)
                        }
                        X.success = true;
                        X.ref = an
                    } else {
                        if (aa && A()) {
                            aj.data = aa;
                            P(aj, am, ah, ac);
                            return
                        } else {
                            w(ah, true)
                        }
                    } if (ac) {
                        ac(X)
                    }
                })
            } else {
                if (ac) {
                    ac(X)
                }
            }
        },
        switchOffAutoHideShow: function () {
            m = false
        },
        ua: M,
        getFlashPlayerVersion: function () {
            return {
                major: M.pv[0],
                minor: M.pv[1],
                release: M.pv[2]
            }
        },
        hasFlashPlayerVersion: F,
        createSWF: function (Z, Y, X) {
            if (M.w3) {
                return u(Z, Y, X)
            } else {
                return undefined
            }
        },
        showExpressInstall: function (Z, aa, X, Y) {
            if (M.w3 && A()) {
                P(Z, aa, X, Y)
            }
        },
        removeSWF: function (X) {
            if (M.w3) {
                y(X)
            }
        },
        createCSS: function (aa, Z, Y, X) {
            if (M.w3) {
                v(aa, Z, Y, X)
            }
        },
        addDomLoadEvent: K,
        addLoadEvent: s,
        getQueryParamValue: function (aa) {
            var Z = j.location.search || j.location.hash;
            if (Z) {
                if (/\?/.test(Z)) {
                    Z = Z.split("?")[1]
                }
                if (aa == null) {
                    return L(Z)
                }
                var Y = Z.split("&");
                for (var X = 0; X < Y.length; X++) {
                    if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                        return L(Y[X].substring((Y[X].indexOf("=") + 1)))
                    }
                }
            }
            return ""
        },
        expressInstallCallback: function () {
            if (a) {
                var X = c(R);
                if (X && l) {
                    X.parentNode.replaceChild(l, X);
                    if (Q) {
                        w(Q, true);
                        if (M.ie && M.win) {
                            l.style.display = "block"
                        }
                    }
                    if (E) {
                        E(B)
                    }
                }
                a = false
            }
        }
    }
}();

var SpeechStream = new function () {};
var baa = "r\x77DontA\x6cter";
var caa = "r\x77T\x48c\x6fmp";
var daa = "r\x77THgen";
var eaa = "r\x77THpgen";
var faa = ["ScanSoft Emily_Full_22kHz", "ScanSoft Samantha_Full_22kHz", "ScanSoft Paulina_Full_22kHz", "ScanSoft Isabel_Full_22kHz", "ScanSoft Virginie_Full_22kHz", "ScanSoft Julie_Full_22kHz", "ScanSoft Steffi_Full_22kHz", "ScanSoft Silvia_Full_22kHz", "ScanSoft Claire_Full_22kHz", "ScanSoft Ingrid_Full_22kHz", "ScanSoft Karen_Full_22kHz", "ScanSoft Raquel_Full_22kHz", "ScanSoft Joana_Full_22kHz"];
var gaa = [
    ["\x43lick\x20\x54\x6f\x20Spe\x61k\x20M\x6fde", "\x53elect\x20this\x20then\x20cli\x63k\x20anywher\x65\x20in\x20the\x20bo\x6fk\x20t\x6f\x20st\x61rt\x20rea\x64ing\x20text", "\x48az\x20cli\x63\x20para\x20el\x20mo\x64\x6f\x20\x68abla\x64o"],
    ["\x53peak\x20The\x20Current\x20Select\x69on", "\x53p\x65ak\x20t\x68e\x20c\x75rrent\x20s\x65lection", "\x4ceer\x20en\x20voz\x20alta\x20e\x6c\x20texto\x20s\x65\x6c\x65\x63cionad\x6f"],
    ["\x50aus\x65\x20Sp\x65ech", "\x50ause\x20\x53peech", "\x44isc\x75rso\x20\x64e\x20paus\x61"],
    ["\x53top\x20S\x70ee\x63h", "\x53tops\x20speec\x68\x20playba\x63k", "\x50\x61rar\x20v\x6fz"],
    ["\x54ranslat\x65\x20W\x6frd", "\x44oub\x6ce-c\x6ci\x63k\x20a\x20word\x20in\x20t\x68e\x20book\x20and\x20\x63lick\x20this\x20\x69con\n" + "t\x6f\x20translat\x65\x20t\x68e\x20\x77ord\x20into\x20\x53panish", "\x54raducir\x20pa\x6cabr\x61"],
    ["\x46act\x20Fin\x64er", "\x53elect\x20som\x65\x20text\x20\x69n\x20the\x20book\x20and\x20click\x20t\x68\x69s\x20i\x63on\x20to\n" + "\x70\x65rform\x20a\x20Goo\x67le\x20search", "\x42usc\x61dor\x20d\x65\x20datos"],
    ["\x44iction\x61ry", "\x44ou\x62\x6ce-cl\x69ck\x20a\x20\x77\x6fr\x64\x20in\x20t\x68e\x20book\x20and\x20click\x20th\x69s\x20icon\x20to\n" + "s\x65e\x20d\x69ctionar\x79\x20\x64efinit\x69ons", "\x44i\x63c\x69onario"],
    ["\x48ig\x68\x6cig\x68t\x20C\x79an", "\x4da\x6be\x20a\x20sele\x63tion\x20in\x20the\x20book\x20and\x20click\x20this\x20ic\x6fn\x20to\n" + "\x63reate\x20a\x20b\x6cue\x20\x68ig\x68l\x69ght", "\x52ealc\x65\x20azul\x20v\x65r\x64\x6fso"],
    ["\x48i\x67hli\x67ht\x20\x4dagent\x61", "\x4da\x6be\x20a\x20sel\x65ction\x20in\x20the\x20\x62oo\x6b\x20and\x20click\x20this\x20icon\x20to\n" + "\x63reate\x20\x61\x20pink\x20\x68\x69gh\x6cight", "\x52e\x61l\x63e\x20morado"],
    ["\x48ig\x68light\x20Yello\x77", "\x4dak\x65\x20a\x20se\x6cection\x20in\x20th\x65\x20boo\x6b\x20and\x20clic\x6b\x20this\x20ic\x6fn\x20t\x6f\n" + "\x63reat\x65\x20a\x20yel\x6co\x77\x20highli\x67\x68t", "\x52ealce\x20\x61m\x61rillo"],
    ["\x48ighlig\x68t\x20Gr\x65en", "\x4dake\x20a\x20select\x69on\x20in\x20th\x65\x20book\x20\x61n\x64\x20click\x20this\x20\x69con\x20to\n" + "\x63reate\x20\x61\x20gr\x65en\x20\x68ighlig\x68t", "\x52\x65alce\x20v\x65rde"],
    ["\x52\x65move\x20H\x69g\x68lights", "\x52\x65move\x20\x61ll\x20your\x20\x68\x69\x67\x68l\x69g\x68ts\x20\x66ro\x6d\x20th\x69s\x20page", "\x42orrar\x20re\x61lc\x65"],
    ["\x43o\x6cle\x63t\x20High\x6cights", "\x43ollect\x20\x61\x6cl\x20\x79our\x20hig\x68l\x69ghts\x20\x61nd\x20d\x69splay\x20them\n" + "\x69n\x20a\x20\x77indow,\x20\x67roup\x65d\x20\x62y\x20\x63\x6flor", "\x52ecopil\x61r\x20re\x61l\x63es"],
    ["\x43lick\x20\x68ere\x20to\x20s\x65l\x65ct\x20th\x65\x20text", "\x43\x6c\x69ck\x20here\x20to\x20select\x20th\x65\x20t\x65xt", "clic aqu" + String.fromCharCode(237) + "\x20para\x20destac\x61r"],
    ["\x4dP3\x20Maker", "\x4dP3\x20Mak\x65r", "\x4d\x503\x20Maker"],
    ["\x43\x61lculator", "\x43\x61lculat\x6fr", "\x43alcu\x6cator"],
    ["\x47en\x65rate\x20Ca\x63h\x65", "\x47\x65nerat\x65\x20Cac\x68e", "\x47ener\x61te\x20Cach\x65"],
    ["\x43\x68\x65\x63k\x20C\x61che", "\x43hec\x6b\x20Cach\x65", "\x43h\x65ck\x20Cache"],
    ["\x50i\x63ture\x20Dicti\x6fn\x61ry", "\x50\x69cture\x20Dict\x69onary", "\x44iccion\x61rio\x20visual"],
    ["\x53\x70el\x6c\x20Check\x65r", "\x53p\x65l\x6c\x20Chec\x6ber", "\x53pell\x20\x43\x68\x65cker"],
    ["\x48\x6fmoph\x6fne\x20Checker", "\x48omop\x68\x6fne\x20Checker", "\x48omo\x70hone\x20Che\x63\x6ber"],
    ["\x50re\x64iction\x20C\x68eck\x65r", "\x50redict\x69on\x20C\x68ec\x6b\x65r", "\x50redi\x63tion\x20Checker"],
    ["\x53ubmit", "\x53ub\x6dit", "\x53ub\x6dit"],
    ["\x53tic\x6by\x20note", "\x53tic\x6b\x79\x20note", "\x53tick\x79\x20not\x65"],
    ["\x43reate\x20pr\x6fnunciat\x69\x6fn", "\x43r\x65\x61te\x20pr\x6fnunciat\x69on", "\x43re\x61t\x65\x20\x70ron\x75n\x63iation"],
    ["\x45\x64it\x20pronun\x63iat\x69on", "\x45dit\x20pron\x75nci\x61ti\x6fn", "\x45d\x69t\x20pronunc\x69ation"],
    ["\x56oc\x61bulary\x20lookup", "\x56\x6fcab\x75l\x61r\x79\x20lookup", "\x56oc\x61bulary\x20\x6coo\x6bup"],
    ["\x53trike\x20t\x68rough", "\x4dake\x20a\x20s\x65lect\x69on\x20in\x20the\x20book\x20and\x20click\x20t\x68is\x20\x69con\x20to\n" + "s\x65t\x20strike-t\x68rough\x20styl\x65", "\x53tri\x6b\x65\x20throug\x68"]
];
var haa = 0;
var iaa = haa++;
var jaa = haa++;
var kaa = haa++;
var laa = haa++;
var maa = haa++;
var naa = haa++;
var oaa = haa++;
var paa = haa++;
var qaa = haa++;
var raa = haa++;
var saa = haa++;
var taa = haa++;
var uaa = haa++;
var vaa = haa++;
var waa = haa++;
var xaa = haa++;
var yaa = haa++;
var zaa = haa++;
var Aba = haa++;
var Bba = haa++;
var Cba = haa++;
var Dba = haa++;
var Eba = haa++;
var Fba = haa++;
var Gba = haa++;
var Hba = haa++;
var Iba = haa++;
var Jba = haa++;
var Kba = haa++;
var Lba = haa++;
var Mba = 0;
var Nba = 1;
var Oba = 2;
var Pba = 3;
var Qba = 4;
var Rba = 5;
var Sba = 6;
var Tba = 7;
var Uba = 8;
var Vba = 9;
var Wba = 10;
var Xba = 11;
var Yba = [0, 33, 66, 99, 132, 165, 198, 264, 297, 330, 363, 396, 429, 0, 528, 462, 561, 594, 231, 0, 0, 0, 0, 495, 627, 660, 759, 792, 693, 726];
var Zba = "t\x65xth\x65lpSto\x70Cont\x69nuous";
var aba = "t\x65xt\x68elp\x53ki\x70";
var FAST_SPEED = 55;
var MEDIUM_SPEED = 40;
var DEFAULT_SPEED = MEDIUM_SPEED;
var SLOW_SPEED = 25;
var VERY_SLOW_SPEED = 15;
var READING_AGE_4 = 25;
var READING_AGE_5 = 25;
var READING_AGE_6 = 26;
var READING_AGE_7 = 27;
var READING_AGE_8 = 28;
var gba = 29;
var READING_AGE_10 = 30;
var READING_AGE_11 = 35;
var READING_AGE_12 = 40;
var READING_AGE_13 = 44;
var READING_AGE_14 = 46;
var READING_AGE_15 = 48;
var READING_AGE_16 = 50;
var hba = "eba_language ENG_UK  ENGLISH UK ENG_US ENGLISH_US SPANISH SPANISH_US ESPANOL SPANISH_ES " + "FRENCH FRENCH_CN GERMAN ITALIAN DUTCH SWEDISH AUSTRALIAN PORTUGUESE PORTUGUESE_BR " + "PORTUGUES PORTUGUES_PT";
var ENG_UK = 0;
var UK = 0;
var ENGLISH = 0;
var ENGLISH_UK = 0;
var ENG_US = 1;
var ENGLISH_US = 1;
var SPANISH = 2;
var SPANISH_US = 2;
var ESPANOL = 3;
var SPANISH_ES = 3;
var FRENCH = 4;
var FRENCH_CN = 5;
var GERMAN = 6;
var ITALIAN = 7;
var DUTCH = 8;
var SWEDISH = 9;
var AUSTRALIAN = 10;
var PORTUGUESE = 11;
var PORTUGUESE_BR = 11;
var PORTUGUES = 12;
var Bca = 12;
var Cca = "eba_locale LOCALE_UK LOCALE_US ";
var LOCALE_UK = "UK";
var LOCALE_US = "US";
var clicktospeak_icon = 1;
var play_icon = 2;
var search_icons = 28;
var translation_icon = 4;
var translate_icon = 4;
var translator_icon = 4;
var factfinder_icon = 8;
var dictionary_icon = 16;
var language_icons = 224;
var spelling_icon = 32;
var homophone_icon = 64;
var prediction_icon = 128;
var highlight_icons = 3840;
var highlightcyan_icon = 256;
var highlightmagenta_icon = 512;
var highlightyellow_icon = 1024;
var highlightgreen_icon = 2048;
var collect_icon = 4096;
var sticky_icon = 16384;
var funplay_icon = 32768;
var proncreate_icon = 65536;
var createpron_icon = 65536;
var pronCreate_icon = 65536;
var pronedit_icon = 131072;
var pronEdit_icon = 131072;
var editpron_icon = 131072;
var selectspeed_icon = 262144;
var selectSpeed_icon = 262144;
var pause_icon = 524288;
var mp3_icon = 1048576;
var calculator_icon = 2097152;
var generatecache_icon = 4194304;
var checkcache_icon = 8388608;
var picturedictionary_icon = 16777216;
var imagedictionary_icon = 16777216;
var vocabulary_icon = 33554432;
var strike_icon = 67108864;
var fullbrowsealoud_icons = 7967;
var standardbrowsealoud_icons = 31;
var minbrowsealoud_icons = 1;
var submit_icon = 8192;
var no_bar = 0;
var main_icons = 7967;
var standard_icons = 31;
var min_icons = 1;
var title_rw = 0;
var title_ba = 1;
var title_ebooks = 2;
var title_th = 3;
var title_portal = 4;
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt) {
        var gpa = this.length;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += gpa;
        }
        for (; from < gpa; from++) {
            if (from in this && this[from] === elt) {
                return from;
            }
        }
        return -1;
    };
}
/* Copyright 2005-2008 Texthelp Systems Ltd
 */
var Hca = false;
var Ica = false;
var Jca = true;
var Kca = true;
var Lca = "dtdType ls_teacherFlag FAST_SPEED DEFAULT_SPEED MEDIUM_SPEED SLOW_SPEED VERY_SLOW_SPEED pause_icon mp3_icon calculator_icon generatecache_icon checkcache_icon picturedictionary_icon";
var Mca;
var Nca = false;
var Oca = "color:#000000; background:#FFFF00";
var Pca = "color:#FFFFFF; background:#0000FF";
var Qca = null;
var Rca = false;
var Sca = false;
var Tca = false;
var eba_actual_version = "191";
var Uca = "4";
var Vca = "191";
var Wca = "164";
var Xca = -1;
var Yca = "speechus.texthelp.com";
var Zca = fullbrowsealoud_icons;
var aca = -1;
var bca = 0;
var cca = Yca;
var dca = Yca;
var eca = null;
var fca = null;
var gca = null;
var hca = null;
var ica = "SpeechStream";
var jca = "/SpeechStream/";
var kca = "ScanSoft Samantha_Full_22kHz";
var lca = null;
var mca = null;
var nca = null;
var oca = -1;
var pca = "rwonline";
var qca = "rwonline";
var rca = 0;
var sca = false;
var tca = "US";
var uca = 40;
var vca = -1;
var wca = false;
var xca = false;
var yca = false;
var zca = false;
var Ada = false;
var Bda = false;
var Cda = false;
var Dda = false;
var Eda = null;
var Fda = 1;
var Gda = false;
var Hda = false;
var Ida = 3;
var Jda = 10;
var Kda = false;
var Lda = false;
var Mda = false;
var Nda = "*";
var Oda = "*";
var Pda = "*";
var Qda = "*";
var Rda = false;
var Sda = false;
var Tda = true;
var Uda = "portal.texthelp.com";
var Vda = null;
var Wda = null;
var Xda = "";
var Yda = true;
var Zda = null;
var ada = null;
var bda = false;
var cda = false;
var dda = null;
var eda = 10 * 1024;
var fda = false;
var gda = false;
var hda = false;
var ida = -1;
var jda = -1;
var kda = -1;
var lda = -1;
var mda = -1;
var nda = false;
var oda = false;
var pda = false;
var qda = false;
var rda = true;
var sda = null;
var tda = false;
var uda = false;
var vda = true;
var wda = false;
var xda = false;
var yda = false;
var zda = false;
var Aea = false;
var Bea = false;
var Cea = true;
var Dea = true;
var Eea = true;
var Fea = null;
var Gea = null;
var Hea = false;
var Iea = null;
var Jea = null;
var Kea = 0;
var Lea = 0;
var Mea = 0;
var Nea = new Array();
var Oea = -1;
var Pea = 0;
var Qea = 0;
var Rea = false;
var Sea = false;
var Tea = false;
var Uea = null;
var Vea = false;
var Wea = 0;
var Xea = "";

function $rw_getAutoCacheMissingCount() {
    return Wea;
};

function $rw_getAutoCacheError() {
    return Xea || "";
};
var Yea;
var Zea = false;
var dtdType;
var bea = false;
var cea = false;
var g_icons = new Array();
var dea = new Array();
var eea = 0;
var fea = 0;
var gea = 300;
var hea = {
    x: 0,
    y: 0
};
var iea = {
    x: 0,
    y: 0
};
var jea = null;
var kea = false;
var lea = 5;
var mea = false;
var nea = 0;
var oea = "";
var pea = 1.0;
var qea = 0.01;
var rea = true;
var sea = 8;
var tea = 60;
var uea = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00];
var vea = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00];
var wea = [300, 300, 300, 300, 600, 250, 220, 660, 240, 300, 300, 100];
var xea = [40, 40, 40, 40, 40, 250, 40, 60, 256, 30, 30, 30];
var yea = [false, false, false, false, false, false, false, false, false, false, false, false];
var $g_bMouseSpeech = false;
var zea = "";
var Afa = false;
var Bfa = false;
var Cfa = navigator.appName == "\x4di\x63rosoft\x20Internet\x20Explor\x65r";
var Dfa = navigator.appVersion.indexOf("MSIE 6.") > -1;
var Efa = navigator.appVersion.indexOf("MSIE 7.") > -1;
var Ffa = navigator.appVersion.indexOf("MSIE 8.") > -1;
var Gfa = navigator.appVersion.indexOf("MSIE 9.") > -1;
var Hfa = navigator.appVersion.indexOf("MSIE 10.") > -1;
var Ifa = false;
var Jfa = false;
var Kfa = -1;
var Lfa;
var Mfa;
var Nfa = navigator.userAgent.toLowerCase();
var Ofa = Nfa.indexOf("\x63hro\x6d\x65") > -1;
var Pfa = Nfa.indexOf("\x61ppl\x65\x77ebkit") > -1;
var Qfa = (Pfa && !Ofa) ? (Nfa.indexOf("s\x61f\x61ri") == -1) : false;
var Rfa = Nfa.indexOf("\x66ir\x65fox") > -1;
if (!Cfa && !Ofa && !Pfa && !Rfa) {
    Ifa = Nfa.indexOf("trident") > -1;
    if (Ifa) {
        Cfa = true;
    } else {
        Rfa = true;
    }
}
if (Cfa) {
    if (Dfa) {
        if (document.compatMode) {
            if (document.compatMode != "CSS1Compat") {
                Jfa = true;
            }
        }
    } else if (Efa) {
        Ffa = true;
        if (document.compatMode) {
            if (document.compatMode != "CSS1Compat") {
                Jfa = true;
            } else {
                Afa = true;
            }
        }
        if (document.documentMode) {
            Kfa = document.documentMode;
        }
    } else {
        Afa = true;
        Kfa = document.documentMode;
    } if (Kfa >= 9) {
        Mfa = true;
        Lfa = false;
    } else {
        Mfa = false;
        Lfa = true;
    }
}
var Sfa = (Nfa.indexOf("ipad") > -1 || Nfa.indexOf("ipod") > -1 || Nfa.indexOf("iphone") > -1 || Nfa.indexOf("android") > -1);
var Tfa = Nfa.indexOf("ipad") > -1 || Nfa.indexOf("ipod") > -1 || Nfa.indexOf("iphone") > -1;
var Ufa;
var Vfa = 0;
if (Tfa) {
    Vfa = parseInt(Nfa.substring(Nfa.indexOf("cpu os ") + 7, Nfa.indexOf("_")));
    if (isNaN(Vfa)) {
        Vfa = 6;
    }
}
var Wfa = !(top === self);

function iOS6Workaround() {
    if ($rw_getTouchSelection) {
        $rw_getTouchSelection();
    }
}
if (Vfa >= 6 && Wfa) {
    setInterval("iOS6Workaround();", 100);
}
var Yfa = "\x6co\x63al\x68\x6fst";
var $g_strFileLoc = "";
var Zfa = "";
var g_speakableTextAreaTarget = null;
var g_nSpeakableTextAreaTimerId = 0;
var cfa = 1;
var dfa = false;
var efa = false;
var ffa = false;
var gfa = false;
var hfa = new Array();
var ifa = new Object();
var jfa = "-:minus;+:plus;/:divided by;*:multiplied by;<:less than;>:greater than;=:equals;^:raised to the power of;<=:less than or equal to;>=:greater than or equal to;";
QTb(jfa);
var kfa = false;
var lfa = false;
var mfa = false;
var nfa = false;
var ofa = "mp3";
var pfa = false;
var qfa = null;
var rfa = 20;
var sfa = "~p~br~head~body~hr~div~h1~h2~h3~h4~h5~h6~blockquote~table~tbody~tr~td~th~";
var tfa = sfa;
var ufa = "~em~strong~b~i~u~tt~font~kbd~dfn~cite~sup~sub~a~embed~span~small~nobr~wbr~acronym~" + "abbr~code~s~chunk~th:pron~img~/th:pron~w~/w~lic/lic~";
var vfa = ufa;
var wfa = true;
var xfa = false;
var eba_server_version;
var eba_serverVersion;
var eba_client_version;
var eba_clientVersion;
var eba_login_name;
var eba_login_password;
var eba_loginName;
var eba_loginPassword;
var eba_server;
var eba_speech_server;
var eba_speechServer;
var eba_speech_server_backup;
var eba_speechServerBackup;
var eba_folder;
var eba_client_folder;
var eba_clientFolder;
var eba_speech_stream_server_version = -1;
var eba_voice;
var eba_hover_flag;
var eba_bubble_mode;
var eba_bubble_freeze_on_shift_flag;
var eba_voice_from_lang_flag;
var eba_voice_language_map;
var eba_speed_value;
var eba_speedValue;
var eba_speed_offset;
var eba_volume_value;
var eba_initial_speech_on;
var eba_continuous_reading;
var eba_play_start_point;
var eba_speech_started_callback;
var eba_rendering_speech_callback;
var eba_speech_complete_callback;
var eba_page_complete_callback;
var eba_speak_selection_by_sentence;
var eba_page_complete_after_selection;
var eba_dont_extend_selection;
var eba_use_container;
var eba_override_x;
var eba_override_y;
var eba_icons;
var eba_no_display_icons;
var eba_no_title;
var eba_noTitleFlag;
var eba_hidden_bar;
var eba_speech_range_colours;
var eba_speech_word_colours;
var eba_allow_alerts_flag;
var eba_alerts;
var eba_language;
var eba_locale;
var eba_ignore_buttons;
var eba_max_word_count;
var eba_logo_url = null;
var eba_inline_img;
var eba_cache_buster;
var eba_dictionary_server;
var eba_custom_dictionary_url;
var eba_alt_dictionary_url;
var eba_picturedictionary_server;
var eba_translate_server;
var eba_translation_server;
var eba_translate_source;
var eba_translate_target;
var eba_mp3_id;
var eba_mp3_limit;
var eba_mp3_callback;
var eba_cust_id;
var eba_custId;
var eba_book_id;
var eba_bookId;
var eba_page_id;
var eba_pageId;
var eba_annotate_confirm_delete_note;
var eba_annotate_persist_notes;
var eba_annotate_persist_highlights;
var eba_annotate_note_editor_id;
var eba_annotate_highlight_editor_id;
var eba_annotate_storage_url;
var eba_annotate_note_storage_url;
var eba_annotate_highlight_storage_url;
var eba_annotate_note_reader_id;
var eba_annotate_highlight_reader_id;
var eba_annotate_highlight_store_text;
var eba_speechCacheGenerateFlag;
var eba_cache_building_mode;
var eba_speechCacheFlag;
var eba_speech_cache_flag;
var eba_cache_mode;
var eba_cache_live_generation;
var eba_autoCachePage;
var eba_cacheResult = "";
var eba_cache_retry;
var eba_cache_retry_timeout;
var eba_cache_selection;
var eba_cache_user_text;
var eba_split_cache_path;
var eba_autocache_generate;
var eba_autocache_check;
var eba_autocache_allspeeds;
var eba_autocache_callback;
var eba_autocache_no_alert;
var eba_clientside_pronunciation;
var eba_check_pronunciation_before_cache;
var eba_skip_on_error;
var eba_alter_browser_for_consistency;
var eba_ssl_flag;
var eba_ssl_speech;
var eba_ssl_toolbar;
var eba_search_speech_server;
var eba_replace_speech_server;
var eba_no_flash;
var eba_handle_radio_checkbox_click;
var eba_bypass_dom_check = false;
var eba_limit_cookies;
var eba_ignore_frames;
var eba_math;
var eba_maths;
var eba_symbol_text;
var eba_abbr_array = null;
var eba_date_filter_mode;
var eba_build_cache_for_external_use;
var eba_use_html5;
var eba_speech_file_type;
var eba_use_vocab;
var eba_use_vocabulary;
var eba_vocabulary_server;
var eba_vocabulary_limit;
var eba_break_list;
var eba_no_scroll;
var eba_use_commands;
var eba_tinymce;
var eba_tinymce_id;
var ls_teacherFlag = false;
var eba_reading_age;

function $rw_getVersion() {
    return eba_actual_version;
}

function $rw_getRevision() {
    return Uca;
}

function $rw_setIconsToLoad(p_nIcons) {
    var zfa = false;
    if ((p_nIcons & clicktospeak_icon) == clicktospeak_icon) {
        if (!uda) {
            ida = ysa('hover', gaa[iaa][rca], Yba[iaa], true);
        }
        zfa = true;
    }
    if ((p_nIcons & play_icon) == play_icon) {
        if (!(Ada && !zca && !Bda)) {
            if (!uda) {
                ysa('play', gaa[jaa][rca], Yba[jaa], false);
            }
            zfa = true;
        }
    }
    if ((p_nIcons & pause_icon) == pause_icon) {
        ysa('pause', gaa[kaa][rca], Yba[kaa], false);
    }
    if (zfa) {
        ysa('stop', gaa[laa][rca], Yba[laa], false);
    }
    var Aga = false;
    if ((p_nIcons & funplay_icon) == funplay_icon) {
        ysa('funplay', gaa[jaa][rca], Yba[Kba], false);
        Aga = true;
    }
    if (Aga) {
        ysa('funstop', gaa[laa][rca], Yba[Lba], false);
    }
    if ((p_nIcons & translation_icon) == translation_icon) {
        ysa('trans', gaa[maa][rca], Yba[maa], false);
    }
    if ((p_nIcons & factfinder_icon) == factfinder_icon) {
        ysa('ffinder', gaa[naa][rca], Yba[naa], false);
    }
    if ((p_nIcons & dictionary_icon) == dictionary_icon) {
        ysa('dictionary', gaa[oaa][rca], Yba[oaa], false);
    }
    if ((p_nIcons & picturedictionary_icon) == picturedictionary_icon) {
        ysa('picturedictionary', gaa[Aba][rca], Yba[Aba], false);
    }
    if ((p_nIcons & spelling_icon) == spelling_icon) {
        kda = ysa('spell', gaa[Bba][rca], Yba[Bba], true);
    }
    if ((p_nIcons & homophone_icon) == homophone_icon) {
        lda = ysa('homophone', gaa[Cba][rca], Yba[Cba], true);
    }
    if ((p_nIcons & prediction_icon) == prediction_icon) {
        mda = ysa('pred', gaa[Dba][rca], Yba[Dba], true);
    }
    var Bga = false;
    if ((p_nIcons & highlightcyan_icon) == highlightcyan_icon) {
        ysa('cyan', gaa[paa][rca], Yba[paa], false);
        Bga = true;
    }
    if ((p_nIcons & highlightmagenta_icon) == highlightmagenta_icon) {
        ysa('magenta', gaa[qaa][rca], Yba[qaa], false);
        Bga = true;
    }
    if ((p_nIcons & highlightyellow_icon) == highlightyellow_icon) {
        ysa('yellow', gaa[raa][rca], Yba[raa], false);
        Bga = true;
    }
    if ((p_nIcons & highlightgreen_icon) == highlightgreen_icon) {
        ysa('green', gaa[saa][rca], Yba[saa], false);
        Bga = true;
    }
    if ((p_nIcons & strike_icon) == strike_icon) {
        ysa('strike', gaa[Jba][rca], Yba[Jba], false);
        Bga = true;
    }
    if (Bga) {
        ysa('clear', gaa[taa][rca], Yba[taa], false);
    }
    if ((p_nIcons & collect_icon) == collect_icon) {
        ysa('collect', gaa[uaa][rca], Yba[uaa], false);
    }
    if ((p_nIcons & vocabulary_icon) == vocabulary_icon) {
        ysa('vocabulary', gaa[Iba][rca], Yba[Iba], false);
    }
    if ((p_nIcons & mp3_icon) == mp3_icon) {
        ysa('mp3', gaa[waa][rca], Yba[waa], false);
    }
    if ((p_nIcons & calculator_icon) == calculator_icon) {
        ysa('calculator', gaa[xaa][rca], Yba[xaa], false);
    }
    if ((p_nIcons & generatecache_icon) == generatecache_icon) {
        ysa('generate_cache', gaa[yaa][rca], Yba[yaa], false);
    }
    if ((p_nIcons & checkcache_icon) == checkcache_icon) {
        ysa('check_cache', gaa[zaa][rca], Yba[zaa], false);
    }
    if ((p_nIcons & submit_icon) == submit_icon) {
        ysa('submit', gaa[Eba][rca], Yba[Eba], false);
    }
    if ((p_nIcons & sticky_icon) == sticky_icon) {
        jda = ysa('sticky', gaa[Fba][rca], Yba[Fba], true);
    }
    if (lca != null && mca != null && nca != null) {
        if ((p_nIcons & pronCreate_icon) == pronCreate_icon) {
            ysa('pronCreate', gaa[Gba][rca], Yba[Gba], false);
        }
        if ((p_nIcons & pronEdit_icon) == pronEdit_icon) {
            ysa('pronEdit', gaa[Hba][rca], Yba[Hba], false);
        }
    }
}
var Cga = 0;

function $rw_setVoice(YPb) {
    if (typeof (YPb) == "string") {
        if (YPb != null && YPb.length > 0 && YPb != kca) {
            eba_voice = YPb;
            kca = YPb;
            try {
                var Rga = NZb.getConnector();
                if (Rga != null) {
                    Rga.setVoiceName(kca);
                }
            } catch (err) {
                thLogE(err);
            }
        }
    }
}

function $rw_setVoiceForLanguage(YPb, p_languageCode) {
    var XBb;
    if (typeof (p_languageCode) == "string") {
        XBb = Gga(p_languageCode);
        if (XBb == -1) {
            try {
                XBb = parseInt(p_languageCode, 10);
            } catch (err) {
                thLogE(err);
                return;
            }
        }
    } else if (typeof (p_languageCode) == "number") {
        XBb = p_languageCode;
    } else {
        return;
    } if (typeof (YPb) == "string" && YPb != null && YPb.length > 0 && XBb >= 0 && XBb < faa.length) {
        faa[XBb] = YPb;
    }
}

function Gga(Hga) {
    var Dhb = Hga.toLowerCase();
    if (Dhb == "english" || Dhb == "english_uk") {
        return ENG_UK;
    } else if (Dhb == "english_us") {
        return ENG_US;
    } else if (Dhb == "spanish") {
        return SPANISH;
    } else if (Dhb == "espanol") {
        return ESPANOL;
    } else if (Dhb.substr(0, 4) == "espa" && Dhb == ("espa" + String.fromCharCode(241) + "ol")) {
        return ESPANOL;
    } else if (Dhb == "french") {
        return FRENCH;
    } else if (Dhb.substr(0, 4) == "fran" && Dhb == ("fran" + String.fromCharCode(231) + "ais")) {
        return FRENCH;
    } else if (Dhb == "french_cn") {
        return FRENCH_CN;
    } else if (Dhb == "german") {
        return GERMAN;
    } else if (Dhb == "italian") {
        return ITALIAN;
    } else if (Dhb == "dutch") {
        return DUTCH;
    } else if (Dhb == "swedish") {
        return SWEDISH;
    } else if (Dhb == "australian") {
        return AUSTRALIAN;
    } else if (Dhb == "portuguese") {
        return PORTUGUESE;
    } else if (Dhb == "portugues") {
        return PORTUGUES;
    } else {
        return -1;
    }
}

function Jga(yfb) {
    try {
        var mia = yfb.split("~");
        var Xmb = mia.length;
        var i;
        var Dhb;
        var OLb;
        for (i = 0; i < Xmb; i += 2) {
            OLb = mia[i];
            Dhb = mia[i + 1];
            $rw_setVoiceForLanguage(OLb, Dhb);
        }
    } catch (e) {}
}

function $rw_setSpeedValue(p_nSpeedValue) {
    if (typeof (p_nSpeedValue) == "number") {
        if (p_nSpeedValue > -4 && p_nSpeedValue < 101 && p_nSpeedValue != uca) {
            eba_speedValue = p_nSpeedValue;
            eba_speed_value = p_nSpeedValue;
            eba_reading_age = p_nSpeedValue;
            uca = p_nSpeedValue;
            try {
                if (bea) {
                    var Rga = NZb.getConnector();
                    if (Rga != null) {
                        Rga.setSpeedValue("" + uca);
                    }
                }
            } catch (err) {
                thLogE(err);
            }
        }
    } else if (typeof (p_nSpeedValue) == "string") {
        var Olb = p_nSpeedValue.toUpperCase();
        if (Olb == "VERY_SLOW_SPEED") {
            $rw_setSpeedValue(VERY_SLOW_SPEED);
        } else if (Olb == "SLOW_SPEED") {
            $rw_setSpeedValue(SLOW_SPEED);
        } else if (Olb == "MEDIUM_SPEED") {
            $rw_setSpeedValue(MEDIUM_SPEED);
        } else if (Olb == "FAST_SPEED") {
            $rw_setSpeedValue(FAST_SPEED);
        } else {
            var ROb = parseInt(p_nSpeedValue, 10);
            $rw_setSpeedValue(ROb);
        }
    }
}

function $rw_setVolumeValue(p_nVolumeValue) {
    if (typeof (p_nVolumeValue) == "number") {
        if (p_nVolumeValue >= -1 && p_nVolumeValue <= 100 && p_nVolumeValue != vca) {
            eba_volume_value = p_nVolumeValue;
            vca = p_nVolumeValue;
            try {
                if (bea) {
                    var Rga = NZb.getConnector();
                    if (Rga != null) {
                        Rga.setVolumeValue("" + vca);
                    }
                }
            } catch (err) {
                thLogE(err);
            }
        }
    }
}

function $rw_setBarVisibility(cCb) {
    if (typeof (cCb) == "\x62\x6folean") {
        var Sga = document.getElementById("r\x77\x44rag");
        if (cCb) {
            Sga.style.visibility = "\x76\x69si\x62\x6c\x65";
            Sga.style.display = "\x69nline";
        } else {
            Sga.style.visibility = "\x68i\x64den";
            Sga.style.display = "n\x6fne";
        }
        xca = !cCb;
        FCb();
    }
}

function $rw_enableClickToSpeak(p_bEnable) {
    if (p_bEnable && !$g_bMouseSpeech) {
        $rw_event_hover(null, ida);
    } else if (!p_bEnable && $g_bMouseSpeech) {
        $rw_event_hover(null, ida);
        if (ida > -1) {
            var vma = nea;
            nea = 0;
            jya("hover" + "", ida, true);
            nea = vma;
        }
    }
}

function $rw_enableSpeachByBubbleMode(uxa) {
    if (typeof (kZb) == "undefinded") {
        if (uxa) {
            alert("Bubble speech mode is not available.");
        }
        return;
    }
    if (Hca) {
        uda = uxa;
        if (!uda) {
            Sab();
            Tab();
            $rw_stopSpeech();
        }
    } else {
        wda = !uxa;
    }
}

function $rw_enableContinuousReading(uxa) {
    rda = uxa;
    eba_continuous_reading = uxa;
    if (!rda) {
        sda = null;
        Cea = false;
    } else {
        if (typeof (eba_speak_selection_by_sentence) == "boolean") {
            Cea = eba_speak_selection_by_sentence;
        } else {
            Cea = true;
        } if ($rw_isSpeaking() && KDb != null && sda == null) {
            kCb();
            pCb(KDb);
        }
    }
}
var Uga = null;

function $rw_getUserTarget() {
    return Uga;
}
var eba_ignore_hidden;
var Vga = true;
var Wga = "The SpeechStream object will contain parameter objects in the future. It holds actionOnError cacheMode and pronunciation";
var Xga = function () {
    this.STOP = 0;
    this.SKIP = 1;
    this.action = this.STOP;
};
var Yga = function () {
    this.NONE = 0;
    this.CACHE_WITH_LIVE_SERVER = 1;
    this.CACHE_ONLY = 2;
    this.CACHE_BUILDING_MODE = 3;
    this.mode = this.NONE;
    this.getLiveServer = function () {
        if (this.mode == this.NONE) {
            return dca;
        } else if (this.mode == this.CACHE_ONLY) {
            return null;
        } else if (this.mode == this.CACHE_WITH_LIVE_SERVER) {
            return eca;
        } else if (this.mode == this.CACHE_BUILDING_MODE) {
            if (eca != null) {
                return eca;
            } else {
                return dca;
            }
        }
    };
    this.setCacheMode = function (p_nMode) {
        try {
            var flash = NZb.getConnector();
            if (flash != null) {
                switch (p_nMode) {
                case this.NONE:
                    this.mode = this.NONE;
                    eba_cache_mode = false;
                    eba_cache_building_mode = false;
                    eba_cache_live_generation = false;
                    Ada = false;
                    zca = false;
                    Bda = false;
                    flash.setCacheMode(false, false);
                    break;
                case this.CACHE_WITH_LIVE_SERVER:
                    this.mode = this.CACHE_WITH_LIVE_SERVER;
                    eba_cache_mode = true;
                    eba_cache_building_mode = false;
                    eba_cache_live_generation = true;
                    Ada = true;
                    zca = false;
                    Bda = true;
                    flash.setCacheMode(true, true);
                    break;
                case this.CACHE_ONLY:
                    this.mode = this.CACHE_ONLY;
                    eba_cache_mode = true;
                    eba_cache_building_mode = false;
                    eba_cache_live_generation = false;
                    Ada = true;
                    zca = false;
                    Bda = false;
                    flash.setCacheMode(true, false);
                    break;
                case this.CACHE_BUILDING_MODE:
                    this.mode = this.CACHE_BUILDING_MODE;
                    eba_cache_mode = false;
                    eba_cache_building_mode = true;
                    eba_cache_live_generation = false;
                    Ada = false;
                    zca = true;
                    Bda = false;
                    flash.setCacheMode(true, true);
                    break;
                default:
                    bra("Tried to set to an invalid mode, " + p_nMode + " is not recognised.");
                }
            }
        } catch (err) {}
    };
};
SpeechStream.actionOnError = new Xga();
SpeechStream.cacheMode = new Yga();

function $rw_stopSpeech() {
    $rw_event_stop();
}
var aga = 200;

function $rw_speakFromId(id) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    var target = vga(id);
    if (target != null) {
        $rw_stopSpeech();
        if (Cea) {
            var Dna;
            Dna = Ona(target, false);
            Fea = null;
            if (Dna != null) {
                target = Dna;
            }
        }
        Uga = target;
        rw_speakHoverTarget(target);
    } else {
        var Elb = document.getElementById(id);
        if (Elb != null) {
            Elb = XKb(Elb, false, null);
            $rw_speakCurrentSentence(Elb, 0);
        }
    }
}

function $rw_speakById(id) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    var target = vga(id);
    if (target != null) {
        $rw_stopSpeech();
        var Dna;
        if (Cea) {
            Dna = Ona(target, false);
            if (Dna == null) {
                Fea = target;
            }
        } else {
            Dna = target;
        } if (Dna != null) {
            target = Dna;
            rw_speakHoverTarget(target);
        } else {
            target.blockCache = !Gda;
            rw_speakHoverTarget(target);
        }
        Uga = target;
    }
}

function $rw_speakByIdFromFile(id, jEb) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    var target = vga(id);
    if (target != null) {
        $rw_stopSpeech();
        Uga = target;
        fEb(target, jEb);
    }
}

function $rw_speakByIdHighlightOnly(id) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    var target = vga(id);
    if (target != null) {
        $rw_stopSpeech();
        Uga = target;
        rw_speechHighlightOnly(target);
    }
}

function $rw_speakByIdWithSpeaker(id) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    var target = vga(id);
    if (target != null) {
        $rw_stopSpeech();
        Iea = id;
        Uga = target;
        rw_speakHoverTarget(target);
    }
}

function vga(id) {
    var lfb = document.getElementById(id);
    if (lfb != null) {
        var kga = lfb.innerHTML;
        if (kga.length > 0) {
            var NGb = sIb(lfb, true);
            if (NGb == null || NGb.nodeType != 3) {
                return null;
            }
            var OGb = wIb(lfb, true);
            if (OGb == null || OGb.nodeType != 3) {
                return null;
            }
            var Qfb = dSb(NGb, 0);
            var Rfb = (OGb.nodeType == 3) ? dSb(OGb, OGb.nodeValue.length) : dSb(OGb, 0);
            var Wbb = new THRange(lfb.ownerDocument.body, Qfb, Rfb);
            var target = new THHoverTarget(null, null, Wbb);
            return target;
        }
    }
    return null;
}

function $rw_setSentenceFromSelection() {
    try {
        var Gab = $rw_getTHCaretRangeFromSelection();
        if (Gab == null) {
            return;
        }
        var Zfb = KJb(Gab.Zfb);
        var afb = YJb(Gab.afb);
        if (Zfb != null && afb != null) {
            var tga = new Kka(Zfb, afb);
            var Wbb = pHb(tga);
            if (Wbb != null) {
                Uga = new THHoverTarget(null, null, Wbb);
            }
        }
    } catch (err) {
        thLogE(err);
    }
}

function $rw_speakCurrentSentence(gib, ulb) {
    var bBb = (new Date).getTime();
    var xga = (bBb - Cga);
    if (xga < aga) {
        return;
    }
    var fha = Dha(gib, ulb);
    if (fha != null) {
        if (fha.equals(Uga)) {
            if (xga < aga * 5) {
                return;
            }
        }
        $rw_stopSpeech();
        Uga = fha;
        rw_speakHoverTarget(fha);
    }
    Cga = bBb;
}

function $rw_speakCurrentSentenceHighlightOnly(gib, ulb) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Cga = bBb;
    var fha = Dha(gib, ulb);
    if (fha != null) {
        $rw_stopSpeech();
        Uga = fha;
        rw_speechHighlightOnly(fha);
    }
}

function Dha(gib, ulb) {
    var Wbb;
    var fha;
    if (typeof (gib) == "undefined" || gib == null) {
        if (Uga == null) {
            var Gab = tKb(document.body);
            if (Gab == null) {
                return null;
            }
            Wbb = pHb(Gab);
            fha = new THHoverTarget(null, null, Wbb);
        } else {
            fha = Uga;
        }
    } else {
        if (gib instanceof Kka) {
            Wbb = pHb(gib);
        } else {
            var Rgb;
            if (typeof (ulb) == "undefined") {
                Rgb = new THCaret(gib, 0, true);
            } else {
                Rgb = new THCaret(gib, ulb, true);
            }
            var Zfb = KJb(Rgb);
            var afb = YJb(Rgb);
            if (Zfb == null || afb == null) {
                return null;
            }
            var Gab = new Kka(Zfb, afb);
            if (Gab == null) {
                return null;
            }
            Wbb = pHb(Gab);
        }
        fha = new THHoverTarget(null, null, Wbb);
    }
    return fha;
}

function $rw_getCurrentTarget() {
    return Uga;
}

function $rw_setCurrentTarget(lEb) {
    Uga = lEb;
}

function $rw_speakFirstSentence(rEb) {
    var Ufb = null;
    if (rEb && rEb.nodeType) {
        Ufb = rEb;
    } else {
        if (Qca != null && Qca != "") {
            Ufb = document.getElementById(Qca);
        }
        if (Ufb == null) {
            Ufb = document.body;
        }
    } if (!(Ufb.nodeType == 3 && dsa(Ufb.nodeValue))) {
        Ufb = XKb(Ufb, false, null);
    }
    $rw_speakCurrentSentence(Ufb, 0);
}

function $rw_speakNextSentence() {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Cga = bBb;
    if (Uga == null) {
        $rw_speakCurrentSentence();
        return;
    }
    var cha = Uga.getCaretRange();
    var uCb = YLb(cha);
    if (uCb == null) {
        return;
    }
    if (qEb(cha.Zfb.node, uCb.Zfb.node)) {
        return;
    }
    var Wbb = pHb(uCb);
    var fha = new THHoverTarget(null, null, Wbb);
    $rw_stopSpeech();
    Uga = fha;
    rw_speakHoverTarget(fha);
}

function $rw_speakNextSentenceHighlightOnly() {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Cga = bBb;
    if (Uga == null) {
        $rw_speakCurrentSentenceHighlightOnly();
        return;
    }
    var cha = Uga.getCaretRange();
    var uCb = YLb(cha);
    if (uCb == null) {
        return;
    }
    var Wbb = pHb(uCb);
    var fha = new THHoverTarget(null, null, Wbb);
    $rw_stopSpeech();
    Uga = fha;
    rw_speechHighlightOnly(fha);
}

function $rw_speakPreviousSentence() {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Cga = bBb;
    if (Uga == null) {
        $rw_speakCurrentSentence();
        return;
    }
    var cha = Uga.getCaretRange();
    var dha = kLb(cha);
    if (dha == null) {
        return;
    }
    if (qEb(dha.afb.node, cha.afb.node)) {
        return;
    }
    var Wbb = pHb(dha);
    var fha = new THHoverTarget(null, null, Wbb);
    $rw_stopSpeech();
    Uga = fha;
    rw_speakHoverTarget(fha);
}

function $rw_speakPreviousSentenceHighlightOnly() {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Cga = bBb;
    if (Uga == null) {
        $rw_speakCurrentSentenceHighlightOnly();
        return;
    }
    var cha = Uga.getCaretRange();
    var dha = kLb(cha);
    if (dha == null) {
        return;
    }
    var Wbb = pHb(dha);
    var fha = new THHoverTarget(null, null, Wbb);
    $rw_stopSpeech();
    Uga = fha;
    rw_speechHighlightOnly(fha);
}

function $rw_getTHCaretRangeFromSelection() {
    var ZRb = XRb();
    if (ZRb != null && ZRb.range instanceof THRange) {
        return BIb(ZRb.range);
    }
    return null;
}

function $rw_isTextSelectedForPlay() {
    if (bea) {
        try {
            if (g_speakableTextAreaTarget != null) {
                if ($rw_isPaused()) {
                    return true;
                }
                if (g_nSpeakableTextAreaTimerId != 0) {
                    return false;
                }
                return true;
            } else {
                if ($rw_isPaused()) {
                    return true;
                }
                var yma = XRb();
                if (yma != null && yma.range != null) {
                    var Wbb = yma.range;
                    if (Wbb instanceof String) {
                        return true;
                    } else {
                        var target = new THHoverTarget(null, null, Wbb);
                        var Uib = target.getTextPreparedForSpeech();
                        if (Uib != null && Uib.length > 0) {
                            return true;
                        }
                    }
                }
            }
        } catch (err) {
            thLogE(err);
        }
    }
    return false;
}

function $rw_getNumberOfHighlights() {
    if (typeof (Rbb) != "undefined") {
        return Rbb.length;
    } else {
        return 0;
    }
}

function $rw_getHighlightText(index) {
    if (typeof (Rbb) != "undefined" && index > -1 && index < Rbb.length) {
        if (Lfa) {
            return Rbb[index].text;
        } else {
            return Rbb[index].toString();
        }
    }
    return "";
}

function $rw_getHighlightColor(index) {
    if (typeof (Sbb) != "undefined" && index > -1 && index < Sbb.length) {
        return Sbb[index];
    }
    return "";
}

function $rw_getHighlightColour(index) {
    return $rw_getHighlightColor(index);
}

function $rw_isPageLoaded() {
    return (Hca && bea);
}

function $rw_highlightOnlyWTSFailed() {}

function $rw_log(Jmb) {
    bra(Jmb);
}

function $rw_setReadingAge(p_nAge) {
    if (typeof (p_nAge) == "string") {
        try {
            p_nAge = parseInt(p_nAge, 10);
        } catch (e) {
            thLogE(e);
            return;
        }
    }
    if (typeof (p_nAge) == "number") {
        switch (p_nAge) {
        case 1:
        case 2:
        case 3:
        case 4:
            $rw_setSpeedValue(READING_AGE_4);
            break;
        case 5:
            $rw_setSpeedValue(READING_AGE_5);
            break;
        case 6:
            $rw_setSpeedValue(READING_AGE_6);
            break;
        case 7:
            $rw_setSpeedValue(READING_AGE_7);
            break;
        case 8:
            $rw_setSpeedValue(READING_AGE_8);
            break;
        case 9:
            $rw_setSpeedValue(gba);
            break;
        case 10:
            $rw_setSpeedValue(READING_AGE_10);
            break;
        case 11:
            $rw_setSpeedValue(READING_AGE_11);
            break;
        case 12:
            $rw_setSpeedValue(READING_AGE_12);
            break;
        case 13:
            $rw_setSpeedValue(READING_AGE_13);
            break;
        case 14:
            $rw_setSpeedValue(READING_AGE_14);
            break;
        case 15:
            $rw_setSpeedValue(READING_AGE_15);
            break;
        case 16:
            $rw_setSpeedValue(READING_AGE_16);
            break;
        default:
            $rw_setSpeedValue(READING_AGE_10);
        }
    }
}

function $rw_getVoice() {
    return eba_voice;
}

function $rw_getSpeed() {
    return eba_speed_value;
}

function $rw_setCustomerId(p_strVal) {
    try {
        if (typeof (p_strVal) == "string") {
            var qha = DUb(p_strVal.trimTH());
            if (lca != qha) {
                lca = qha;
                eba_cust_id = lca;
                var flash = NZb.getConnector();
                if (flash != null) {
                    flash.setCustomerId(lca);
                }
                var Elb = document.getElementById("editPageMsg");
                if (Elb != null) {
                    Elb.innerHTML = "";
                }
                if (ffa) {
                    eVb.deleteAll();
                    hWb();
                }
                tha();
            }
        }
    } catch (ignore) {
        thLogE(ignore);
    }
}

function $rw_setBookId(p_strVal) {
    try {
        if (typeof (p_strVal) == "string") {
            var qha = DUb(p_strVal.trimTH());
            if (mca != qha) {
                mca = qha;
                eba_book_id = mca;
                var flash = NZb.getConnector();
                if (flash != null) {
                    flash.setBookId(mca);
                }
                var Elb = document.getElementById("editPageMsg");
                if (Elb != null) {
                    Elb.innerHTML = "";
                }
                if (ffa) {
                    eVb.deleteAll();
                    hWb();
                }
                tha();
            }
        }
    } catch (ignore) {
        thLogE(ignore);
    }
}

function $rw_setPageId(p_strVal) {
    try {
        if (typeof (p_strVal) == "string") {
            var qha = DUb(p_strVal.trimTH());
            if (nca != qha) {
                nca = qha;
                eba_page_id = nca;
                var flash = NZb.getConnector();
                if (flash != null) {
                    flash.setPageId(nca);
                }
                var Elb = document.getElementById("editPageMsg");
                if (Elb != null) {
                    Elb.innerHTML = "";
                }
                if (ffa) {
                    eVb.deleteAll();
                    hWb();
                }
                tha();
            }
        }
    } catch (ignore) {
        thLogE(ignore);
    }
}

function $rw_setSymbolText(amb) {
    if (amb != null && typeof (amb) == "string" && amb.length > 0) {
        gfa = true;
        hfa = new Array();
        ifa = new Object();
        QTb(jfa);
        QTb(amb);
    }
}

function tha() {
    if (Mda) {
        if (Oda != "*" && typeof (bgb) != "undefined") {
            var aeb = Mda;
            Mda = false;
            Idb(true);
            Mda = aeb;
        }
        if (Nda != "*" && typeof (Hkb) != "undefined") {
            Tjb();
        }
        if (Oda != "*" && typeof (bgb) != "undefined") {
            bgb();
        } else {
            if (Nda != "*" && typeof (Hkb) != "undefined") {
                Hkb();
            }
        }
    }
}

function vha() {
    Nea = Bia();
    Kea = 0;
    Lea = 1;
    if (Rea) {
        Fda = 1;
        $rw_setSpeedValue(SLOW_SPEED);
    }
    Jea = tKb(document.body);
    Kea = xha(Jea);
    Mea = Nea.length;
    Oea = -1;
    Lia(true);
}

function xha(yha) {
    var nBb = yha;
    var i = 0;
    while (nBb != null) {
        i++;
        nBb = YLb(nBb);
    }
    i += Nea.length;
    if (Rea) {
        return i * 3;
    } else {
        return i;
    }
}

function Bia() {
    var zha = new Array();
    if (tda) {
        return zha;
    }
    var Aia = document.getElementsByTagName("img");
    var Xmb = Aia.length;
    var i;
    for (i = 0; i < Xmb; i++) {
        var Dia = Aia[i];
        if (Dia.style.display == "none" && Vga) {
            continue;
        }
        if (mMb(Dia)) {
            continue;
        }
        if (Dia.getAttribute("msg") != null) {
            continue;
        }
        var FNb = Dia.getAttribute("title");
        if (FNb != null && FNb.length > 0) {
            if (FNb.trimTH().length > 0) {
                zha.push(Dia);
            }
        } else {
            FNb = Dia.getAttribute("alt");
            if (FNb != null && FNb.length > 0) {
                if (FNb.trimTH().length > 0) {
                    zha.push(Dia);
                }
            }
        }
    }
    return zha;
}

function Fia(gib) {
    if (gib == null) {
        return "";
    }
    var yZb = gib.getAttribute("title");
    if (yZb != null && yZb.length > 0) {
        return yZb;
    } else {
        var zZb = gib.getAttribute("alt");
        if (zZb != null && zZb.length > 0) {
            return zZb;
        } else {
            var Aab = gib.getAttribute("msg");
            if (Aab != null && Aab.length > 0) {
                return Aab;
            }
        }
    }
    return "";
}

function Lia(Mia) {
    var hlb = "";
    var Nia = "";
    var Oia = null;
    if (Jea == null) {
        var YTb = false;
        if (Oea < Mea) {
            if (Oea > -1 && Oea < Nea.length) {
                var Qia = Fia(Nea[Oea]);
                if (Qia.trimTH().length > 0) {
                    if (sca) {
                        Oia = yAb(Nea[Oea]);
                    }
                    var YFb = new SpeechStream.SpeechRequest();
                    YFb.setString(Qia, SpeechStream.SpeechRequestBookmarks.OUTER);
                    Nia = YFb.getText();
                    hlb = YFb.getFinalText();
                    YTb = true;
                }
            }
        }
        if (!YTb) {
            if (Mia) {
                $rw_autogenSpeechFilesCallback("Success");
            } else {
                $rw_checkAutogenCachedFilesCallback("Success");
            }
            return;
        }
    } else {
        var LHb = NFb(Jea, new Array());
        Oia = LHb.voice;
        if (LHb.Qgb != null) {
            Jea = LHb.Qgb;
            Kea++;
        }
        hlb = LHb.Uib;
        Nia = LHb.cEb;
    }
    var flash = NZb.getConnector();
    if (flash != null) {
        var SHb = eHb();
        var Coa;
        if (SpeechStream.pronunciation.mode == SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER) {
            Coa = XQb(hlb);
        } else {
            Coa = XQb(Nia);
        } if (Cda) {
            var YHb = fHb(Coa);
            SHb = SHb + "/" + YHb;
        }
        if (Mia) {
            var Foa = usa(true) + SpeechStream.cacheMode.getLiveServer() + "/";
            flash.autogenSpeechFiles(hlb, SHb, Coa, !efa, Foa);
        } else {
            var mfb = SHb + "/" + Coa;
            flash.checkAutogenCachedFiles(mfb);
        }
    }
}

function $rw_autogenSpeechFilesCallback(dia) {
    if (dia == 'Success') {
        var eia = false;
        if (Rea) {
            if (Fda == 1 || Fda == 2) {
                Fda++;
            } else {
                Fda = 1;
                eia = true;
            }
            switch (Fda) {
            case 1:
                $rw_setSpeedValue(SLOW_SPEED);
                break;
            case 2:
                $rw_setSpeedValue(MEDIUM_SPEED);
                break;
            case 3:
                $rw_setSpeedValue(FAST_SPEED);
                break;
            }
        } else {
            eia = true;
        } if (eia) {
            Jea = YLb(Jea, null);
            if (Jea != null) {
                Lea++;
                if (Kea >= Lea) {
                    $rwj('#pb1').progressBar((Lea / Kea) * 100);
                    Lia(true);
                } else {
                    $rwj.unblockUI();
                    Xea = "Error: More sentences to be cached than counted in initial count at the start of this process!";
                    if (!Vea) {
                        alert(Xea);
                    }
                    if (typeof (Uea) == "string") {
                        Dqa(Uea);
                    }
                }
            } else {
                if (Mea > 0 && Oea < (Mea - 1)) {
                    ++Lea;
                    $rwj('#pb1').progressBar((Lea / Kea) * 100);
                    ++Oea;
                    Lia(true);
                } else {
                    $rwj.unblockUI();
                    var Foa = usa(true) + SpeechStream.cacheMode.getLiveServer() + "/";
                    var flash = NZb.getConnector();
                    flash.autoGenComplete(Foa);
                    if (Uea == null && !Vea) {
                        alert("Page Cached Successfully!");
                    }
                }
            }
        } else {
            Lea++;
            Lia(true);
        }
    } else {
        $rwj.unblockUI();
        Xea = dia;
        if (!Vea) {
            alert(dia);
        }
        if (typeof (Uea) == "string") {
            Dqa(Uea);
        }
    }
}

function cia() {
    Nea = Bia();
    Kea = 0;
    Lea = 1;
    Pea = 0;
    Qea = 0;
    if (Rea) {
        Fda = 1;
        $rw_setSpeedValue(SLOW_SPEED);
    }
    Jea = tKb(document.body);
    Kea = xha(Jea);
    Mea = Nea.length;
    Oea = -1;
    Lia(false);
}

function $rw_checkAutogenCachedFilesCallback(dia) {
    if (dia == 'Success') {
        ++Pea;
    } else {
        ++Qea;
    }
    var eia = false;
    if (Rea) {
        if (Fda == 1 || Fda == 2) {
            Fda++;
        } else {
            Fda = 1;
            eia = true;
        }
        switch (Fda) {
        case 1:
            $rw_setSpeedValue(SLOW_SPEED);
            break;
        case 2:
            $rw_setSpeedValue(MEDIUM_SPEED);
            break;
        case 3:
            $rw_setSpeedValue(FAST_SPEED);
            break;
        }
    } else {
        eia = true;
    } if (eia) {
        Jea = YLb(Jea, null);
        if (Jea != null) {
            Lea++;
            if (Kea >= Lea) {
                $rwj('#pb1').progressBar((Lea / Kea) * 100);
                Lia(false);
            } else {
                $rwj.unblockUI();
                Xea = "Error: More sentences to be cached than counted in initial count at the start of this process!";
                if (!Vea) {
                    alert(Xea);
                }
                if (typeof (Uea) == "string") {
                    Dqa(Uea);
                }
            }
        } else {
            if (Mea > 0 && Oea < (Mea - 1)) {
                ++Lea;
                $rwj('#pb1').progressBar((Lea / Kea) * 100);
                ++Oea;
                Lia(false);
            } else {
                $rwj.unblockUI();
                if (Qea > 0) {
                    Xea = "Missing files!  Checked page and found that " + Qea + " sentences out of " + Lea + " where not cached.";
                    Wea = Qea;
                    if (!Vea) {
                        alert(Xea);
                    }
                }
                if (typeof (Uea) == "string") {
                    Dqa(Uea);
                } else {
                    if (Qea == 0 && !Vea) {
                        alert("Checked page and found that all " + Lea + " sentences were cached.");
                    }
                }
            }
        }
    } else {
        Lea++;
        Lia(false);
    }
}

function $rw_autogenCompleteCallback(dia) {
    if (dia != "Success") {
        Xea = dia;
        if (!Vea) {
            alert("Finished autogeneration process.  " + dia);
        }
    }
    if (typeof (Uea) == "string") {
        Dqa(Uea);
    }
}

function $rw_setTranslateSource(oYb) {
    xgb.setSource(oYb);
}

function $rw_setTranslateTarget(p_strTarget) {
    xgb.setTarget(p_strTarget);
}
var fia = null;
var gia = null;
var hia = 0;

function $rw_getTouchSelection() {
    var Ydb;
    var jia;
    if (window.getSelection().rangeCount > 0 && !window.getSelection().isCollapsed) {
        Ydb = window.getSelection().getRangeAt(0).cloneRange();
        jia = window;
    } else {
        Ydb = null;
        jia = null;
        var Ndb = RQb(window);
        if (Ndb) {
            var nab = Ndb.getSelection();
            if (nab.rangeCount > 0 && !nab.isCollapsed) {
                Ydb = nab.getRangeAt(0).cloneRange();
                jia = Ndb;
            }
        }
    } if (Tfa && Vfa >= 6 && Wfa && Ydb == null || jia == null) {
        ++hia;
        if (hia >= 10) {
            fia = Ydb;
            gia = jia;
            hia = 0;
        }
    } else {
        fia = Ydb;
        gia = jia;
        hia = 0;
    }
}

function $rw_setBreakList(p_strList) {
    var mia = p_strList.split("~");
    var i;
    for (i = 0; i < mia.length; i++) {
        var Bkb = mia[i];
        if (Bkb.length > 0) {
            if (Bkb.charAt(0) == "!") {
                Bkb = Bkb.substring(1);
                if (tfa.indexOf("~" + Bkb + "~") != -1) {
                    var ylb = tfa.indexOf("~" + Bkb + "~");
                    var zlb = ylb + 1 + Bkb.length;
                    tfa = tfa.substring(0, ylb) + tfa.substring(zlb);
                }
                if (vfa.indexOf("~" + Bkb + "~") == -1) {
                    vfa += Bkb + "~";
                }
            } else {
                if (tfa.indexOf("~" + Bkb + "~") == -1) {
                    tfa += Bkb + "~";
                }
                if (vfa.indexOf("~" + Bkb + "~") != -1) {
                    var ylb = vfa.indexOf("~" + Bkb + "~");
                    var zlb = ylb + 1 + Bkb.length;
                    vfa = vfa.substring(0, ylb) + vfa.substring(zlb);
                }
            }
        }
    }
}

function $rw_parseNewSection(gib) {
    try {
        if (gib != null) {
            $rw_tagSentencesForDynamicSection(gib);
            if (Nda != "*" && typeof (Hkb) != "undefined") {
                if (Eib != -1) {
                    vib(Eib);
                    var jkb = function () {
                        $rw_parseNewSection(gib);
                    };
                    setTimeout(jkb, 100);
                    return;
                }
                Tjb();
            }
            if (typeof ($rw_refreshHighlights) == "function" && Mda) {
                if (Ifb == 1) {
                    Ifb = 2;
                }
                $rw_refreshHighlights();
            } else {
                if (typeof (Hkb) == "function" && Mda) {
                    Hkb();
                }
            }
        }
    } catch (err) {
        bra(err.message);
    }
}
var Swa = "[\\x21\\x2E\\x3F\\x3A]";
var Twa = /[\n\r\t ]{2,}/g;

function $rw_tagSentencesForDynamicSection(gib) {
    if (gib == null) {
        return;
    }
    try {
        var Uwa = false;
        var cNb = YIb(gib, false, gib);
        while (cNb != null) {
            if (cNb.nodeType == 3) {
                var gNb = cNb.parentNode.tagName.toLowerCase();
                if (gNb == "textarea") {
                    cNb = LIb(cNb, false, gib);
                    continue;
                }
                var Uib = cNb.nodeValue;
                var Zwa = Uib.trimSpaceTH();
                var Cxa = Zwa.length > 0;
                if (cda && gNb == "a") {
                    Cxa = false;
                }
                if (!Cxa) {
                    if (Mda || Ada && (oda || Lda || Bea)) {
                        if (Uwa) {
                            if (!cda) {
                                cNb.nodeValue = " ";
                            }
                            Uwa = false;
                            cNb = LIb(cNb, false, gib);
                        } else {
                            var fgb = cNb;
                            cNb = LIb(cNb, false, gib);
                            if (!cda) {
                                fgb.parentNode.removeChild(fgb);
                            }
                        }
                    } else {
                        cNb = LIb(cNb, false, gib);
                    }
                } else {
                    if (!cda) {
                        if (Mda || Ada && (oda || Lda || Bea)) {
                            if (Zwa.length < Uib.length) {
                                var fbb = false;
                                Zwa = Uib.trimSpaceStartTH();
                                if ((Uib.length - Zwa.length) > 0) {
                                    if (Uwa) {
                                        Uib = " " + Zwa;
                                    } else {
                                        Uib = Zwa;
                                    }
                                    fbb = true;
                                }
                                Zwa = Uib.trimSpaceEndTH();
                                if ((Uib.length - Zwa.length) > 1) {
                                    Uib = Zwa + " ";
                                    Uwa = false;
                                    fbb = true;
                                }
                                Zwa = Uib.replace(Twa, " ");
                                if (Zwa.length < Uib.length) {
                                    Uib = Zwa;
                                    fbb = true;
                                }
                                if (fbb) {
                                    cNb.nodeValue = Uib;
                                }
                            }
                        }
                    }
                    var bmb;
                    bmb = Uib.search(Swa);
                    var ewa = (cNb.parentNode.getAttribute("texthelpSkip") != null);
                    var fwa = cNb;
                    if (bmb > -1 && bmb < (Uib.length - 1)) {
                        var gwa = true;
                        while (true) {
                            var Hgb = Lxa(Uib, bmb, cNb);
                            if (Hgb) {
                                break;
                            } else {
                                var iwa = Uib.substring(bmb + 1);
                                var Wab = iwa.search(Swa);
                                if (Wab > -1) {
                                    bmb = bmb + 1 + Wab;
                                } else {
                                    gwa = false;
                                    break;
                                }
                            }
                        }
                        if (gwa) {
                            var elb = Uib.substring(0, bmb + 1);
                            var SMb = Uib.substring(bmb + 1);
                            var span = document.createElement("span");
                            span.setAttribute(eaa, "1");
                            var VMb = document.createTextNode(elb);
                            var WMb = document.createTextNode(SMb);
                            var vwa = cNb.parentNode;
                            vwa.insertBefore(WMb, cNb);
                            vwa.insertBefore(span, WMb);
                            span.appendChild(VMb);
                            vwa.removeChild(cNb);
                            cNb = WMb;
                            fwa = VMb;
                        } else {
                            if (cNb.previousSibling != null || cNb.nextSibling != null || ewa) {
                                var span = document.createElement("span");
                                span.setAttribute(eaa, "1");
                                var VMb = document.createTextNode(Uib);
                                var vwa = cNb.parentNode;
                                vwa.insertBefore(span, cNb);
                                span.appendChild(VMb);
                                vwa.removeChild(cNb);
                                cNb = VMb;
                            }
                            fwa = cNb;
                            cNb = LIb(cNb, false, null);
                        }
                    } else {
                        if (cNb.previousSibling != null || cNb.nextSibling != null || ewa) {
                            var span = document.createElement("span");
                            span.setAttribute(eaa, "1");
                            var VMb = document.createTextNode(Uib);
                            var vwa = cNb.parentNode;
                            vwa.insertBefore(span, cNb);
                            span.appendChild(VMb);
                            vwa.removeChild(cNb);
                            cNb = VMb;
                        }
                        fwa = cNb;
                        cNb = LIb(cNb, false, null);
                    } if (Mda || Ada && (oda || Lda || Bea)) {
                        var wwa = fwa.nodeValue;
                        var xwa = fwa.nodeValue.length;
                        if (xwa > 0 && wwa.charCodeAt(xwa - 1) == 32) {
                            Uwa = false;
                        } else {
                            Uwa = true;
                        }
                    }
                }
            } else if (cNb.nodeType == 1) {
                if (Mda) {
                    if (!ZMb(cNb)) {
                        if (pMb(cNb)) {
                            Uwa = false;
                        }
                    } else if (cNb.tagName.toLowerCase() == "img") {
                        Uwa = true;
                    }
                }
                if (oda) {
                    if (cNb.tagName.toLowerCase() == "img") {
                        var FNb = cNb.getAttribute("title");
                        cNb.setAttribute("msg", FNb);
                    }
                } else if (tda) {
                    if (cNb.tagName.toLowerCase() == "img") {
                        var FNb = cNb.getAttribute("msg");
                        if (!(FNb != null && FNb.length > 0)) {
                            FNb = cNb.getAttribute("title");
                            if (FNb != null && FNb.length > 0) {
                                cNb.setAttribute("msg", FNb);
                            } else {
                                FNb = cNb.getAttribute("alt");
                                cNb.setAttribute("msg", FNb);
                            }
                        }
                    }
                }
                var Gxa = cNb.getAttribute(caa);
                var Hxa = cNb.getAttribute(baa);
                if (cNb.tagName.toLowerCase() == "pre" || (Gxa != null && Gxa.length > 0) || (Hxa != null && Hxa.length > 0)) {
                    cNb = mIb(cNb, false, gib);
                } else {
                    cNb = LIb(cNb, false, gib);
                }
            } else {
                cNb = LIb(cNb, false, gib);
            }
        }
        if (Mda) {
            cNb = YIb(gib, false, gib);
            while (cNb != null) {
                if (cNb.nodeType == 3) {
                    var Cxa = cNb.nodeValue.trimTH().length > 0;
                    if (Cxa) {
                        var Dxa = cNb.parentNode;
                        var Fxa = Dxa.getAttribute("rwthgen");
                        while ((Fxa != null && Fxa.length > 0)) {
                            Dxa = Dxa.parentNode;
                            Fxa = Dxa.getAttribute("rwthgen");
                        }
                        var Exa = Dxa.getAttribute("id");
                        if (Exa != null && Exa.substr(0, 14) == "rwTHnoteMarker") {
                            var qjb = Exa;
                            Dxa.id = "";
                            Exa = null;
                            if (Dxa.nextSibling == null && Dxa.previousSibling == null && (Dxa.parentNode.id == null || Dxa.parentNode.id == "")) {
                                Dxa.parentNode.id = qjb;
                            } else {
                                var Iva = Dxa.ownerDocument.createElement("span");
                                Dxa.id = qjb;
                                while (Dxa.firstChild != null) {
                                    Iva.appendChild(Dxa.firstChild);
                                }
                                Dxa.appendChild(Iva);
                                Dxa = Iva;
                            }
                        }
                        if (Exa == null || Exa.length == 0) {
                            var Lkb = sja(cNb);
                            if (Lkb != null) {
                                Dxa.id = Lkb;
                            }
                        }
                    }
                    cNb = LIb(cNb, false, gib);
                } else if (cNb.nodeType == 1) {
                    if (fib(cNb)) {
                        if (cNb.tagName.toLocaleLowerCase() == "img") var Fxa = cNb.getAttribute("id");
                        if (Fxa != null && Fxa.substr(0, 14) == "rwTHnoteMarker") {
                            var qjb = Fxa;
                            cNb.id = "";
                            Fxa = null;
                            if (cNb.nextSibling == null && cNb.previousSibling == null && (cNb.parentNode.id == null || cNb.parentNode.id == "")) {
                                cNb.parentNode.id = qjb;
                            } else {
                                var Iva = cNb.ownerDocument.createElement("span");
                                Iva.id = qjb;
                                cNb.parentNode.insertBefore(Iva, cNb);
                                Iva.appendChild(cNb);
                            }
                        }
                        if (Fxa == null || Fxa.length == 0) {
                            var Lkb = wja(cNb);
                            if (Lkb != null) {
                                cNb.id = Lkb;
                            }
                        }
                    }
                    var Gxa = cNb.getAttribute(caa);
                    var Hxa = cNb.getAttribute(baa);
                    if (cNb.tagName.toLowerCase() == "pre" || (Gxa != null && Gxa.length > 0) || (Hxa != null && Hxa.length > 0)) {
                        cNb = mIb(cNb, false, gib);
                    } else {
                        cNb = LIb(cNb, false, gib);
                    }
                } else {
                    cNb = LIb(cNb, false, gib);
                }
            }
        }
    } catch (exception) {
        bra("Error in $rw_tagSentences: " + exception);
    }
    nda = true;
}

function sja(gib) {
    if (gib != null && gib.nodeType == 3) {
        var YAb = gib.ownerDocument;
        var kib = YAb.body;
        var Uib = gib.nodeValue;
        if (Uib != null) {
            Uib = Uib.replace(/\s+/g, "");
            var jAb = gib.parentNode;
            while (jAb != null && jAb.parentNode != null) {
                jAb = jAb.parentNode;
                if (jAb.id != null && jAb.id.length > 0) {
                    if (jAb.id.substr(0, 4) != "rwTH") {
                        Uib = jAb.id + Uib;
                        break;
                    }
                }
                if (jAb == kib) {
                    break;
                }
            }
            var Lkb = "rwTH" + lGb(Uib);
            if (YAb.getElementById(Lkb) != null) {
                var n = 1;
                while (YAb.getElementById(Lkb + n) != null) {
                    ++n;
                }
                Lkb = Lkb + n;
            }
            return Lkb;
        }
    }
    return null;
}

function wja(gib) {
    if (gib != null && gib.nodeType == 1 && gib.tagName.toLocaleLowerCase() == "img") {
        var YAb = gib.ownerDocument;
        var kib = YAb.body;
        var Uib = gib.src;
        if (Uib != null) {
            Uib = Uib.replace(/\s+/g, "");
            var jAb = gib;
            while (jAb != null && jAb.parentNode != null) {
                jAb = jAb.parentNode;
                if (jAb.id != null && jAb.id.length > 0) {
                    if (jAb.id.substr(0, 4) != "rwTH") {
                        Uib = jAb.id + Uib;
                        break;
                    }
                }
                if (jAb == kib) {
                    break;
                }
            }
            var Lkb = "rwTH" + lGb(Uib);
            if (YAb.getElementById(Lkb) != null) {
                var n = 1;
                while (YAb.getElementById(Lkb + n) != null) {
                    ++n;
                }
                Lkb = Lkb + n;
            }
            return Lkb;
        }
    }
    return null;
}
var Dka = -10;

function THCaret(gib, ulb, uOb) {
    this.node = gib;
    this.offset = ulb;
    this.forwardBias = uOb;
    if (ZFb(this.node)) {
        this.offset = Dka;
    }
}
THCaret.prototype.isSpecialCase = function () {
    return (this.offset == Dka);
};
THCaret.prototype.check = function () {
    var Hgb = true;
    if (this.node == null || this.node.parentNode == null) {
        Hgb = false;
    } else {
        if (this.node.nodeType != 3) {
            if (this.node.nodeType == 1 && this.offset == Dka) {} else {
                Hgb = false;
            }
        } else if (this.offset < 0 || this.offset > this.node.nodeValue.length) {
            Hgb = false;
        }
    }
    return Hgb;
};
THCaret.prototype.toString = function () {
    var Uib = "THCaret ";
    if (this.node != null) {
        if (this.node.nodeType == 3) {
            Uib += this.node.nodeValue + " " + this.node.parentNode.tagName + " ";
        } else if (this.node.nodeType == 1) {
            Uib += this.node.tagName + " ";
        }
    }
    Uib += this.offset;
    return Uib;
};
THCaret.prototype.equals = function (gfb) {
    if (gfb == null) {
        return false;
    }
    return this.node == gfb.node && this.offset == gfb.offset && this.forwardBias == gfb.forwardBias;
};

function Kka(XLb, DGb) {
    this.Zfb = XLb;
    this.afb = DGb;
}
Kka.prototype.equals = function (yLb) {
    if (yLb == null) {
        return false;
    }
    return this.Zfb.equals(yLb.Zfb) && this.afb.equals(yLb.afb);
};
Kka.prototype.toString = function () {
    return rw_getTextOverCaretRange(this);
};

function Oka(Pka) {
    this.command = null;
    this.nxa = null;
    if (Pka != null) {
        var bmb = Pka.indexOf(":");
        if (bmb > -1) {
            this.command = Pka.substr(0, bmb).toLowerCase();
            this.nxa = Pka.substr(bmb + 1);
        } else {
            this.command = Pka.toLowerCase();
        }
    }
}
Oka.prototype.CMD_LIST = "list";
Oka.prototype.CMD_STOP = "stop";
Oka.prototype.CMD_STOPAFTER = "stopafter";
Oka.prototype.CMD_JUMP = "jump";
Oka.prototype.CMD_VOICE = "voice";
Oka.prototype.CMD_PAGEID = "pageid";
Oka.prototype.CMD_BOOKID = "bookid";
Oka.prototype.CMD_EXEC = "exec";
Oka.prototype.CMD_EXECAFTER = "execafter";

function Tka(gib) {
    var Qka = [];
    if (gib != null) {
        var kib = gib.ownerDocument.body;
        var fgb = gib;
        if (fgb.nodeType == 3) {
            fgb = fgb.parentNode;
        }
        if (fgb.nodeType != 1) {
            return Qka;
        }
        while (fgb != null && fgb != kib) {
            if (fgb.getAttribute("texthelpCmd") != null) {
                var Cfb = fgb.getAttribute("texthelpCmd").trimTH();
                if (Cfb == Oka.prototype.CMD_LIST || Cfb == (Oka.prototype.CMD_LIST + ":")) {
                    var Ieb = 1;
                    Cfb = fgb.getAttribute(("texthelpCmd" + Ieb));
                    while (Cfb != null) {
                        Qka.push(new Oka(Cfb));
                        ++Ieb;
                        Cfb = fgb.getAttribute(("texthelpCmd" + Ieb));
                    }
                } else {
                    Qka.push(new Oka(Cfb));
                }
                break;
            }
            fgb = fgb.parentNode;
        }
    }
    return Qka;
}

function Zka(gib) {
    if (gib != null) {
        var kib = gib.ownerDocument.body;
        var fgb = gib;
        if (fgb.nodeType == 3) {
            fgb = fgb.parentNode;
        }
        if (fgb.nodeType != 1) {
            return null;
        }
        while (fgb != null && fgb != kib) {
            if (fgb.getAttribute("texthelpCmd") != null) {
                return fgb;
            }
            fgb = fgb.parentNode;
        }
    }
    return null;
}

function gka(lEb) {
    if (wfa) {
        var ZEb = lEb.getCaretRange();
        if (ZEb != null) {
            var cka = Tka(ZEb.afb.node);
            if (cka.length > 0) {
                var dka = false;
                for (var i = 0; i < cka.length; i++) {
                    var cmd = cka[i];
                    if (cmd.command == cmd.CMD_STOP) {
                        dka = true;
                    } else if (cmd.command == cmd.CMD_STOPAFTER) {
                        lEb.allowContinuous = false;
                    } else if (cmd.command == cmd.CMD_JUMP) {
                        lEb.jumpId = cmd.nxa;
                    } else if (cmd.command == cmd.CMD_VOICE) {
                        lEb.voice = cmd.nxa;
                    } else if (cmd.command == cmd.CMD_PAGEID) {
                        lEb.pageId = cmd.nxa;
                    } else if (cmd.command == cmd.CMD_BOOKID) {
                        lEb.bookId = cmd.nxa;
                    } else if (cmd.command == cmd.CMD_EXEC) {
                        try {
                            eval(cmd.nxa);
                        } catch (err) {
                            thLogE(err.message);
                        }
                    } else if (cmd.command == cmd.CMD_EXECAFTER) {
                        var fka = "try{eval(\"" + cmd.nxa + "\");}catch(err){thLogE(err.message);}";
                        jCb.push(fka);
                    }
                }
                if (dka) {
                    lEb.valid = false;
                }
            }
        }
    }
}
SpeechStream.DateFilterModes = {
    DATE: 2,
    NUMBER: 1,
    NONE: 0
};
SpeechStream.DateFilter = function () {
    var ika = 2;
    var jka = SpeechStream.DateFilterModes;
    var kka = /^[ ,.?!;:\x27\x22\x28\x29\x5b\x5d\x7b\x7d\x82\x91\x92\x93\x94]+|[ ,.?!;:\x27\x22\x28\x29\x5b\x5d\x7b\x7d\x82\x91\x92\x93\x94]+$/g;
    this.setMode = function (p_nMode) {
        var lka = parseInt(p_nMode, 10);
        if (lka == jka.NONE || lka == jka.NUMBER || lka == jka.DATE) {
            ika = lka;
        } else if (typeof (p_nMode) == "string") {
            if (p_nMode == "NONE") {
                ika = jka.NONE;
            } else if (p_nMode == "NUMBER") {
                ika = jka.NUMBER;
            } else if (p_nMode == "DATE") {
                ika = jka.DATE;
            }
        }
    };
    this.getMode = function () {
        return ika;
    };
    this.checkDatesFromString = function (amb) {
        var fbb = false;
        var wordList = amb.split(" ");
        fbb = this.checkDatesFromList(wordList);
        if (fbb) {
            var Xmb = wordList.length;
            var lTb = "";
            for (i = 0; i < Xmb - 1; i++) {
                lTb += wordList[i];
                lTb += " ";
            }
            lTb += wordList[Xmb - 1];
            return lTb;
        } else {
            return amb;
        }
    };
    this.checkDatesFromList = function (IWb) {
        var Bkb;
        var fbb = false;
        var Xmb = IWb.length;
        var i;
        for (i = 0; i < Xmb; i++) {
            Bkb = Bla(IWb[i]);
            if (Bkb != IWb[i]) {
                IWb[i] = Bkb;
                fbb = true;
            }
        }
        return fbb;
    };

    function uka(qFb) {
        var qhb;
        switch (ika) {
        case 0:
            qhb = qFb;
            break;
        case 1:
            if (yka(qFb)) {
                qhb = " " + qFb.substring(0, 1) + "," + qFb.substring(1, 4) + " ";
            } else {
                qhb = qFb;
            }
            break;
        case 2:
            if (yka(qFb)) {
                var qgb = parseInt(qFb, 10);
                var xka = parseInt(qFb.substring(2, 4), 10);
                if (qgb < 1000) {
                    qhb = qFb;
                } else if (((qgb >= 1000 && qgb < 2000) || qgb >= 2100) && xka == 0) {
                    qhb = " " + qFb.substring(0, 2) + " hundred ";
                } else if (((qgb >= 1000 && qgb < 2000) || qgb >= 2100) && (xka > 0 && xka < 10)) {
                    qhb = " " + qFb.substring(0, 2) + " oh " + qFb.substring(3, 4) + " ";
                } else if (((qgb >= 1000 && qgb < 2000) || qgb >= 2010) && xka >= 10) {
                    qhb = " " + qFb.substring(0, 2) + " " + qFb.substring(2, 4) + " ";
                } else if (qgb == 2000) {
                    qhb = " two thousand ";
                } else if (qgb > 2000 && qgb < 2010) {
                    qhb = " two thousand and " + qFb.substring(3, 4) + " ";
                } else {
                    qhb = qFb;
                }
            } else {
                qhb = qFb;
            }
            break;
        default:
            qhb = qFb;
            break;
        }
        return qhb;
    };

    function yka(qFb) {
        if (qFb.length == 4) {
            if (!isNaN(qFb)) {
                if (parseInt(qFb, 10) >= 1000) {
                    return true;
                }
            }
        }
        return false;
    };

    function Bla(amb) {
        if (amb == null) {
            return amb;
        }
        var hlb = amb.replace(kka, '');
        if (hlb.length == 4) {
            var lTb = uka(hlb);
            if (lTb != hlb) {
                var n = amb.indexOf(hlb);
                return amb.substring(0, n) + lTb + amb.substring(n + 4);
            }
        }
        return amb;
    };
};
var Ela = new SpeechStream.DateFilter();
var Fla = -1;
var Gla = 0;
var Hla = 1;
var Ila = 2;
var Jla = 3;
var Kla = 4;
var Lla = 5;
var Mla = 6;
var Nla = 7;
var Ola = 8;

function Pla(rEb, Wla, QSb, Xla) {
    this.body = rEb.ownerDocument.body;
    this.Rgb = new THCaret(rEb, Wla, true);
    this.Sgb = new THCaret(QSb, Xla, false);
    this.Qfb = dSb(rEb, Wla);
    this.Rfb = dSb(QSb, Xla);
}
Pla.prototype.refresh = function () {
    with(this) {
        if (Rgb.check() == false || Sgb.check() == false) {
            var Qgb = xOb(this.body, this.Qfb.path, this.Qfb.offset, this.Rfb.path, this.Rfb.offset);
            var Rgb = Qgb.Zfb;
            var Sgb = Qgb.afb;
            if (Rgb == null && Sgb == null) {
                Rgb = new THCaret(document.body, 0, true);
                Sgb = new THCaret(document.body, 0, false);
            } else if (Rgb == null || Sgb == null) {
                if (Rgb == null) {
                    Rgb = new THCaret(Sgb.node, Sgb.offset, true);
                } else {
                    Sgb = new THCaret(Rgb.node, Rgb.offset, false);
                }
            }
        }
    }
};
Pla.prototype.toString = function () {
    this.refresh();
    var range = Qra(this.body);
    range.setStart(this.Rgb.node, this.Rgb.offset);
    range.setEnd(this.Sgb.node, this.Sgb.offset);
    return range.toString();
};
Pla.prototype.getStartAsRange = function () {
    var range = Qra(this.body);
    range.setStart(this.Rgb.node, this.Rgb.offset);
    range.setEnd(this.Rgb.node, this.Rgb.offset);
    return range;
};
Pla.prototype.getEndAsRange = function () {
    var range = Qra(this.body);
    range.setStart(this.Sgb.node, this.Sgb.offset);
    range.setEnd(this.Sgb.node, this.Sgb.offset);
    return range;
};
Pla.prototype.equals = function (lEb) {
    return (this.Qfb.path == lEb.Qfb.path && this.Qfb.offset == lEb.Qfb.offset && this.Rfb.path == lEb.Rfb.path && this.Rfb.offset == lEb.Rfb.offset);
};
Pla.prototype.compareRange = function (lEb) {
    if (this.equals(lEb)) {
        return Gla;
    }
    this.refresh();
    lEb.refresh();
    var bla = this.getStartAsRange();
    var cla = this.getEndAsRange();
    var dla = lEb.getStartAsRange();
    var ela = lEb.getEndAsRange();
    var fla = bla.compareBoundaryPoints("START_TO_START", dla);
    var gla = bla.compareBoundaryPoints("START_TO_START", ela);
    var hla = cla.compareBoundaryPoints("START_TO_START", dla);
    var ila = cla.compareBoundaryPoints("START_TO_START", ela);
    var vlb = Fla;
    if (gla > -1) {
        vlb = Hla;
    } else if (hla < 1) {
        vlb = Ila;
    } else if (fla == -1) {
        if (ila == -1) {
            vlb = Mla;
        } else {
            vlb = Jla;
        }
    } else if (fla == 0) {
        if (ila == -1) {
            vlb = Nla;
        } else if (ila == 0) {
            vlb = Gla;
        } else {
            vlb = Jla;
        }
    } else {
        if (ila == -1) {
            vlb = Kla;
        } else if (ila == 0) {
            vlb = Ola;
        } else {
            vlb = Lla;
        }
    }
    return vlb;
};

function THDomRefPt(iOb, ulb) {
    this.path = iOb;
    this.offset = ulb;
};
THDomRefPt.prototype.isSpecialCase = function () {
    return (this.offset == Dka);
};
THDomRefPt.prototype.toString = function () {
    return "THDomRefPt " + this.path + " " + this.offset;
};

function THHoverTarget(PVb, iOb, qla) {
    this.body = PVb;
    this.path = iOb;
    this.range = qla;
    this.hTb = null;
    this.blockCache = false;
    this.textToSpeak = null;
    this.textToSpeakNoChanges = null;
    this.allowContinuous = true;
    this.useHighlighting = true;
    this.prepared = false;
    this.valid = true;
    this.jumpId = null;
    this.voice = null;
    this.pageId = null;
    this.bookId = null;
}
THHoverTarget.prototype.isRange = function () {
    return this.range != null;
};
THHoverTarget.prototype.isValid = function () {
    return this.valid;
};
THHoverTarget.prototype.isOverridingGlobal = function () {
    return this.voice != null || this.pageId != null || this.bookId != null;
};
THHoverTarget.prototype.getCaretRange = function () {
    var Qgb;
    if (this.isRange()) {
        Qgb = xOb(this.range.body, this.range.Qfb.path, this.range.Qfb.offset, this.range.Rfb.path, this.range.Rfb.offset);
    } else {
        var caret = dOb(this.body, this.path, -1, true);
        Qgb = new Kka(caret, caret);
    }
    return Qgb;
};
THHoverTarget.prototype.getTextPreparedForSpeech = function () {
    this.prepareTextForSpeech();
    return this.textToSpeak;
};
THHoverTarget.prototype.prepareTextForSpeech = function () {
    if (this.prepared) {
        return;
    }
    var tla;
    var ula;
    if (this.isRange()) {
        this.hTb = new Array();
        var vla = AFb(this.range.body, this.range.Qfb, this.range.Rfb, this.hTb);
        this.voice = vla.voice;
        if (vla.Qgb != null) {
            var TFb = vla.Qgb;
            this.range = pHb(TFb);
        }
        tla = vla.Uib;
        ula = vla.cEb;
    } else {
        var caret = dOb(this.body, this.path, -1, true);
        if (caret != null && caret.node != null) {
            var yla = wSb(caret.node);
            if (yla.trimTH().length == 0) {
                tla = "";
                ula = "";
            } else {
                if (sca) {
                    this.voice = yAb(caret.node);
                } else {
                    this.voice = null;
                }
                var YFb = new SpeechStream.SpeechRequest();
                YFb.setString(yla, SpeechStream.SpeechRequestBookmarks.OUTER);
                tla = YFb.getFinalText();
                ula = YFb.getText();
            }
        } else {
            tla = "";
            ula = "";
        }
    }
    this.textToSpeak = tla;
    this.textToSpeakNoChanges = ula;
    this.prepared = true;
};
THHoverTarget.prototype.highlightRange = function () {
    try {
        if (this.range != null) {
            var Qgb = xOb(this.range.body, this.range.Qfb.path, this.range.Qfb.offset, this.range.Rfb.path, this.range.Rfb.offset);
            var Zfb = Qgb.Zfb;
            var afb = Qgb.afb;
            if (Zfb != null && afb != null) {
                rw_setSpeechRangeImpl(Zfb.node, Zfb.offset, afb.node, afb.offset, "sp");
            } else {}
        }
    } catch (err) {
        bra("Error in THHoverTargetClass:highlightRange: " + err.message);
    }
};
THHoverTarget.prototype.unhighlightRange = function () {
    try {
        if (this.range != null) {
            var Qgb = xOb(this.range.body, this.range.Qfb.path, this.range.Qfb.offset, this.range.Rfb.path, this.range.Rfb.offset);
            var Zfb = Qgb.Zfb;
            var afb = Qgb.afb;
            if (Zfb != null && afb != null) {
                rw_removeSpeechHighlight(Rqa(Zfb, afb), false);
            } else {}
        }
    } catch (err) {
        bra("Error in THHoverTarget:unhighlightRange: " + err.message);
    }
};
THHoverTarget.prototype.equals = function (Nab) {
    if (Nab == null) {
        return false;
    }
    if (this.isRange() != Nab.isRange()) {
        return false;
    }
    if (this.isRange()) {
        return this.range.equals(Nab.range);
    } else {
        return this.path.equalsTH(Nab.path);
    }
};
THHoverTarget.prototype.equalsAprox = function (Nab) {
    if (Nab == null) {
        return false;
    }
    if (this.isRange() != Nab.isRange()) {
        return false;
    }
    if (this.isRange()) {
        if (this.range.equals(Nab.range)) {
            return true;
        }
        var r1 = this.getCaretRange();
        var r2 = Nab.getCaretRange();
        r1 = bna(r1);
        r2 = bna(r2);
        return r1.equals(r2);
    } else {
        return this.path.equalsTH(Nab.path);
    }
};
THHoverTarget.prototype.toString = function () {
    var Uib = "THHoverTarget ";
    if (this.path != null) {
        Uib += "path=" + this.path;
    } else if (this.range != null) {
        Uib += this.range.toString();
    }
    return Uib;
};
SpeechStream.pronunciation = new function () {
    this.NONE = 0;
    this.SERVER_PRONUNCIATION = 1;
    this.CLIENT_PRONUNCIATION_FOR_OFFLINE_CACHE = 2;
    this.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER = 3;
    this.mode = this.SERVER_PRONUNCIATION;
    this.checkPronunciation = function () {
        return (this.mode != this.NONE && SpeechStream.cacheMode.mode != SpeechStream.cacheMode.CACHE_ONLY && this.mode != this.SERVER_PRONUNCIATION);
    };
    this.fetchData = function () {
        if (this.mode == this.NONE || SpeechStream.cacheMode.mode == SpeechStream.cacheMode.CACHE_ONLY) {
            return false;
        }
        if (this.mode != this.SERVER_PRONUNCIATION) {
            return true;
        } else {
            if ((Zca & pronCreate_icon) == pronCreate_icon || (Zca & pronEdit_icon) == pronEdit_icon) {
                return true;
            }
        }
        return false;
    };
    this.encodeData = function () {
        return (this.mode != this.NONE && this.mode != this.SERVER_PRONUNCIATION);
    };
    this.setPronunciation = function (p_nMode) {
        if (p_nMode == this.NONE || p_nMode == this.SERVER_PRONUNCIATION || p_nMode == this.CLIENT_PRONUNCIATION_FOR_OFFLINE_CACHE || p_nMode == this.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER) {
            this.mode = p_nMode;
        }
    };
};
SpeechStream.Dictionary = function () {
    function Hma(Yma) {
        return (this["+" + Yma]);
    }

    function Kma(Yma) {
        var Pma = "+" + Yma;
        this[Pma] = null;
        delete this[Pma];
        var bmb = this.Keys$__.indexOf(Yma);
        if (bmb > -1) {
            this.Keys$__.splice(bmb, 1);
        }
        bmb = this.AllPageKeys$__.indexOf(Yma);
        if (bmb > -1) {
            this.AllPageKeys$__.splice(bmb, 1);
        }
        if (Yma.indexOf(" ") > -1) {
            var bmb = Yma.indexOf(" ");
            var WHb = Yma.substring(0, bmb);
            bmb = this.MultiwordStart$__.indexOf(WHb);
            if (bmb > -1) {
                this.MultiwordStart$__.splice(bmb, 1);
            }
        }
    }

    function Qma(Yma, mpa, Tma) {
        var Pma = "+" + Yma;
        if (Yma.substr(Yma.length - 3) == "$__") {
            Yma = Yma.substr(0, Yma.length - 1);
        }
        if (Yma != null && Yma.length > 0 && mpa != null && mpa.length > 0) {
            var Uma = false;
            if (this[Pma] != null) {
                Uma = true;
                if (Tma && !this.isAllPage$__(Yma)) {
                    return;
                }
            }
            this[Pma] = mpa;
            if (this.Keys$__.indexOf(Yma) == -1) {
                this.Keys$__[this.Keys$__.length] = Yma;
            }
            if (Tma) {
                if (this.AllPageKeys$__.indexOf(Yma) == -1) {
                    this.AllPageKeys$__[this.AllPageKeys$__.length] = Yma;
                }
            } else {
                if (this.AllPageKeys$__.indexOf(Yma) > -1) {
                    this.AllPageKeys$__.splice(this.AllPageKeys$__.indexOf(Yma), 1);
                }
            } if (!Uma) {
                if (Yma.indexOf(" ") > -1) {
                    var bmb = Yma.indexOf(" ");
                    var WHb = Yma.substring(0, bmb);
                    this.MultiwordStart$__.push(WHb);
                }
            }
        }
    }

    function Xma(Yma) {
        return this.AllPageKeys$__.indexOf(Yma) > -1;
    }
    this.add$__ = Qma;
    this.get$__ = Hma;
    this.remove$__ = Kma;
    this.isAllPage$__ = Xma;
    this.Keys$__ = new Array();
    this.AllPageKeys$__ = new Array();
    this.MultiwordStart$__ = new Array();
};
SpeechStream.Dictionary.prototype.deleteAll = function () {
    if (typeof (this.Keys$__) != "undefined") {
        var Bkb;
        var i;
        for (i = 0; i < this.Keys$__.length; i++) {
            Bkb = this.Keys$__[i];
            this["+" + Bkb] = null;
            delete this["+" + Bkb];
        }
        this.Keys$__ = new Array();
        this.AllPageKeys$__ = new Array();
        this.MultiwordStart$__ = new Array();
    }
};

function THRange(PVb, cma, dma) {
    this.body = PVb;
    this.Qfb = cma;
    this.Rfb = dma;
}
THRange.prototype.equals = function (lEb) {
    return (this.body == lEb.body && this.Qfb.path == lEb.Qfb.path && this.Qfb.offset == lEb.Qfb.offset && this.Rfb.path == lEb.Rfb.path && this.Rfb.offset == lEb.Rfb.offset);
};
THRange.prototype.toString = function () {
    var range = this.getAsRange();
    if (range != null) {
        if (Lfa) {
            return this.getAsRange().text;
        } else {
            return this.getAsRange().toString();
        }
    } else {
        return "";
    }
};
THRange.prototype.getAsRange = function () {
    var range = null;
    if (Lfa) {
        range = rw_getAsTextRange(this.body, this.Qfb.path, this.Qfb.offset, this.Rfb.path, this.Rfb.offset);
    } else {
        range = Qra(this.body);
        var Qgb = xOb(this.body, this.Qfb.path, this.Qfb.offset, this.Rfb.path, this.Rfb.offset);
        var Rgb = Qgb.Zfb;
        var Sgb = Qgb.afb;
        if (Rgb != null && Sgb != null) {
            range.setStart(Rgb.node, Rgb.offset);
            range.setEnd(Sgb.node, Sgb.offset);
        } else {
            range = null;
            bra("Error in THRange:getAsRange: Failed to get the start or end caret.");
        }
    }
    return range;
};
THRange.prototype.clone = function () {
    return new THRange(this.body, this.Qfb, this.Rfb);
};
var hma = "SpeechMode DISABLED CLICK_SPEAK HOVER_SPEAK BUBBLE_SPEAK KEY_PRESS_SPEAK";
SpeechStream.SpeechMode = new function () {
    this.mode = -1;
    this.DISABLED = 0;
    this.CLICK_SPEAK = 1;
    this.HOVER_SPEAK = 2;
    this.BUBBLE_SPEAK = 4;
    this.KEY_PRESS_SPEAK = 8;
};
SpeechStream.SpeechMode.setPlayMode = function (p_nMode) {
    if (typeof (p_nMode) == "number") {
        switch (p_nMode) {
        case SpeechStream.SpeechMode.DISABLED:
            $g_bMouseSpeech = false;
            hxa = false;
            $rw_enableSpeachByBubbleMode(false);
            break;
        case SpeechStream.SpeechMode.CLICK_SPEAK:
            Jca = true;
            $g_bMouseSpeech = true;
            hxa = true;
            $rw_enableSpeachByBubbleMode(false);
            break;
        case SpeechStream.SpeechMode.HOVER_SPEAK:
            Jca = false;
            $g_bMouseSpeech = true;
            hxa = true;
            $rw_enableSpeachByBubbleMode(false);
            break;
        case SpeechStream.SpeechMode.BUBBLE_SPEAK:
            $g_bMouseSpeech = false;
            hxa = false;
            $rw_enableSpeachByBubbleMode(true);
            break;
        case SpeechStream.SpeechMode.KEY_PRESS_SPEAK:
            $g_bMouseSpeech = false;
            hxa = false;
            $rw_enableSpeachByBubbleMode(false);
            break;
        default:
            return;
        }
        SpeechStream.SpeechMode.mode = p_nMode;
    }
};
SpeechStream.SpeechMode.getPlayMode = function () {
    if (SpeechStream.SpeechMode.mode == -1) {
        if (uda) {
            g_nSpeechMode = SpeechStream.SpeechMode.BUBBLE_SPEAK;
        } else if ($g_bMouseSpeech && Jca) {
            g_nSpeechMode = SpeechStream.SpeechMode.CLICK_SPEAK;
        } else if ($g_bMouseSpeech && !Jca) {
            g_nSpeechMode = SpeechStream.SpeechMode.HOVER_SPEAK;
        } else {
            g_nSpeechMode = SpeechStream.SpeechMode.KEY_PRESS_SPEAK;
        }
    }
    return SpeechStream.SpeechMode.mode;
};
SpeechStream.SpeechRequestBookmarks = {
    NONE: 0,
    OUTER: 1,
    ALL: 2
};
SpeechStream.SpeechRequest = function () {
    this.m_strText = null;
    this.m_strFinalText = null;
    this.m_bChanged = false;
    this.m_wordList = null;
};
SpeechStream.SpeechRequest.prototype.setString = function (amb, p_nBookmarks) {
    var wordList = amb.split(" ");
    var i;
    var Xmb = wordList.length - 1;
    for (i = 0; i < Xmb; i++) {
        wordList[i] = wordList[i] + " ";
    }
    this.setWordList(wordList, p_nBookmarks);
};
SpeechStream.SpeechRequest.prototype.setWordList = function (IWb, p_nBookmarks) {
    var kma = null;
    if (typeof (eba_build_cache_for_external_use) == "boolean" && eba_build_cache_for_external_use) {
        var fgb = "";
        var Xmb = IWb.length;
        for (i = 0; i < Xmb; i++) {
            fgb += IWb[i];
        }
        kma = fgb;
    }
    var fbb = false;
    if (gfa) {
        if (qTb(IWb)) {
            fbb = true;
        }
    }
    if (Ela != null && Ela.getMode() != SpeechStream.DateFilterModes.NONE) {
        if (Ela.checkDatesFromList(IWb)) {
            fbb = true;
        }
    }
    this.m_strText = this.buildString(IWb, p_nBookmarks);
    if (SpeechStream.pronunciation.checkPronunciation()) {
        if (HWb(IWb)) {
            fbb = true;
            this.m_strFinalText = this.buildString(IWb, p_nBookmarks);
        }
    }
    this.m_bChanged = fbb;
    if (this.m_strFinalText == null) {
        this.m_strFinalText = this.m_strText;
    }
    if (kma != null) {
        this.m_strText = kma;
    }
};
SpeechStream.SpeechRequest.prototype.buildString = function (IWb, p_nBookmarks) {
    if (IWb.length == 0) {
        return "";
    }
    var Rlb = (p_nBookmarks == SpeechStream.SpeechRequestBookmarks.ALL);
    var pma = (p_nBookmarks == SpeechStream.SpeechRequestBookmarks.OUTER);
    var fgb = "";
    var Xmb = IWb.length;
    if (pma) {
        fgb += HDb + "0" + IDb;
    }
    for (i = 0; i < Xmb; i++) {
        if (Rlb) {
            fgb += HDb + i + IDb;
        }
        fgb += pFb(IWb[i]);
    }
    if (pma || Rlb) {
        fgb += HDb + Xmb + IDb;
    }
    return fgb;
};
SpeechStream.SpeechRequest.prototype.isChanged = function () {
    return this.m_bChanged;
};
SpeechStream.SpeechRequest.prototype.getFinalText = function () {
    return this.m_strFinalText;
};
SpeechStream.SpeechRequest.prototype.getText = function () {
    return this.m_strText;
};
var sma = null;
var tma = null;

function $rw_event_click(event, i) {
    return $rw_event_hover(event, i);
}

function $rw_event_hover(event, i) {
    if (fda && Pfa) {
        $rw_tagSentences();
    }
    if (!bea) {
        return;
    }
    if (!nda) {
        if (zca) {
            throw "The page has not fully loaded, click and speak is not available yet.";
        } else {
            ssa("The page has not fully loaded, click and speak is not available yet.");
        }
        return;
    }
    $g_bMouseSpeech = !$g_bMouseSpeech;
    var nkb = SpeechStream.wsa;
    if (i > -1) {
        g_icons[i][nkb.ICON_TOGGLE_STATE] = $g_bMouseSpeech;
        if (Sfa && !$g_bMouseSpeech) {
            qta(g_icons[i][nkb.ICON_NAME], "flat", g_icons[i][nkb.ICON_OFFSET], true);
        } else {
            qta(g_icons[i][nkb.ICON_NAME], "toggleOn", g_icons[i][nkb.ICON_OFFSET], true);
        }
    }
    if (dfa && $g_bMouseSpeech) {
        if (jda > -1 && typeof ($rw_event_sticky) != "undefined") {
            $rw_event_sticky(event, jda);
            var vma = nea;
            nea = 0;
            jya("sticky" + "", jda, true);
            nea = vma;
        }
    }
    if (!$g_bMouseSpeech) {
        NZb.enableTouchEvents(false);
        $rw_event_stop();
        pxa(false);
        rxa(false);
        NZb.enableTouchEvents(false);
    } else {
        pxa(true);
        NZb.enableTouchEvents(true);
    }
}

function $rw_isPaused() {
    return (bea && NZb.getConnector && $rw_isSpeaking() && NZb.getConnector() != null && NZb.getConnector().isPaused());
}
var wma = String.fromCharCode(160);

function $rw_event_play() {
    if (bea) {
        try {
            if (g_speakableTextAreaTarget != null) {
                if ($rw_isPaused()) {
                    $rw_event_pause();
                    return;
                }
                if (g_nSpeakableTextAreaTimerId != 0) {
                    clearTimeout(g_nSpeakableTextAreaTimerId);
                    g_nSpeakableTextAreaTimerId = 0;
                    if (g_speakableTextAreaTarget == null) {
                        $rw_event_play();
                        return;
                    }
                }
                var xma = g_speakableTextAreaTarget;
                xma.focus();
                g_speakableTextAreaTarget = null;
                $rw_event_stop();
                rw_speakHoverTarget(new THHoverTarget(xma.ownerDocument.body, AOb(xma), null));
            } else {
                if ($rw_isPaused()) {
                    $rw_event_pause();
                    return;
                }
                var yma = XRb();
                if (yma != null && yma.range != null) {
                    var Wbb = yma.range;
                    if (Wbb instanceof String) {
                        $rw_event_stop();
                        rw_speakHoverTarget(Wbb);
                    } else {
                        if (Lfa) {
                            var range = Ira();
                            if (range != null) {
                                range.collapse();
                                range.select();
                            }
                        } else {
                            var range = Ira();
                            if (range != null) {
                                range.collapseToStart();
                            }
                        }
                        var target = new THHoverTarget(null, null, Wbb);
                        var Ydb = Wbb.clone();
                        var Uib = target.getTextPreparedForSpeech();
                        var Cna = false;
                        if (!Ydb.equals(target.range)) {
                            Cna = true;
                        }
                        if (Uib == null || Uib.length == 0) {
                            return;
                        }
                        $rw_event_stop();
                        var Dna;
                        if (Cea) {
                            if (Cna) {
                                Dna = Ona(new THHoverTarget(null, null, Ydb), true);
                            } else {
                                Dna = Ona(target, true);
                            } if (Dna == null) {
                                Fea = target;
                            }
                        } else {
                            Dna = target;
                        } if (Dna != null) {
                            target = Dna;
                            rw_speakHoverTarget(target);
                        } else {
                            target.blockCache = !Gda;
                            rw_speakHoverTarget(target);
                        }
                    }
                } else {
                    if (Qca != null || arguments[0]) {
                        $rw_event_stop();
                        if (Uga == null || Rca) {
                            Rca = false;
                            $rw_speakFirstSentence(arguments[0]);
                        } else {
                            $rw_speakCurrentSentence();
                        }
                    }
                }
            }
        } catch (err) {
            thLogE(err);
        }
    }
}

function Ona(lEb, Qna) {
    if (lEb == null) {
        return null;
    }
    Gea = null;
    var Qgb = lEb.getCaretRange();
    Qgb = bna(Qgb);
    var HHb = Qna ? SLb(Qgb.Zfb) : LLb(Qgb.Zfb);
    if (HHb.afb.node == Qgb.afb.node) {
        if (HHb.afb.offset == Qgb.afb.offset) {
            return null;
        }
        var bfb = HHb.afb.node;
        if (bfb.nodeType == 3) {
            var Hna = bfb.nodeValue.substring(HHb.afb.offset, Qgb.afb.offset).trimTH();
            if (Hna.length == 0) {
                return null;
            }
        }
    }
    var Ina = Qna ? SLb(Qgb.afb) : LLb(Qgb.afb);
    if (HHb.equals(Ina)) {
        return null;
    } else {
        var Jna;
        if (!Dea) {
            Jna = HHb;
            HHb = new Kka(Qgb.Zfb, HHb.afb);
        }
        if (!nsa(HHb)) {
            HHb = YLb(HHb, Ina.afb.node);
            if (HHb == null) {
                return null;
            }
            if (HHb.equals(Ina)) {
                return null;
            }
        }
        if (!nsa(Ina)) {
            Ina = kLb(Ina, null);
            if (Ina == null) {
                return null;
            }
            if (HHb.equals(Ina)) {
                return null;
            }
            if (Jna) {
                if (Jna.equals(Ina)) {
                    return null;
                }
            }
        }
        if (!Dea) {
            var Kna = new Kka(Ina.Zfb, Qgb.afb);
            Gea = new THHoverTarget(null, null, pHb(Kna));
        }
        var Lna;
        var Mna;
        var Wbb = pHb(HHb);
        Lna = new THHoverTarget(null, null, Wbb);
        Ina = new Kka(bna(Ina).Zfb, Ina.afb);
        Wbb = pHb(Ina);
        Mna = new THHoverTarget(null, null, Wbb);
        Fea = Mna;
        return Lna;
    }
}

function bna(yLb) {
    var fbb = false;
    var aNb;
    var Ggb;
    var lSb;
    var Dgb;
    try {
        var bfb;
        var Xna;
        if (!yLb.afb.isSpecialCase()) {
            aNb = yLb.afb.node;
            Ggb = yLb.afb.offset;
            var Yna = aNb.nodeValue;
            while (true) {
                if (Ggb == 0) {
                    bfb = nJb(aNb, false, lSb);
                    if (bfb == null) {
                        break;
                    }
                    if (bfb.nodeType == 1) {
                        aNb = bfb;
                        Ggb = 0;
                        fbb = true;
                        break;
                    }
                    aNb = bfb;
                    Yna = aNb.nodeValue;
                    Ggb = Yna.length;
                    fbb = true;
                }
                if (Ggb > 0) {
                    Xna = Yna.charAt(Ggb - 1);
                    if (Ssa(Xna)) {
                        --Ggb;
                        fbb = true;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
        if (!yLb.Zfb.isSpecialCase()) {
            lSb = yLb.Zfb.node;
            Dgb = yLb.Zfb.offset;
            var Zna = lSb.nodeValue;
            var Xmb = Zna.length;
            while (true) {
                if (Dgb == Xmb) {
                    bfb = OKb(lSb, false, aNb);
                    if (bfb == null) {
                        break;
                    }
                    if (bfb.nodeType == 1) {
                        lSb = bfb;
                        Dgb = 0;
                        Xmb = 0;
                        fbb = true;
                        break;
                    }
                    lSb = bfb;
                    Zna = lSb.nodeValue;
                    Dgb = 0;
                    Xmb = Zna.length;
                    fbb = true;
                }
                if (Dgb < Xmb) {
                    Xna = Zna.charAt(Dgb);
                    if (Ssa(Xna)) {
                        ++Dgb;
                        fbb = true;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
    } catch (err) {
        thLogE(err);
    }
    if (!fbb) {
        return yLb;
    } else {
        return (new Kka(new THCaret(lSb, Dgb, true), new THCaret(aNb, Ggb, false)));
    }
}

function $rw_event_funplay() {
    $rw_event_play();
}
var dna = null;

function $rw_speakText(amb) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    $rw_event_stop();
    var YFb = new SpeechStream.SpeechRequest();
    YFb.setString(amb, SpeechStream.SpeechRequestBookmarks.NONE);
    var hlb = YFb.getText();
    var lna = YFb.getFinalText();
    mna(lna, !Hda, hlb);
}

function $rw_speak(amb, p_bNoCache, p_bFilter) {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    $rw_event_stop();
    if (p_bFilter) {
        var YFb = new SpeechStream.SpeechRequest();
        YFb.setString(amb, SpeechStream.SpeechRequestBookmarks.NONE);
        var hlb = YFb.getText();
        var lna = YFb.getFinalText();
        mna(lna, p_bNoCache, hlb);
    } else {
        mna(amb, p_bNoCache, amb);
    }
}

function mna(amb, ona, pna) {
    if (typeof (eba_no_flash) == "boolean" && eba_no_flash) {
        rw_sendSocketMessage("THStart" + amb + "THEnd");
        return;
    }
    if (amb == null && amb.length == 0) {
        $rw_doSelection(-1);
        return;
    }
    if (!bea) {
        $rw_doSelection(-1);
        return;
    }
    try {
        if (amb.indexOf(wma) > -1) {
            var bmb = amb.indexOf(wma) > -1;
            while (bmb > -1) {
                amb = amb.replace(wma, " ");
                bmb = amb.indexOf(wma, bmb + 1);
            }
        }
        if (typeof (pna) == "undefinded" || pna == null) {
            pna = amb;
        } else {
            if (pna.indexOf(wma) > -1) {
                var bmb = pna.indexOf(wma) > -1;
                while (bmb > -1) {
                    pna = pna.replace(wma, " ");
                    bmb = pna.indexOf(wma, bmb + 1);
                }
            }
        }
        var flash = NZb.getConnector();
        if (flash != null) {
            if (KDb && KDb.isRange()) {
                pxa(true);
                rxa(true);
                $rw_doSelection(0);
            }
            if (ona && Ada && Bda) {
                flash.startSpeechFromBackup(amb, !efa);
                Gqa();
            } else {
                if (SpeechStream.cacheMode.mode == SpeechStream.cacheMode.CACHE_ONLY) {
                    var SHb = eHb();
                    var Coa = XQb(pna);
                    var mfb;
                    if (Cda) {
                        var YHb = fHb(Coa);
                        SHb = SHb + "/" + YHb;
                        mfb = SHb + "/" + Coa;
                    } else {
                        mfb = SHb + "/" + Coa;
                    }
                    flash.startSpeechFromCache(mfb, amb, false);
                    Gqa();
                } else if (SpeechStream.cacheMode.mode == SpeechStream.cacheMode.CACHE_WITH_LIVE_SERVER) {
                    var SHb = eHb();
                    var Coa;
                    if (SpeechStream.pronunciation.mode == SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER) {
                        Coa = XQb(amb);
                    } else {
                        Coa = XQb(pna);
                    }
                    var mfb;
                    if (Cda) {
                        var YHb = fHb(Coa);
                        SHb = SHb + "/" + YHb;
                        mfb = SHb + "/" + Coa;
                    } else {
                        mfb = SHb + "/" + Coa;
                    }
                    flash.startSpeechFromCacheWithGen(mfb, amb, SHb, Coa, !efa);
                    Gqa();
                } else if (SpeechStream.cacheMode.mode == SpeechStream.cacheMode.CACHE_BUILDING_MODE) {
                    var SHb = eHb();
                    var Coa;
                    if (SpeechStream.pronunciation.mode == SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER) {
                        Coa = XQb(amb);
                    } else {
                        Coa = XQb(pna);
                    }
                    var mfb;
                    if (Cda) {
                        var YHb = fHb(Coa);
                        SHb = SHb + "/" + YHb;
                        mfb = SHb + "/" + Coa;
                    } else {
                        mfb = SHb + "/" + Coa;
                    }
                    var Foa = usa(true) + SpeechStream.cacheMode.getLiveServer() + "/";
                    flash.startSpeechGenerateCache(mfb, amb, SHb, Coa, !efa, Foa);
                    Gqa();
                } else {
                    flash.startSpeech(amb, !efa);
                    Gqa();
                }
            }
        }
    } catch (err) {
        thLogE(err);
    }
}

function Goa(tpa, amb) {
    if (amb.indexOf("\n") > -1) {
        var lYb = usa(true) + dca + "/SpeechCache/" + tpa + ".xml";
        var Koa = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        Koa.open("HEAD", lYb, false);
        Koa.send();
        return (Koa.status == 404);
    }
    return false;
}

function Moa(amb, jEb) {
    if (amb == null && amb.length == 0) {
        $rw_doSelection(-1);
        return;
    }
    if (!bea) {
        $rw_doSelection(-1);
        return;
    }
    try {
        var flash = NZb.getConnector();
        if (flash != null) {
            pxa(true);
            $rw_doSelection(0);
            flash.startSpeechFromFile(amb, jEb, !efa);
            Gqa();
        }
    } catch (err) {
        thLogE(err);
    }
}

function Soa(amb) {
    if (amb == null && amb.length == 0) {
        $rw_doSelection(-1);
        return;
    }
    if (!bea) {
        $rw_doSelection(-1);
        return;
    }
    try {
        var flash = NZb.getConnector();
        if (flash != null) {
            pxa(true);
            $rw_doSelection(0);
            flash.startHighlighting(amb);
        }
    } catch (err) {
        thLogE(err);
    }
}
var g_nPauseEventTimeout = 0;

function $rw_event_pause() {
    if (g_nPauseEventTimeout > 0) {
        clearTimeout(g_nPauseEventTimeout);
        g_nPauseEventTimeout = 0;
    }
    if ($rw_isSpeaking()) {
        var bBb = (new Date).getTime();
        if ((bBb - Cga) < aga) {
            return;
        }
        Mca = bBb;
        var flash = NZb.getConnector();
        if (flash != null) {
            if (!flash.canPause()) {
                g_nPauseEventTimeout = setTimeout("g_nPauseEventTimeout=0;$rw_event_pause();", 100);
                return;
            }
            if (flash.isPaused()) {
                if (!flash.resume()) {
                    g_nPauseEventTimeout = setTimeout("g_nPauseEventTimeout=0;$rw_event_pause();", 100);
                }
            } else {
                if (!flash.pause()) {
                    g_nPauseEventTimeout = setTimeout("g_nPauseEventTimeout=0;$rw_event_pause();", 100);
                }
            }
        }
    } else {
        if (ixa) {
            g_nPauseEventTimeout = setTimeout("g_nPauseEventTimeout=0;$rw_event_pause();", 100);
        }
    }
}

function $rw_event_funstop() {
    $rw_event_stop();
}

function $rw_event_stop() {
    if (!bea) {
        return;
    }
    try {
        if (uda) {
            Tab();
        }
        kCb();
        sda = null;
        Fea = null;
        if (PEb > 0) {
            clearTimeout(PEb);
            PEb = 0;
        }
        NEb.length = 0;
        if (FEb) {
            setTimeout($rw_event_stop, 100);
            return;
        }
        if (LDb > 0) {
            clearTimeout(LDb);
            LDb = 0;
        }
        if (MDb > 0) {
            clearTimeout(MDb);
            MDb = 0;
        }
        pxa(false);
        rxa(false);
        var flash = NZb.getConnector();
        if (flash != null) {
            flash.stopSpeechAlt();
        }
        JDb = null;
    } catch (err) {
        thLogE(err);
    }
}

function $rw_event_stop_limited() {
    if (!bea) {
        return;
    }
    try {
        kCb();
        sda = null;
        pxa(false);
        rxa(false);
        var flash = NZb.getConnector();
        if (flash != null) {
            flash.stopSpeechAlt();
        }
    } catch (err) {
        thLogE(err);
    }
}

function $rw_event_mp3() {
    try {
        var Yoa = null;
        if (dda != null) {
            var target = document.getElementById(dda);
            if (target != null) {
                Yoa = rMb(target);
            }
        } else {
            Yoa = poa();
        } if (Yoa != null) {
            Yoa = Yoa.trimTH();
            if (Yoa.length > 0) {
                if (Yoa.length > eda) {
                    alert("Too much text was selected for making an MP3 file, there is a " + (eda / 1024) + "k limit.");
                    return;
                }
                var flash = NZb.getConnector();
                if (flash != null) {
                    var Uib = "<br>The MP3 file for the text is being generated, <br> " + "this could take some time depending on the amount of text selected.<br><p align=\"center\">" + "<img alt=\"loading\" src=\"" + $g_strFileLoc + "rwimgs/request-processing.gif\"> </p>";
                    WCb(Mba, Uib);
                    bCb(true, Mba);
                    flash.getMP3File(Yoa, !efa);
                }
            }
        }
    } catch (err) {
        thLogE(err);
    }
}

function $rw_mp3reply(Uib) {
    try {
        if (typeof (eba_mp3_callback) != "undefined") {
            bCb(false, Mba);
            eval("" + eba_mp3_callback + "('" + Uib + "')");
        } else {
            if (Uib.length > 0) {
                var Tva = "Save Target As...";
                if (!Cfa) {
                    if (Ofa) {
                        Tva = "Save Link As...";
                    } else if (Pfa) {
                        Tva = "Download Linked File";
                    } else {
                        Tva = "Save Link As...";
                    }
                }
                Uib = "<br>Right click on the link below and select " + "'" + Tva + "' to save the mp3 file to your hard drive.<p></p>" + "<a type='application/octet-stream' href=\"" + Uib + "\">Download speech mp3 file.</a><p></p>";
                WCb(Mba, Uib);
                bCb(true, Mba);
            }
        }
    } catch (err) {
        thLogE(err);
    }
}
var coa = "setWarning";

function setWarning() {
    $rw_lexiSubmitEvent();
}

function $rw_lexiSubmitEvent() {
    mea = true;
}

function eoa() {
    if (Lfa) {
        var range = document.selection.createRange();
        if (range.text.length > 0) {
            return true;
        }
        if (!hda && top.frames.length > 0) {
            var i = 0;
            var Xmb = top.frames.length;
            for (i = 0; i < Xmb; i++) {
                try {
                    var Ndb = top.frames[i];
                    range = Ndb.document.selection.createRange();
                    if (range.text != null && range.text.length > 0) {
                        return true;
                    }
                } catch (e) {}
            }
        }
    } else {
        if (fia != null) {
            return true;
        }
        if (window.getSelection() != null && !window.getSelection().isCollapsed) {
            return true;
        }
        if (!hda && top.frames.length > 0) {
            var i = 0;
            var Xmb = top.frames.length;
            for (i = 0; i < Xmb; i++) {
                try {
                    if (top.frames[i].getSelection() != null && !top.frames[i].getSelection().isCollapsed) {
                        return true;
                    }
                } catch (e) {}
            }
        }
    }
    return false;
}

function ioa() {
    if (Lfa) {
        var range = document.selection.createRange();
        if (range.text == null || range.text.length == 0) {
            if (!hda && top.frames.length > 0) {
                var i = 0;
                var Xmb = top.frames.length;
                for (i = 0; i < Xmb; i++) {
                    try {
                        var Ndb = top.frames[i];
                        range = Ndb.document.selection.createRange();
                        if (range.text != null && range.text.length > 0) {
                            return range.parentElement();
                        }
                    } catch (e) {}
                }
            }
        } else {
            return range.parentElement();
        }
    } else {
        if (fia != null) {
            return fia.startContainer;
        }
        var LRb = window.getSelection();
        if (LRb.isCollapsed) {
            if (Yxa && Yxa.selectionStart != Yxa.selectionEnd) {
                return Yxa;
            }
            if (!hda && top.frames.length > 0) {
                var i = 0;
                var Xmb = top.frames.length;
                for (i = 0; i < Xmb; i++) {
                    try {
                        var nab = top.frames[i].getSelection();
                        if (nab != null && !nab.isCollapsed) {
                            return nab;
                        }
                    } catch (e) {}
                }
            }
        } else {
            return LRb.focusNode;
        }
    }
    return null;
}

function poa() {
    var Uib = '';
    if (Lfa) {
        var range = document.selection.createRange();
        if (range.text == null || range.text.length == 0) {
            if (!hda && top.frames.length > 0) {
                var i = 0;
                var Xmb = top.frames.length;
                for (i = 0; i < Xmb; i++) {
                    try {
                        var Ndb = top.frames[i];
                        range = Ndb.document.selection.createRange();
                        if (range.text != null && range.text.length > 0) {
                            break;
                        }
                    } catch (e) {}
                }
            }
        }
        Uib = range.text;
        var Ydb = range.duplicate();
        Ydb.collapse();
        var pjb = Ydb.parentElement();
        if (mMb(pjb)) {
            Uib = "";
        }
    } else {
        if (fia != null) {
            return fia.toString();
        }
        var LRb = window.getSelection();
        if (LRb.isCollapsed) {
            if (Yxa && Yxa.selectionStart != Yxa.selectionEnd) {
                return Yxa.value.substring(Yxa.selectionStart, Yxa.selectionEnd);
            }
            if (!hda && top.frames.length > 0) {
                var i = 0;
                var Xmb = top.frames.length;
                for (i = 0; i < Xmb; i++) {
                    try {
                        var nab = top.frames[i].getSelection();
                        if (nab != null && !nab.isCollapsed) {
                            LRb = nab;
                            break;
                        }
                    } catch (e) {}
                }
            }
        }
        if (LRb.anchorNode) {
            if (mMb(LRb.anchorNode)) {
                return "";
            }
        }
        if (LRb.focusNode && LRb.focusNode.id) {
            if (LRb.focusNode.id == "flashcontent") {
                return "";
            }
        }
        if (!LRb.isCollapsed) {
            Uib = LRb.toString();
        } else {
            Uib = "";
        }
    }
    return Uib;
}

function xoa() {
    pxa(false);
    rxa(false);
}
var yoa = -1;

function $rw_doSelection(pya) {
    if (pya < 0) {
        if (pya == -2 && $rw_isSpeaking()) {
            $rw_speechCompleteCallback();
        } else if (pya == -3) {
            $rw_speechErrorCallback();
        }
        mxa = setTimeout(xoa, 200);
        txa(false);
        if (uda) {
            Tab();
        }
    } else {
        txa(true);
    } if (KDb && KDb.isRange()) {
        if (pya != yoa) {
            if (pya == -1 || pya == -2 || pya == -3) {
                if (yoa > -1 && KDb.hTb != null) {
                    try {
                        var hTb = KDb.hTb;
                        var Xmb = hTb.length;
                        if (yoa < Xmb) {
                            var Wbb = hTb[yoa].range;
                            var Qgb = xOb(Wbb.body, Wbb.Qfb.path, Wbb.Qfb.offset, Wbb.Rfb.path, Wbb.Rfb.offset);
                            var Zfb = Qgb.Zfb;
                            var afb = Qgb.afb;
                            if (Zfb != null && afb != null) {
                                rw_removeSpeechHighlight(Rqa(Zfb, afb), true);
                            } else {
                                bra("Cannot determine valid range to remove speech highlight from. " + Zfb + " " + afb);
                            }
                        }
                    } catch (err) {
                        bra("$rw_doSelection:clear last speech:" + err.toString());
                    }
                }
                yoa = -1;
                try {
                    KDb.unhighlightRange();
                } catch (err) {
                    bra("$rw_doSelection:unhighlightRange:" + err.message);
                }
            } else if (KDb.hTb != null) {
                if (yoa == pya) {
                    return;
                }
                var hTb = KDb.hTb;
                var Xmb = hTb.length;
                try {
                    if (yoa > -1 && yoa < Xmb) {
                        var Wbb = hTb[yoa].range;
                        var Qgb = xOb(Wbb.body, Wbb.Qfb.path, Wbb.Qfb.offset, Wbb.Rfb.path, Wbb.Rfb.offset);
                        var Zfb = Qgb.Zfb;
                        var afb = Qgb.afb;
                        if (Zfb != null && afb != null) {
                            rw_removeSpeechHighlight(Rqa(Zfb, afb), true);
                        } else {
                            bra("Cannot determine valid range to remove speech highlight from. " + Zfb + " " + afb);
                        }
                    }
                } catch (err) {
                    thLogE(err);
                }
                if (pya < 0 || pya >= Xmb) {
                    return;
                }
                yoa = pya;
                var Wbb = hTb[pya].range;
                try {
                    var Qgb = xOb(Wbb.body, Wbb.Qfb.path, Wbb.Qfb.offset, Wbb.Rfb.path, Wbb.Rfb.offset);
                    var Zfb = Qgb.Zfb;
                    var afb = Qgb.afb;
                    if (Zfb != null && afb != null) {
                        var result = rw_setSpeechRangeImpl(Zfb.node, Zfb.offset, afb.node, afb.offset, "csp");
                        if (result != null && result.node != null) {
                            bRb(result.node);
                        } else {
                            bRb(Zfb.node);
                        }
                    } else {
                        bra("Cannot determine valid range to add speech highlight from. " + Zfb + " " + afb);
                    }
                } catch (err) {
                    bra("error with highlight speech range in rw_doSelection:" + err.message);
                }
            }
        }
    }
    if (pya == -1 || pya == -2 || pya == -3) {
        yoa = -1;
        KDb = null;
        var Qpa = null;
        if (jCb.length > 0) {
            Qpa = new Array();
        }
        while (jCb.length > 0) {
            if (typeof (jCb[0]) == "string") {
                if (jCb[0].indexOf("$rw_readNextTarget") > -1) {
                    break;
                }
            }
            Qpa.push(jCb.shift());
        }
        if (pya == -1) {
            if (jCb.length > 0) {
                Qpa.push(jCb.shift());
            }
        } else if (pya == -3) {
            var flash = NZb.getConnector();
            var Spa = flash.getLastError();
            var wcb = "An error occurred with speech.  " + Spa;
            if (SpeechStream.actionOnError.action == SpeechStream.actionOnError.SKIP) {
                bra(wcb);
                if (jCb.length > 0) {
                    Qpa.push(jCb.shift());
                }
            } else {
                ssa(wcb);
            }
        }
        if (Qpa != null && Qpa.length > 0) {
            FDb(Qpa);
        }
    }
}

function $displayMe(Uib) {
    ssa(Uib);
}

function Xpa(Ypa, Zpa, apa, bpa, a_bool_scrollbars, a_bool_resizable, a_bool_menubar, a_bool_toolbar, a_bool_addressbar, a_bool_statusbar, a_bool_fullscreen) {
    var Upa = (screen.width - apa) / 2;
    var Vpa = (screen.height - bpa) / 2;
    var Wpa = 'height=' + bpa + ',width=' + apa + ',top=' + Vpa + ',left=' + Upa + ',scrollbars=' + a_bool_scrollbars + ',resizable=' + a_bool_resizable + ',menubar=' + a_bool_menubar + ',toolbar=' + a_bool_toolbar + ',location=' + a_bool_addressbar + ',statusbar=' + a_bool_statusbar + ',fullscreen=' + a_bool_fullscreen + '';
    var cpa = window.open(Ypa, Zpa, Wpa);
    if (parseInt(navigator.appVersion, 10) >= 4) {
        cpa.window.focus();
    }
}

function epa(spa) {
    var start = document.cookie.indexOf(spa + "=");
    var gpa = start + spa.length + 1;
    if ((!start) && (spa != document.cookie.substring(0, spa.length))) {
        return null;
    }
    if (start == -1) {
        return null;
    }
    var end = document.cookie.indexOf(";", gpa);
    if (end == -1) {
        end = document.cookie.length;
    }
    return unescape(document.cookie.substring(gpa, end));
}

function kpa(spa, mpa, npa, tpa, upa, qpa) {
    var ipa = new Date();
    ipa.setTime(ipa.getTime());
    if (npa) {
        npa = npa * 1000 * 60 * 60 * 24;
    }
    var jpa = new Date(ipa.getTime() + (npa));
    document.cookie = spa + "=" + escape(mpa) + ((npa) ? ";expires=" + jpa.toGMTString() : "") + ((tpa) ? ";path=" + tpa : "") + ((upa) ? ";domain=" + upa : "") + ((qpa) ? ";secure" : "");
}

function rpa(spa, tpa, upa) {
    if (epa(spa)) {
        document.cookie = spa + "=" + ((tpa) ? ";path=" + tpa : "") + ((upa) ? ";domain=" + upa : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
    }
}

function xpa() {
    if (Zeb()) {
        var hlb = jdb();
        WCb(Qba, hlb);
        bCb(true, Qba);
        var hCb = zxa("rwcollatewrapper");
        var ypa = document.getElementById("rwCollect");
        if (ypa != null) {
            if (parseInt(hCb.scrollHeight, 10) >= 380) {
                var rwTextCollect = zxa("rwTextCollect");
                rwTextCollect.style.height = (360);
            } else {
                var rwTextCollect = zxa("rwTextCollect");
                rwTextCollect.style.height = (hCb.scrollHeight + 24);
            }
        }
    }
}

function $rw_event_axendolink() {
    document.location = "http://www.browsealoud.info";
}

function dis(node) {
    ssa(node.tagName + "|" + node.nodeValue + "|" + AOb(node));
}

function Dqa(YPb, Fqa) {
    if (YPb == null) {
        return;
    }
    try {
        var YTb = false;
        var Xmb = YPb.length;
        if (Xmb > 0) {
            if (YPb.charAt(Xmb - 1) == ")" || YPb.substr(Xmb - 1) == ";") {
                YTb = true;
            }
        } else {
            return;
        } if (YTb) {
            eval(YPb);
        } else {
            try {
                if (typeof (Fqa) != "undefined" && Fqa != null) {
                    eval(YPb + "(" + Fqa + ");");
                } else {
                    eval(YPb + "();");
                }
            } catch (innerErr) {
                eval(YPb);
            }
        }
    } catch (err) {
        thLogE(err);
    }
}

function Gqa() {
    if (typeof (eba_speech_started_callback) == "string") {
        Dqa(eba_speech_started_callback.trimTH());
    }
}

function $rw_renderingSpeechCallback() {
    if (typeof (eba_rendering_speech_callback) == "string") {
        Dqa(eba_rendering_speech_callback.trimTH());
    }
}

function $rw_speechCompleteCallback() {
    if (typeof (eba_speech_complete_callback) == "string") {
        Dqa(eba_speech_complete_callback.trimTH(), "'Success'");
    }
}

function $rw_speechErrorCallback() {
    if (typeof (eba_speech_complete_callback) == "string") {
        Dqa(eba_speech_complete_callback.trimTH(), "'Error'");
    }
}

function rw_pageCompleteCallBack() {
    if (typeof (eba_page_complete_callback) == "string") {
        Dqa(eba_page_complete_callback.trimTH());
    }
}

function $rw_event_calculator() {
    try {
        WCb(Uba, "");
        bCb(true, Uba);
        rw_calClearMem();
        rw_calAddDigit('0');
    } catch (err) {
        thLogE(err);
    }
}

function $rw_event_generate_cache() {
    try {
        $rwj.blockUI({
            message: '<div id="rwDragMeGenerateCache" class="rwToolbarCaptionGenerateCache" ignore> Caching page please wait...</div><br><span id="pb1" ignore>0%</span>'
        });
        $rwj('#pb1').progressBar(0);
        vha();
    } catch (err) {
        thLogE(err);
    }
}

function $rw_event_check_cache() {
    try {
        $rwj.blockUI({
            message: '<div id="rwDragMeGenerateCache" class="rwToolbarCaptionGenerateCache" ignore> Reading Cache please wait...</div><br><span id="pb1" ignore>0%</span>'
        });
        $rwj('#pb1').progressBar(0);
        cia();
    } catch (err) {
        $rwj.unblockUI();
        thLogE(err);
    }
}

function Jqa(aUb) {
    var Uib = "";
    if (aUb.nodeType == 3) {
        Uib = aUb.nodeValue;
    } else if (aUb.nodeType == 1) {
        var yMb = aUb.firstChild;
        while (yMb != null) {
            if (yMb.nodeType == 3) {
                Uib += yMb.nodeValue;
            } else if (yMb.nodeType == 1) {
                Uib += Jqa(yMb);
            }
            yMb = yMb.nextSibling;
        }
    }
    return Uib;
}

function aa(a) {}

function Mqa(wcb) {
    var nn = 150;
    if (wcb.length > nn) {
        while (wcb.length > nn) {
            var Lqa = wcb.substring(0, nn);
            wcb = wcb.substring(nn);
            bra(Lqa);
        }
    } else {
        bra(wcb);
    }
}
String.prototype.trimSpaceTH = function () {
    return this.replace(/^[\t\r\n ]+/, "").replace(/[\t\r\n ]+$/, "");
};
String.prototype.trimSpaceStartTH = function () {
    return this.replace(/^[\t\r\n ]+/, "");
};
String.prototype.trimSpaceEndTH = function () {
    return this.replace(/[\t\r\n ]+$/, "");
};
String.prototype.trimTH = function () {
    return this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
};
String.prototype.trimStartTH = function () {
    return this.replace(/^[\s\xA0]+/, "");
};
String.prototype.trimEndTH = function () {
    return this.replace(/[\s\xA0]+$/, "");
};
String.prototype.equalsTH = function (s) {
    if (this.length != s.length) {
        return false;
    }
    for (var i = 0; i < this.length; i += 1) {
        if (this.charAt(i) != s.charAt(i)) {
            return false;
        }
    }
    return true;
};

function Rqa(dqa, eqa) {
    var Nqa = Vga;
    Vga = false;
    var Yqa = new Array();
    try {
        var Ufb = dqa.node;
        var Vfb = eqa.node;
        if (Ufb.nodeType != 3) {
            if (Ufb.nodeType == 1 && Ufb.tagName.toLowerCase() == "math") {
                Yqa.push(Ufb);
                if (Ufb == Vfb) {
                    return Yqa;
                } else {
                    Ufb = OKb(Ufb, false, Vfb);
                }
            } else if (Cfa && Ufb.nodeType == 1 && Ufb.firstChild != null && Ufb.firstChild.tagName.toLowerCase() == "math") {
                Yqa.push(Ufb.firstChild);
                if (Ufb == Vfb) {
                    return Yqa;
                } else {
                    Ufb = Ufb.firstChild;
                    Ufb = OKb(Ufb, false, Vfb);
                }
            } else {
                Ufb = sIb(Ufb, false);
                if (Ufb == null) {
                    return Yqa;
                }
            }
        }
        if (Ufb == Vfb) {
            if (Ufb.nodeType == 3) {
                var Uib = Ufb.nodeValue;
                if (Uib.length > 0 && dqa.offset < Uib.length && eqa.offset > 0 && eqa.offset > dqa.offset) {
                    Yqa.push(Ufb);
                }
            }
        } else {
            if (Ufb.nodeType == 3) {
                var Uib = Ufb.nodeValue;
                if (Uib.length > 0 && dqa.offset < Uib.length) {
                    Yqa.push(Ufb);
                }
            } else {
                if (Ufb.nodeType == 1 && Ufb.tagName.toLowerCase() == "math") {
                    Yqa.push(Ufb);
                } else if (Cfa && Ufb.nodeType == 1 && Ufb.firstChild != null && Ufb.firstChild.tagName.toLowerCase() == "math") {
                    Ufb = Ufb.firstChild;
                    Yqa.push(Ufb);
                }
            }
            var bfb = eKb(Ufb, false, Vfb, true);
            while (bfb != null) {
                if (bfb == Vfb) {
                    if (Vfb.nodeType == 3) {
                        var Uib = Vfb.nodeValue;
                        if (Uib.length > 0 && eqa.offset > 0) {
                            Yqa.push(Vfb);
                        }
                    } else {
                        if (bfb.nodeType == 1 && bfb.tagName.toLowerCase() == "math") {
                            Yqa.push(bfb);
                        } else if (Cfa && bfb.nodeType == 1 && bfb.firstChild != null && bfb.firstChild.tagName.toLowerCase() == "math") {
                            Yqa.push(bfb.firstChild);
                        }
                    }
                    break;
                } else {
                    Yqa.push(bfb);
                }
                bfb = eKb(bfb, false, Vfb, true);
            }
        }
    } catch (err) {
        bra("rw_setHighlight error:" + err.message);
    }
    Vga = Nqa;
    return Yqa;
}

function rw_getListOfNodes(dqa, eqa) {
    var Yqa = new Array();
    try {
        var Ufb = dqa.node;
        var Vfb = eqa.node;
        if (Ufb == Vfb) {
            Yqa.push(Ufb);
        } else {
            Yqa.push(Ufb);
            var bfb = OKb(Ufb, false, Vfb, true);
            while (bfb != null) {
                Yqa.push(bfb);
                bfb = eKb(bfb, false, Vfb, true);
            }
        }
    } catch (err) {
        bra("rw_getListOfNodes error:" + err.message);
    }
    return Yqa;
}

function lqa(gib) {
    if (gib == null) {
        return gib;
    }
    var jAb = gib.parentNode;
    if (jAb != null && gib.nodeType == 3) {
        var YAb = gib.ownerDocument;
        while (gib.previousSibling != null && gib.previousSibling.nodeType == 3) {
            var Uib = gib.previousSibling.nodeValue + gib.nodeValue;
            var hkb = YAb.createTextNode(Uib);
            jAb.removeChild(gib.previousSibling);
            jAb.replaceChild(hkb, gib);
            gib = hkb;
        }
        while (gib.nextSibling != null && gib.nextSibling.nodeType == 3) {
            var Uib = gib.nodeValue + gib.nextSibling.nodeValue;
            var hkb = YAb.createTextNode(Uib);
            jAb.removeChild(gib.nextSibling);
            jAb.replaceChild(hkb, gib);
            gib = hkb;
        }
    }
    return gib;
}

function qqa(rqa) {
    try {
        var Uib = rqa + "";
        Uib = Uib.trimTH();
        rqa.collapseToStart();
        var Ufb = rqa.anchorNode;
        var tqa = rqa.anchorOffset;
        if (Ufb.nodeType != 3) {
            Ufb = XKb(Ufb, false, null);
            tqa = 0;
        } else if (tqa == Ufb.nodeValue.length) {
            Ufb = XKb(Ufb, false, null);
            tqa = 0;
        }
        if (Ufb != null && Ufb.nodeType == 3) {
            var ofb = Ufb.nodeValue.substring(tqa);
            var vqa = ofb.trimStartTH();
            while (ofb.length > vqa.length) {
                if (vqa.length == 0) {
                    Ufb = XKb(Ufb, false, null);
                    tqa = 0;
                    if (Ufb == null || Ufb.nodeType != 3) {
                        break;
                    }
                } else {
                    tqa += ofb.length - vqa.length;
                }
                ofb = Ufb.nodeValue.substring(tqa);
                vqa = ofb.trimStartTH();
            }
        }
        var range = Qra();
        if (Ufb == null) {
            range.setStart(rqa.anchorNode, rqa.anchorOffset);
            range.setEnd(rqa.anchorNode, rqa.anchorOffset);
        } else {
            if (Ufb.nodeType != 3) {
                range = Bra(Ufb, tqa, Uib);
            } else {
                if ((tqa + Uib.length) < Ufb.nodeValue.length) {
                    range.setStart(Ufb, tqa);
                    range.setEnd(Ufb, tqa + Uib.length);
                } else {
                    range = Bra(Ufb, tqa, Uib);
                }
            }
        }
        return range;
    } catch (ignore) {
        var range = Qra();
        range.setStart(rqa.anchorNode, rqa.anchorOffset);
        range.setEnd(rqa.anchorNode, rqa.anchorOffset);
        return range;
    }
}

function Bra(rEb, ulb, Jmb) {
    var range = Qra(rEb.ownerDocument.body);
    range.setStart(rEb, ulb);
    range.setEnd(rEb, ulb);
    var Xmb = 0;
    var xqa = Jmb.length + ulb;
    var bfb = rEb;
    while (bfb != null && Xmb < xqa) {
        if (bfb.nodeType == 3) {
            var Uib = bfb.nodeValue;
            Xmb += Uib.length;
        }
        if (Xmb < xqa) {
            bfb = XKb(bfb, false, null);
        } else {
            var Ara = Xmb - xqa;
            range.setEnd(bfb, bfb.nodeValue.length - Ara);
        }
    }
    return range;
}

function Ira() {
    var GRb = null;
    if (window.getSelection) {
        if (fia != null) {
            return null;
        }
        var LRb = window.getSelection();
        var MRb = null;
        if (!LRb.isCollapsed) {
            MRb = LRb;
        } else {
            LRb = TQb(window);
            if (LRb.MRb) {
                MRb = LRb.MRb;
            }
        } if (MRb == null) {
            return null;
        }
        GRb = MRb;
    } else if (document.selection) {
        var range = document.selection.createRange();
        if (range.text.length > 0) {
            NUb = window;
            GRb = range;
        } else {
            var fgb = VQb(window);
            if (fgb.GRb) {
                GRb = fgb.GRb;
            }
        }
    }
    return GRb;
}

function Nra() {
    var Uib = "";
    if (Lfa) {
        var range = document.body.createTextRange();
        range.expand("textedit");
        Uib = range.text;
    } else {
        var range = document.createRange();
        range.setStartBefore(document.body);
        range.setEndAfter(document.body);
        Uib = range.toString();
    }
    return Uib;
}

function Ora(gib) {
    if (gib.innerText) {
        return gib.innerText;
    } else if (gib.textContent) {
        return gib.textContent;
    } else {
        return "";
    }
}

function Qra(PVb) {
    if (typeof (PVb) == 'undefined' || PVb == null) {
        PVb = document.body;
    }
    if (Lfa) {
        return PVb.createTextRange();
    } else {
        var YAb = PVb.ownerDocument;
        return YAb.createRange();
    }
}

function Xra(gib) {
    if (gib.document) {
        return gib.document.body;
    } else {
        return gib.ownerDocument.body;
    }
}

function rw_getWindow(gib) {
    try {
        if (gib == null) {
            return window;
        }
        if (top.frames.length === 0) {
            return window;
        } else {
            var Tra = gib.ownerDocument.body;
            var Ura = window.document.body;
            if (Tra === Ura) {
                return window;
            }
            if (!hda) {
                var i = 0;
                var Xmb = top.frames.length;
                for (i = 0; i < Xmb; i++) {
                    try {
                        var Fua = top.frames[i].document.body;
                        if (Fua === Tra) {
                            return top.frames[i];
                        }
                    } catch (e) {}
                }
            }
        }
    } catch (err) {
        bra("Error rw_getWindow: " + err);
    }
    return window;
}

function bra(Aab) {
    if (window.console && window.console.log) {
        window.console.log(Aab);
    } else if (typeof (dump) != 'undefined') {
        dump(Aab + "\n");
    }
}

function thLogE(error) {
    if (error != null) {
        if (error.name && error.message) {
            bra("Error: " + "" + error.name + ". : " + error.message);
        } else if (error.message) {
            bra("Error: " + "" + error.message);
        }
    }
}

function dra(Uib) {
    if (Uib == null) {
        return "";
    }
    Uib = Uib.trimTH();
    var pra = "";
    var i = 0;
    var n = Uib.length;
    var ylb = -1;
    var zlb = -1;
    for (i = 0; i < n; i++) {
        var ROb = Uib.charCodeAt(i);
        if ((ROb > 64 && ROb < 91) || (ROb > 96 && ROb < 123)) {
            if (ylb == -1) {
                ylb = i;
            }
        } else {
            if (ylb > -1) {
                if (ROb == 39) {
                    if (i < (n - 1)) {
                        nValNext = Uib.charCodeAt(i + 1);
                        if ((nValNext > 64 && nValNext < 91) || (nValNext > 96 && nValNext < 123)) {
                            ++i;
                        } else {
                            zlb = i;
                            break;
                        }
                    } else {
                        zlb = i;
                        break;
                    }
                } else {
                    zlb = i;
                    break;
                }
            }
        }
    }
    if (ylb > -1) {
        if (zlb > -1) {
            pra = Uib.substring(ylb, zlb);
        } else {
            pra = Uib.substring(ylb);
        }
    }
    return pra;
}

function ira(Uib) {
    if (Uib == null) {
        return "";
    }
    Uib = Uib.trimTH();
    Uib = Uib.replace(/[\s\xA0]+/g, " ");
    var pra = "";
    var i = 0;
    var n = Uib.length;
    var ylb = -1;
    var zlb = -1;
    for (i = 0; i < n; i++) {
        var ROb = Uib.charCodeAt(i);
        if ((ROb > 64 && ROb < 91) || (ROb > 96 && ROb < 123) || ROb > 127) {
            if (ylb == -1) {
                ylb = i;
            }
        } else {
            if (ylb > -1) {
                if (ROb == 39) {
                    if (i < (n - 1)) {
                        nValNext = Uib.charCodeAt(i + 1);
                        if ((nValNext > 64 && nValNext < 91) || (nValNext > 96 && nValNext < 123) || ROb > 127) {
                            ++i;
                        } else {
                            zlb = i;
                            break;
                        }
                    } else {
                        zlb = i;
                        break;
                    }
                } else {
                    zlb = i;
                    break;
                }
            }
        }
    }
    if (ylb > -1) {
        if (zlb > -1) {
            pra = Uib.substring(ylb, zlb);
        } else {
            pra = Uib.substring(ylb);
        }
    }
    return pra;
}

function nra(Jmb) {
    if (Jmb == null) {
        return "";
    }
    var pra = Jmb.trimTH();
    if (pra.length == 0) {
        return "";
    }
    pra = pra.replace(/[\s\xA0]+/g, " ");
    var qra = 0;
    var bmb = pra.indexOf(' ');
    while (bmb > -1) {
        ++qra;
        if (qra == 3) {
            pra = pra.substr(0, bmb);
            break;
        }
        bmb = pra.indexOf(' ', bmb + 1);
    }
    return pra;
}

function sra(Umb) {
    return (Umb > 64 && Umb < 91) || (Umb > 96 && Umb < 123);
}

function ura(Umb) {
    return (Umb > 47 && Umb < 58);
}

function wra(Umb) {
    return (Umb > 47 && Umb < 58) || (Umb > 63 && Umb < 91) || (Umb > 94 && Umb < 123);
}

function zra(Uib) {
    if (Uib == null) {
        return false;
    }
    for (var i = 0; i < Uib.length; i++) {
        var ROb = Uib.charCodeAt(i);
        if (ROb == 39 || (ROb > 47 && ROb < 58) || (ROb > 64 && ROb < 91) || ROb == 96 || (ROb > 96 && ROb < 123)) {
            return true;
        }
    }
    return false;
}

function Csa(Dsa) {
    if (Dsa == null || Dsa.length == 0) {
        return Dsa;
    }
    var Xmb = Dsa.length;
    for (var i = 0; i < Xmb; i++) {
        var ROb = Dsa.charCodeAt(i);
        if (!(ROb == 39 || ROb == 44 || ROb == 46 || (ROb > 47 && ROb < 58) || (ROb > 63 && ROb < 91) || (ROb > 94 && ROb < 123))) {
            Dsa = Dsa.replace(Dsa.charAt(i), ' ');
        }
    }
    return Dsa.trimTH();
}

function Fsa(range) {
    var Uib = "";
    if (range.text) {
        Uib = range.text;
    } else {
        Uib = range.toString();
    }
    return Uib;
}

function Hsa() {
    var ZRb = Ira();
    if (ZRb == null) {
        return;
    }
    if (ZRb.collapseToStart) {
        ZRb.collapseToStart();
    } else if (ZRb.execCommand) {
        ZRb.execCommand("UnSelect", false, null);
    }
}

function Osa(gib) {
    if (gib != null) {
        if (Lfa) {
            var range = Qra(gib.ownerDocument.body);
            range.moveToElementText(gib);
            range.select();
        } else {
            var bfb = mIb(gib, false, null);
            if (bfb != null) {
                var range = new Pla(gib, 0, bfb, 0);
                Qsa(range);
            }
        }
    }
}

function Qsa(ddb) {
    if (Lfa) {
        ddb.select();
    } else {
        var start = ddb.Rgb;
        var end = ddb.Sgb;
        var NUb = rw_getWindow(start.node);
        if (!Pfa) {
            var Pfb = NUb.getSelection();
            Pfb.collapse(start.node, start.offset);
            if (Pfb.extend) {
                Pfb.extend(end.node, end.offset);
            } else {
                var range = NUb.document.createRange();
                range.setStart(start.node, start.offset);
                range.setEnd(end.node, end.offset);
                Pfb.addRange(range);
            }
        } else {
            NUb.getSelection().setBaseAndExtent(start.node, start.offset, end.node, end.offset);
        }
    }
}

function Ssa(Wmb) {
    return (Wmb.search(/[\s\xa0]/) > -1);
}

function Usa(eRb) {
    var Vsa = eRb + "  ";
    if (eRb.tagName != null) {
        Vsa += eRb.tagName + " ";
    }
    if (eRb.className != null) {
        Vsa += eRb.className + " ";
    }
    for (prop in eRb) {
        Vsa += prop + "  " + " | ";
    }
    alert(Vsa);
}

function Wsa(eRb) {
    var Vsa = eRb + "  ";
    for (prop in eRb) {
        Vsa += prop + "  " + " | ";
    }
    return Vsa;
}

function $rw_inputFieldFilter(pdb) {
    if (pdb == null || pdb.length == 0) {
        return pdb;
    }
    var i;
    var Xmb = pdb.length;
    for (i = Xmb - 1; i >= 0; i--) {
        var c = pdb.charCodeAt(i);
        if ((c < 44 && c != 39) || c == 47 || (c > 57 && c < 65) || (c > 90 && c < 97 && c != 95) || (c > 122 && c < 128)) {
            pdb = pdb.substring(0, i) + pdb.substr(i + 1);
        }
    }
    return pdb;
}

function $rw_handleFieldInput(rib) {
    var pre = rib.value;
    var post = $rw_inputFieldFilter(pre);
    if (pre != post) {
        rib.value = post;
    }
}

function $rw_handleFieldKeyDownInput(evt) {
    if (!evt.ctrlKey) {
        var c = evt.keyCode;
        if ((c > 32 && c < 44 && c != 39) || c == 47 || (c > 57 && c < 65) || (c > 90 && c < 97 && c != 95) || (c > 122 && c < 128)) {
            return false;
        }
    }
    return true;
}

function asa(c) {
    return (c > 64 && c < 91) || (c > 96 && c < 123) || c == 39 || (c > 128 && c != 160);
}

function dsa(qFb) {
    var Xmb = qFb.length;
    var i = 0;
    var ROb;
    for (i = 0; i < Xmb; i++) {
        ROb = qFb.charCodeAt(i);
        if ((ROb > 63 && ROb < 91) || (ROb > 96 && ROb < 123) || (ROb > 127 && ROb != 160)) {
            return true;
        } else if (ROb > 46 && ROb < 58) {
            return true;
        } else if ((ROb > 35 && ROb < 39) || ROb == 43 || ROb == 61) {
            return true;
        } else if (ROb == 42 || ROb == 45 || ROb == 92 || (ROb > 93 && ROb < 97)) {
            if (kca != "VW Kate") {
                return true;
            }
        }
    }
    if (gfa) {
        if (dTb(qFb)) {
            return true;
        }
    }
    return false;
}

function nsa(WNb) {
    try {
        if (WNb == null || WNb.Zfb == null || WNb.afb == null) {
            return false;
        }
        var Zfb = WNb.Zfb;
        var afb = WNb.afb;
        var lSb = Zfb.node;
        var aNb = afb.node;
        var RNb = true;
        var bNb = false;
        var cNb = lSb;
        var Uib = "";
        while (cNb != null) {
            bNb = ZFb(cNb);
            if (bNb || cNb.nodeType == 3) {
                var fgb = ANb(cNb);
                if (fgb != null && fgb != "") {
                    if (cNb == aNb && afb.offset > -1) {
                        fgb = fgb.substring(0, afb.offset);
                    }
                    if (cNb == lSb && Zfb.offset > 0) {
                        fgb = fgb.substring(Zfb.offset);
                    }
                    if (dsa(fgb)) {
                        return true;
                    }
                }
            }
            if (bNb) {
                cNb = mIb(cNb, false, aNb);
            } else {
                if (RNb) {
                    cNb = YIb(cNb, true, aNb);
                } else {
                    cNb = LIb(cNb, false, aNb);
                }
            }
            RNb = false;
        }
    } catch (err) {
        thLogE(err);
    }
    return false;
}

function qsa(d) {
    return d.toString(16);
}

function rsa(h) {
    return parseInt(h, 16);
}

function ssa(pdb) {
    if (Tca) {
        alert(pdb);
    } else {
        bra(pdb);
    }
}

function $rw_enable_alerts(p_bEnable) {
    if (typeof (p_bEnable) == "boolean") {
        Tca = p_bEnable;
    }
}

function $rw_uriEncode(pdb) {
    return encodeURIComponent(pdb);
}

function usa(pva) {
    if (pva) {
        return ((xda || yda) ? "https://" : "http://");
    } else {
        return ((xda || zda) ? "https://" : "http://");
    }
} /*Code designed and developed by Stuart McWilliams.*/
SpeechStream.IconParameters = function () {
    this.ICON_NAME = 0;
    this.ICON_ALT_TEXT = 1;
    this.ICON_OFFSET = 2;
    this.ICON_IS_TOGGLE = 3;
    this.ICON_TOGGLE_STATE = 4;
};
SpeechStream.wsa = new SpeechStream.IconParameters();

function ysa(YPb, Zta, WVb, qya) {
    var wsa = SpeechStream.wsa;
    var bmb = eea;
    g_icons[eea] = new Array(5);
    g_icons[eea][wsa.ICON_NAME] = YPb;
    g_icons[eea][wsa.ICON_ALT_TEXT] = Zta;
    g_icons[eea][wsa.ICON_OFFSET] = WVb;
    g_icons[eea][wsa.ICON_IS_TOGGLE] = qya;
    g_icons[eea][wsa.ICON_TOGGLE_STATE] = false;
    eea++;
    return bmb;
}

function Jta(YPb) {
    var i = 0;
    for (i = 0; i < g_icons.length; i++) {
        if (g_icons[i][SpeechStream.wsa.ICON_NAME] == YPb) {
            return i;
        }
    }
    return -1;
}

function Lta(i) {
    var Dta = SpeechStream.wsa;
    var hib = g_icons[i][Dta.ICON_NAME];
    var zZb = g_icons[i][Dta.ICON_ALT_TEXT];
    var Dgb = g_icons[i][Dta.ICON_OFFSET];
    var Hta = g_icons[i][Dta.ICON_IS_TOGGLE];
    var Ita = false;
    if (Hta) {
        if (hib == "hover" + "" && typeof (eba_initial_speech_on) == "boolean" && eba_initial_speech_on) {
            g_icons[i][Dta.ICON_TOGGLE_STATE] = true;
            Ita = true;
        }
    }
    var Mta = 33;
    if (hib.equalsTH("submit" + "")) {
        Mta = 53;
    }
    sea += Mta;
    var Nta = Wta(hib, "flat" + "", zZb, Mta, Dgb, true, Ita);
    if (Tfa && (Vfa < 6 || !Wfa)) {
        axa(Nta, "touchstart", function () {
            $rw_getTouchSelection();
        });
    }
    axa(Nta, "mouseover", function () {
        if (!Sfa) {
            if (!g_icons[i][Dta.ICON_TOGGLE_STATE]) {
                fya(hib, i, Hta);
            }
        }
    });
    axa(Nta, "mouseout", function () {
        if (!g_icons[i][Dta.ICON_TOGGLE_STATE]) {
            jya(hib, i, Hta);
        }
    });
    axa(Nta, "mousedown", function () {
        if (!Sfa) {
            if (!g_icons[i][Dta.ICON_TOGGLE_STATE]) {
                nya(hib, i, Hta);
            }
        }
        oea = hib;
    });
    axa(Nta, "mouseup", function () {
        if (oea.equalsTH(hib)) {
            if ($rw_blockClick(hib)) {
                return true;
            } else {
                if (xfa && Tfa) {
                    try {
                        var Fua = Gua(true);
                        if (Fua) {
                            if (Fua.ipadTinyMceFocus) {
                                Fua.ipadTinyMceFocus = false;
                                var Pta = window.pageXOffset;
                                var Qta = window.pageYOffset;
                                var fgb = document.getElementById(SpeechStream.tinymceipadfix);
                                fgb.focus();
                                window.scrollTo(Pta, Qta);
                                fgb.blur();
                            }
                        }
                    } catch (err) {}
                }
                var wcb;
                wcb = '$rw_event_' + hib + '(null, ' + i + ');';
                eval(wcb);
            }
        }
        if (!Sfa) {
            if (!g_icons[i][Dta.ICON_TOGGLE_STATE]) {
                fya(hib, i, Hta);
            }
        }
    });
    return Nta;
}

function Wta(YPb, vua, Zta, ata, pya, cCb, dta) {
    var Tta = ata * Jta(YPb);
    var Uta = 0;
    if (dta) {
        Uta = 66;
    }
    var Qva = {};
    Qva["ignore"] = "1";
    Qva["name"] = YPb + vua;
    Qva["width"] = "" + ata;
    Qva["height"] = "32";
    Qva["title"] = Zta;
    Qva["unselectable"] = "on";
    if (cCb) {
        Qva["style"] = "left:" + Tta + "px; background-position: -" + pya + "px -" + Uta + "px;";
    } else {
        Qva["style"] = "left:" + Tta + "px; background-position: -" + pya + "px -" + Uta + "px;";
    }
    var WPb = XPb("span", Qva, YPb, null, false);
    if (Cfa) {
        WPb.onselectstart = function () {
            return false;
        };
    } else {
        WPb.onmousedown = function () {
            return false;
        };
    }
    return WPb;
}

function gta() {
    sea += 100;
    nLeftPosition = 33 * eea;
    var Qva = {};
    Qva["ignore"] = "1";
    if (Cfa) {
        Qva["style"] = "width:95px;position:relative;left:" + nLeftPosition + "px;top:6px;border: 1px solid;color:#000000;backgroundColor:#f1efe5";
    } else {
        Qva["style"] = "width:95px;position:relative;left:" + nLeftPosition + "px;top:6px;border: 1px solid;color:#000000;background-color:#f1efe5";
    }
    var hta = XPb("select", Qva, null, null, true);
    bxa(hta, "change", function () {
        $rw_setSpeedValue(parseInt(hta.value, 10));
    });
    var ita;
    Qva = {};
    Qva["ignore"] = "1";
    Qva["value"] = "" + SLOW_SPEED;
    if (uca == -3 || uca == SLOW_SPEED) {
        Qva["selected"] = "1";
    }
    ita = XPb("option", Qva, null, null, true);
    ita.innerHTML = "Slow";
    var jta;
    Qva = {};
    Qva["ignore"] = "1";
    Qva["value"] = "" + MEDIUM_SPEED;
    if (uca == -2 || uca == MEDIUM_SPEED) {
        Qva["selected"] = "1";
    }
    jta = XPb("option", Qva, null, null, true);
    jta.innerHTML = "Medium";
    var kta;
    Qva = {};
    Qva["ignore"] = "1";
    Qva["value"] = "" + FAST_SPEED;
    if (uca == -1 || uca == FAST_SPEED) {
        Qva["selected"] = "1";
    }
    kta = XPb("option", Qva, null, null, true);
    kta.innerHTML = "Fast";
    hta.appendChild(ita);
    hta.appendChild(jta);
    hta.appendChild(kta);
    return hta;
}

function mta(YPb, vua) {
    if (vua != null) {
        var pta = document.images[YPb + vua].style;
        pta.visibility = "\x76\x69sibl\x65";
        pta.display = "\x69nlin\x65";
        pta.width = "\x326px";
    }
    if (vua != "\x6fff") {
        document.images[YPb + "off"].style.visibility = "\x68idden";
        document.images[YPb + "off"].style.display = "n\x6fne";
        document.images[YPb + "off"].style.width = "\x30\x70x";
    }
    if (vua != "\x6fn") {
        document.images[YPb + "on"].style.visibility = "\x68idden";
        document.images[YPb + "on"].style.display = "n\x6fne";
        document.images[YPb + "on"].style.width = "\x30px";
    }
}

function qta(YPb, vua, ulb, uta) {
    if (vua != null) {
        var pta = document.getElementById(YPb);
        if (YPb == "s\x75bm\x69t") {
            pta.width = "\x353px";
        } else {
            pta.width = "\x333px";
        }
    }
    if (vua == "\x66lat") {
        dPb(pta, "backgroundPosition: -" + ulb + "px 0px;");
    }
    if (vua == "hover") {
        dPb(pta, "backgroundPosition: -" + ulb + "px -33px;");
    }
    if (vua == "toggle") {
        dPb(pta, "backgroundPosition: -" + ulb + "px -66px;");
    }
    if (vua == "mask") {
        dPb(pta, "backgroundPosition: -" + ulb + "px -99px;");
    }
    if (uta) {
        if (vua == "toggleOn") {
            dPb(pta, "backgroundPosition: -" + ulb + "px -66px;");
        }
        if (vua == "mask") {
            dPb(pta, "backgroundPosition: -" + ulb + "px -99px;");
        }
    }
}
SpeechStream.tinymceipadfix = "thtinymceipadbugworkaround";

function $rw_barInit() {
    if (!Iua()) {
        return;
    }
    if ((typeof (eba_custId) == "string" && eba_custId == "200") || (typeof (eba_cust_id) == "string" && eba_cust_id == "200")) {
        cua();
    }
    Jua();
    Ufa = Sfa && !(Nfa.indexOf("android") > -1) && (Zca & clicktospeak_icon) != clicktospeak_icon && (Zca & sticky_icon) != sticky_icon && (bca & clicktospeak_icon) != clicktospeak_icon && (bca & sticky_icon) != sticky_icon;
    Yea = Fva();
    oca = parseInt(lca, 10);
    if (oca == 300) {
        hua();
    }
    if (oca >= 500 && oca < 600) {
        pda = true;
    }
    if (oca >= 810 && oca < 820) {
        cda = true;
    }
    if (oca >= 1220 && oca < 1229) {
        fda = true;
    }
    if (Cfa && !bda) {
        var hDb = Awa();
        if (!hDb) {
            qda = true;
            if (zca) {} else {
                ssa("The embedded speech toolbar cannot be added due to invalid html tag markup in this page .\n" + "Try using FireFox or Safari to view this page or contact the page author to notify them of this error.");
                return;
            }
        }
    }
    SpeechStream.calculatePaths.initPaths();
    if (Zca == 0) {
        rea = false;
    }
    if (rea) {
        Jva();
    }
    zua();
    Dva();
    Lwa();
    if ((Zca & calculator_icon) == calculator_icon) {
        $rw_barCalInit();
    }
    if ((Zca & generatecache_icon) == generatecache_icon) {
        $rw_barCacheInit();
    }
    if ((Zca & dictionary_icon) == dictionary_icon || (Zca & factfinder_icon) == factfinder_icon || (Zca & translation_icon) == translation_icon || (Zca & mp3_icon) == mp3_icon) {
        var wta = RPb("script", ["type", "text/javascript", "src", $g_strFileLoc + "texthelpSearch.js"]);
        Yea.appendChild(wta);
    }
    if ((Zca & highlightcyan_icon) == highlightcyan_icon || (Zca & highlightgreen_icon) == highlightgreen_icon || (Zca & highlightmagenta_icon) == highlightmagenta_icon || (Zca & highlightyellow_icon) == highlightyellow_icon || (Zca & collect_icon) == collect_icon || Mda || (Zca & vocabulary_icon) == vocabulary_icon || (Zca & strike_icon) == strike_icon) {
        var xta = RPb("script", ["type", "text/javascript", "src", $g_strFileLoc + "texthelpSS.js"]);
        Yea.appendChild(xta);
    }
    if ((Zca & sticky_icon) == sticky_icon || Mda) {
        var yta = RPb("script", ["type", "text/javascript", "src", $g_strFileLoc + "texthelpSticky.js"]);
        Yea.appendChild(yta);
    }
    if ((Zca & pronCreate_icon) == pronCreate_icon || (Zca & pronEdit_icon) == pronEdit_icon) {
        var zta = RPb("script", ["type", "text/javascript", "src", $g_strFileLoc + "texthelpPron.js"]);
        Yea.appendChild(zta);
    }
    if ((Zca & generatecache_icon) == generatecache_icon || (Zca & checkcache_icon) == checkcache_icon) {
        var Aua = RPb("script", ["type", "text/javascript", "src", $g_strFileLoc + "jquerycombined.js"]);
        Yea.appendChild(Aua);
    }
    if (!Cfa) {
        var Bua = document.getElementsByTagName('input');
        for (var i = 0; i < Bua.length; i++) {
            var Cua = Bua.item(i);
            var attr = Cua.getAttribute("t\x79pe");
            if (attr != null && attr == "t\x65xt") {
                axa(Cua, "\x6douse\x75p", Zxa);
            }
        }
    }
    if (xfa && Tfa) {
        var Dua = null;
        if (typeof (eba_tinymce_id) == "string") {
            Dua = document.getElementById(eba_tinymce_id);
        }
        if (Dua) {
            var ta = document.createElement("input");
            ta.setAttribute("type", "text");
            ta.setAttribute("style", "opacity:0;color:#ffffff;padding:0px;margin:0px;" + "border-top-color:#FFFFFF;border-right-color:#FFFFFF;border-bottom-color:#FFFFFF;border-left-color:#FFFFFF;" + "border-top-style:none;border-right-style:none;border-bottom-style:none;border-left-style:none;" + "height:1px;width:1px");
            ta.setAttribute("id", SpeechStream.tinymceipadfix);
            var Llb = document.getElementById("rwDrag");
            if (Llb != null) {
                Llb.appendChild(ta);
            } else {
                Dua.parentNode.insertBefore(ta, Dua);
            }
            Gua(false);
        }
    }
    if (uda) {
        if (!bda) {
            kZb();
        }
    }
    if (typeof (eba_initial_speech_on) == "boolean") {
        if (eba_initial_speech_on) {
            $g_bMouseSpeech = true;
            pxa(true);
            NZb.enableTouchEvents(eba_initial_speech_on);
        }
    }
}

function Gua(Hua) {
    try {
        var Fua = document.getElementById(eba_tinymce_id + "_ifr").contentDocument.body;
        if (Fua && typeof (Fua.ipadTinyMceFocus) == "undefined") {
            Fua.ipadTinyMceFocus = Hua;
            bxa(Fua, "click", function () {
                Fua.ipadTinyMceFocus = true;
            });
            bxa(document.getElementById(eba_tinymce_id + "_ifr").contentWindow, "focus", function () {
                Fua.ipadTinyMceFocus = true;
            });
        }
        return Fua;
    } catch (e) {}
    return null;
}

function Iua() {
    if (typeof (eba_bypass_dom_check) == "boolean" && eba_bypass_dom_check) {
        bda = true;
    }
    return true;
}

function Jua() {
    hva();
    if (typeof (pktTitleId) != "\x75nde\x66\x69ne\x64") {
        rva();
    }
    if (typeof (eba_annotate_storage_url) == "string" || typeof (eba_annotate_highlight_editor_id) == "string" || typeof (eba_annotate_note_editor_id) == "string" || typeof (eba_annotate_note_storage_url) == "string" || typeof (eba_annotate_highlight_storage_url) == "string") {
        qva();
    }
    if (rca == SPANISH && typeof (eba_voice) == "undefined" && typeof (pktVoice) == "undefined" && !sca) {
        kca = "\x53\x63\x61nSoft\x20Paulin\x61_Fu\x6cl_22\x6bHz";
    }
    if (typeof (dtdType) != "undefined" && Rfa) {
        zea = dtdType;
        if (dtdType == "xtran") {
            Afa = true;
        } else if (dtdType == "loose") {
            Bfa = true;
        }
    }
    Lua();
    if (typeof (eba_use_html5) == "boolean") {
        if (!eba_use_html5) {
            cea = true;
        }
    } else {
        cea = !((typeof (dca) == "string" && dca == "speechus.texthelp.com") || (typeof (eca) == "string" && eca == "speechus.texthelp.com"));
    }
}

function Lua() {
    var gua;
    try {
        gua = window.location.search;
    } catch (err) {
        gua = "";
    }
    if (typeof (eba_autocache_generate) == "boolean" && eba_autocache_generate) {
        Sea = true;
    } else {
        var CXb = Sua(gua, "speechstreamautocache");
        Sea = (CXb != null) && (CXb.toLowerCase() == "true");
    } if (!Sea) {
        if (typeof (eba_autocache_check) == "boolean" && eba_autocache_check) {
            Tea = true;
        } else {
            var CXb = Sua(gua, "speechstreamautocachecheck");
            Tea = (CXb != null) && (CXb.toLowerCase() == "true");
        }
    }
    if (typeof (eba_autocache_no_alert) == "boolean" && eba_autocache_no_alert) {
        Vea = true;
    } else {
        var CXb = Sua(gua, "speechstreamautocachenoalert");
        Vea = (CXb != null) && (CXb.toLowerCase() == "true");
    } if (Sea || Tea) {
        bca = bca | generatecache_icon;
        bca = bca | checkcache_icon;
        cea = true;
    } else {
        if (typeof (eba_icons) == "number" && eba_icons > 0) {
            if ((eba_icons & generatecache_icon) == generatecache_icon || (eba_icons & checkcache_icon) == checkcache_icon) {
                cea = true;
            }
        }
        if (typeof (eba_no_display_icons) == "number" && eba_no_display_icons > 0) {
            if ((eba_no_display_icons & generatecache_icon) == generatecache_icon || (eba_no_display_icons & checkcache_icon) == checkcache_icon) {
                cea = true;
            }
        }
    } if (typeof (eba_autocache_callback) == "string") {
        Uea = eba_autocache_callback;
    } else {
        var CXb = Sua(gua, "speechstreamautocachecallback");
        if (CXb != null && CXb.length > 0) {
            CXb = decodeURIComponent(CXb);
            Uea = CXb;
        }
    } if (Uea && Uea.length > 0) {
        Uea = vTb(Uea, "\\amp;", "&");
    }
    if (typeof (eba_autocache_allspeeds) == "boolean") {
        Rea = eba_autocache_allspeeds;
    }
}

function Sua(Tua, Uua) {
    var CXb = null;
    var Rua = Uua + "=";
    Rua = Rua.toLowerCase();
    var Xmb = Rua.length;
    var ylb;
    var zlb;
    var Yua;
    var Zua = Tua.toLowerCase();
    ylb = Zua.indexOf(Rua);
    while (ylb > 0) {
        Yua = Tua.charAt(ylb - 1);
        if (Yua == "?" || Yua == "&") {
            zlb = Tua.indexOf("&", ylb + Xmb);
            if (zlb == -1) {
                CXb = Tua.substr(ylb + Xmb);
            } else {
                CXb = Tua.substring(ylb + Xmb, zlb);
            }
            break;
        } else {
            ylb = Zua.indexOf(Rua, ylb + 1);
        }
    }
    return CXb;
}

function cua() {
    var aua = false;
    var bua = false;
    oda = true;
    if (pca == null) {
        pca = "s\x63holast\x69c";
        qca = "s\x63h\x6flastic";
    }
    var dua = document.getElementsByTagName("meta");
    var Xmb = dua.length;
    var i;
    for (i = 0; i < Xmb; i++) {
        var fua = dua[i];
        if (fua.name != null) {
            if (fua.name.toLowerCase() == "assetid" && fua.content != null && fua.content.length > 0) {
                nca = fua.content;
                bua = true;
            } else if (fua.name.toLowerCase() == "pcode" && fua.content != null && fua.content.length > 0) {
                mca = fua.content;
                aua = true;
            }
        }
    }
    var gua = window.location.search;
    ylb = gua.indexOf("id=");
    while (ylb > 0) {
        Yua = gua.charAt(ylb - 1);
        if (Yua == "?" || Yua == "&") {
            zlb = gua.indexOf("&", ylb + 3);
            if (zlb == -1) {
                nca = gua.substr(ylb + 3);
            } else {
                nca = gua.substring(ylb + 3, zlb);
            }
            ylb = -1;
        } else {
            ylb = gua.indexOf("id=", ylb + 1);
        }
    }
    ylb = gua.indexOf("product_id=");
    while (ylb > 0) {
        Yua = gua.charAt(ylb - 1);
        if (Yua == "?" || Yua == "&") {
            zlb = gua.indexOf("&", ylb + 11);
            if (zlb == -1) {
                mca = gua.substr(ylb + 11);
                aua = true;
            } else {
                mca = gua.substring(ylb + 11, zlb);
                bua = true;
            }
            ylb = -1;
        } else {
            ylb = gua.indexOf("product_id=", ylb + 1);
        }
    }
    if (!aua && (mca == null || mca == "")) {
        mca = "none";
    }
    if (!bua && (nca == null || nca == "")) {
        nca = "none";
    }
}

function hua() {
    mca = "index";
    nca = "1";
    var iua = document.location;
    if (iua != null) {
        var Bkb = iua.pathname;
        if (Bkb.length > 0) {
            var kua = Bkb.lastIndexOf("/");
            if (kua > -1) {
                Bkb = Bkb.substr(kua + 1);
                var lua = Bkb.indexOf(".html");
                if (lua > -1) {
                    Bkb = Bkb.substring(0, lua);
                    mca = Bkb;
                }
            }
        }
    }
}

function pua() {
    var mua;
    var nua;
    var oua;
    this.initPaths = function () {
        mua = usa(false) + cca + "/";
        nua = usa(true) + dca + "/";
        if (eca != null) {
            oua = usa(true) + eca + "/";
        } else {
            oua = null;
        }
        rua();
        var sua = tua();
        uua(sua);
    };
    this.getServerUrl = function () {
        return mua;
    };
    this.getSpeechServerUrl = function () {
        return nua;
    };
    this.getSpeechServerUrlBackup = function () {
        return oua;
    };

    function rua() {
        if (ica == null) {
            ica = "";
        }
        while (ica.length > 0 && ica.charAt(0) == '/') {
            ica = ica.substr(1);
        }
        while (ica.length > 0 && ica.charAt(ica.length - 1) == '/') {
            ica = ica.substr(0, ica.length - 1);
        }
        if (ica == "") {
            ica = "SpeechStream";
        }
    }

    function tua() {
        var sua;
        if (Vca.length > 0) {
            if (Vca == "latest") {
                sua = ica + "/" + Vca;
            } else {
                sua = ica + "/v" + Vca;
            }
        } else {
            sua = ica;
        }
        return sua;
    }

    function uua(vua) {
        if (vua.length > 0) {
            $g_strFileLoc = mua + vua + "/";
        } else {
            $g_strFileLoc = mua;
        }
        Zfa = jca;
        try {
            var wua = new String(document.location);
            if (wua.substring(0, 4) == "file") {
                $g_strFileLoc = "";
                Zfa = "";
            }
        } catch (ignore) {
            thLogE(ignore);
        }
    }
}
SpeechStream.calculatePaths = new pua();

function zua() {
    var xua;
    var Xva = Yva();
    if (sea > 0) {
        if (Sca) {
            if (Rfa) {
                kfa = true;
                xua = RPb("div", ["rwTHComp", "1", "style", "visibility:hidden;display:none"], "rwDrag");
            } else {
                xua = RPb("div", ["rwTHComp", "1", "style", "position:relative;visibility:hidden;display:none"], "rwDrag");
            }
        } else {
            xua = RPb("div", ["rwTHComp", "1", "style", "visibility:hidden;display:none"], "rwDrag");
        }
        var Nva = Pva();
        if (!Nca) {
            Nva.appendChild(Uva());
        }
        Nva.appendChild(Xva);
        xua.appendChild(Nva);
    } else {
        xua = RPb("div", ["rwTHComp", "1", "visibility", "hidden"], "rwDrag");
        var Nva = RPb("div", ["rwTHComp", "1", "visibility", "hidden"], "rwDrag");
        xua.appendChild(Nva);
    }
    Yea.appendChild(xua);
}

function Dva() {
    var Llb = document.getElementById("WebToSpeech");
    if (Llb == null) {
        Llb = document.createElement("span");
        Llb.id = "WebToSpeech";
        Yea.appendChild(Llb);
    }
    cva(SpeechStream.calculatePaths.getServerUrl(), SpeechStream.calculatePaths.getSpeechServerUrl(), SpeechStream.calculatePaths.getSpeechServerUrlBackup());
}

function $rw_barDynamicStart() {
    Zea = true;
}

function Fva() {
    var Eva;
    Eva = document.getElementById("speechStreamPlaceholder");
    if (Eva == null) {
        if (Zea) {
            Eva = document.body;
        } else {
            if (Sca || (Cfa && Lfa)) {
                var fgb = document.body;
                var match;
                while (fgb != null) {
                    if (fgb != null && fgb.nodeType == 1) {
                        match = fgb;
                    }
                    fgb = fgb.lastChild;
                }
                if (match == document.body) {
                    Eva = match;
                } else {
                    var Hva = match.parentNode;
                    var Iva = document.createElement("span");
                    Iva.id = "speechStreamPlaceholder";
                    Hva.insertBefore(Iva, match);
                    Eva = Iva;
                }
            } else {
                Eva = document.body;
            }
        }
    }
    return Eva;
}

function Jva() {
    if (pda) {
        HQb(Yea, "<link href=\"" + $g_strFileLoc + "rwMain500Bar.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
    } else {
        var Kva = Zca;
        if (aca != -1) {
            Kva = aca;
        }
        var Lva = clicktospeak_icon + play_icon + pause_icon;
        if ((Kva | Lva) == Lva) {
            HQb(Yea, "<link " + "href=\"" + $g_strFileLoc + "rwMainTHSpeechBar.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
        } else {
            var Mva = Lva + search_icons + picturedictionary_icon;
            if ((Kva | Mva) == Mva) {
                HQb(Yea, "<link href=\"" + $g_strFileLoc + "rwMainTHSearchBar.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
            } else {
                HQb(Yea, "<link href=\"" + $g_strFileLoc + "rwMainTHFullBar.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
            }
        }
    }
}

function Pva() {
    var Nva;
    var hPb = "width:" + sea + "px;" + "visibility:hidden;";
    if (xca || Nca) {
        hPb += "display:none;";
    }
    var Qva = {};
    Qva["style"] = hPb;
    if (!Nca) {
        Nva = XPb("div", Qva, "rwMainOutline", "rwToolbarOutline");
    } else {
        Nva = XPb("div", Qva, "rwMainOutline", null);
    }
    return Nva;
}

function Uva() {
    var Rva;
    var yZb;
    var Tva;
    if (eba_logo_url == null) {
        if (pda || Lda) {
            yZb = "";
            Tva = null;
        } else {
            yZb = "Click here to go to www.texthelp.com";
            Tva = "www.texthelp.com";
        }
    } else if (eba_logo_url == "none") {
        yZb = "";
        Tva = null;
    } else {
        yZb = "Click here to go to " + eba_logo_url;
        Tva = eba_logo_url;
        if (Tva.substr(0, 7) == "http://") {
            Tva = Tva.substr(7);
        } else if (Tva.substr(0, 8) == "https://") {
            Tva = Tva.substr(8);
        }
    }
    Rva = RPb("div", null, "rwDragMe", "rwToolbarCaption");
    var Vva;
    if (Tva == null) {
        Qva = {};
        Qva["border"] = "0";
        Qva["ignore"] = "1";
        Qva["align"] = "right";
        if (pda) {
            Qva["src"] = $g_strFileLoc + "rwimgs500/logo500.gif";
            Qva["style"] = "margin: 5px; cursor:default;";
        } else {
            Qva["src"] = $g_strFileLoc + "rwimgs/logo.gif";
            Qva["style"] = "cursor:default";
        }
        Qva["title"] = "";
        Qva["alt"] = "";
        Vva = XPb("img", Qva, null, null);
        Rva.appendChild(Vva);
    } else {
        Qva = {};
        Qva["border"] = "0";
        Qva["ignore"] = "1";
        Qva["align"] = "right";
        if (pda) {
            Qva["src"] = $g_strFileLoc + "rwimgs500/logo500.gif";
            Qva["style"] = "margin: 5px;";
        } else {
            Qva["src"] = $g_strFileLoc + "rwimgs/logo.gif";
        }
        Qva["title"] = yZb;
        Qva["alt"] = yZb;
        Vva = XPb("img", Qva, null, null);
        var Wva;
        Qva = {};
        Qva["href"] = usa(false) + Tva;
        Qva["target"] = "new";
        if (!Pfa) {
            Qva["style"] = "cursor:hand";
        }
        Wva = XPb("a", Qva, null, null);
        Wva.appendChild(Vva);
        Rva.appendChild(Wva);
    }
    return Rva;
}

function Yva() {
    var Xva;
    if (Nca) {
        Xva = RPb("div", null, null, "rwToolbarBarNoBorder");
    } else {
        Xva = RPb("div", null, null, "rwToolbarBar");
    }
    var Zva = RPb("div", null, "rwToolbarList", null);
    $rw_setIconsToLoad(Zca);
    var ava = false;
    for (var i = 0; i < eea; i++) {
        ava = true;
        Zva.appendChild(Lta(i));
    }
    if ((Zca & selectSpeed_icon) == selectSpeed_icon) {
        ava = true;
        Zva.appendChild(gta());
    }
    if (ava && sea < 110) {
        sea = 110;
    } else if (!ava) {
        sea = 0;
    }
    Xva.appendChild(Zva);
    return Xva;
}

function cva(dva, eva, fva) {
    var bva = {};
    if (pca != null && qca != null) {
        bva.userName = pca;
        bva.userPassword = qca;
    } else {}
    bva.lessonServerLoc = dva;
    bva.speechServerLoc = eva;
    bva.speedValue = uca;
    if (Xca >= 3) {
        bva.useServices = "true";
    } else if (Xca == -1) {
        if ((dca != null && dca.indexOf(".speechstream.net") > -1) || (eca != null && eca.indexOf(".speechstream.net") > -1)) {
            bva.useServices = "true";
        } else {
            bva.useServices = "false";
        }
    } else {
        bva.useServices = "false";
        cea = true;
    } if (fca != null) {
        bva.translateServerLoc = fca;
    }
    if (gca != null) {
        bva.dictionaryServerLoc = gca;
    }
    if (hca != null) {
        bva.imagedictionaryServerLoc = hca;
    }
    if (zca || Ada) {
        bva.cacheMode = "true";
        if (fva != null) {
            bva.cacheLiveFallover = "true";
        }
    }
    if (fva != null) {
        bva.speechServerBackupLoc = fva;
    }
    if (lca != null && mca != null && nca != null) {
        bva.custID = lca;
        bva.bookID = mca;
        bva.pageID = nca;
    }
    if (Ida > -1) {
        bva.cacheCount = Ida;
    }
    if (Jda > -1) {
        bva.cacheTimeDelay = Jda;
    }
    bva.locale = tca;
    bva.speechName = kca;
    if (Zda != null && ada != null) {
        bva.searchString = Zda;
        bva.replaceString = ada;
    }
    if (Zfa == null || Zfa == "") {
        Zfa = usa(false) + cca + "/";
    } else if (Zfa.charAt(0) == '.') {
        if (Zfa.charAt(Zfa.length - 1) != '/') {
            Zfa = cca + "/";
        }
    } else {
        if (Zfa.charAt(0) != '/') {
            Zfa = "/" + Zfa;
        }
        if (Zfa.charAt(Zfa.length - 1) != '/') {
            Zfa = Zfa + "/";
        }
        Zfa = usa(false) + cca + Zfa;
    } if (xda) {
        bva.SSLSpeech = "true";
        bva.SSLToolbar = "true";
    } else {
        if (yda) {
            bva.SSLSpeech = "true";
        }
        if (zda) {
            bva.SSLToolbar = "true";
        }
    } if (Cfa && (xda || yda)) {
        bva.IESSL = "true";
    }
    aca = Zca;
    Zca = Zca | bca;
    if ((Zca & pronCreate_icon) == pronCreate_icon || (Zca & pronEdit_icon) == pronEdit_icon || Kda) {
        bva.cacheBuster = "true";
    }
    if (vca > -1) {
        bva.volumeValue = "" + vca;
    }
    var keb = {};
    keb.allowScriptAccess = "always";
    keb.movie = Zfa + 'WebToSpeech' + Wca + '.swf';
    keb.quality = "high";
    keb.bgcolor = "#ffffff";
    SpeechStream.m_flashVars = bva;
    SpeechStream.setUpControllerFactory();
    if (NZb.doesSupportHtml5()) {
        NZb.getConnector().initialise(bva, dva, eva, fva);
    } else {
        try {
            if (Mfa && !Ifa) {
                g_strAmp = "&amp;";
            }
            swfobject.embedSWF(Zfa + 'WebToSpeech' + Wca + '.swf', "WebToSpeech", "1", "1", "9.0.0", false, bva, keb);
        } catch (err) {
            g_strAmp = "&amp;";
            swfobject.embedSWF(Zfa + 'WebToSpeech' + Wca + '.swf', "WebToSpeech", "1", "1", "9.0.0", false, bva, keb);
        }
    }
}

function hva() {
    if (typeof (eba_use_container) == "boolean") {
        Sca = eba_use_container;
    }
    if (typeof (eba_allow_alerts_flag) == "boolean") {
        Tca = eba_allow_alerts_flag;
    }
    if (typeof (eba_alerts) == "boolean") {
        Tca = eba_alerts;
    }
    if (typeof (eba_no_title) == "boolean") {
        Nca = eba_no_title;
    }
    if (typeof (eba_noTitleFlag) == "boolean") {
        Nca = eba_noTitleFlag;
    }
    if (typeof (eba_hidden_bar) == "boolean") {
        xca = eba_hidden_bar;
    }
    if (typeof (eba_continuous_reading) == "boolean") {
        rda = eba_continuous_reading;
        if (!rda) {
            Cea = false;
        }
    }
    if (typeof (eba_dont_extend_selection) == "boolean") {
        Dea = !eba_dont_extend_selection;
    }
    if (typeof (eba_ignore_buttons) == "boolean") {
        yca = eba_ignore_buttons;
    }
    if (typeof (eba_speak_selection_by_sentence) == "boolean") {
        if (rda) {
            Cea = eba_speak_selection_by_sentence;
        } else {
            Cea = false;
        }
    }
    if (typeof (eba_page_complete_after_selection) == "boolean") {
        Eea = eba_page_complete_after_selection;
    }
    if (typeof (eba_speechCacheGenerateFlag) == "boolean") {
        zca = eba_speechCacheGenerateFlag;
        if (zca) {
            SpeechStream.cacheMode.mode = SpeechStream.cacheMode.CACHE_BUILDING_MODE;
        }
    }
    if (typeof (eba_cache_building_mode) == "boolean") {
        zca = eba_cache_building_mode;
        if (zca) {
            SpeechStream.cacheMode.mode = SpeechStream.cacheMode.CACHE_BUILDING_MODE;
        }
    }
    var iva = false;
    if (typeof (eba_speechCacheFlag) == "boolean") {
        Ada = eba_speechCacheFlag;
        iva = true;
    }
    if (typeof (eba_speech_cache_flag) == "boolean") {
        Ada = eba_speech_cache_flag;
        iva = true;
    }
    if (typeof (eba_cache_mode) == "boolean") {
        Ada = eba_cache_mode;
        iva = true;
    }
    if (iva && Ada) {
        SpeechStream.cacheMode.mode = SpeechStream.cacheMode.CACHE_ONLY;
    }
    if (typeof (eba_cache_live_generation) == "boolean") {
        Bda = eba_cache_live_generation;
        if (Bda) {
            SpeechStream.cacheMode.mode = SpeechStream.cacheMode.CACHE_WITH_LIVE_SERVER;
        }
    }
    if (typeof (eba_split_cache_path) == "boolean") {
        Cda = eba_split_cache_path;
    }
    if (typeof (eba_autoCachePage) == "boolean") {
        Dda = eba_autoCachePage;
    }
    if (typeof (eba_voice_from_lang_flag) == "boolean") {
        sca = eba_voice_from_lang_flag;
    }
    if (typeof (eba_bubble_mode) == "boolean") {
        uda = eba_bubble_mode;
    }
    if (typeof (eba_bubble_freeze_on_shift_flag) == "boolean") {
        vda = eba_bubble_freeze_on_shift_flag;
    }
    if (typeof (eba_hover_flag) == "boolean") {
        Jca = !eba_hover_flag;
    }
    if (typeof (eba_ssl_flag) == "boolean") {
        xda = eba_ssl_flag;
        yda = xda;
        zda = xda;
    }
    if (typeof (eba_ssl_speech) == "boolean") {
        yda = eba_ssl_speech;
    }
    if (typeof (eba_ssl_toolbar) == "boolean") {
        zda = eba_ssl_toolbar;
    }
    if (typeof (eba_clientside_pronunciation) == "boolean") {
        if (eba_clientside_pronunciation) {
            if (typeof (eba_check_pronunciation_before_cache) == "boolean") {
                if (eba_check_pronunciation_before_cache) {
                    SpeechStream.pronunciation.mode = SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER;
                } else {
                    SpeechStream.pronunciation.mode = SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_OFFLINE_CACHE;
                }
            } else {
                SpeechStream.pronunciation.mode = SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_OFFLINE_CACHE;
            }
        } else {
            SpeechStream.pronunciation.mode = SpeechStream.pronunciation.SERVER_PRONUNCIATION;
        }
    } else {
        if (typeof (eba_check_pronunciation_before_cache) == "boolean") {
            if (eba_check_pronunciation_before_cache) {
                SpeechStream.pronunciation.mode = SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER;
            } else {
                SpeechStream.pronunciation.mode = SpeechStream.pronunciation.SERVER_PRONUNCIATION;
            }
        }
    } if (typeof (eba_alter_browser_for_consistency) == "boolean") {
        Bea = eba_alter_browser_for_consistency;
    }
    if (typeof (eba_cache_selection) == "boolean") {
        Gda = eba_cache_selection;
    }
    if (typeof (eba_cache_user_text) == "boolean") {
        Hda = eba_cache_user_text;
    }
    if (typeof (eba_skip_on_error) == "boolean") {
        if (eba_skip_on_error) {
            SpeechStream.actionOnError.action = SpeechStream.actionOnError.SKIP;
        }
    }
    if (typeof (eba_cache_buster) == "boolean") {
        if (eba_cache_buster) {
            Kda = true;
        }
    }
    if (typeof (eba_handle_radio_checkbox_click) == "boolean") {
        if (eba_handle_radio_checkbox_click) {
            Hea = true;
        }
    }
    if (typeof (eba_inline_img) == "boolean") {
        tda = eba_inline_img;
    }
    if (typeof (eba_ignore_hidden) == "boolean") {
        Vga = eba_ignore_hidden;
    }
    if (typeof (eba_limit_cookies) == "boolean") {
        gda = eba_limit_cookies;
    }
    if (typeof (eba_ignore_frames) == "boolean") {
        hda = eba_ignore_frames;
    }
    if (typeof (eba_math) == "boolean") {
        gfa = eba_math;
    }
    if (typeof (eba_maths) == "boolean") {
        gfa = eba_maths;
    }
    if (typeof (eba_use_vocabulary) == "boolean") {
        pfa = eba_use_vocabulary;
    }
    if (typeof (eba_use_vocab) == "boolean") {
        pfa = eba_use_vocab;
    }
    if (typeof (eba_use_commands) == "boolean") {
        wfa = eba_use_commands;
    }
    if (typeof (eba_tinymce) == "boolean") {
        xfa = eba_tinymce;
    }
    if (typeof (eba_icons) == "number") {
        Zca = eba_icons;
    }
    if (typeof (eba_no_display_icons) == "number") {
        bca = eba_no_display_icons;
    }
    if (typeof (eba_language) == "number") {
        rca = eba_language;
        if (rca == 3) {
            rca = 2;
        } else if (rca > 3 || rca < 0) {
            rca = 0;
        }
        if (sca) {
            if (eba_language >= 0 && eba_language < faa.length) {
                kca = faa[eba_language];
            }
        }
    }
    if (typeof (eba_speedValue) == "number") {
        uca = eba_speedValue;
    }
    if (typeof (eba_speed_value) == "number") {
        uca = eba_speed_value;
    }
    if (typeof (eba_reading_age) == "number") {
        $rw_setReadingAge(eba_reading_age);
    }
    if (typeof (eba_speed_offset) == "number") {
        uca += eba_speed_offset;
    }
    if (typeof (eba_volume_value) == "number") {
        vca = eba_volume_value;
    }
    if (typeof (eba_cache_retry) == "number") {
        Ida = eba_cache_retry;
    }
    if (typeof (eba_cache_retry_timeout) == "number") {
        Jda = eba_cache_retry_timeout;
    }
    if (typeof (eba_mp3_limit) == "number") {
        if (eba_mp3_limit < 1000) {
            eda = eda * 1024;
        } else {
            eda = eba_mp3_limit;
        }
    }
    if (typeof (eba_max_word_count == "number")) {
        jFb = eba_max_word_count;
    }
    if (typeof (eba_date_filter_mode == "number") || typeof (eba_date_filter_mode) == "string") {
        Ela.setMode(eba_date_filter_mode);
    }
    if (typeof (eba_vocabulary_limit) == "number") {
        rfa = eba_vocabulary_limit;
    }
    if (typeof (eba_server_version) == "string") {
        Vca = eba_server_version;
    }
    if (typeof (eba_serverVersion) == "string") {
        Vca = eba_serverVersion;
    }
    if (typeof (eba_client_version) == "string") {
        if (eba_client_version != "latest") {
            Wca = eba_client_version;
        }
    }
    if (typeof (eba_clientVersion) == "string") {
        if (eba_clientVersion != "latest") {
            Wca = eba_clientVersion;
        }
    }
    if (typeof (eba_server) == "string") {
        cca = eba_server;
        if (cca.length > 6 && cca.substring(0, 7) == "http://") {
            cca = cca.substring(7);
        } else if (cca.length > 7 && cca.substring(0, 8) == "https://") {
            cca = cca.substring(8);
        }
    }
    if (typeof (eba_speech_server) == "string") {
        dca = eba_speech_server;
    }
    if (typeof (eba_speechServer) == "string") {
        dca = eba_speechServer;
    }
    if (typeof (eba_speech_server_backup) == "string") {
        eca = eba_speech_server_backup;
    }
    if (typeof (eba_speechServerBackup) == "string") {
        eca = eba_speechServerBackup;
    }
    if (typeof (eba_translation_server) == "string") {
        fca = nva(eba_translation_server, false);
    }
    if (typeof (eba_translate_server) == "string") {
        fca = nva(eba_translate_server, false);
    }
    if (typeof (eba_dictionary_server) == "string") {
        gca = nva(eba_dictionary_server, false);
    }
    if (typeof (eba_picturedictionary_server) == "string") {
        hca = nva(eba_picturedictionary_server, false);
    }
    if (fca == null || gca == null || hca == null) {
        var jva = ".speechstream.net";
        var kva = jva.length;
        var lva = false;
        var mva = SpeechStream.cacheMode.getLiveServer();
        if (mva != null && (mva == "speechus.texthelp.com" || (mva.length > kva && mva.substring(mva.length - kva) == jva))) {
            lva = true;
        }
        if (lva) {
            mva = nva(mva, false);
            if (fca == null) {
                fca = mva;
            }
            if (gca == null) {
                gca = mva;
            }
            if (hca == null) {
                hca = mva;
            }
        }
    }
    if (typeof (eba_vocabulary_server) == "string") {
        qfa = nva(eba_vocabulary_server, false);
    } else {
        qfa = gca;
    } if (typeof (eba_folder) == "string") {
        ica = eba_folder;
    }
    if (typeof (eba_client_folder) == "string") {
        jca = eba_client_folder;
    }
    if (typeof (eba_clientFolder) == "string") {
        jca = eba_clientFolder;
    }
    if (typeof (eba_voice) == "string") {
        kca = eba_voice;
        if (kca == "ScanSoft Daniel_Full_22kHz") {
            faa[ENG_UK] = kca;
        } else if (kca == "ScanSoft Tom_Full_22kHz") {
            faa[ENG_US] = kca;
        } else if (kca == "ScanSoft Jill_Full_22kHz") {
            faa[ENG_US] = kca;
        }
    }
    if (typeof (eba_custId) == "string") {
        eba_cust_id = eba_custId;
    }
    if (typeof (eba_cust_id) == "string") {
        lca = DUb(eba_cust_id.trimTH());
    }
    if (typeof (eba_bookId) == "string") {
        eba_book_id = eba_bookId;
    }
    if (typeof (eba_book_id) == "string") {
        mca = DUb(eba_book_id.trimTH());
    }
    if (typeof (eba_pageId) == "string") {
        eba_page_id = eba_pageId;
    }
    if (typeof (eba_page_id) == "string") {
        nca = DUb(eba_page_id.trimTH());
    }
    if (lca == null || lca.length == 0 || mca == null || mca.length == 0 || nca == null || nca.length == 0) {
        SpeechStream.pronunciation.mode = SpeechStream.pronunciation.NONE;
        SpeechStream.cacheMode.mode = SpeechStream.cacheMode.NONE;
    }
    if (typeof (eba_loginName) == "string") {
        eba_login_name = eba_loginName;
    }
    if (typeof (eba_login_name) == "string") {
        pca = eba_login_name;
    }
    if (typeof (eba_loginPassword) == "string") {
        eba_login_password = eba_loginPassword;
    }
    if (typeof (eba_login_password) == "string") {
        qca = eba_login_password;
    } else {
        qca = pca;
    } if (typeof (eba_locale) == "string") {
        tca = eba_locale;
    }
    if (typeof (eba_speech_range_colors) == "string") {
        Oca = eba_speech_range_colors;
    }
    if (typeof (eba_speech_range_colours) == "string") {
        Oca = eba_speech_range_colours;
    }
    if (typeof (eba_speech_word_colors) == "string") {
        Pca = eba_speech_word_colors;
    }
    if (typeof (eba_speech_word_colours) == "string") {
        Pca = eba_speech_word_colours;
    }
    if (typeof (eba_mp3_id) == "string") {
        dda = eba_mp3_id;
    }
    if (typeof (eba_search_speech_server) == "string") {
        Zda = eba_search_speech_server;
    }
    if (typeof (eba_replace_speech_server) == "string") {
        ada = eba_replace_speech_server;
    }
    if (typeof (eba_play_start_point) == "string") {
        Qca = eba_play_start_point;
    }
    if (typeof (eba_speech_stream_server_version) == "string" || typeof (eba_speech_stream_server_version) == "number") {
        if (typeof (eba_speech_stream_server_version) == "number") {
            Xca = eba_speech_stream_server_version;
        } else {
            try {
                Xca = parseInt(eba_speech_stream_server_version, 10);
            } catch (e) {}
        }
    } else {
        if (eba_cust_id == "810") {
            Xca = 3;
        }
    } if (typeof (eba_symbol_text) == "string") {
        QTb(eba_symbol_text);
    }
    if (typeof (eba_speech_file_type) == "string") {
        eba_speech_file_type = eba_speech_file_type.toLowerCase();
        if (eba_speech_file_type == "mp3" || eba_speech_file_type == "ogg" || eba_speech_file_type == "wav") {
            ofa = eba_speech_file_type;
        }
    }
    if (typeof (eba_voice_language_map) == "string") {
        Jga(eba_voice_language_map);
    }
    if (typeof (eba_break_list) == "string") {
        $rw_setBreakList(eba_break_list);
    }
}

function nva(ova, pva) {
    if (ova.length < 4 || ova.substring(0, 4) != "http") {
        ova = usa(pva) + ova;
    }
    if (ova.substr(ova.length - 1, 1) != "/") {
        ova += "/";
    }
    return ova;
}

function qva() {
    if (mca == null) {
        ssa("Persistent annotations is enabled but no book id was provided, " + "this feature will not work in this page.");
        return;
    }
    if (nca == null) {
        ssa("Persistent annotations is enabled but no page id was provided, " + "this feature will not work in this page.");
        return;
    }
    Mda = true;
    if (typeof (eba_annotate_note_editor_id) == "string") {
        Nda = DUb(eba_annotate_note_editor_id);
    }
    if (typeof (eba_annotate_highlight_editor_id) == "string") {
        Oda = DUb(eba_annotate_highlight_editor_id);
    }
    if (typeof (eba_annotate_note_reader_id) == "string") {
        Pda = DUb(eba_annotate_note_reader_id);
    }
    if (typeof (eba_annotate_highlight_reader_id) == "string") {
        Qda = DUb(eba_annotate_highlight_reader_id);
    }
    if (typeof (eba_annotate_persist_notes) == "boolean" && Nda != "*") {
        Rda = eba_annotate_persist_notes;
    }
    if (typeof (eba_annotate_persist_highlights) == "boolean" && Oda != "*") {
        Sda = eba_annotate_persist_highlights;
    }
    if (typeof (eba_annotate_highlight_store_text) == "boolean") {
        Tda = eba_annotate_highlight_store_text;
    }
    if (typeof (eba_annotate_storage_url) == "string") {
        Uda = eba_annotate_storage_url;
        if (typeof (eba_server) == "undefined") {
            cca = Uda;
        }
    } else {
        if (Ada) {
            if (eca != null) {
                Uda = eca;
            } else {
                Uda = cca;
            }
        } else {
            Uda = dca;
        }
    } if (typeof (eba_annotate_note_storage_url) == "string") {
        Vda = eba_annotate_note_storage_url;
    }
    if (typeof (eba_annotate_highlight_storage_url) == "string") {
        Wda = eba_annotate_highlight_storage_url;
    }
    if (typeof (eba_annotate_confirm_delete_note) == 'boolean') {
        Yda = eba_annotate_confirm_delete_note;
    }
    if (Rda) {
        if ((Zca & sticky_icon) != sticky_icon) {
            if (Zca == no_bar) {
                bca += sticky_icon;
            } else {
                Zca += sticky_icon;
            }
        }
    }
}

function rva() {
    Lda = true;
    Mda = true;
    if (typeof (pktIsTeacher) == "boolean") {
        Rda = pktIsTeacher;
    }
    if (typeof (pktTitleId) == "string") {
        mca = pktTitleId;
    }
    if (typeof (pktPageId) == "string") {
        nca = pktPageId;
    }
    if (typeof (pktStudentId) == "string") {
        if (!Rda) {
            Sda = true;
        }
        Oda = DUb(pktStudentId);
        Pda = DUb(pktStudentId);
    }
    if (typeof (pktTeacherId) == "string") {
        Nda = DUb(pktTeacherId);
        Qda = DUb(pktTeacherId);
    }
    if (typeof (pktStorageUrl) == "string") {
        Uda = pktStorageUrl;
        if (typeof (eba_server) == "undefined") {
            cca = Uda;
        }
    } else {
        Uda = cca;
    } if (typeof (pktSpeechServerUrl) == "string") {
        dca = pktSpeechServerUrl;
    }
    if (typeof (pktVoice) == "string") {
        kca = pktVoice;
    }
    if (typeof (pktCustCode) == 'string') {
        Xda = pktCustCode;
    }
    if (typeof (pktConfirmOnDelete) == 'boolean') {
        Yda = pktConfirmOnDelete;
    }
    if (Rda) {
        if ((Zca & sticky_icon) != sticky_icon) {
            if (Zca == no_bar) {
                bca += sticky_icon;
            } else {
                Zca += sticky_icon;
            }
        }
    }
}

function Awa() {
    if (!hda && top.frames.length > 0) {
        var i = 0;
        var Xmb = top.frames.length;
        for (i = 0; i < Xmb; i++) {
            var Rwa = top.frames[i];
            try {
                var Mwa = Rwa.document;
                var b = Cwa(Mwa.body);
                if (!b) {
                    return false;
                }
            } catch (e) {}
        }
    }
    if (document.body != null) {
        return Cwa(document.body);
    } else {
        return true;
    }
}

function Cwa(PVb) {
    if (PVb.firstChild != null) {
        var aUb = PVb.firstChild;
        var kib = aUb.ownerDocument.body;
        try {
            while (aUb != null && aUb != kib) {
                aUb = GJb(aUb);
            }
        } catch (er) {
            return false;
        }
    }
    return true;
}
var xva = 0;
var yva = 500;
var zva = false;

function $rw_versionCheck() {
    try {
        bea = NZb.doesSupportSpeech();
        $rw_setSpeedValue(uca);
    } catch (err) {
        bea = false;
    }
    if (!bea) {
        xva++;
        if (xva < yva) {
            setTimeout($rw_versionCheck, 100);
        } else {
            if (!zva) {
                if (zca) {} else {
                    ssa("A necessary flash component failed to load.  This page will not work as intended.\n" + "Could not load file from: " + Zfa + 'WebToSpeech' + Wca + '.swf');
                }
                zva = true;
            }
        }
    }
}
var Ewa = -1;

function $rw_getFlashVersion() {
    if (Ewa < 0) {
        try {
            var flash = NZb.getConnector();
            var XZb = flash.getVersion();
            Ewa = parseInt(XZb, 10);
        } catch (err) {
            Ewa = parseInt(Wca, 10);
            thLogE(err);
        }
    }
    return Ewa;
}

function Hwa(Iwa, Kwa) {
    if (Iwa == null || Kwa == null) {
        return false;
    }
    if (Iwa = Kwa) {
        return true;
    }
    if (Iwa.frames.length > 0) {
        var i;
        for (i = 0; i < Iwa.frames.length; i++) {
            if (Kwa == Iwa.frames[i]) {
                return true;
            } else {
                if (Iwa.frames[i].length > 0) {
                    if (Hwa(Iwa.frames[i], Kwa)) {
                        return true;
                    }
                }
            }
        }
        return false;
    } else {
        return false;
    }
}

function Lwa() {
    bxa(window, 'scroll', FCb);
    bxa(window, 'resize', FCb);
    bxa(window, 'scroll', HCb);
    bxa(window, 'resize', HCb);
    if (!Zea) {
        bxa(window, 'load', tya);
    }
    bxa(window, 'beforeunload', Aza);
    bxa(document, 'click', Gya);
    axa(document, 'mouseout', dya);
    axa(document, 'mouseup', bya);
    axa(document, 'mousemove', Vya);
    axa(document, 'mouseover', Jya);
    axa(document, 'mousedown', Cya);
    axa(document, 'dragstart', Dya);
}

function $rw_addEventsToFrame(WQb) {
    try {
        var Mwa = WQb.document;
        axa(Mwa, 'mouseout', dya);
        axa(Mwa, 'mouseup', bya);
        axa(Mwa, 'click', Gya);
        axa(Mwa, 'mousemove', Vya);
        axa(Mwa, 'mouseover', Jya);
        axa(Mwa, 'mousedown', Cya);
        axa(Mwa, 'dragstart', Dya);
    } catch (er) {}
    if (WQb.frames.length > 0) {
        if (!hda) {
            var i = 0;
            for (i = 0; i < WQb.frames.length; i++) {
                $rw_addEventsToFrame(WQb.frames[i]);
            }
        }
    }
}

function $rw_pageSetup() {
    $rw_tagSentencesWithFrames(window);
    if (!hda && window.frames.length > 0) {
        var i = 0;
        try {
            var Xmb = window.frames.length;
            for (i = 0; i < Xmb; i++) {
                try {
                    $rw_addEventsToFrame(window.frames[i]);
                } catch (e) {}
            }
        } catch (e) {}
    }
    iCb = document.getElementById('rwDrag').style;
    iCb.display = "inline";
    xva = 0;
    $rw_versionCheck();
    Pwa();
    Vga = true;
}

function Pwa() {
    if (!bea) {
        if (xva < yva) {
            setTimeout(Pwa, 109);
        }
        return;
    }
    efa = false;
    var Owa = false;
    if (bea && typeof (hWb) == "function") {
        if (SpeechStream.pronunciation.fetchData()) {
            Owa = true;
        }
    }
    if (Owa) {
        if (lca != null && lca.length > 0 && mca != null && mca.length > 0 && nca != null && nca.length > 0) {
            ffa = true;
            eVb.deleteAll();
            hWb();
        }
    }
}

function $rw_tagSentencesWithFrames(WQb) {
    if (typeof (WQb) == "undefined") {
        WQb = window;
    }
    if (WQb.document && WQb.document.body) {
        $rw_tagSentences(WQb.document.body);
    }
    if (!hda) {
        if (WQb.frames.length > 0) {
            var i = 0;
            var Xmb = WQb.frames.length;
            for (i = 0; i < Xmb; i++) {
                try {
                    var Rwa = WQb.frames[i];
                    if (Rwa.frames.length > 0) {
                        $rw_tagSentencesWithFrames(Rwa.frames);
                    } else {
                        if (Rwa.document && Rwa.document.body) {
                            $rw_tagSentences(Rwa.document.body);
                        }
                    }
                } catch (err) {}
            }
        }
    }
}
var Swa = "[\\x21\\x2E\\x3F\\x3A]";
var Twa = /[\n\r\t ]{2,}/g;

function $rw_tagSentences(PVb) {
    if (typeof (PVb) == 'undefinded' || PVb == null) {
        PVb = document.body;
    }
    try {
        var Uwa = false;
        var Vwa = false;
        if (oca >= 200 && oca < 300) {
            Vwa = true;
        }
        oda = Vwa;
        var cNb = PVb;
        while (cNb != null) {
            if (cNb.nodeType == 3) {
                var gNb = cNb.parentNode.tagName.toLowerCase();
                if (gNb == "textarea") {
                    cNb = LIb(cNb, false, null);
                    continue;
                }
                var Uib = cNb.nodeValue;
                var Zwa = Uib.trimSpaceTH();
                var Cxa = Zwa.length > 0;
                if (cda && gNb == "a") {
                    Cxa = false;
                }
                if (!Cxa) {
                    if (Mda || Ada && (oda || Lda || Bea)) {
                        if (Uwa) {
                            if (!cda) {
                                cNb.nodeValue = " ";
                            }
                            Uwa = false;
                            cNb = LIb(cNb, false, null);
                        } else {
                            var fgb = cNb;
                            cNb = LIb(cNb, false, null);
                            if (!cda) {
                                fgb.parentNode.removeChild(fgb);
                            }
                        }
                    } else {
                        cNb = LIb(cNb, false, null);
                    }
                } else {
                    if (!cda) {
                        if (Mda || Ada && (oda || Lda || Bea)) {
                            if (Zwa.length < Uib.length) {
                                var fbb = false;
                                Zwa = Uib.trimSpaceStartTH();
                                if ((Uib.length - Zwa.length) > 0) {
                                    if (Uwa) {
                                        Uib = " " + Zwa;
                                    } else {
                                        Uib = Zwa;
                                    }
                                    fbb = true;
                                }
                                Zwa = Uib.trimSpaceEndTH();
                                if ((Uib.length - Zwa.length) > 1) {
                                    Uib = Zwa + " ";
                                    Uwa = false;
                                    fbb = true;
                                }
                                Zwa = Uib.replace(Twa, " ");
                                if (Zwa.length < Uib.length) {
                                    Uib = Zwa;
                                    fbb = true;
                                }
                                if (fbb) {
                                    cNb.nodeValue = Uib;
                                }
                            }
                        }
                    }
                    var bmb;
                    bmb = Uib.search(Swa);
                    var ewa = (cNb.parentNode.getAttribute("texthelpSkip") != null);
                    var fwa = cNb;
                    if (bmb > -1 && bmb < (Uib.length - 1)) {
                        var gwa = true;
                        while (true) {
                            var Hgb = Lxa(Uib, bmb, cNb);
                            if (Hgb) {
                                break;
                            } else {
                                var iwa = Uib.substring(bmb + 1);
                                var Wab = iwa.search(Swa);
                                if (Wab > -1) {
                                    bmb = bmb + 1 + Wab;
                                } else {
                                    gwa = false;
                                    break;
                                }
                            }
                        }
                        if (gwa) {
                            var elb = Uib.substring(0, bmb + 1);
                            var SMb = Uib.substring(bmb + 1);
                            var span = document.createElement("span");
                            span.setAttribute(eaa, "1");
                            var VMb = document.createTextNode(elb);
                            var WMb = document.createTextNode(SMb);
                            var vwa = cNb.parentNode;
                            vwa.insertBefore(WMb, cNb);
                            vwa.insertBefore(span, WMb);
                            span.appendChild(VMb);
                            vwa.removeChild(cNb);
                            cNb = WMb;
                            fwa = VMb;
                        } else {
                            if (cNb.previousSibling != null || cNb.nextSibling != null || ewa) {
                                var span = document.createElement("span");
                                span.setAttribute(eaa, "1");
                                var VMb = document.createTextNode(Uib);
                                var vwa = cNb.parentNode;
                                vwa.insertBefore(span, cNb);
                                span.appendChild(VMb);
                                vwa.removeChild(cNb);
                                cNb = VMb;
                            }
                            fwa = cNb;
                            cNb = LIb(cNb, false, null);
                        }
                    } else {
                        if (cNb.previousSibling != null || cNb.nextSibling != null || ewa) {
                            var span = document.createElement("span");
                            span.setAttribute(eaa, "1");
                            var VMb = document.createTextNode(Uib);
                            var vwa = cNb.parentNode;
                            vwa.insertBefore(span, cNb);
                            span.appendChild(VMb);
                            vwa.removeChild(cNb);
                            cNb = VMb;
                        }
                        fwa = cNb;
                        cNb = LIb(cNb, false, null);
                    } if (Mda || Ada && (oda || Lda || Bea)) {
                        var wwa = fwa.nodeValue;
                        var xwa = fwa.nodeValue.length;
                        if (xwa > 0 && wwa.charCodeAt(xwa - 1) == 32) {
                            Uwa = false;
                        } else {
                            Uwa = true;
                        }
                    }
                }
            } else if (cNb.nodeType == 1) {
                if (Mda) {
                    if (!ZMb(cNb)) {
                        if (pMb(cNb)) {
                            Uwa = false;
                        }
                    } else if (cNb.tagName.toLowerCase() == "img") {
                        Uwa = true;
                    }
                }
                if (Vwa) {
                    if (cNb.tagName.toLowerCase() == "img") {
                        var FNb = cNb.getAttribute("title");
                        cNb.setAttribute("msg", FNb);
                    }
                } else if (tda) {
                    if (cNb.tagName.toLowerCase() == "img") {
                        var FNb = cNb.getAttribute("msg");
                        if (!(FNb != null && FNb.length > 0)) {
                            FNb = cNb.getAttribute("title");
                            if (FNb != null && FNb.length > 0) {
                                cNb.setAttribute("msg", FNb);
                            } else {
                                FNb = cNb.getAttribute("alt");
                                cNb.setAttribute("msg", FNb);
                            }
                        }
                    }
                }
                var Gxa = cNb.getAttribute(caa);
                var Hxa = cNb.getAttribute(baa);
                if (cNb.tagName.toLowerCase() == "pre" || (Gxa != null && Gxa.length > 0) || (Hxa != null && Hxa.length > 0)) {
                    cNb = mIb(cNb, false, null);
                } else {
                    cNb = LIb(cNb, false, null);
                }
            } else {
                cNb = LIb(cNb, false, null);
            }
        }
        if (Mda) {
            cNb = PVb;
            while (cNb != null) {
                if (cNb.nodeType == 3) {
                    var Cxa = cNb.nodeValue.trimTH().length > 0;
                    if (Cxa) {
                        var Dxa = cNb.parentNode;
                        var Exa = Dxa.getAttribute("id");
                        if (Exa == null || Exa.length == 0) {
                            Dxa.id = "rwTHnoteMarker" + cfa;
                            ++cfa;
                        }
                    }
                    cNb = LIb(cNb, false, null);
                } else if (cNb.nodeType == 1) {
                    if (fib(cNb)) {
                        var Fxa = cNb.getAttribute("id");
                        if (Fxa == null || Fxa.length == 0) {
                            cNb.id = "rwTHnoteMarker" + cfa;
                            ++cfa;
                        }
                    }
                    var Gxa = cNb.getAttribute(caa);
                    var Hxa = cNb.getAttribute(baa);
                    if (cNb.tagName.toLowerCase() == "pre" || (Gxa != null && Gxa.length > 0) || (Hxa != null && Hxa.length > 0)) {
                        cNb = mIb(cNb, false, null);
                    } else {
                        cNb = LIb(cNb, false, null);
                    }
                } else {
                    cNb = LIb(cNb, false, null);
                }
            }
        }
    } catch (exception) {
        bra("Error in $rw_tagSentences: " + exception);
    }
    nda = true;
}

function Lxa(Jmb, Kmb, gib) {
    var Fmb = true;
    var Xmb = Jmb.length;
    if (Xmb > Kmb + 1) {
        var Hmb = Jmb.charCodeAt(Kmb + 1);
        if (wra(Hmb)) {
            Fmb = false;
        }
        if (gfa && Hmb == 61) {
            if (dTb("!=")) {
                if (gib.nodeValue.charAt(Kmb) == '!') {
                    Fmb = false;
                }
            }
        }
    }
    if (Fmb) {
        if (gib.nodeValue.charAt(Kmb) != '.') {
            return true;
        }
    }
    if (Fmb) {
        if (Kmb > 1) {
            var Mmb = Jmb.substring(Kmb - 2, Kmb);
            if ((Mmb.charAt(0) == ' ' || Mmb.charAt(0) == '\n' || Mmb.charAt(0) == '\r' || Mmb.charAt(0) == '\t') && Mmb.charCodeAt(1) > 63 && Mmb.charCodeAt(1) < 91) {
                Fmb = false;
            } else if (Mmb.charAt(0) == '.' && wra(Mmb.charCodeAt(1))) {
                Fmb = false;
            } else {
                if (Mmb == "Dr" || Mmb == "Mr" || Mmb == "Ms" || Mmb == "Av" || Mmb == "St" || Mmb == "eg") {
                    Fmb = false;
                } else if (Kmb > 2) {
                    var Nmb = Jmb.substring(Kmb - 3, Kmb);
                    if (Nmb == "Mrs" || Nmb == "etc" || Nmb == "i.e" || Nmb == "P.O" || Nmb == "PhD") {
                        Fmb = false;
                    } else if (Kmb > 3) {
                        var Omb = Jmb.substring(Kmb - 4, Kmb);
                        if (Omb == "Ph.D") {
                            Fmb = false;
                        }
                    }
                }
            }
        } else {
            try {
                if (gib != null && Kmb == 0) {
                    if (fda) {
                        var aGb = null;
                        if (gib.previousSibling != null && gib.previousSibling.nodeType == 1) {
                            aGb = gib.previousSibling;
                        } else if (gib.parentNode.previousSibling != null && gib.parentNode.previousSibling.nodeType == 1) {
                            aGb = gib.parentNode.previousSibling;
                        } else {
                            var cNb = gib.parentNode;
                            while (cNb != null && cNb.parentNode.tagName.toLowerCase() == "span") {
                                if (cNb.parentNode.previousSibling != null && cNb.parentNode.previousSibling.nodeType == 1) {
                                    aGb = cNb.parentNode.previousSibling;
                                    break;
                                }
                                cNb = cNb.parentNode;
                            }
                        } if (aGb != null) {
                            if (aGb.nodeType == 1 && aGb.tagName.toLowerCase() == "span") {
                                FNb = aGb.getAttribute(("class"));
                                WGb = aGb.getAttribute(("className"));
                                var YGb = false;
                                YGb = (FNb != null && (FNb.toLowerCase() == "x2" || FNb.toLowerCase() == "x3")) || (WGb != null && (WGb.toLowerCase() == "x2" || WGb.toLowerCase() == "x3"));
                                if (YGb) {
                                    if (aGb.lastChild.nodeType == 1) {
                                        while (aGb != null && aGb.lastChild != null && aGb.lastChild.nodeType != 3) {
                                            aGb = aGb.lastChild;
                                        }
                                    }
                                    if (aGb != null && aGb.lastChild.nodeType == 3) {
                                        return Lxa(aGb.lastChild.nodeValue + Jmb, aGb.lastChild.nodeValue.length, null);
                                    } else {}
                                }
                            }
                        }
                    } else {
                        var bfb = nJb(gib, true, null);
                        if (bfb != null && bfb.nodeType == 3) {
                            if (!Lxa(bfb.nodeValue + Jmb, bfb.nodeValue.length, null)) {
                                return false;
                            }
                        }
                    }
                }
            } catch (err) {}
        }
    }
    if (Fmb && eba_abbr_array != null && typeof (eba_abbr_array) == "object" && typeof (eba_abbr_array.length) == "number") {
        var Pmb = eba_abbr_array.length;
        var i;
        var Qmb;
        for (i = 0; i < Pmb; i++) {
            Qmb = eba_abbr_array[i];
            if (typeof (Qmb) == "string") {
                if (Kmb - Qmb.length > -1) {
                    if (Jmb.substring(Kmb - Qmb.length, Kmb) == Qmb) {
                        Fmb = false;
                        break;
                    }
                }
            }
        }
    }
    return Fmb;
}
var Yxa = null;

function Zxa(event) {
    Yxa = event.currentTarget;
}

function axa(eRb, eventType, func) {
    if (Ufa) {
        if (eRb.document && eRb.document.body && eRb.document.body.screen) {
            return true;
        }
        if (eRb.location) {
            return true;
        }
    }
    return bxa(eRb, eventType, func);
}

function bxa(eRb, eventType, func) {
    if (eRb.addEventListener) {
        eRb.addEventListener(eventType, func, false);
        return true;
    } else if (eRb.attachEvent) {
        return eRb.attachEvent("on" + eventType, func);
    } else {
        return false;
    }
}

function cxa(ev) {
    if (ev.pageX) {
        if (Afa) {
            return {
                x: (ev.pageX - document.documentElement.scrollLeft),
                y: (ev.pageY - document.documentElement.scrollTop)
            };
        } else if (Bfa) {
            return {
                x: (ev.pageX - document.body.parentNode.scrollLeft),
                y: (ev.pageY - document.body.parentNode.scrollTop)
            };
        } else {
            return {
                x: (ev.pageX - document.body.scrollLeft),
                y: (ev.pageY - document.body.scrollTop)
            };
        }
    } else {
        return {
            x: ev.clientX,
            y: ev.clientY
        };
    }
}

function exa(dab) {
    var left = 0;
    var top = 0;
    if (dab.nodeType == 3) {
        dab = dab.parentNode;
    }
    while (dab.offsetParent) {
        left += dab.offsetLeft + (dab.currentStyle ? (parseInt(dab.currentStyle.borderLeftWidth, 10)).NaN0() : 0);
        top += dab.offsetTop + (dab.currentStyle ? (parseInt(dab.currentStyle.borderTopWidth, 10)).NaN0() : 0);
        dab = dab.offsetParent;
    }
    left += dab.offsetLeft + (dab.currentStyle ? (parseInt(dab.currentStyle.borderLeftWidth, 10)).NaN0() : 0);
    top += dab.offsetTop + (dab.currentStyle ? (parseInt(dab.currentStyle.borderTopWidth, 10)).NaN0() : 0);
    left -= rw_getScreenOffsetLeft();
    top -= rw_getScreenOffsetTop();
    return {
        x: left,
        y: top
    };
}
var gxa = false;
var hxa = false;
var ixa = false;

function $rw_isSpeaking() {
    return gxa;
}
var jxa = "funplay play cyan magenta yellow green strike clear collect trans ffinder dictionary picturedictionary vocabulary";
var kxa = "cyan magenta yellow green strike clear collect";
var lxa = "spell homophone pred";
var mxa = 0;

function pxa(uxa) {
    if (mxa > 0) {
        clearTimeout(mxa);
        mxa = 0;
    }
    if ($g_bMouseSpeech) {
        uxa = true;
    }
    if (hxa == uxa) {
        return;
    }
    try {
        var nxa = SpeechStream.wsa;
        for (var i = 0; i < eea; i++) {
            var hib = g_icons[i][nxa.ICON_NAME];
            if (jxa.indexOf(hib) > -1) {
                if (uxa) {
                    qta(g_icons[i][nxa.ICON_NAME], "mask", g_icons[i][nxa.ICON_OFFSET], false);
                } else {
                    qta(g_icons[i][nxa.ICON_NAME], "flat", g_icons[i][nxa.ICON_OFFSET], false);
                }
            }
        }
        hxa = uxa;
    } catch (err) {
        thLogE(err);
    }
}

function rxa(uxa) {
    if (Iea != null) {
        if (ixa == uxa) {
            return;
        }
        try {
            if (uxa) {
                mta("speaker" + Iea, "on");
            } else {
                mta("speaker" + Iea, "off");
                Iea = null;
            }
            ixa = uxa;
        } catch (err) {
            thLogE(err);
        }
    }
}

function txa(uxa) {
    gxa = uxa;
}

function xxa() {
    try {
        var nkb = SpeechStream.wsa;
        for (var i = 0; i < eea; i++) {
            var hib = g_icons[i][nkb.ICON_NAME];
            if (kxa.indexOf(hib) > -1) {
                qta(g_icons[i][nkb.ICON_NAME], "flat", g_icons[i][nkb.ICON_OFFSET], false);
            }
        }
        for (var i = 0; i < fea; i++) {
            var hib = dea[i][nkb.ICON_NAME];
            if (lxa.indexOf(hib) > -1) {
                qta(g_icons[i][nkb.ICON_NAME], "mask", g_icons[i][nkb.ICON_OFFSET], true);
            }
        }
    } catch (err) {
        thLogE(err);
    }
}

function zxa(YPb) {
    return document.getElementById(YPb);
}

function $speechFinishedInFlash() {
    pxa(false);
    rxa(false);
    txa(false);
}
Number.prototype.NaN0 = function () {
    return isNaN(this) ? 0 : this;
};

function Bya(event) {}

function Cya(event) {
    if (!Hca) {
        return;
    }
    var target = event.target || event.srcElement;
    if (target.id == 'rwDragMe' || target.id == 'rwDragMeDisplay' || target.id == 'rwDragMeTrans' || target.id == 'rwDragMeFF' || target.id == 'rwDragMeDict' || target.id == 'rwDragMeCollect' || target.id == 'rwDragMeStickyNoteTop' || target.id == 'rwDragMeStickyNoteBot' || target.id == 'rwDragMePronCreate' || target.id == 'rwDragMePronEdit' || target.id == 'rwDragMeCal' || target.id == 'rwDragMePictureDictionary') {
        jea = target;
        kea = true;
        if (jea.setCapture) {
            jea.setCapture(true);
        }
        iea = exa(jea);
        if (target.id == 'rwDragMeStickyNoteBot') {
            iea.y -= target.offsetTop;
        }
        hea = cxa(event);
        return false;
    }
}

function Dya(event) {
    if (!Hca) {
        return;
    }
    var target = event.target || event.srcElement;
    if (target.tagName == "IMG" && target.className == "rwIcon") {
        eya(event);
        return false;
    }
}
var Eya = 0;

function Gya(event) {
    if (!Hca) {
        return;
    }
    var bBb = (new Date).getTime();
    if ((bBb - Eya) < aga) {
        return;
    }
    Eya = bBb;
    if (event != null) {
        if (!kea) {
            if ($g_bMouseSpeech && Jca) {
                XDb(event);
            }
            if (dfa) {
                Hib(event);
            }
        }
    }
}

function Jya(event) {
    if (!Hca) {
        return;
    }
    if (event != null) {
        if (!kea) {
            if (Pfa) {
                if ($g_bMouseSpeech && !Jca) {
                    XDb(event);
                } else if (uda) {
                    wZb(event);
                } else if (((Zca & calculator_icon) == calculator_icon) && Mbb()) {
                    if (Zya(event)) {
                        XDb(event, true);
                    }
                }
            }
        }
    }
}
var Hya = -1;
var Iya = -1;

function Vya(event) {
    if (!Hca) {
        return;
    }
    if (event == null) {
        return true;
    }
    if (Cfa) {
        var Kya = event.clientX;
        var Lya = event.clientY;
        if (Hya == Kya && Iya == Lya) {
            return;
        }
        Hya = Kya;
        Iya = Lya;
    }
    if (jea == null) {
        if ($g_bMouseSpeech && (Rfa || Cfa) && !Jca) {
            XDb(event);
        } else if (uda) {
            wZb(event);
        } else if (((Zca & calculator_icon) == calculator_icon) && Mbb() && (Rfa || Cfa)) {
            if (Zya(event)) {
                XDb(event, true);
            }
        }
        kea = false;
        return true;
    }
    var WUb = cxa(event);
    if (WUb.x < 0 || WUb.y < 0 || WUb.x > rw_getDisplayWidth() || WUb.y > rw_getDocumentDisplayHeight()) {
        eya(event);
        return false;
    }
    var Nya;
    var Oya;
    var Pya = false;
    var Qya = 1.0;
    if (Cfa && !Afa && Jfa) {
        var a1 = document.body.offsetWidth;
        var a2 = document.documentElement.offsetWidth;
        Qya = (a1 / a2);
        if (Qya > 1.05 || Qya < 99.5) {
            Pya = true;
        }
    }
    if (Pya) {
        var Tya = (Qya * hea.x) - (iea.x);
        var Uya = (Qya * hea.y) - (iea.y);
        Nya = (((Qya * WUb.x) - Tya)) / Qya;
        Oya = (((Qya * WUb.y) - Uya)) / Qya;
    } else {
        var Tya = hea.x - (iea.x);
        var Uya = hea.y - (iea.y);
        Nya = (WUb.x - Tya);
        Oya = (WUb.y - Uya);
    } if (jea == null) {
        return;
    }
    if (jea.id == 'rwDragMe') {
        PCb(Nya, Oya);
        if ((Nya + sea + lea) > rw_getDisplayWidthAdjusted()) {
            Nya = rw_getDisplayWidthAdjusted() - sea - lea;
            pea = 1.0;
        }
        if (Nya < lea) {
            Nya = lea;
            pea = 0.0;
        }
        if ((Oya + tea + lea) > rw_getDocumentDisplayHeightAdjusted()) {
            Oya = rw_getDisplayHeightAdjusted() - tea - lea;
            qea = 1.0;
        }
        if (Oya < lea) {
            Oya = lea;
            qea = 0.0;
        }
        FCb();
        eya(event);
    } else if (jea.id == 'rwDragMeTrans' || jea.id == 'rwDragMeFF' || jea.id == 'rwDragMeDict' || jea.id == 'rwDragMeDisplay' || jea.id == 'rwDragMeCollect' || jea.id == 'rwDragMeStickyNoteTop' || jea.id == 'rwDragMeStickyNoteBot' || jea.id == 'rwDragMePronCreate' || jea.id == 'rwDragMePronEdit' || jea.id == 'rwDragMeCal' || jea.id == 'rwDragMeGencache' || jea.id == 'rwDragMeCheckcache' || jea.id == 'rwDragMePictureDictionary') {
        var Wya;
        if (jea.id == 'rwDragMeDisplay') {
            Wya = Mba;
        } else if (jea.id == 'rwDragMeTrans') {
            Wya = Nba;
        } else if (jea.id == 'rwDragMeFF') {
            Wya = Oba;
        } else if (jea.id == 'rwDragMeDict') {
            Wya = Pba;
        } else if (jea.id == 'rwDragMeStickyNoteTop') {
            Wya = Rba;
        } else if (jea.id == 'rwDragMeStickyNoteBot') {
            Wya = Rba;
        } else if (jea.id == 'rwDragMePronCreate') {
            Wya = Sba;
        } else if (jea.id == 'rwDragMePronEdit') {
            Wya = Tba;
        } else if (jea.id == 'rwDragMeCal') {
            Wya = Uba;
        } else if (jea.id == 'rwDragMeGencache') {
            Wya = Vba;
        } else if (jea.id == 'rwDragMeCache') {
            Wya = Wba;
        } else if (jea.id == 'rwDragMePictureDictionary') {
            Wya = Xba;
        } else {
            Wya = Qba;
        }
        RCb(Wya, Nya, Oya);
        if ((Nya + wea[Wya] + lea) > rw_getDisplayWidthAdjusted()) {
            Nya = rw_getDisplayWidthAdjusted() - wea[Wya] - lea;
            uea[Wya] = 1.0;
        }
        if (Nya < lea) {
            Nya = lea;
            uea[Wya] = 0.0;
        }
        if ((Oya + xea[Wya] + lea) > rw_getDocumentDisplayHeightAdjusted()) {
            Oya = rw_getDocumentDisplayHeightAdjusted() - xea[Wya] - lea;
            vea[Wya] = 1.0;
        }
        if (Oya < lea) {
            Oya = lea;
            vea[Wya] = 0.0;
        }
        LCb(Wya);
        eya(event);
    }
    return false;
}

function Zya(event) {
    var target;
    if (Rfa) {
        target = event.explicitOriginalTarget;
    } else if (Cfa) {
        target = event.srcElement;
    } else {
        target = event.target;
    } if (target != null && target.nodeType == 1) {
        var Xya = target.ownerDocument.body;
        if (target != Xya) {
            var xZb = target.parentNode;
            if (typeof (xZb.tagName) == "string") {
                while (xZb != null && xZb != Xya) {
                    var gNb = xZb.tagName.toLowerCase();
                    if (gNb == "form") {
                        if (xZb.id == "rw_calForm") {
                            return true;
                        }
                    }
                    xZb = xZb.parentNode;
                }
            }
        }
    }
    return false;
}

function bya(event) {
    if (!Hca) {
        return;
    }
    if (!kea) {
        return true;
    }
    if (jea.releaseCapture) {
        jea.releaseCapture();
    }
    jea = null;
    kea = false;
    eya(event);
    return false;
}

function dya(event) {
    if (!Hca) {
        return;
    }
    if (kea) {
        if (Rfa) {
            var WUb = cxa(event);
            if (WUb.x < 5 || WUb.y < 5 || WUb.x > (rw_getDisplayWidth() - 5) || WUb.y > (rw_getDocumentDisplayHeight() - 5)) {
                bya(event);
                eya(event);
                return;
            }
        }
        Vya(event);
        eya(event);
    } else {
        if (!Jca) {
            JDb = null;
        }
    }
}

function eya(event) {
    if (event == null) {
        return;
    }
    if (event.cancelBubble) {
        event.cancelBubble = true;
    } else if (event.stopPropagation) {
        event.stopPropagation();
    }
    if (event.returnValue) {
        event.returnValue = false;
    } else if (event.preventDefault) {
        event.preventDefault(true);
    }
}

function fya(YPb, pya, qya) {
    if (nea > 0) {
        --nea;
        return;
    }
    if (kea) {
        return;
    }
    if ($rw_blockClick(YPb)) {
        return;
    }
    qta(g_icons[pya][SpeechStream.wsa.ICON_NAME], "hover", g_icons[pya][SpeechStream.wsa.ICON_OFFSET], qya);
}

function jya(YPb, pya, qya) {
    if (nea > 0) {
        --nea;
        return;
    }
    if (kea) {
        return;
    }
    if ($rw_blockClick(YPb)) {
        return;
    }
    qta(g_icons[pya][SpeechStream.wsa.ICON_NAME], "flat", g_icons[pya][SpeechStream.wsa.ICON_OFFSET], qya);
}

function nya(YPb, pya, qya) {
    if (nea > 0) {
        --nea;
        return;
    }
    if (kea) {
        return;
    }
    if ($rw_blockClick(YPb)) {
        return;
    }
    qta(g_icons[pya][SpeechStream.wsa.ICON_NAME], "toggle", g_icons[pya][SpeechStream.wsa.ICON_OFFSET], qya);
}

function $rw_blockClick(YPb) {
    if (hxa && jxa.indexOf(YPb) > -1) {
        return true;
    }
    if (lxa.indexOf(YPb) > -1) {
        return true;
    }
    return false;
}
var rya = "rw_speechenablingdata";

function tya() {
    if (Mda) {
        if (!mfa || !lfa) {
            setTimeout(tya, 50);
            return;
        }
    }
    if (rea && !(gda && (Dfa || Efa))) {
        var sya = epa("rwebooks-x");
        var uya = epa("rwebooks-y");
        if ((sya != null) && (uya != null)) {
            pea = parseFloat(sya);
            qea = parseFloat(uya);
        }
    }
    var vya = false;
    var Xmb = uea.length;
    var xya;
    var yya;
    if (rea && !(gda && (Dfa || Efa))) {
        for (var i = 0; i < Xmb; i++) {
            xya = epa("rwebooks-div" + i + "x");
            if (xya != null) {
                uea[i] = parseFloat(xya);
            }
            yya = epa("rwebooks-div" + i + "y");
            if (yya != null) {
                vea[i] = parseFloat(yya);
            }
            if (i == Rba) {
                if (xya == null && yya == null) {
                    vya = true;
                }
            }
        }
    } else {
        vya = true;
    } if (vya) {
        uea[Rba] = 0.45;
        if (Sfa) {
            vea[Rba] = 0.0;
        } else {
            vea[Rba] = 0.35;
        }
    }
    FCb();
    HCb();
    $rw_pageSetup();
    if (Mda) {
        if (Oda != "*" && typeof (bgb) != "undefined") {
            bgb();
        } else {
            if (Nda != "*" && typeof (Hkb) != "undefined") {
                Hkb();
            }
        }
    }
    if (Cfa) {
        var zya = document.createTextNode(" ");
        document.body.appendChild(zya);
    }
    if (zca && Dda) {
        $rw_cachePage(null, null);
    }
    if (uda) {
        if (bda) {
            kZb();
        }
        if (wda) {
            uda = false;
        }
    }
    if (Sea) {
        setTimeout($rw_event_generate_cache, 1000);
    }
    if (Tea) {
        setTimeout($rw_event_check_cache, 1000);
    }
    Hca = true;
    if (typeof ($rw_toolbarLoadedCallback) == "function") {
        $rw_toolbarLoadedCallback();
    }
}

function Aza() {
    if (typeof (ajb) != 'undefined' && Mda && typeof (Eib) != 'undefined' && Eib > -1) {
        vib(Eib);
    }
    if (rea && !(gda && (Dfa || Efa))) {
        kpa("rwebooks-x", pea, 20, "/", window.location.host);
        kpa("rwebooks-y", qea, 20, "/", window.location.host);
        var Xmb = uea.length;
        for (var i = 0; i < Xmb; i++) {
            kpa("rwebooks-div" + i + "x", uea[i], 20, "/", window.location.host);
            kpa("rwebooks-div" + i + "y", vea[i], 20, "/", window.location.host);
        }
    }
}

function $rw_setSpeechRangeColours(p_strCols) {
    Oca = p_strCols;
}

function $rw_setSpeechWordColours(p_strCols) {
    Pca = p_strCols;
}

function $rw_getSpeechRangeColours() {
    return Oca;
}

function $rw_getSpeechWordColours() {
    return Pca;
}
var Cza = false;

function rw_setHighlight(rEb, uza, QSb, vza, Seb) {
    var Dza = rEb;
    var Eza = QSb;
    try {
        var result = null;
        if (QSb == rEb) {
            result = rw_setNodeBackground(rEb, uza, vza, "ss", Seb);
            Dza = result.node;
            Eza = result.node;
        } else {
            if (uza > 0) {
                result = rw_setNodeBackground(rEb, uza, rEb.nodeValue.length, "ss", Seb);
            } else {
                result = rw_setNodeBackground(rEb, -1, -1, "ss", Seb);
            }
            Dza = result.node;
            var bfb = eKb(result.node, false, QSb, true);
            while (bfb != null) {
                if (bfb == QSb) {
                    result = rw_setNodeBackground(bfb, 0, vza, "ss", Seb);
                    bfb = result.node;
                    Eza = bfb;
                    break;
                } else {
                    result = rw_setNodeBackground(bfb, -1, -1, "ss", Seb);
                    bfb = result.node;
                }
                Eza = bfb;
                bfb = eKb(bfb, false, QSb, true);
            }
        }
    } catch (err) {
        bra("rw_setHighlight error:" + err.message);
    }
    return {
        start: Dza,
        end: Eza
    };
}

function Vza(dza) {
    try {
        if (dza == null || !(dza instanceof Array) || dza.length == 0) {
            return;
        }
        for (var i = 0; i < dza.length; i++) {
            var fgb = dza[i];
            if (Xza(fgb)) {
                var jAb = fgb.parentNode;
                if (fgb.nextSibling != null || fgb.previousSibling != null) {
                    var Uib = Jqa(jAb);
                    var YAb = jAb.ownerDocument;
                    fgb = YAb.createTextNode(Uib);
                }
                var jza = jAb.parentNode;
                jza.replaceChild(fgb, jAb);
                fgb = lqa(fgb);
                dza[i] = fgb;
            } else {
                var Uza = Zza(fgb);
                if (Uza != null) {
                    Uza.removeAttribute("rwstate");
                    Uza.removeAttribute("style");
                }
            }
        }
        if (!gxa) {
            rw_removeSpeechHighlight(dza, false);
        }
    } catch (err) {
        bra("Error in rw_setHighlight: " + err.message);
    }
}

function Xza(gib) {
    if (gib.nodeType != 3 || gib.parentNode == null || gib.parentNode.parentNode == null) {
        return false;
    }
    var parent = gib.parentNode;
    var attr = parent.getAttribute("rwstate");
    if (parent.tagName.toLowerCase() != "font" || attr == null || attr != "ss") {
        return false;
    }
    return true;
}

function Zza(gib) {
    if (gib.nodeType != 3 || gib.parentNode == null || gib.parentNode.parentNode == null) {
        return null;
    }
    var parent = gib.parentNode;
    var attr = parent.getAttribute("rwstate");
    if (parent.tagName.toLowerCase() != "font" || attr == null || attr != "ss") {
        if (parent.getAttribute("rwthgen") != null) {
            var Llb = parent;
            attr = "1";
            while (attr != null) {
                Llb = Llb.parentNode;
                if (Llb.getAttribute("rwState") == "ss" && Llb.tagName.toLowerCase() == "font") {
                    return Llb;
                }
                attr = Llb.getAttribute("rwthgen");
            }
        }
        return null;
    }
    return parent;
}

function rw_removeSpeechHighlight(dza, mza) {
    try {
        if (typeof (mza) == "undefined") {
            mza = false;
        }
        if (dza == null || !(dza instanceof Array) || dza.length == 0) {
            return;
        }
        for (var i = 0; i < dza.length; i++) {
            var fgb = dza[i];
            if (kza(fgb, mza)) {
                var jAb = fgb.parentNode;
                if (fgb.nextSibling != null || fgb.previousSibling != null) {
                    var Uib = Jqa(jAb);
                    var YAb = jAb.ownerDocument;
                    fgb = YAb.createTextNode(Uib);
                }
                var jza = jAb.parentNode;
                jza.replaceChild(fgb, jAb);
                fgb = lqa(fgb);
                dza[i] = fgb;
                if (kza(fgb, mza)) {
                    --i;
                }
            } else {
                var tagName = "";
                if (fgb.nodeType == 1) {
                    tagName = fgb.tagName.toLowerCase();
                }
                if (tagName == "math") {
                    kAb(fgb, null, null, false);
                }
            }
        }
    } catch (err) {
        bra("rw_removeSpeechHighlight failed error:" + err.message);
    }
}

function kza(gib, mza) {
    if (gib.nodeType != 3 || gib.parentNode == null || gib.parentNode.parentNode == null) {
        return false;
    }
    var parent = gib.parentNode;
    var attr = parent.getAttribute("rwstate");
    if (parent.tagName.toLowerCase() == "font" && attr != null) {
        if ((!mza && attr == "sp") || attr == "csp") {
            return true;
        }
    }
    return false;
}

function rw_setSpeechRangeImpl(rEb, uza, QSb, vza, wza) {
    var result = null;
    try {
        if (QSb == rEb) {
            result = rw_setNodeBackground(rEb, uza, vza, wza, "");
            return result;
        }
        if (uza > 0) {
            result = rw_setNodeBackground(rEb, uza, rEb.nodeValue.length, wza, "");
        } else {
            result = rw_setNodeBackground(rEb, -1, -1, wza, "");
        }
        var bfb = eKb(result.node, false, QSb, true);
        while (bfb != null) {
            if (bfb == QSb) {
                result = rw_setNodeBackground(bfb, 0, vza, wza, "");
                bfb = result.node;
                break;
            } else {
                result = rw_setNodeBackground(bfb, -1, -1, wza, "");
                bfb = result.node;
            }
            bfb = eKb(bfb, false, QSb, true);
        }
    } catch (err) {
        bra("rw_setSpeechRangeImpl error:" + err.message);
    }
    return result;
}

function yza() {
    this.node = null;
    this.offset = 0;
}

function rw_setNodeBackground(QAb, Cmb, Dmb, TAb, UAb) {
    var NRb = new yza();
    NRb.node = QAb;
    NRb.offset = Cmb;
    if (QAb.nodeType != 3) {
        if (QAb.nodeType == 1 && cFb(QAb)) {
            if (QAb.tagName.toLowerCase() == "math") {
                var jAb = QAb.parentNode;
                NRb = OAb(jAb, QAb, Cmb, Dmb, TAb, "");
            } else {
                var HAb = sIb(QAb, false);
                var IAb = wIb(QAb, false);
                if (HAb != null && HAb.nodeType == 3 && IAb != null && IAb.nodeType == 3) {
                    rw_setSpeechRangeImpl(HAb, 0, IAb, IAb.nodeValue.length, TAb);
                    NRb.node = HAb;
                    NRb.offset = 0;
                } else {}
            }
            return NRb;
        } else {
            return NRb;
        }
    }
    if (QAb.nodeType == 3) {
        var Uib = QAb.nodeValue;
        Uib = Uib.trimTH();
        if (Uib.length == 0) {
            var pjb = QAb.parentNode;
            if (pjb != null) {
                var ofb = pjb.tagName.trimTH().toLowerCase();
                if (ofb == "tr" || ofb == "table") {
                    return NRb;
                }
            }
        }
    }
    var jAb = QAb.parentNode;
    var NAb = null;
    if (jAb.tagName.toLowerCase() == "font") {
        NAb = jAb.getAttribute("rwstate");
    }
    if (TAb == "ss") {
        if (NAb == null || NAb == "") {
            NRb = OAb(jAb, QAb, Cmb, Dmb, TAb, UAb);
        } else if (NAb == "ss") {
            return NRb;
        } else {
            return NRb;
        }
    } else if (TAb == "sp") {
        if (NAb == "csp") {
            bra("fail in rw_setNodeBackground setting sp to csp");
            return NRb;
        }
        if (NAb == "sp") {
            bra("fail in rw_setNodeBackground setting sp to sp");
            return NRb;
        }
        NRb = OAb(jAb, QAb, Cmb, Dmb, TAb, "");
    } else if (TAb == "csp") {
        if (NAb == "csp") {
            bra("fail parent is csp for csp");
            return NRb;
        }
        if (NAb == "sp") {
            NRb = OAb(jAb, QAb, Cmb, Dmb, TAb, "");
        } else {}
    } else {}
    return NRb;
}

function OAb(PAb, QAb, Cmb, Dmb, TAb, UAb) {
    var tagName = "";
    if (QAb.nodeType == 1) {
        tagName = QAb.tagName.toLowerCase();
    }
    if ((QAb.nodeType == 3 && (Dmb == -1 || Dmb > Cmb)) || tagName == "math") {
        var VAb;
        if (TAb == "ss") {
            if (UAb == "strikethrough") {
                VAb = "text-decoration:line-through";
            } else {
                VAb = "background:" + UAb;
            }
        } else if (TAb == "sp") {
            VAb = Oca;
        } else if (TAb == "csp") {
            VAb = Pca;
        } else {
            VAb = "color:#ff000; background:#00ff00";
        } if (tagName == "math") {
            if (TAb != "ss") {
                kAb(QAb, TAb, VAb, true);
            }
        } else {
            var Xmb = QAb.nodeValue.length;
            if ((Xmb == 1 && (QAb.nodeValue == "\n" || QAb.nodeValue == "\r")) || (Xmb == 2 && QAb.nodeValue == "\r\n")) {
                var NRb = new yza();
                NRb.node = QAb;
                if (Cmb < 0) {
                    NRb.offset = 0;
                } else {
                    NRb.offset = Cmb;
                }
                return NRb;
            }
            var YAb = PAb.ownerDocument;
            var Rlb = false;
            if (Cmb == -1 && Dmb == -1) {
                Rlb = true;
            } else if (Dmb == -1) {
                Dmb = Xmb;
            }
            if (Cmb == 0 && Dmb >= Xmb) {
                Rlb = true;
            }
            var rAb = YAb.createElement("font");
            if (Rlb) {
                if (Lfa) {
                    rAb.style.setAttribute("cssText", VAb, 0);
                } else {
                    rAb.setAttribute("style", VAb);
                }
                rAb.setAttribute("rwstate", TAb);
                if (TAb != "ss") {
                    rAb.setAttribute("started", "1");
                }
                PAb.replaceChild(rAb, QAb);
                rAb.appendChild(QAb);
            } else {
                var Uib = QAb.nodeValue;
                var cAb;
                var dAb;
                var eAb;
                if (PAb.tagName.toLowerCase() == "span" && PAb.getAttribute("pron") != null) {
                    cAb = "";
                    dAb = Uib;
                    eAb = "";
                } else {
                    cAb = Uib.substring(0, Cmb);
                    dAb = Uib.substring(Cmb, Dmb);
                    eAb = Uib.substring(Dmb);
                } if (Lfa) {
                    rAb.style.setAttribute("cssText", VAb, 0);
                } else {
                    rAb.setAttribute("style", VAb);
                }
                rAb.setAttribute("rwstate", TAb);
                if (TAb != "ss") {
                    rAb.setAttribute("started", "1");
                }
                var fAb = null;
                var hkb = null;
                var hAb = null;
                if (cAb.length > 0) {
                    fAb = YAb.createTextNode(cAb);
                }
                hkb = YAb.createTextNode(dAb);
                if (eAb.length > 0) {
                    hAb = YAb.createTextNode(eAb);
                }
                rAb.appendChild(hkb);
                PAb.replaceChild(rAb, QAb);
                if (fAb != null) {
                    PAb.insertBefore(fAb, rAb);
                }
                if (hAb != null) {
                    if (rAb.nextSibling == null) {
                        PAb.insertBefore(hAb, null);
                    } else {
                        PAb.insertBefore(hAb, rAb.nextSibling);
                    }
                }
                QAb = hkb;
            }
        }
    }
    var NRb = new yza();
    NRb.node = QAb;
    if (Cmb < 0) {
        NRb.offset = 0;
    } else {
        NRb.offset = Cmb;
    }
    return NRb;
}

function kAb(lAb, mAb, nAb, oAb) {
    if (lAb == null) {
        return;
    }
    if (Cfa) {
        var jAb = lAb.parentNode;
        if (jAb == null) {
            return;
        }
        if (jAb.tagName.toLowerCase() == "font" && jAb.getAttribute("started") != null) {
            if (oAb) {
                jAb.style.setAttribute("cssText", nAb, 0);
                jAb.setAttribute("rwstate", mAb);
            } else {
                var pAb = jAb.parentNode;
                if (pAb == null) {
                    return;
                }
                pAb.replaceChild(lAb, jAb);
            }
        } else {
            if (oAb) {
                var qAb = document.createElement("font");
                qAb.style.setAttribute("cssText", nAb, 0);
                qAb.setAttribute("started", "1");
                qAb.setAttribute("rwstate", mAb);
                jAb.replaceChild(qAb, lAb);
                qAb.appendChild(lAb);
            }
        }
    } else {
        var rAb = lAb.firstChild;
        while (rAb != null) {
            if (rAb.nodeType == 1) {
                if (oAb) {
                    if (rAb.getAttribute("started") != null) {
                        rAb.setAttribute("style", nAb);
                        rAb.setAttribute("rwstate", mAb);
                    } else {
                        if (rAb.getAttribute("style") == null) {
                            rAb.setAttribute("style", nAb);
                            rAb.setAttribute("rwstate", mAb);
                            rAb.setAttribute("started", "1");
                        }
                    }
                } else {
                    if (rAb.getAttribute("started") != null) {
                        rAb.removeAttribute("style");
                        rAb.removeAttribute("started");
                        rAb.removeAttribute("rwstate");
                    }
                }
            }
            rAb = rAb.nextSibling;
        }
    }
}

function uAb(vAb, wAb) {
    if (vAb == wAb) {
        return 0;
    }
    var sAb = Qra(vAb.ownerDocument.body);
    sAb.setStart(vAb, 0);
    sAb.setEnd(vAb, 0);
    var tAb = Qra(vAb.ownerDocument.body);
    tAb.setStart(wAb, 0);
    tAb.setEnd(wAb, 0);
    return (sAb.compareBoundaryPoints("START_TO_START", tAb));
}

function xAb() {
    this.Uib = "";
    this.cEb = "";
    this.voice = null;
    this.Qgb = null;
}

function yAb(gib) {
    return YBb(FBb(gib));
}

function BBb(gib) {
    if (gib != null && gib.nodeType == 1) {
        var bfb = gib.getAttribute("lang");
        if (bfb == null) {
            try {
                bfb = gib.getAttribute("xml:lang");
                if (bfb != null) {
                    return YBb(bfb);
                }
            } catch (e) {}
        } else {
            return YBb(bfb);
        }
    }
    return null;
}

function FBb(gib) {
    var cNb = gib;
    while (cNb != null) {
        if (cNb.nodeType == 1) {
            var EBb = cNb.getAttribute("lang");
            if (EBb != null && EBb.length > 0) {
                return EBb;
            }
            try {
                EBb = cNb.getAttribute("xml:lang");
                if (EBb != null && EBb.length > 0) {
                    return EBb;
                }
            } catch (e) {}
        }
        cNb = cNb.parentNode;
    }
    return null;
}

function KBb(lSb, aNb, QBb) {
    var cNb = lSb;
    cNb = YIb(cNb, false, aNb);
    while (cNb != null) {
        var NBb = yAb(cNb);
        if (NBb != QBb) {
            var OGb = nJb(cNb, false, lSb);
            if (OGb == null) {
                OGb = nJb(cNb, false, lSb);
                if (OGb == null) {
                    return null;
                }
            }
            if (OGb.nodeType == 3) {
                return new THCaret(OGb, OGb.nodeValue.length, false);
            } else {
                return new THCaret(OGb, Dka, true);
            }
        }
        cNb = LIb(cNb, false, aNb);
    }
    return null;
}

function PBb(lSb, aNb, QBb) {
    var cNb = aNb;
    cNb = EIb(cNb, false, lSb);
    while (cNb != null) {
        var NBb = yAb(cNb);
        if (NBb != QBb) {
            var OGb = XKb(cNb, false, aNb);
            if (OGb != null) {
                if (OGb.nodeType == 3) {
                    return new THCaret(OGb, 0, false);
                } else {
                    return new THCaret(OGb, Dka, true);
                }
            } else {
                return null;
            }
        }
        cNb = EIb(cNb, false, lSb);
    }
    return null;
}

function UBb(lSb, aNb, VBb) {
    var cNb = lSb;
    cNb = YIb(cNb, false, aNb);
    while (cNb != null) {
        var SBb = Zka(cNb);
        if (SBb != VBb) {
            var OGb = wJb(cNb, false, lSb);
            if (OGb == null) {
                OGb = nJb(cNb, false, lSb);
                if (OGb == null) {
                    return null;
                }
            }
            if (OGb.nodeType == 3) {
                return new THCaret(OGb, OGb.nodeValue.length, false);
            } else {
                return new THCaret(OGb, 0, true);
            }
        }
        cNb = LIb(cNb, false, aNb);
    }
    return null;
}

function YBb(ZBb) {
    if (ZBb != null) {
        var wcb = ZBb.toLowerCase();
        var XBb;
        if (wcb == "en" || wcb == "en-gb") {
            XBb = ENGLISH;
        } else if (wcb == "en-us") {
            XBb = ENGLISH_US;
        } else if (wcb == "es-us") {
            XBb = SPANISH;
        } else if (wcb == "es" || wcb == "es-es") {
            XBb = ESPANOL;
        } else if (wcb == "fr" || wcb == "fr-fr") {
            XBb = FRENCH;
        } else if (wcb == "fr-ca") {
            XBb = FRENCH_CN;
        } else if (wcb == "de") {
            XBb = GERMAN;
        } else if (wcb == "it") {
            XBb = ITALIAN;
        } else if (wcb == "nl") {
            XBb = DUTCH;
        } else if (wcb == "sv") {
            XBb = SWEDISH;
        } else if (wcb == "en-au") {
            XBb = AUSTRALIAN;
        } else if (wcb == "pt-br") {
            XBb = PORTUGUESE;
        } else if (wcb == "pt" || wcb == "pt-pt") {
            XBb = PORTUGUES;
        } else {
            return null;
        }
        return faa[XBb];
    } else {
        return null;
    }
}
var aBb = "ReadHeader1 ReadSection";

function ReadHeader1() {
    var bBb = (new Date).getTime();
    if ((bBb - Cga) < aga) {
        return;
    }
    Mca = bBb;
    var Elb = document.getElementsByTagName("H1")[0];
    var hkb = YIb(Elb, true, Elb);
    if (hkb == null) {
        return;
    }
    if (hkb.nodeType != 3) {
        hkb = OKb(hkb, true, Elb);
    }
    if (hkb == null) {
        return;
    }
    var ZEb = new THCaret(hkb, 0, true);
    var target = tDb(ZEb);
    if (target != null) {
        var Gab = target.getCaretRange();
        if (nsa(Gab)) {
            var start = Gab.Zfb.node;
            if (target.isRange()) {
                var end = Gab.afb.node;
                start = BMb(start);
                end = FMb(end);
                var Qfb = dSb(start, 0);
                var Rfb;
                if (end.nodeType == 1) {
                    Rfb = dSb(end, 0);
                } else {
                    Rfb = dSb(end, end.nodeValue.length);
                }
                target.range = new THRange(document.body, Qfb, Rfb);
            }
            var lBb = rda;
            $rw_stopSpeech();
            rda = false;
            rw_speakHoverTarget(target);
            rda = lBb;
        }
    }
}

function $rw_getHashCodes() {
    var mBb = "";
    var nBb = tKb(document.body);
    while (nBb != null) {
        var LHb = NFb(nBb, new Array());
        mBb = mBb + eHb() + "/";
        var XHb;
        if (SpeechStream.cacheMode.mode == SpeechStream.cacheMode.CACHE_ONLY || SpeechStream.pronunciation.mode == SpeechStream.pronunciation.CLIENT_PRONUNCIATION_FOR_LIVE_SERVER) {
            XHb = XQb(LHb.Uib);
        } else {
            XHb = XQb(LHb.cEb);
        }
        mBb = mBb + XHb + "~";
        nBb = YLb(nBb);
    }
    return mBb;
}

function $rw_getSoundFileLength(iOb) {
    var flash = NZb.getConnector();
    if (flash == null) {
        alert("Connection not available to the server.");
    } else {
        flash.getSoundFileLength(iOb);
    }
}

function $rw_soundFileLengthCallback(p_strLength) {
    alert(p_strLength);
}
SpeechStream.storedVoice = null;
SpeechStream.storedSpeed = null;
SpeechStream.storedCustId = null;
SpeechStream.storedBookId = null;
SpeechStream.storedPageId = null;

function tBb(uBb, zBb, ACb, BCb, CCb) {
    if (SpeechStream.storedVoice == null) {
        SpeechStream.storedVoice = kca;
        SpeechStream.storedSpeed = uca;
        SpeechStream.storedCustId = lca;
        SpeechStream.storedBookId = mca;
        SpeechStream.storedPageId = nca;
    }
    if (uBb != undefined) {
        kca = uBb;
    }
    if (zBb != undefined) {
        $rw_setSpeedValue(zBb);
    }
    if (ACb != undefined) {
        lca = ACb;
    }
    if (BCb != undefined) {
        mca = BCb;
    }
    if (CCb != undefined) {
        nca = CCb;
    }
    var flash = NZb.getConnector();
    flash.setAltSettings(uBb, zBb, ACb, BCb, CCb);
}

function DCb() {
    if (SpeechStream.storedVoice != null) {
        kca = SpeechStream.storedVoice;
        g_speedValue = SpeechStream.storedSpeed;
        lca = SpeechStream.storedCustId;
        mca = SpeechStream.storedBookId;
        nca = SpeechStream.storedPageId;
        SpeechStream.storedVoice = null;
        SpeechStream.storedSpeed = null;
        SpeechStream.storedCustId = null;
        SpeechStream.storedBookId = null;
        SpeechStream.storedPageId = null;
    }
    var flash = NZb.getConnector();
    flash.restoreSettings();
} /*Code designed and developed by Stuart McWilliams.*/
function FCb() {
    var iCb;
    iCb = document.getElementById('rwDrag').style;
    if (iCb == null) {
        return;
    }
    if (!Sca) {
        var x;
        var y;
        if (typeof (eba_override_x) != 'undefined' && typeof (eba_override_y) != 'undefined') {
            x = eba_override_x;
            y = eba_override_y;
        } else {
            var wd = rw_getDisplayWidth();
            var ht = rw_getDisplayHeight();
            if (Nca) {
                pea = 1;
                qea = 0;
                lea = 0;
            }
            x = wd * pea;
            y = ht * qea;
            if ((x + sea + lea) > rw_getDisplayWidthAdjusted()) {
                x = rw_getDisplayWidthAdjusted() - sea - lea;
            }
            if (x < lea) {
                x = lea;
            }
            if ((y + tea + lea) > rw_getDisplayHeightAdjusted()) {
                y = rw_getDisplayHeightAdjusted() - tea - lea;
            }
            if (y < lea) {
                y = lea;
            }
            x = rw_getScreenOffsetLeft() + x;
            y = rw_getScreenOffsetTop() + y;
            if (Nca) {
                y = 0;
            }
        }
        iCb.left = x + 'px';
        iCb.top = y + 'px';
    }
    if (xca) {
        return;
    }
    iCb.visibility = 'visible';
    iCb.display = "inline";
    var fgb = document.getElementById("rwMainOutline");
    if (fgb != null) {
        fgb.style.visibility = 'visible';
        fgb.style.display = "block";
    }
    fgb = document.getElementById("rwMainNoOutline");
    if (fgb != null) {
        fgb.style.visibility = 'visible';
        fgb.style.display = "block";
    }
}

function HCb() {
    LCb(0);
    LCb(1);
    LCb(2);
    LCb(3);
    LCb(4);
    LCb(5);
    LCb(6);
    LCb(7);
    LCb(8);
    LCb(9);
    LCb(10);
    LCb(11);
}

function LCb(dCb) {
    var ICb;
    var iCb;
    var hib;
    switch (dCb) {
    case 0:
        hib = "rwDisplay";
        break;
    case 1:
        hib = "rwTrans";
        break;
    case 2:
        hib = "rwFF";
        break;
    case 3:
        hib = "rwDict";
        break;
    case 4:
        hib = "rwCollect";
        break;
    case 5:
        hib = "rwSticky";
        break;
    case 6:
        hib = "rwPronCreate";
        break;
    case 7:
        hib = "rwPronEdit";
        break;
    case 8:
        hib = "rwCal";
        break;
    case 9:
        hib = "rwGenerateCache";
        break;
    case 10:
        hib = "rwCheckCache";
        break;
    case 11:
        hib = "rwPictureDictionary";
        break;
    default:
        hib = "rwDisplay";
    }
    ICb = document.getElementById(hib);
    if (typeof (ICb) == 'undefined' || ICb == null) {
        return;
    }
    iCb = ICb.style;
    if (iCb == null) {
        return;
    }
    if (yea[dCb]) {
        iCb.display = "block";
        if (iCb.visibility == 'visible') {
            var hCb = zxa(hib);
            if (hCb != null) {
                var OCb = parseInt(hCb.offsetHeight, 10);
                if (!isNaN(OCb)) {
                    xea[dCb] = OCb - 4;
                }
            }
        }
        var width = fQb();
        var height = rw_getDocumentDisplayHeight();
        var x = width * uea[dCb];
        var y = height * vea[dCb];
        if ((x + wea[dCb] + lea) > hQb()) {
            x = hQb() - wea[dCb] - lea;
        }
        if (x < lea) {
            x = lea;
        }
        if ((y + xea[dCb] + lea) > rw_getDocumentDisplayHeightAdjusted()) {
            y = rw_getDocumentDisplayHeightAdjusted() - xea[dCb] - lea;
        }
        if (y < lea) {
            y = lea;
        }
        x = rw_getScreenOffsetLeft() + x;
        y = rw_getScreenOffsetTop() + y;
        iCb.left = x + 'px';
        iCb.top = y + 'px';
        iCb.visibility = 'visible';
    } else {
        if (Rfa) {
            iCb.display = "none";
        }
        iCb.visibility = 'hidden';
    }
}

function PCb(x, y) {
    pea = x / fQb();
    qea = y / rw_getDocumentDisplayHeight();
}

function RCb(dCb, x, y) {
    uea[dCb] = x / fQb();
    vea[dCb] = y / rw_getDocumentDisplayHeight();
}

function $rw_divOver(dCb) {
    var hib;
    switch (dCb) {
    case Mba:
        hib = "displayImg";
        break;
    case Nba:
        hib = "transImg";
        break;
    case Oba:
        hib = "FFImg";
        break;
    case Pba:
        hib = "dictImg";
        break;
    case Qba:
        hib = "collectImg";
        break;
    case Sba:
        hib = "pronCreateImg";
        break;
    case Tba:
        hib = "pronEditImg";
        break;
    case Uba:
        hib = "calImg";
        break;
    case Vba:
        hib = "generateCacheImg";
        break;
    case Wba:
        hib = "checkCacheImg";
        break;
    case Xba:
        hib = "pictureDictionaryImg";
        break;
    default:
        hib = "displayImg";
    }
    if (document.images[hib] != null) {
        document.images[hib].src = $g_strFileLoc + "rwimgs/thepressedx.bmp";
    }
}

function $rw_divOut(dCb) {
    var hib;
    switch (dCb) {
    case Mba:
        hib = "displayImg";
        break;
    case Nba:
        hib = "transImg";
        break;
    case Oba:
        hib = "FFImg";
        break;
    case Pba:
        hib = "dictImg";
        break;
    case Qba:
        hib = "collectImg";
        break;
    case Sba:
        hib = "pronCreateImg";
        break;
    case Tba:
        hib = "pronEditImg";
        break;
    case Uba:
        hib = "calImg";
        break;
    case Vba:
        hib = "generateCacheImg";
        break;
    case Wba:
        hib = "checkCacheImg";
        break;
    case Xba:
        hib = "pictureDictionaryImg";
        break;
    default:
        hib = "displayImg";
    }
    if (document.images[hib] != null) {
        document.images[hib].src = $g_strFileLoc + "rwimgs/thex.bmp";
    }
}

function $rw_divPress(dCb) {
    $rw_event_stop();
    bCb(false, dCb);
}

function WCb(dCb, amb) {
    var iCb;
    var hib;
    switch (dCb) {
    case Mba:
        hib = "rwpopupdisplay";
        break;
    case Nba:
        hib = "rwpopuptrans";
        break;
    case Oba:
        hib = "rwpopupff";
        break;
    case Pba:
        hib = "rwpopupdict";
        break;
    case Qba:
        hib = "rwpopupcollect";
        break;
    case Sba:
        hib = "rwpopupproncreate";
        break;
    case Tba:
        hib = "rwpopuppronedit";
        break;
    case Uba:
        hib = "rwpopupcal";
        break;
    case Vba:
        hib = "rwpopupgeneratecache";
        break;
    case Wba:
        hib = "rwpopupcheckcache";
        break;
    case Xba:
        hib = "rwpopuppicturedictionary";
        break;
    default:
        hib = "rwpopupdisplay";
    }
    iCb = document.getElementById(hib);
    if (iCb == null) {
        return;
    }
    try {
        iCb.innerHTML = amb;
    } catch (err) {
        HQb(iCb, amb, true);
    }
}

function bCb(cCb, dCb) {
    var iCb;
    yea[dCb] = cCb;
    var hib;
    switch (dCb) {
    case Mba:
        hib = "rwDisplay";
        break;
    case Nba:
        hib = "rwTrans";
        break;
    case Oba:
        hib = "rwFF";
        break;
    case Pba:
        hib = "rwDict";
        break;
    case Qba:
        hib = "rwCollect";
        break;
    case Rba:
        hib = "rwSticky";
        break;
    case Sba:
        hib = "rwPronCreate";
        break;
    case Tba:
        hib = "rwPronEdit";
        break;
    case Uba:
        hib = "rwCal";
        break;
    case Vba:
        hib = "rwGenerateCache";
        break;
    case Wba:
        hib = "rwCache";
        break;
    case Xba:
        hib = "rwPictureDictionary";
        break;
    default:
        hib = "rwDisplay";
    }
    var hCb = zxa(hib);
    if (hCb != null) {
        iCb = hCb.style;
        if (iCb == null) {
            return;
        }
        if (cCb) {
            gCb();
            iCb.visibility = 'visible';
            iCb.display = 'block';
            iCb.zIndex = 501;
        } else {
            iCb.visibility = 'hidden';
            if (Rfa) {
                iCb.display = "none";
            }
            WCb(dCb, "");
        }
    }
    HCb();
}

function gCb() {
    var hib;
    hib = "rwDisplay";
    var hCb = zxa(hib);
    var iCb;
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwTrans";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwFF";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwDict";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwCollect";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwSticky";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwCal";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwGenerateCache";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwCheckCache";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
    hib = "rwPictureDictionary";
    hCb = zxa(hib);
    if (hCb != null && hCb.style) {
        iCb = hCb.style;
        iCb.zIndex = 500;
    }
}

function $setToolbarX(p_fBarX) {
    if (p_fBarX < 0) {
        pea = 0;
    } else if (p_fBarX > 1) {
        pea = 1;
    } else {
        pea = p_fBarX;
    }
    FCb();
}

function $setToolbarY(p_fBarY) {
    if (p_fBarY < 0) {
        qea = 0;
    } else if (p_fBarY > 1) {
        qea = 1;
    } else {
        qea = p_fBarY;
    }
    FCb();
}

function $getToolbarX() {
    return pea;
}

function $getToolbarY() {
    return qea;
}
var jCb = new Array();

function $rw_clearInstructionQueue() {
    jCb.length = 0;
}

function kCb() {
    if (jCb != null) {
        var i;
        for (i = 0; i < jCb.length; i++) {
            if (typeof (jCb[i]) == "string") {
                if (jCb[i].indexOf("$rw_readNextTarget") > -1) {
                    jCb.length = i;
                    break;
                }
            }
        }
    }
}

function pCb(lEb) {
    var Wbb = lEb.range;
    var Qgb;
    var kib;
    if (Wbb != null) {
        kib = Wbb.body;
        Qgb = xOb(kib, Wbb.Qfb.path, Wbb.Qfb.offset, Wbb.Rfb.path, Wbb.Rfb.offset);
    } else if (lEb.body != null && lEb.path != null) {
        kib = lEb.body;
        var oCb = new THCaret(LOb(kib, lEb.path), 0, true);
        Qgb = new Kka(oCb, oCb);
    } else {
        jCb.push("rw_pageCompleteCallBack()");
        return;
    }
    var uCb = null;
    if (lEb.jumpId != null) {
        var tCb = Qgb.afb.node.ownerDocument.getElementById(lEb.jumpId);
        if (tCb != null) {
            uCb = LLb(new THCaret(tCb, 0, true));
        }
    }
    if (uCb == null) {
        var uCb = YLb(Qgb);
        if (uCb == null) {
            var jkb = function () {
                Rca = true;
                rw_pageCompleteCallBack();
            };
            jCb.push(jkb);
            return;
        }
        while (!nsa(uCb)) {
            uCb = YLb(uCb);
            if (uCb == null) {
                var jkb = function () {
                    Rca = true;
                    rw_pageCompleteCallBack();
                };
                jCb.push(jkb);
                return;
            }
        }
        var xCb = new THHoverTarget(null, null, pHb(uCb));
        xCb.prepareTextForSpeech();
        var yCb = xCb.getCaretRange();
        if (!yCb.equals(uCb)) {
            uCb = yCb;
        }
        if (qEb(Qgb.Zfb.node, uCb.afb.node)) {
            var jkb = function () {
                Rca = true;
                rw_pageCompleteCallBack();
            };
            jCb.push(jkb);
            return;
        }
    }
    Rca = false;
    if (uda) {
        var fgb = BMb(uCb.Zfb.node);
        uCb.Zfb.node = fgb;
        uCb.afb.node = FMb(uCb.afb.node);
        uCb.Zfb.offset = 0;
        if (uCb.afb.node.nodeType == 1) {
            uCb.afb.offset = 0;
        } else {
            uCb.afb.offset = uCb.afb.node.length;
        }
    }
    var BDb = new THRange(kib, dSb(uCb.Zfb.node, uCb.Zfb.offset), dSb(uCb.afb.node, uCb.afb.offset));
    sda = new THHoverTarget(null, null, BDb);
    var Uib = sda.getTextPreparedForSpeech();
    if (Uib == null || Uib.length == 0) {
        var jkb = function () {
            Rca = true;
            rw_pageCompleteCallBack();
        };
        jCb.push(jkb);
        return;
    }
    jCb.push("setTimeout($rw_readNextTarget, 50);");
}

function FDb(GDb) {
    while (GDb.length > 0) {
        var EDb = GDb.shift();
        try {
            if (typeof (EDb) == "function") {
                EDb();
            } else if (typeof (EDb) == "string") {
                eval(EDb);
            }
        } catch (err) {
            thLogE(err.message);
        }
    }
}
var HDb = '<bookmark mark="';
var IDb = '"/>';
var JDb = null;
var KDb = null;
var LDb = 0;
var MDb = 0;
var NDb = false;
var ODb = false;
var PDb = false;
if (Pfa) {
    var QDb = navigator.appVersion;
    var RDb = QDb.lastIndexOf("/");
    QDb = QDb.substring(RDb + 1);
    try {
        var SDb = parseFloat(QDb);
        if (SDb < 300 || (SDb > 400 && SDb < 416)) {
            NDb = true;
        } else if (SDb > 500) {
            PDb = true;
        } else {
            ODb = true;
        }
    } catch (err) {
        PDb = true;
    }
}
var TDb = 0;
var UDb = 0;

function XDb(evt, EEb) {
    try {
        if (Jca) {
            var d = new Date();
            var Ylb = d.getTime();
            if (Ylb < (UDb + 800) || !Hca) {
                return;
            }
        }
        var tZb = dDb(evt, Jca);
        if (tZb != null) {
            if (Hea) {
                if (tZb.node.nodeType == 1 && tZb.node.tagName.toLowerCase() == "input") {
                    var Yjb = tZb.node.getAttribute("type");
                    if (Yjb != null) {
                        Yjb = Yjb.toLowerCase();
                        if ((Yjb == "radio" || Yjb == "checkbox")) {
                            tZb.node = XKb(tZb.node, true, null);
                            tZb.offset = 0;
                        }
                    }
                }
            }
            var Bab = tDb(tZb);
            if (Bab != null) {
                try {
                    if (Bab.equals(JDb)) {
                        return;
                    }
                    if (Bab.equals(KDb)) {
                        if ((Ylb - TDb) < 1000) {
                            return;
                        }
                        TDb = Ylb;
                    }
                    if (typeof (EEb) == "boolean" && EEb) {
                        Bab.useHighlighting = false;
                        CEb(Bab, true);
                    } else {
                        CEb(Bab, false);
                    }
                } catch (err) {
                    thLogE(err);
                }
            } else {
                JDb = null;
            }
        }
    } catch (err) {
        bra("mousehover error: " + err);
    }
}

function dDb(eDb, SUb) {
    var uNb = null;
    var cDb = 0;
    if (Cfa) {
        uNb = eDb.srcElement;
        if (uNb.nodeType == 1 && uNb.tagName.toLowerCase() == "textarea") {} else {
            var Tkb = rw_getTargetNodeAsCaretIE(eDb, SUb);
            if (Tkb != null) {
                uNb = Tkb.node;
                cDb = Tkb.offset;
            } else {
                var hDb = false;
                if (uNb.tagName.toLowerCase() == "li" || uNb.tagName.toLowerCase() == "a") {
                    hDb = true;
                } else if (uNb.parentNode != null && uNb.parentNode.tagName != null && uNb.parentNode.tagName.toLowerCase() == "li") {
                    hDb = true;
                }
                if (hDb) {
                    var bfb = uNb.firstChild;
                    if (bfb == null) {
                        return null;
                    }
                    if (bfb.nodeType != 3) {
                        bfb = XKb(bfb, false, uNb);
                        if (bfb == null) {
                            return null;
                        }
                    }
                    uNb = bfb;
                    cDb = 0;
                }
            }
        }
    } else if (Pfa) {
        uNb = eDb.target;
        if (uNb != null) {
            if (PDb) {
                if (uNb.firstChild != null && uNb.firstChild.nodeType == 3 && uNb.tagName.toLowerCase() != "textarea") {
                    var VUb = uNb.firstChild.nodeValue;
                    if (VUb.trimTH().length > 0) {
                        uNb = uNb.firstChild;
                    }
                }
            } else if (ODb) {
                if (eDb.fromElement != null) {
                    if (uNb.nodeType == 1 && uNb.tagName.toLowerCase() != "textarea") {
                        if (eDb.fromElement.nodeType == 3) {
                            uNb = eDb.fromElement;
                        }
                    }
                } else {
                    if (uNb.firstChild != null && uNb.firstChild.nodeType == 3 && uNb.tagName.toLowerCase() != "textarea") {
                        var VUb = uNb.firstChild.nodeValue;
                        if (VUb.trimTH().length > 0) {
                            uNb = uNb.firstChild;
                        }
                    }
                }
            }
        }
    } else {
        if (eDb.explicitOriginalTarget.nodeValue != null) {
            if (eDb.target.tagName.toLowerCase() == "textarea") {
                uNb = eDb.target;
            } else {
                uNb = eDb.explicitOriginalTarget;
                if (eDb.rangeOffset) {
                    cDb = eDb.rangeOffset;
                }
            }
        } else {
            uNb = eDb.target;
        }
    } if (uNb == null) {
        return null;
    }
    if (mMb(uNb)) {
        return null;
    }
    return new THCaret(uNb, cDb, true);
}

function tDb(uDb) {
    var lDb = false;
    var uNb = uDb.node;
    var Bab = null;
    if (uSb(uNb)) {
        if (eca == null) {
            return Bab;
        } else {
            lDb = true;
        }
    }
    if (uNb != null && uNb.parentNode != null && uNb.parentNode.getAttribute) {
        var gNb;
        var pDb;
        var qDb;
        var rDb;
        var sDb;
        if (uNb.nodeType == 1) {
            gNb = uNb.tagName;
            if (yca && gNb.toUpperCase() == "INPUT") {
                var Yjb = uNb.getAttribute("type");
                var wDb = uNb.className;
                if (Yjb != null && Yjb == "button" && wDb != "rwcalbutton" && wDb != "rwcalEqbutton") {
                    return Bab;
                }
            }
            pDb = uNb.getAttribute("started");
            qDb = uNb.getAttribute("ignore");
            rDb = uNb.getAttribute("sp");
            sDb = uNb.getAttribute("csp");
            if (sDb != null || qDb != null || rDb != null || pDb != null) {
                return Bab;
            }
        }
        var eab = uNb.parentNode;
        pDb = eab.getAttribute("started");
        qDb = eab.getAttribute("ignore");
        rDb = eab.getAttribute("sp");
        sDb = eab.getAttribute("csp");
        if (sDb != null || qDb != null || rDb != null || pDb != null) {
            Bab = null;
        } else {
            var Zfb;
            var afb;
            if (uNb.nodeType == 3) {
                var Tkb = uDb;
                try {
                    if (!Cfa && Tkb.node.nodeValue.length > 0) {
                        if (!rda && Pfa) {
                            Tkb.offset = 0;
                            Zfb = KJb(Tkb);
                            Tkb.offset = Tkb.node.nodeValue.length - 1;
                            afb = YJb(Tkb);
                        } else {
                            Zfb = KJb(Tkb);
                            afb = YJb(Tkb);
                        }
                    } else {
                        Zfb = KJb(Tkb);
                        afb = YJb(Tkb);
                    } if (Zfb != null && afb != null) {
                        var range = new THRange(Xra(eab), dSb(Zfb.node, Zfb.offset), dSb(afb.node, afb.offset));
                        Bab = new THHoverTarget(null, null, range);
                        Bab.blockCache = lDb;
                    }
                } catch (err) {
                    thLogE(err);
                }
            } else if (uNb.nodeType == 1) {
                if (uNb.tagName.toLowerCase() == "img" && uNb.getAttribute("msg") != null) {
                    Zfb = KJb(uDb);
                    afb = YJb(uDb);
                    if (Zfb != null && afb != null) {
                        var range = new THRange(Xra(eab), dSb(Zfb.node, Zfb.offset), dSb(afb.node, afb.offset));
                        Bab = new THHoverTarget(null, null, range);
                    } else {
                        Bab = new THHoverTarget(Xra(uNb), AOb(uNb), null);
                    }
                    Bab.blockCache = lDb;
                } else {
                    Bab = new THHoverTarget(Xra(uNb), AOb(uNb), null);
                    Bab.blockCache = lDb;
                    Bab.allowContinuous = false;
                }
            } else {
                Bab = null;
            }
        }
    }
    return Bab;
}

function CEb(Nab, EEb) {
    if (LDb > 0) {
        clearTimeout(LDb);
        LDb = 0;
    }
    if (MDb > 0) {
        clearTimeout(MDb);
        MDb = 0;
    }
    if (Jca && !EEb) {
        if (!LEb(Nab)) {
            return;
        }
        JDb = Nab;
        var BEb = gxa;
        $rw_event_stop_limited();
        if (BEb) {
            LDb = setTimeout(JEb, 500);
        } else {
            LDb = setTimeout(JEb, 5);
        }
    } else {
        JDb = Nab;
        LDb = setTimeout(GEb, 500);
    }
}

function GEb() {
    if (JDb == null) {
        return;
    }
    if ($g_bMouseSpeech || ((Zca & calculator_icon) == calculator_icon)) {
        LDb = 0;
        if (JDb != null) {
            if (!LEb(JDb)) {
                return;
            }
        }
        if (LDb > 0) {
            clearTimeout(LDb);
            LDb = 0;
        }
        if (MDb > 0) {
            clearTimeout(MDb);
            MDb = 0;
        }
        $rw_event_stop_limited();
        MDb = setTimeout(JEb, 500);
    }
}
var FEb = false;

function JEb() {
    try {
        FEb = true;
        LDb = 0;
        if (JDb != null) {
            if (KDb != null) {
                if (MDb > 0) {
                    clearTimeout(MDb);
                    MDb = 0;
                }
                $rw_event_stop_limited();
                MDb = setTimeout(JEb, 500);
            } else {
                var d = new Date();
                UDb = d.getTime();
                if (JDb.range != null) {
                    Uga = JDb;
                }
                rw_speakHoverTarget(JDb);
                JDb = null;
            }
        }
    } catch (ignore) {
        thLogE(ignore);
    }
    FEb = false;
}

function LEb(Nab) {
    if (Nab != null) {
        var Uib;
        if (Nab instanceof String) {
            Uib = Nab.toString();
        } else {
            if (Nab.isRange()) {
                if (nsa(Nab.getCaretRange())) {
                    Uib = " ";
                } else {
                    Uib = null;
                }
            } else {
                Uib = Nab.getTextPreparedForSpeech();
            }
        } if (Uib == null || Uib.length == 0) {
            return false;
        } else {
            return true;
        }
    }
}
var NEb = new Array();
var OEb = (new Date).getTime();
var PEb = 0;
var QEb = 500;

function SEb() {
    if ((new Date).getTime() - OEb < QEb) {
        return true;
    }
    return false;
}

function TEb() {
    if (SEb()) {
        PEb = setTimeout(TEb, 100);
    } else {
        PEb = 0;
        if (NEb.length > 1) {
            var UZb = NEb[NEb.length - 2];
            var target = NEb[NEb.length - 1];
            NEb.length = 0;
            if (UZb == "rw_speakHoverTarget") {
                rw_speakHoverTarget(target);
            } else if (UZb == "rw_speechHighlightOnly") {
                rw_speechHighlightOnly(target);
            } else {
                fEb(target, UZb);
            }
        }
    }
}

function rw_speakHoverTarget(lEb) {
    try {
        if (lEb == null) {
            return;
        }
        if (SEb()) {
            NEb.push("rw_speakHoverTarget");
            NEb.push(lEb);
            if (PEb == 0) {
                PEb = setTimeout(TEb, 100);
            }
            return;
        }
        OEb = (new Date).getTime();
        if (KDb != null) {
            KDb.unhighlightRange();
        }
        if (lEb instanceof String) {
            KDb = null;
            var YFb = new SpeechStream.SpeechRequest();
            YFb.setString(lEb.toString(), SpeechStream.SpeechRequestBookmarks.NONE);
            var hlb = YFb.getText();
            var flash = NZb.getConnector();
            if (flash != null) {
                flash.simpleSpeech(hlb, !efa);
            }
        } else {
            if (lEb.range && lEb.range instanceof THRange) {
                var ZEb = BIb(lEb.range);
                if (ZEb != null && uSb(ZEb.Zfb.node)) {
                    if (eca == null) {
                        return;
                    } else {
                        lEb.blockCache = true;
                    }
                }
            }
            if (!Dea && Gea != null && Fea != null) {
                if (lEb.equalsAprox(Fea)) {
                    lEb = Gea;
                    lEb.allowContinuous = false;
                    Fea = null;
                    Gea = null;
                    if (Eea) {
                        jCb.push("rw_pageCompleteCallBack()");
                    }
                }
            }
            KDb = lEb;
            var Uib = lEb.getTextPreparedForSpeech();
            if (Uib != null && Uib.length > 0) {
                gka(lEb);
                if (!lEb.isValid()) {
                    return;
                }
                $rw_setSentenceFromSelection();
                if (!lEb.useHighlighting) {
                    var flash = NZb.getConnector();
                    if (flash != null) {
                        if (lEb.isOverridingGlobal()) {
                            tBb(lEb.voice, null, null, lEb.bookId, lEb.pageId);
                            flash.simpleSpeech(Uib, !efa);
                            DCb();
                        } else {
                            flash.simpleSpeech(Uib, !efa);
                        }
                    }
                } else {
                    lEb.highlightRange();
                    var cEb = lEb.textToSpeakNoChanges;
                    if (lEb.isOverridingGlobal()) {
                        tBb(lEb.voice, null, null, lEb.bookId, lEb.pageId);
                        mna(Uib, lEb.blockCache, cEb);
                        DCb();
                    } else {
                        mna(Uib, lEb.blockCache, cEb);
                    }
                } if (rda && lEb.allowContinuous) {
                    Ica = true;
                    if (lEb.equals(Fea)) {
                        Fea = null;
                        if (Eea) {
                            jCb.push("rw_pageCompleteCallBack()");
                        }
                    } else {
                        pCb(lEb, lEb.blockCache);
                    }
                    Ica = false;
                }
            }
        }
    } catch (err) {
        bra("rw_speakHoverTarget error:" + err.message);
    }
}

function fEb(lEb, jEb) {
    if (lEb == null || jEb == null) {
        return;
    }
    if (SEb()) {
        NEb.push(jEb);
        NEb.push(lEb);
        if (PEb == 0) {
            PEb = setTimeout(TEb, 100);
        }
        return;
    }
    OEb = (new Date).getTime();
    if (KDb != null) {
        KDb.unhighlightRange();
    }
    if (lEb instanceof String) {
        KDb = null;
        try {
            var flash = NZb.getConnector();
            if (flash != null) {
                pxa(true);
                flash.startSpeechFromFile(lEb, jEb, !efa);
                Gqa();
            }
        } catch (err) {
            thLogE(err);
        }
    } else {
        KDb = lEb;
        var Uib = lEb.getTextPreparedForSpeech();
        if (Uib != null && Uib.length > 0) {
            gka(lEb);
            if (!lEb.isValid()) {
                return;
            }
            lEb.highlightRange();
            Moa(Uib, jEb);
        }
    }
}

function rw_speechHighlightOnly(lEb) {
    if (lEb == null) {
        return;
    }
    if (SEb()) {
        NEb.push("rw_speechHighlightOnly");
        NEb.push(lEb);
        if (PEb == 0) {
            PEb = setTimeout(TEb, 100);
        }
        return;
    }
    OEb = (new Date).getTime();
    if (KDb != null) {
        KDb.unhighlightRange();
    }
    if (lEb instanceof String) {
        KDb = null;
    } else {
        KDb = lEb;
        var Uib = lEb.getTextPreparedForSpeech();
        if (Uib != null && Uib.length > 0) {
            gka(lEb);
            if (!lEb.isValid()) {
                return;
            }
            lEb.highlightRange();
            Soa(Uib);
        }
    }
}

function $rw_readNextTarget() {
    if (sda != null) {
        JDb = sda;
        Uga = sda;
        sda = null;
        JEb();
    }
}

function qEb(rEb, QSb) {
    if (rEb == null || QSb == null || rEb == QSb) {
        return false;
    }
    var Hgb;
    var aNb = rEb;
    var pEb = null;
    if (Fea != null) {
        pEb = Fea.getCaretRange().afb.node;
    }
    while (aNb != null && aNb != QSb) {
        if (aNb.nodeType == 1) {
            if (aNb.getAttribute("texthelpStopContinuous") != null) {
                return true;
            }
        }
        if (aNb == pEb && aNb != QSb) {
            return true;
        }
        Hgb = !cMb(aNb);
        if (aNb.firstChild != null && Hgb) {
            aNb = aNb.firstChild;
        } else if (aNb.nextSibling != null) {
            aNb = aNb.nextSibling;
        } else {
            while (aNb != null && aNb.nextSibling == null) {
                aNb = aNb.parentNode;
                if (aNb != null && aNb.nodeType == 1) {
                    if (aNb.getAttribute("texthelpStopContinuous") != null) {
                        return true;
                    }
                }
                if (QSb == aNb) {
                    return false;
                }
            }
            if (aNb != null && QSb != aNb) {
                aNb = aNb.nextSibling;
            }
        }
    }
    return false;
}

function uEb(ddb, qFb) {
    this.range = ddb;
    this.word = qFb;
}

function AFb(PVb, INb, JNb, EGb) {
    try {
        if (INb == null || JNb == null) {
            return new xAb();
        }
        var Qgb = xOb(PVb, INb.path, INb.offset, JNb.path, JNb.offset);
        return NFb(Qgb, EGb);
    } catch (err) {
        bra("err rw_getTextOverRangeToSpeak:" + "|" + err.message);
        return new xAb();
    }
}

function NFb(WNb, EGb) {
    var FFb = new xAb();
    try {
        if (WNb == null) {
            return FFb;
        }
        var Zfb = WNb.Zfb;
        var afb = WNb.afb;
        if (Zfb == null) {
            return FFb;
        }
        if (afb == null) {
            return FFb;
        }
        if (Zfb.node != null) {
            var pjb = hFb(Zfb.node);
            if (pjb != null) {
                Zfb.node = pjb;
                Zfb.offset = 0;
            }
        }
        if (afb.node != null && afb.node.nodeType == 3) {
            var pjb = hFb(afb.node);
            if (pjb != null) {
                if (afb.node.nodeType == 3) {
                    afb.offset = afb.node.nodeValue.length;
                }
                afb.node = pjb;
            }
        }
        var KFb = false;
        if (!sca) {
            var bfb = Zfb.node;
            var qjb;
            while (bfb != null) {
                if (bfb.nodeType == 1) {
                    qjb = bfb.getAttribute("id");
                    if (qjb != null && qjb.length > 0) {
                        if (qjb == "rwpopuptrans") {
                            KFb = true;
                            break;
                        } else {
                            if (qjb.indexOf("rwMeaning") != 0 && qjb.indexOf("rwHeadWord") != 0) {
                                break;
                            }
                        }
                    }
                }
                bfb = bfb.parentNode;
            }
        }
        if (sca || KFb) {
            var OLb = yAb(Zfb.node);
            if (OLb != null) {
                FFb.voice = OLb;
            }
            var PLb = KBb(Zfb.node, afb.node, OLb);
            if (PLb != null) {
                FFb.Qgb = new Kka(Zfb, PLb);
                var Uib = FFb.Qgb.toString();
                if (Uib.length == 0 || !dsa(Uib)) {
                    var bfb = XKb(Zfb.node, false, afb.node);
                    if (bfb != null && bfb != Zfb.node && bfb != WNb.Zfb.node) {
                        var TFb = new Kka(new THCaret(bfb, 0, true), WNb.afb);
                        return NFb(TFb, EGb);
                    }
                }
                afb = PLb;
            }
        }
        if (wfa) {
            var UFb = Zka(Zfb.node);
            var VFb = UBb(Zfb.node, afb.node, UFb);
            if (VFb != null) {
                FFb.Qgb = new Kka(WNb.Zfb, VFb);
                afb = VFb;
            }
        }
        rw_getTextOverRangeToSpeakImpl(Zfb, afb, EGb);
        var i;
        var Xmb = EGb.length;
        var wordList = new Array();
        for (i = 0; i < Xmb; i++) {
            wordList.push(EGb[i].word);
        }
        var YFb = new SpeechStream.SpeechRequest();
        YFb.setWordList(wordList, SpeechStream.SpeechRequestBookmarks.ALL);
        FFb.cEb = YFb.getText();
        FFb.Uib = YFb.getFinalText();
        return FFb;
    } catch (err) {
        bra("err rw_getTextOverRangeToSpeak:" + "|" + err.message);
        return FFb;
    }
};

function ZFb(gib) {
    if (gib == null) {
        return false;
    }
    if (gib.nodeType == 1) {
        var tagName = gib.tagName.toLowerCase();
        if (tagName == "span") {
            var attr = gib.getAttribute("pron");
            if (attr != null) {
                return true;
            }
            attr = gib.getAttribute("chunk");
            if (attr != null) {
                return true;
            }
        } else if (tagName == "acronym" || tagName == "abbr") {
            var attr = gib.getAttribute("title");
            if (attr != null) {
                return true;
            }
        } else if (tagName == "chunk") {
            return true;
        } else if (tagName == "img") {
            var attr = gib.getAttribute("msg");
            if (attr != null) {
                return true;
            }
        } else if (tagName == "math") {
            var HTb = DQb(gib);
            if (HTb.length > 0) {
                return true;
            }
        }
        if (gib.getAttribute("ignore") != null) {
            return true;
        }
    }
    return false;
};

function cFb(gib) {
    if (gib.nodeType == 1) {
        var tagName = gib.tagName.toLowerCase();
        if (tagName == "span") {
            var attr = gib.getAttribute("pron");
            if (attr != null) {
                return true;
            }
            attr = gib.getAttribute("chunk");
            if (attr != null && attr == "1") {
                return true;
            }
        } else if (tagName == "acronym" || tagName == "abbr") {
            var attr = gib.getAttribute("title");
            if (attr != null) {
                return true;
            }
        } else if (tagName == "math") {
            var HTb = DQb(gib);
            if (HTb.length > 0) {
                return true;
            }
        }
    }
    return false;
};

function hFb(gib) {
    if (gib != null) {
        var kib = Xra(gib);
        var bfb = gib;
        while (bfb != null && bfb != kib) {
            if (ZFb(bfb)) {
                return bfb;
            }
            bfb = bfb.parentNode;
        }
        if (bfb == kib) {
            if (bfb.getAttribute("ignore") != null) {
                return bfb;
            }
        }
    }
    return null;
};
var jFb = 500;

function lFb(mFb) {
    var HGb = mFb.length;
    if (HGb > 1 && mFb.substr(HGb - 2, 2) == ". ") {
        return mFb;
    } else if (HGb > 0 && mFb.substr(HGb - 1, 1) == ".") {
        return mFb + " ";
    } else {
        var Uib = mFb.trimEndTH();
        var c = Uib.charCodeAt(Uib.length - 1);
        if (sra(c) || c > 127) {
            return mFb + ". ";
        } else {
            return mFb;
        }
    }
}

function pFb(qFb) {
    var Clb = "";
    if (qFb.indexOf("<math") > -1) {
        return qFb;
    } else {
        var rFb = (qFb.length > 20);
        var Ieb = 0;
        var Xmb = qFb.length;
        var i = 0;
        var ROb;
        for (i = 0; i < Xmb; i++) {
            ROb = qFb.charCodeAt(i);
            if (ROb > 127) {
                Clb += qFb.charAt(i);
            } else {
                switch (ROb) {
                case 35:
                case 40:
                case 41:
                case 91:
                case 93:
                case 95:
                case 123:
                case 124:
                case 125:
                    Clb += " ";
                    break;
                case 96:
                    Clb += "'";
                    break;
                case 38:
                    Clb += "&amp;";
                    break;
                case 34:
                    Clb += "&quot;";
                    break;
                case 60:
                    Clb += "&lt";
                    break;
                case 62:
                    Clb += "&gt";
                    break;
                default:
                    Clb += qFb.charAt(i);
                }
                if (rFb) {
                    if ((ROb >= 48 && ROb <= 57) || ROb == 44) {
                        ++Ieb;
                        if (Ieb > 20) {
                            Clb += ' ';
                            Ieb = 0;
                        }
                    } else {
                        Ieb = 0;
                    }
                }
            }
        }
        return Clb;
    }
}

function rw_getTextOverRangeToSpeakImpl(XLb, DGb, EGb) {
    try {
        var lSb = XLb.node;
        var aNb = DGb.node;
        var kib = Xra(lSb);
        var SJb = XLb.offset;
        var cJb = DGb.offset;
        var AGb = "";
        var cNb = lSb;
        var GGb = null;
        var HGb = 0;
        var RNb = true;
        var Ieb = 0;
        var tUb = dSb(cNb, SJb);
        var uUb = null;
        while (cNb != null) {
            if (Ieb > jFb && jFb > 0) {
                if (zca) {
                    throw "Full selection will not be spoken due to its length.";
                } else {
                    ssa("Full selection will not be spoken due to its length.");
                }
                return;
            }
            if (ZFb(cNb)) {
                if (AGb.length > 0) {
                    if (dsa(AGb)) {
                        EGb[Ieb++] = new uEb(new THRange(kib, tUb, uUb), AGb);
                    }
                    AGb = "";
                }
                var RGb = ANb(cNb);
                if (RGb.length > 0 && dsa(RGb)) {
                    if (cFb(cNb)) {
                        var NGb = sIb(cNb, false);
                        var OGb = wIb(cNb, false);
                        var PGb = "";
                        var QGb = "";
                        if (NGb.nodeType == 1) {
                            PGb = NGb.tagName.toLowerCase();
                        }
                        if (OGb.nodeType == 1) {
                            QGb = OGb.tagName.toLowerCase();
                        }
                        if (NGb != null && NGb.nodeType == 3 && OGb != null && OGb.nodeType == 3) {
                            tUb = dSb(NGb, 0);
                            uUb = dSb(OGb, OGb.nodeValue.length);
                        }
                        if (NGb != null && NGb.nodeType == 1 && PGb == "math" && OGb != null && OGb.nodeType == 1 && QGb == "math") {
                            tUb = dSb(NGb, 0);
                            uUb = dSb(OGb, RGb.length);
                        }
                        EGb[Ieb++] = new uEb(new THRange(kib, tUb, uUb), RGb);
                    } else {
                        tUb = dSb(cNb, -1);
                        EGb[Ieb++] = new uEb(new THRange(kib, tUb, tUb), RGb);
                    }
                    AGb = "";
                }
                tUb = null;
                uUb = null;
                cNb = mIb(cNb, false, aNb);
            } else if (cNb.nodeType == 1) {
                if (RNb) {
                    GGb = YIb(cNb, true, aNb);
                } else {
                    GGb = LIb(cNb, true, aNb);
                } if (GGb == null) {
                    if (AGb.length > 0) {
                        if (dsa(AGb)) {
                            EGb[Ieb++] = new uEb(new THRange(kib, tUb, uUb), lFb(AGb));
                        }
                        AGb = "";
                        tUb = null;
                        uUb = null;
                    }
                    if (RNb) {
                        cNb = YIb(cNb, false, aNb);
                    } else {
                        cNb = LIb(cNb, false, aNb);
                    }
                } else {
                    cNb = GGb;
                }
            } else if (cNb.nodeType == 3) {
                var RGb = ANb(cNb);
                if (RGb == null) {
                    RGb = "";
                }
                var Skb = 0;
                if (aNb == cNb && cJb > -1) {
                    RGb = RGb.substring(0, cJb);
                }
                if (lSb == cNb && SJb > 0) {
                    RGb = RGb.substring(SJb);
                    Skb = SJb;
                }
                if (RGb.length == 0 && AGb.length == 0) {
                    tUb = null;
                } else {
                    if (tUb == null || AGb.length == 0) {
                        tUb = dSb(cNb, Skb);
                    }
                    var bmb = gGb(RGb);
                    while (bmb > -1) {
                        if (bmb == 0) {
                            if (AGb.length > 0) {
                                if (dsa(AGb)) {
                                    if (uUb == null) {
                                        uUb = dSb(cNb, Skb);
                                    }
                                    var Wbb = new THRange(kib, tUb, uUb);
                                    if (!fda) {
                                        AGb = AGb + RGb.substr(0, 1);
                                    } else {
                                        var FNb = null;
                                        var WGb = null;
                                        var aGb = cNb.parentNode;
                                        if (aGb != null && aGb.nodeType == 1) {
                                            FNb = aGb.getAttribute("class");
                                            WGb = aGb.getAttribute("className");
                                        }
                                        var YGb = false;
                                        YGb = (FNb != null && (FNb.toLowerCase() == "x2" || FNb.toLowerCase() == "x3")) || (WGb != null && (WGb.toLowerCase() == "x2" || WGb.toLowerCase() == "x3"));
                                        var ZGb = false;
                                        while (YGb) {
                                            if (aGb.previousSibling != null && aGb.previousSibling.nodeType == 1) {
                                                FNb = aGb.previousSibling.getAttribute("class");
                                                WGb = aGb.previousSibling.getAttribute("className");
                                                if (FNb != null && FNb.length > 3) {
                                                    FNb = FNb.substr(FNb.length - 4).toLowerCase();
                                                    if (FNb == "text") {
                                                        ZGb = true;
                                                        break;
                                                    }
                                                }
                                                if (WGb != null && WGb.length > 3) {
                                                    WGb = WGb.substr(WGb.length - 4).toLowerCase();
                                                    if (WGb == "text") {
                                                        ZGb = true;
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                            aGb = aGb.parentNode;
                                            if (aGb != null && aGb.nodeType == 1 && aGb.tagName.toLowerCase() == "span") {} else {
                                                break;
                                            }
                                        }
                                        if (YGb) {
                                            if (!ZGb) {
                                                AGb = AGb + RGb.substr(0, 1);
                                            }
                                        } else {
                                            if (cNb.previousSibling != null) {
                                                FNb = cNb.previousSibling.getAttribute("class");
                                                WGb = cNb.previousSibling.getAttribute("className");
                                                if ((FNb != null && (FNb.toLowerCase() == "x2" || FNb.toLowerCase() == "x3")) || (WGb != null && (WGb.toLowerCase() == "x2" || WGb.toLowerCase() == "x3"))) {
                                                    AGb = AGb + RGb.substr(0, 1);
                                                }
                                            } else {
                                                var aGb = cNb;
                                                var YTb = false;
                                                while (aGb.previousSibling == null && aGb.parentNode.tagName.toLowerCase() == "span") {
                                                    aGb = aGb.parentNode;
                                                    if (aGb.previousSibling != null) {
                                                        YTb = true;
                                                    }
                                                }
                                                if (YTb && aGb.previousSibling != null) {
                                                    FNb = aGb.previousSibling.getAttribute("class");
                                                    WGb = aGb.previousSibling.getAttribute("className");
                                                    if ((FNb != null && (FNb.toLowerCase() == "x2" || FNb.toLowerCase() == "x3")) || (WGb != null && (WGb.toLowerCase() == "x2" || WGb.toLowerCase() == "x3"))) {
                                                        AGb = AGb + RGb.substr(0, 1);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    EGb[Ieb++] = new uEb(Wbb, AGb);
                                }
                                AGb = "";
                                ++Skb;
                                RGb = RGb.substr(1);
                            } else {
                                RGb = RGb.substr(1);
                                ++Skb;
                            }
                        } else {
                            var cGb = AGb + RGb.substring(0, bmb + 1);
                            if (cGb.trimTH() == "*") {
                                if (!(gfa && dTb("*"))) {
                                    cGb = "";
                                }
                            }
                            if (dsa(cGb)) {
                                uUb = dSb(cNb, bmb + Skb);
                                var Wbb = new THRange(kib, tUb, uUb);
                                EGb[Ieb++] = new uEb(Wbb, cGb);
                                if (Ieb > jFb && jFb > 0) {
                                    if (zca) {
                                        throw "Full selection will not be spoken due to its length.";
                                    } else {
                                        ssa("Full selection will not be spoken due to its length.");
                                    }
                                    return;
                                }
                            }
                            AGb = "";
                            Skb += bmb + 1;
                            RGb = RGb.substring(bmb + 1);
                        }
                        tUb = dSb(cNb, Skb);
                        uUb = null;
                        bmb = gGb(RGb);
                    }
                    if (RGb.length > 0) {
                        AGb += RGb;
                        uUb = dSb(cNb, RGb.length + Skb);
                        if (uUb == null) {
                            AGb = "";
                        }
                    }
                    if (cNb == aNb) {
                        if (AGb.length > 0) {
                            var Wbb = new THRange(kib, tUb, uUb);
                            if (dsa(AGb)) {
                                EGb[Ieb++] = new uEb(Wbb, AGb);
                            }
                        }
                        return;
                    }
                }
                GGb = LIb(cNb, true, aNb);
                if (GGb == null) {
                    if (AGb.length > 0) {
                        if (dsa(AGb)) {
                            EGb[Ieb++] = new uEb(new THRange(kib, tUb, uUb), lFb(AGb));
                        }
                        AGb = "";
                        tUb = null;
                        uUb = null;
                    }
                    cNb = LIb(cNb, false, aNb);
                } else {
                    cNb = GGb;
                }
            } else {
                GGb = LIb(cNb, true, aNb);
                if (GGb == null) {
                    if (AGb.length > 0) {
                        if (dsa(AGb)) {
                            EGb[Ieb++] = new uEb(new THRange(kib, tUb, uUb), lFb(AGb));
                        }
                        AGb = "";
                        tUb = null;
                        uUb = null;
                    }
                    cNb = LIb(cNb, false, aNb);
                } else {
                    cNb = GGb;
                }
            }
            RNb = false;
        }
    } catch (err) {
        bra("err rw_getTextOverRangeToSpeakImpl:" + err.message);
    }
}

function gGb(Jmb) {
    if (Jmb == null || Jmb.length == 0) {
        return -1;
    }
    var bmb = Jmb.search("[\\s\"]");
    return bmb;
} /* The following code is derived from MD5 hash functions (c) Paul Johnston, http://pajhome.org.uk/crypt/md5/. */
var iGb = 0;
var jGb = "";
var kGb = 8;

function lGb(s) {
    return EHb(mGb(CHb(s), s.length * kGb));
}

function mGb(x, gpa) {
    x[gpa >> 5] |= 0x80 << ((gpa) % 32);
    x[(((gpa + 64) >>> 9) << 4) + 14] = gpa;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (var i = 0; i < x.length; i += 16) {
        var nGb = a;
        var oGb = b;
        var pGb = c;
        var qGb = d;
        a = sGb(a, b, c, d, x[i + 0], 7, -680876936);
        d = sGb(d, a, b, c, x[i + 1], 12, -389564586);
        c = sGb(c, d, a, b, x[i + 2], 17, 606105819);
        b = sGb(b, c, d, a, x[i + 3], 22, -1044525330);
        a = sGb(a, b, c, d, x[i + 4], 7, -176418897);
        d = sGb(d, a, b, c, x[i + 5], 12, 1200080426);
        c = sGb(c, d, a, b, x[i + 6], 17, -1473231341);
        b = sGb(b, c, d, a, x[i + 7], 22, -45705983);
        a = sGb(a, b, c, d, x[i + 8], 7, 1770035416);
        d = sGb(d, a, b, c, x[i + 9], 12, -1958414417);
        c = sGb(c, d, a, b, x[i + 10], 17, -42063);
        b = sGb(b, c, d, a, x[i + 11], 22, -1990404162);
        a = sGb(a, b, c, d, x[i + 12], 7, 1804603682);
        d = sGb(d, a, b, c, x[i + 13], 12, -40341101);
        c = sGb(c, d, a, b, x[i + 14], 17, -1502002290);
        b = sGb(b, c, d, a, x[i + 15], 22, 1236535329);
        a = tGb(a, b, c, d, x[i + 1], 5, -165796510);
        d = tGb(d, a, b, c, x[i + 6], 9, -1069501632);
        c = tGb(c, d, a, b, x[i + 11], 14, 643717713);
        b = tGb(b, c, d, a, x[i + 0], 20, -373897302);
        a = tGb(a, b, c, d, x[i + 5], 5, -701558691);
        d = tGb(d, a, b, c, x[i + 10], 9, 38016083);
        c = tGb(c, d, a, b, x[i + 15], 14, -660478335);
        b = tGb(b, c, d, a, x[i + 4], 20, -405537848);
        a = tGb(a, b, c, d, x[i + 9], 5, 568446438);
        d = tGb(d, a, b, c, x[i + 14], 9, -1019803690);
        c = tGb(c, d, a, b, x[i + 3], 14, -187363961);
        b = tGb(b, c, d, a, x[i + 8], 20, 1163531501);
        a = tGb(a, b, c, d, x[i + 13], 5, -1444681467);
        d = tGb(d, a, b, c, x[i + 2], 9, -51403784);
        c = tGb(c, d, a, b, x[i + 7], 14, 1735328473);
        b = tGb(b, c, d, a, x[i + 12], 20, -1926607734);
        a = uGb(a, b, c, d, x[i + 5], 4, -378558);
        d = uGb(d, a, b, c, x[i + 8], 11, -2022574463);
        c = uGb(c, d, a, b, x[i + 11], 16, 1839030562);
        b = uGb(b, c, d, a, x[i + 14], 23, -35309556);
        a = uGb(a, b, c, d, x[i + 1], 4, -1530992060);
        d = uGb(d, a, b, c, x[i + 4], 11, 1272893353);
        c = uGb(c, d, a, b, x[i + 7], 16, -155497632);
        b = uGb(b, c, d, a, x[i + 10], 23, -1094730640);
        a = uGb(a, b, c, d, x[i + 13], 4, 681279174);
        d = uGb(d, a, b, c, x[i + 0], 11, -358537222);
        c = uGb(c, d, a, b, x[i + 3], 16, -722521979);
        b = uGb(b, c, d, a, x[i + 6], 23, 76029189);
        a = uGb(a, b, c, d, x[i + 9], 4, -640364487);
        d = uGb(d, a, b, c, x[i + 12], 11, -421815835);
        c = uGb(c, d, a, b, x[i + 15], 16, 530742520);
        b = uGb(b, c, d, a, x[i + 2], 23, -995338651);
        a = vGb(a, b, c, d, x[i + 0], 6, -198630844);
        d = vGb(d, a, b, c, x[i + 7], 10, 1126891415);
        c = vGb(c, d, a, b, x[i + 14], 15, -1416354905);
        b = vGb(b, c, d, a, x[i + 5], 21, -57434055);
        a = vGb(a, b, c, d, x[i + 12], 6, 1700485571);
        d = vGb(d, a, b, c, x[i + 3], 10, -1894986606);
        c = vGb(c, d, a, b, x[i + 10], 15, -1051523);
        b = vGb(b, c, d, a, x[i + 1], 21, -2054922799);
        a = vGb(a, b, c, d, x[i + 8], 6, 1873313359);
        d = vGb(d, a, b, c, x[i + 15], 10, -30611744);
        c = vGb(c, d, a, b, x[i + 6], 15, -1560198380);
        b = vGb(b, c, d, a, x[i + 13], 21, 1309151649);
        a = vGb(a, b, c, d, x[i + 4], 6, -145523070);
        d = vGb(d, a, b, c, x[i + 11], 10, -1120210379);
        c = vGb(c, d, a, b, x[i + 2], 15, 718787259);
        b = vGb(b, c, d, a, x[i + 9], 21, -343485551);
        a = yGb(a, nGb);
        b = yGb(b, oGb);
        c = yGb(c, pGb);
        d = yGb(d, qGb);
    }
    return Array(a, b, c, d);
}

function rGb(q, a, b, x, s, t) {
    return yGb(zGb(yGb(yGb(a, q), yGb(x, t)), s), b);
}

function sGb(a, b, c, d, x, s, t) {
    return rGb((b & c) | ((~b) & d), a, b, x, s, t);
}

function tGb(a, b, c, d, x, s, t) {
    return rGb((b & d) | (c & (~d)), a, b, x, s, t);
}

function uGb(a, b, c, d, x, s, t) {
    return rGb(b ^ c ^ d, a, b, x, s, t);
}

function vGb(a, b, c, d, x, s, t) {
    return rGb(c ^ (b | (~d)), a, b, x, s, t);
}

function yGb(x, y) {
    var wGb = (x & 0xFFFF) + (y & 0xFFFF);
    var xGb = (x >> 16) + (y >> 16) + (wGb >> 16);
    return (xGb << 16) | (wGb & 0xFFFF);
}

function zGb(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}

function CHb(wcb) {
    var AHb = Array();
    var mask = (1 << kGb) - 1;
    for (var i = 0; i < wcb.length * kGb; i += kGb) {
        AHb[i >> 5] |= (wcb.charCodeAt(i / kGb) & mask) << (i % 32);
    }
    return AHb;
}

function EHb(binarray) {
    var DHb = iGb ? "0123456789ABCDEF" : "0123456789abcdef";
    var wcb = "";
    for (var i = 0; i < binarray.length * 4; i++) {
        wcb += DHb.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + DHb.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
    }
    return wcb;
}

function $rw_hash(pdb) {
    return lGb(pdb);
}

function $rw_cachePage(uBb, zBb, p_strBookName) {
    var JHb = 0;
    try {
        if (qda) {
            eba_cacheResult = "failure: The embedded speech toolbar cannot be added due to invalid html tag markup in this page.";
            window.external.completed(eba_cacheResult);
            return eba_cacheResult;
        }
        if (oca == 300) {
            if (typeof (p_strBookName) == "string" && p_strBookName != null && p_strBookName.length > 0) {
                mca = p_strBookName;
            } else {
                mca = "1";
            }
            nca = "1";
        }
        if (zca) {
            if (zBb != null) {
                $rw_setSpeedValue(parseInt(zBb), 10);
            }
            if (uBb != null) {
                $rw_setVoice(uBb);
            }
            var HHb = tKb(document.body);
            $rw_doSelection(-2);
            JHb = OHb(HHb, JHb);
        } else {
            eba_cacheResult = "failure: The generate cache flag was set to false, no processing done for this page.";
            window.external.completed(eba_cacheResult);
            return eba_cacheResult;
        }
    } catch (err) {
        if (err.message != null) {
            eba_cacheResult = "failure:" + err.message;
        } else {
            eba_cacheResult = "failure:" + err;
        }
        window.external.completed(eba_cacheResult);
        return eba_cacheResult;
    }
    eba_cacheResult = "success";
    if (JHb > 0) {
        eba_cacheResult = eba_cacheResult + ":Warning, encountered " + JHb + " zero length speech files.";
    }
    window.external.completed(eba_cacheResult);
    return "success";
}

function OHb(PHb, QHb) {
    var IHb = PHb;
    var JHb = QHb;
    var KHb = 0;
    while (IHb != null) {
        var LHb = NFb(IHb, new Array());
        var Uib = LHb.Uib;
        if (Uib == null || Uib.trimTH().length == 0) {
            if (IHb != null) {
                var NHb = YLb(IHb);
                if (NHb != null) {
                    IHb = NHb;
                } else {
                    if (KHb > 1) {
                        throw "Speech engine generating empty files.";
                    }
                    VHb();
                    return JHb;
                }
            } else {
                if (KHb > 1) {
                    throw "Speech engine generating empty files.";
                }
                VHb();
                return JHb;
            }
        }
        var RHb = XQb(Uib);
        var SHb = cHb();
        var vlb = window.external.Generate(Uib, SHb, RHb);
        if (vlb == 1) {
            KHb = 0;
        } else {
            if (vlb == 2) {
                throw "Got a Failure response from the speech engine.";
            } else if (vlb == 3) {
                ++JHb;
                ++KHb;
                if (KHb > 4) {
                    throw "Speech engine generating empty files.";
                }
            }
        }
        IHb = YLb(IHb);
    }
    if (KHb > 1) {
        throw "Speech engine generating empty files.";
    }
    VHb();
    return JHb;
}

function VHb() {
    var Llb = document.getElementById("pageComplete");
    if (Llb != null) {
        Llb.click();
    }
}

function ZHb(amb) {
    if (Cda) {
        var WHb = eHb();
        var XHb = XQb(amb);
        var YHb = fHb(XHb);
        return WHb + "/" + YHb + "/" + XHb;
    } else {
        return eHb() + "/" + XQb(amb);
    }
}

function cHb() {
    var wcb = vTb(kca, " ", "_");
    if (oda) {
        return hHb(lca + "\\" + mca + "\\" + $rw_scholasticHash(nca) + "\\" + nca + "\\" + wcb + (uca));
    } else {
        return hHb(lca + "\\" + mca + "\\" + nca + "\\" + wcb + uca);
    }
}

function eHb() {
    var wcb = vTb(kca, " ", "_");
    if (oda) {
        return hHb(lca + "/" + mca + "/" + $rw_scholasticHash(nca) + "/" + nca + "/" + wcb + uca);
    } else {
        return hHb(lca + "/" + mca + "/" + nca + "/" + wcb + uca);
    }
}

function fHb(YPb) {
    if (YPb == null || YPb.length < 2) {
        return "1/1";
    }
    return YPb.substr(0, 1) + "/" + YPb.substr(1, 1);
}

function hHb(pdb) {
    return pdb.replace(/[\x26\x3a\x2a\x3f\x22<>\x7c]/g, "");
}
var BYb = "";

function $rw_speechCacheGenErrorHandler(dia) {
    BYb = dia;
    var Llb = document.getElementById("pageFailed");
    if (Llb != null) {
        Llb.click();
    }
}

function $rw_getLastError() {
    return BYb;
}

function pHb(yLb) {
    if (yLb == null || yLb.Zfb == null || yLb.afb == null) {
        return null;
    }
    return new THRange(yLb.Zfb.node.ownerDocument.body, dSb(yLb.Zfb.node, yLb.Zfb.offset), dSb(yLb.afb.node, yLb.afb.offset));
}

function vHb(AIb) {
    if (AIb == null || AIb.Qfb == null || AIb.Rfb == null) {
        return null;
    } else {
        return new THRange(AIb.body, AIb.Qfb, AIb.Rfb);
    }
}

function zHb(AIb) {
    if (AIb == null || AIb.Qfb == null || AIb.Rfb == null) {
        return null;
    } else {
        var Zfb = dOb(AIb.body, AIb.Qfb.path, AIb.Qfb.offset, true);
        var afb = dOb(AIb.body, AIb.Rfb.path, AIb.Rfb.offset, false);
        if (Zfb != null && afb != null) {
            return new Kka(AIb.body, Zfb, afb);
        } else {
            return null;
        }
    }
}

function BIb(ddb) {
    if (ddb == null || ddb.Qfb == null || ddb.Rfb == null) {
        return null;
    } else {
        var Zfb = dOb(ddb.body, ddb.Qfb.path, ddb.Qfb.offset, true);
        var afb = dOb(ddb.body, ddb.Rfb.path, ddb.Rfb.offset, false);
        if (Zfb != null && afb != null) {
            return new Kka(Zfb, afb);
        } else {
            return null;
        }
    }
}

function EIb(gib, lKb, QSb) {
    if (gib == null || gib == QSb) {
        return null;
    }
    var lSb = gib;
    if (lSb.previousSibling != null) {
        lSb = lSb.previousSibling;
        if (lKb) {
            if (!ZMb(lSb)) {
                return null;
            }
        }
        if (lSb != null && cMb(lSb)) {
            if (QSb == lSb) {
                return null;
            }
            lSb = EIb(lSb, lKb, QSb);
        } else {
            while (lSb != null && lSb.lastChild != null) {
                if (lSb.nodeType == 1 && lSb.tagName.toLowerCase() == "math") {
                    break;
                }
                lSb = lSb.lastChild;
                if (lKb) {
                    if (!ZMb(lSb)) {
                        lSb = null;
                    }
                }
                if (lSb != null && cMb(lSb)) {
                    if (QSb == lSb) {
                        return null;
                    }
                    lSb = EIb(lSb, lKb, QSb);
                    break;
                }
            }
        }
    } else {
        lSb = lSb.parentNode;
        if (lKb) {
            if (!ZMb(lSb)) {
                lSb = null;
            }
        }
    }
    return lSb;
}

function LIb(gib, lKb, QSb) {
    if (gib == null || gib == QSb) {
        return null;
    }
    var BJb = cMb(gib);
    if (gib.nodeType == 1) {
        if (gib.tagName.toLowerCase() == "math") {
            BJb = true;
        }
    }
    var aNb = gib;
    if (aNb.firstChild != null && !BJb) {
        aNb = aNb.firstChild;
    } else if (aNb.nextSibling != null) {
        aNb = aNb.nextSibling;
    } else {
        while (aNb != null && aNb.nextSibling == null) {
            aNb = aNb.parentNode;
            if (lKb) {
                if (!ZMb(aNb)) {
                    aNb = null;
                }
            }
            if (QSb == aNb) {
                break;
            }
        }
        if (aNb != null && QSb != aNb) {
            aNb = aNb.nextSibling;
        }
    } if (aNb != null) {
        if (lKb) {
            if (!ZMb(aNb)) {
                aNb = null;
            }
        }
    }
    if (aNb != null && cMb(aNb)) {
        if (aNb != QSb) {
            aNb = LIb(aNb, lKb, QSb);
        } else {
            aNb = null;
        }
    }
    return aNb;
};

function SIb(gib, YPb, VIb) {
    if (gib == null || YPb == null) {
        return null;
    }
    var node = gib;
    if (VIb < 0) {
        VIb = 0;
    }
    var QIb = 0;
    var YTb = false;
    while (!YTb) {
        if (node.firstChild != null) {
            node = node.firstChild;
        } else if (node.nextSibling != null) {
            node = node.nextSibling;
        } else {
            while (node != null && node.nextSibling == null) {
                node = node.parentNode;
            }
            if (node != null) {
                node = node.nextSibling;
            } else {
                return null;
            }
        } if (node.nodeType == 1 && node.tagName.toLowerCase() == YPb.toLowerCase()) {
            if (QIb == VIb) {
                YTb = true;
            } else {
                ++QIb;
            }
        }
    }
    return node;
};

function YIb(gib, lKb, QSb) {
    if (gib == null) {
        return null;
    }
    var BJb = cMb(gib);
    var aNb = gib;
    if (aNb.firstChild != null && !BJb) {
        aNb = aNb.firstChild;
    } else if (aNb.nextSibling != null) {
        if (gib == QSb) {
            aNb = null;
        } else {
            aNb = aNb.nextSibling;
        }
    } else {
        if (gib == QSb) {
            aNb = null;
        } else {
            while (aNb != null && aNb.nextSibling == null) {
                aNb = aNb.parentNode;
                if (lKb) {
                    if (ZMb(aNb) == false) {
                        aNb = null;
                    }
                }
                if (QSb == aNb) {
                    break;
                }
            }
            if (aNb != null && QSb != aNb) {
                aNb = aNb.nextSibling;
            }
        }
    } if (aNb != null) {
        if (lKb) {
            if (ZMb(aNb) == false) {
                aNb = null;
            }
        }
    }
    if (aNb != null && cMb(aNb)) {
        if (aNb != QSb) {
            aNb = LIb(aNb, lKb, QSb);
        } else {
            aNb = null;
        }
    }
    return aNb;
};

function fIb(gib, lKb, QSb) {
    if (gib == null || gib == QSb) {
        return null;
    }
    var lSb = gib;
    if (lSb.previousSibling != null) {
        lSb = lSb.previousSibling;
        if (lKb) {
            if (!ZMb(lSb)) {
                lSb = null;
            }
        }
        if (lSb != null && cMb(lSb)) {
            if (QSb == lSb) {
                lSb = null;
            } else {
                lSb = fIb(lSb, lKb, QSb);
            }
        }
    } else {
        lSb = lSb.parentNode;
        if (lKb) {
            if (!ZMb(lSb)) {
                lSb = null;
            }
        }
    }
    return lSb;
};

function mIb(gib, lKb, QSb) {
    if (gib == null || gib == QSb) {
        return null;
    }
    var aNb = gib;
    if (aNb.nextSibling != null) {
        aNb = aNb.nextSibling;
    } else {
        while (aNb != null && aNb.nextSibling == null) {
            aNb = aNb.parentNode;
            if (lKb) {
                if (ZMb(aNb) == false) {
                    aNb = null;
                }
            }
            if (QSb == aNb) {
                break;
            }
        }
        if (aNb != null && aNb != QSb) {
            aNb = aNb.nextSibling;
        }
    } if (aNb != null) {
        if (lKb) {
            if (ZMb(aNb) == false) {
                aNb = null;
            }
        }
    }
    if (aNb != null && cMb(aNb)) {
        if (aNb == QSb) {
            aNb = null;
        } else {
            aNb = mIb(aNb, lKb, QSb);
        }
    }
    return aNb;
};

function sIb(gib, yIb) {
    if (gib == null) {
        return null;
    }
    if (gib.firstChild == null || cMb(gib)) {
        return gib;
    }
    if (gib.nodeType == 1 && gib.tagName.toLowerCase() == "textarea") {
        return gib;
    }
    if (gib.nodeType == 1 && gib.tagName.toLowerCase() == "math") {
        return gib;
    }
    var bfb = gib.firstChild;
    if (bfb.nodeType == 3) {
        return bfb;
    } else if (bfb.nodeType == 1 && yIb && bfb.tagName.toLowerCase() == "img" && bfb.getAttribute("msg") != null && bfb.getAttribute("msg").length > 0) {
        return bfb;
    } else {
        if (yIb) {
            return OKb(bfb, false, gib);
        } else {
            return eKb(bfb, false, gib, true);
        }
    }
}

function wIb(gib, yIb) {
    if (gib == null) {
        return null;
    }
    if (gib.lastChild == null || cMb(gib)) {
        return gib;
    }
    if (gib.nodeType == 1 && gib.tagName.toLowerCase() == "textarea") {
        return gib;
    }
    if (gib.nodeType == 1 && gib.tagName.toLowerCase() == "math") {
        return gib;
    }
    var bfb = gib.lastChild;
    while (bfb != null) {
        if (bfb.nodeType == 3) {
            return bfb;
        } else if (bfb.nodeType == 1 && yIb && bfb.tagName.toLowerCase() == "img" && bfb.getAttribute("msg") != null && bfb.getAttribute("msg").length > 0) {
            return bfb;
        } else if (cMb(bfb) || bfb.lastChild == null) {
            var eib;
            if (yIb) {
                eib = nJb(bfb, false, gib);
            } else {
                eib = DKb(bfb, false, gib, true);
            }
            return eib;
        } else {
            bfb = bfb.lastChild;
        }
    }
    return gib;
}

function GJb(aUb) {
    var BJb = cMb(aUb);
    var aNb = aUb;
    if (aNb.firstChild != null && !BJb) {
        aNb = aNb.firstChild;
    } else if (aNb.nextSibling != null) {
        var cNb = aNb;
        aNb = aNb.nextSibling;
        var bfb = aNb;
        var kib = bfb.ownerDocument.body;
        while (bfb != null && bfb != kib) {
            if (bfb == cNb) {
                throw "DOM Error";
            }
            bfb = bfb.parentNode;
        }
    } else {
        while (aNb != null && aNb.nextSibling == null) {
            aNb = aNb.parentNode;
        }
        if (aNb != null) {
            var cNb = aNb;
            aNb = aNb.nextSibling;
            var bfb = aNb;
            var kib = bfb.ownerDocument.body;
            while (bfb != null && bfb != kib) {
                if (bfb == cNb) {
                    throw "DOM Error";
                }
                bfb = bfb.parentNode;
            }
        }
    } if (aNb != null && cMb(aNb)) {
        aNb = GJb(aNb);
    }
    return aNb;
}

function KJb(Kib, QSb) {
    if (typeof (QSb) == "undefined") {
        QSb = null;
    }
    if (Kib == null || Kib.node == null) {
        return null;
    }
    var node = Kib.node;
    var Skb = Kib.offset;
    if (Kib.node.nodeType == 1 && Kib.node.tagName.toLowerCase() == "math") {
        return Kib;
    }
    if (Kib.forwardBias) {
        if (node.nodeType == 3 && Skb == node.nodeValue.length) {
            node = OKb(node, true, QSb);
            Skb = 0;
            if (node == null) {
                node = Kib.node;
                Skb = Kib.offset;
            }
        }
    } else {
        if (Skb > 0) {
            --Skb;
        } else {
            node = nJb(node, true, QSb);
            if (node == null) {
                return Kib;
            }
            if (node.nodeType == 3) {
                Skb = node.nodeValue.length - 1;
            } else {
                Skb = 0;
                if (node.tagName.toLowerCase() == "math") {
                    return Kib;
                }
            }
        }
    } if (node.nodeType == 3) {
        var OJb = node.nodeValue.charAt(Skb);
        if (OJb == '.' || OJb == '!' || OJb == '?' || OJb == ':') {
            if (Skb > 0) {
                --Skb;
            } else {
                node = nJb(node, true, QSb);
                if (node == null) {
                    return Kib;
                }
                if (node.nodeType == 3) {
                    Skb = node.nodeValue.length - 1;
                } else {
                    Skb = 0;
                    if (node.tagName.toLowerCase() == "math") {
                        return Kib;
                    }
                }
            }
        }
    }
    var dJb = node;
    var eJb = Skb;
    var lSb = node;
    var SJb = Skb;
    var PUb = false;
    var gJb = ' ';
    while (!PUb) {
        if (lSb.nodeType == 3) {
            var Uib = lSb.nodeValue;
            if (Uib.length > 0) {
                if (SJb == -1) {
                    SJb = Uib.length;
                }
                Uib = Uib.replace(/[\x21\x3f\x3a]/g, ".");
                var bmb = Uib.lastIndexOf(".", SJb);
                while (bmb > -1) {
                    if (Lxa(Uib, bmb, lSb)) {
                        if (bmb < Uib.length - 1) {
                            dJb = lSb;
                            eJb = bmb + 1;
                            PUb = true;
                            break;
                        } else {
                            if (!wra(gJb)) {
                                PUb = true;
                                break;
                            }
                        }
                    }
                    if (bmb == 0) {
                        bmb = -1;
                    } else {
                        bmb = Uib.lastIndexOf(".", bmb - 1);
                    }
                }
                if (PUb) {
                    break;
                }
                if (Uib.trimTH().length > 0) {
                    dJb = lSb;
                    eJb = 0;
                }
                gJb = Uib.charAt(0);
            }
        } else {
            if (ZFb(lSb) && lSb.getAttribute("ignore") == null) {
                if (lSb.tagName.toLowerCase() == "math") {
                    PUb = true;
                    break;
                }
                dJb = lSb;
                eJb = 0;
            }
        }
        lSb = EIb(lSb, true, QSb);
        SJb = -1;
        if (lSb == null) {
            PUb = true;
            break;
        }
        if (lSb.nodeType == 3 && hFb(lSb) != null) {
            lSb = hFb(lSb);
            if (lSb == null) {
                PUb = true;
                break;
            }
        }
    }
    if (dJb.nodeType == 3) {
        var Uib = dJb.nodeValue;
        if (eJb < Uib.length) {
            while (eJb < Uib.length) {
                if (Ssa(Uib.charAt(eJb))) {
                    ++eJb;
                } else {
                    break;
                }
            }
        }
    }
    return new THCaret(dJb, eJb, true);
}

function YJb(Kib, QSb) {
    if (typeof (QSb) == "undefined") {
        QSb = null;
    }
    if (Kib == null || Kib.node == null) {
        return null;
    }
    var aNb = Kib.node;
    var cJb = Kib.offset;
    var dJb = aNb;
    var eJb = cJb;
    var PUb = false;
    var gJb = ' ';
    while (!PUb) {
        if (aNb.nodeType == 3) {
            var Uib = aNb.nodeValue;
            if (Uib.length > 0) {
                if (gJb == '.') {
                    var iJb = Uib.charAt(cJb);
                    if (!wra(iJb)) {
                        PUb = true;
                        break;
                    }
                }
                Uib = Uib.replace(/[\x21\x3f\x3a]/g, ".");
                var bmb = Uib.indexOf(".", cJb);
                while (bmb > -1) {
                    if (Lxa(Uib, bmb, aNb)) {
                        if (bmb < Uib.length - 1) {
                            dJb = aNb;
                            eJb = bmb + 1;
                            PUb = true;
                        }
                        break;
                    }
                    cJb = bmb + 1;
                    bmb = Uib.indexOf(".", cJb);
                }
                if (PUb) {
                    break;
                }
                if (Uib.trimTH().length > 0) {
                    dJb = aNb;
                    eJb = Uib.length;
                }
                gJb = Uib.charAt(Uib.length - 1);
                if (gJb == '.') {
                    if (!Lxa(Uib, Uib.length - 1, aNb)) {
                        gJb = ' ';
                    }
                }
            }
            aNb = LIb(aNb, true, QSb);
        } else {
            if (ZFb(aNb) && aNb.getAttribute("ignore") == null) {
                if (aNb.tagName.toLowerCase() == "math") {
                    PUb = true;
                    break;
                }
                dJb = aNb;
                eJb = 0;
                aNb = mIb(aNb, true, QSb);
            } else {
                aNb = LIb(aNb, true, QSb);
            }
        }
        cJb = 0;
        if (aNb == null) {
            PUb = true;
            break;
        }
    }
    if (dJb.nodeType == 3) {
        var Uib = dJb.nodeValue;
        if (eJb > 0 && eJb <= Uib.length) {
            while (eJb > 0) {
                if (Ssa(Uib.charAt(eJb - 1))) {
                    --eJb;
                } else {
                    break;
                }
            }
        }
    }
    return new THCaret(dJb, eJb, false);
}

function nJb(gib, lKb, QSb) {
    var lSb = gib;
    var YTb = false;
    while (lSb != null && lSb != QSb) {
        lSb = EIb(lSb, lKb, QSb);
        if (lSb != null) {
            if (lSb.nodeType == 3 && lSb.parentNode.tagName.toLowerCase() != "textarea") {
                if (lSb.nodeValue.length > 0) {
                    YTb = true;
                }
            }
            if (lSb.nodeType == 1 && lSb.tagName.toLowerCase() == "math") {
                YTb = true;
            } else if (lSb.nodeType == 1 && lSb.tagName.toLowerCase() == "img") {
                var FNb = lSb.getAttribute("msg");
                if (FNb != null && FNb.length > 0) {
                    YTb = true;
                }
            }
            if (YTb) {
                return lSb;
            }
        }
    }
    return null;
}

function wJb(gib, lKb, QSb) {
    var lSb = gib;
    while (lSb != null && lSb != QSb) {
        lSb = nJb(lSb, lKb, QSb);
        if (lSb != null) {
            var WKb = (lSb.nodeType == 3) ? lSb.nodeValue.trimTH() : lSb.getAttribute("msg").trimTH();
            if (dsa(WKb)) {
                return lSb;
            }
        }
    }
    return null;
}

function DKb(gib, lKb, QSb, iKb) {
    var lSb = (iKb) ? nJb(gib, lKb, QSb) : wJb(gib, lKb, QSb);
    while (lSb != null && lSb.nodeType != 3 && lSb != QSb) {
        if (lSb.tagName.toLowerCase() == "math") {
            break;
        }
        lSb = (iKb) ? nJb(lSb, lKb, QSb) : wJb(lSb, lKb, QSb);
    }
    return lSb;
}

function OKb(gib, lKb, QSb) {
    var aNb = gib;
    var YTb = false;
    while (aNb != null && aNb != QSb) {
        aNb = LIb(aNb, lKb, QSb);
        if (aNb != null) {
            if (aNb.nodeType == 3 && aNb.parentNode.tagName.toLowerCase() != "textarea") {
                if (aNb.nodeValue.length > 0) {
                    YTb = true;
                }
            }
            if (aNb.nodeType == 1 && aNb.tagName.toLowerCase() == "math") {
                YTb = true;
            } else if (aNb.nodeType == 1 && aNb.tagName.toLowerCase() == "img") {
                var FNb = aNb.getAttribute("msg");
                if (FNb != null && FNb.length > 0) {
                    YTb = true;
                }
            }
            if (YTb) {
                return aNb;
            }
        }
    }
    return null;
}

function XKb(gib, lKb, QSb) {
    var aNb = gib;
    while (aNb != null && aNb != QSb) {
        aNb = OKb(aNb, lKb, QSb);
        if (aNb != null) {
            var WKb;
            if (aNb.nodeType == 3) {
                WKb = aNb.nodeValue.trimTH();
            } else {
                if (aNb.tagName.toLowerCase() == "img") {
                    WKb = aNb.getAttribute("msg").trimTH();
                } else if (aNb.tagName.toLowerCase() == "math") {
                    WKb = DQb(aNb);
                }
            } if (dsa(WKb)) {
                return aNb;
            }
        }
    }
    return null;
}

function eKb(gib, lKb, QSb, iKb) {
    var aNb = (iKb) ? OKb(gib, lKb, QSb) : XKb(gib, lKb, QSb);
    while (aNb != null && aNb.nodeType != 3 && aNb != QSb) {
        if (aNb.tagName.toLowerCase() == "math") {
            break;
        }
        aNb = (iKb) ? OKb(aNb, lKb, QSb) : XKb(aNb, lKb, QSb);
    }
    return aNb;
}

function tKb(PVb) {
    var gLb = sIb(PVb, true);
    var Zfb = new THCaret(gLb, 0, true);
    var afb = YJb(Zfb, PVb);
    Zfb = KJb(afb, PVb);
    if (Zfb == null || afb == null) {
        return null;
    }
    var Gab = new Kka(Zfb, afb);
    var CLb = false;
    while (!CLb) {
        CLb = nsa(Gab) && xLb(Gab);
        if (!CLb) {
            var DLb = YLb(Gab, PVb);
            if (DLb == null || (afb.node == DLb.afb.node && afb.offset == DLb.afb.offset) || (Zfb.node == DLb.Zfb.node && Zfb.offset == DLb.Zfb.offset)) {
                break;
            } else {
                Gab = DLb;
            }
        }
    }
    return Gab;
}

function ELb(PVb) {
    var gLb = wIb(PVb, true);
    var afb;
    if (gLb.nodeType == 3) {
        afb = new THCaret(gLb, gLb.nodeValue.length, false);
    } else {
        afb = new THCaret(gLb, -1, false);
    }
    var Zfb = KJb(afb, PVb);
    afb = YJb(Zfb, PVb);
    if (Zfb == null || afb == null) {
        return null;
    }
    var Gab = new Kka(Zfb, afb);
    var CLb = false;
    while (!CLb) {
        CLb = nsa(Gab) && xLb(Gab);
        if (!CLb) {
            var DLb = kLb(Gab, PVb);
            if (DLb == null || (afb.node == DLb.afb.node && afb.offset == DLb.afb.offset) || (Zfb.node == DLb.Zfb.node && Zfb.offset == DLb.Zfb.offset)) {
                break;
            } else {
                Gab = DLb;
            }
        }
    }
    return Gab;
}

function LLb(Kib) {
    var afb = YJb(Kib);
    var Zfb = KJb(afb);
    if (Zfb == null || afb == null) {
        return null;
    }
    return new Kka(Zfb, afb);
}

function SLb(Kib) {
    var afb = YJb(Kib);
    var OLb = yAb(Kib.node);
    var PLb = KBb(Kib.node, afb.node, OLb);
    if (PLb != null) {
        afb = PLb;
    }
    var Zfb = KJb(afb);
    OLb = yAb(Zfb.node);
    var RLb = PBb(Zfb.node, afb.node, OLb);
    if (RLb != null) {
        Zfb = RLb;
    }
    if (Zfb == null || afb == null) {
        return null;
    }
    return new Kka(Zfb, afb);
}

function WLb(XLb, DGb) {
    var Zfb = KJb(XLb, null);
    var afb = YJb(DGb, null);
    if (Zfb == null || afb == null) {
        return null;
    }
    return new Kka(Zfb, afb);
}

function YLb(yLb, QSb) {
    if (yLb == null) {
        return null;
    }
    if (typeof (QSb) == "undefined") {
        QSb = null;
    }
    var cNb = yLb.afb.node;
    var oLb = yLb.afb.offset;
    if (oLb == Dka) {
        cNb = mIb(cNb, false, QSb);
        oLb = 0;
    }
    var afb;
    var Zfb;
    while (cNb != null) {
        if (cNb.nodeType == 3 && oLb < cNb.nodeValue.length) {
            afb = YJb(new THCaret(cNb, oLb, false), QSb);
            if (afb == null) {
                return null;
            }
            if (afb.node == cNb && afb.offset == oLb) {
                var gLb = XKb(cNb, false, QSb);
                if (gLb == null) {
                    return null;
                }
                afb = YJb(new THCaret(gLb, 0, false), QSb);
            }
        } else {
            var gLb = XKb(cNb, false, QSb);
            if (gLb == null) {
                return null;
            }
            afb = YJb(new THCaret(gLb, 0, false), QSb);
        }
        Zfb = KJb(afb, null);
        if (Zfb == null) {
            return null;
        }
        if (yLb.Zfb.node != Zfb.node || yLb.Zfb.offset != Zfb.offset) {
            var Gab = new Kka(Zfb, afb);
            if (xLb(Gab) && nsa(Gab)) {
                return Gab;
            }
        }
        cNb = afb.node;
        if (cNb.nodeType == 3) {
            var ofb = cNb.nodeValue.replace(/[\x21\x3f\x3a]/g, ".");
            var sLb = ofb.indexOf(".", afb.offset + 1);
            if (sLb == -1) {
                oLb = ofb.length;
            } else {
                oLb = sLb;
            }
        }
    }
    return null;
}

function kLb(yLb, QSb) {
    if (typeof (QSb) == "undefined") {
        QSb = null;
    }
    var cNb = yLb.Zfb.node;
    var oLb = yLb.Zfb.offset;
    var Zfb;
    var afb;
    while (cNb != null) {
        if (cNb.nodeType == 3) {
            var ofb = cNb.nodeValue.replace(/[\x21\x3f\x3a]/g, ".");
            var sLb;
            if (oLb > 0) {
                sLb = ofb.lastIndexOf(".", oLb);
            } else if (oLb == 0) {
                sLb = -1;
            } else {
                sLb = ofb.lastIndexOf(".");
            }
            while (sLb > -1) {
                oLb = sLb;
                afb = YJb(new THCaret(cNb, oLb, true), QSb);
                if (afb == null) {
                    return null;
                }
                if (afb.node != yLb.afb.node || afb.offset != yLb.afb.offset) {
                    Zfb = KJb(afb, QSb);
                    if (Zfb == null) {
                        return null;
                    }
                    var Gab = new Kka(Zfb, afb);
                    if (xLb(Gab) && nsa(Gab)) {
                        return Gab;
                    }
                }
                if (sLb == 0) {
                    sLb = -1;
                } else {
                    sLb = ofb.lastIndexOf(".", sLb - 1);
                }
            }
        }
        oLb = -1;
        bfb = DKb(cNb, true, QSb, false);
        if (bfb != null) {
            cNb = bfb;
        } else {
            cNb = wJb(cNb, false, QSb);
            if (cNb != null) {
                if (cNb.nodeType == 3) {
                    afb = YJb(new THCaret(cNb, cNb.nodeValue.length, false), QSb);
                } else {
                    afb = YJb(new THCaret(cNb, 0, false), QSb);
                } if (afb == null) {
                    return null;
                }
                if (afb.node != yLb.afb.node || afb.offset != yLb.afb.offset) {
                    Zfb = KJb(afb, QSb);
                    if (Zfb == null) {
                        return null;
                    }
                    return new Kka(Zfb, afb);
                }
            }
        }
    }
    return null;
}

function xLb(yLb) {
    var Ufb = yLb.Zfb.node;
    var kib = Ufb.ownerDocument.body;
    while (Ufb != null && Ufb != kib) {
        if (Ufb.nodeType == 1 && Ufb.getAttribute(caa) != null) {
            return false;
        }
        Ufb = Ufb.parentNode;
    }
    var Vfb = yLb.afb.node;
    if (Vfb != Ufb) {
        while (Vfb != null && Vfb != kib) {
            if (Vfb.nodeType == 1 && Vfb.getAttribute(caa) != null) {
                return false;
            }
            Vfb = Vfb.parentNode;
        }
    }
    return true;
}

function BMb(gib) {
    var DMb;
    var match = gib;
    var eib = EIb(gib, true, null);
    while (eib != null) {
        DMb = false;
        if (eib.nodeType == 1) {
            if (ZFb(eib)) {
                if (eib.getAttribute("ignore") != null) {
                    DMb = true;
                }
            } else {
                DMb = true;
            }
        } else if (eib.nodeType == 3) {
            if (eib.nodeValue.trimTH().length == 0) {
                DMb = true;
            }
        }
        if (!DMb) {
            match = eib;
        }
        eib = EIb(eib, true, null);
    }
    return match;
}

function FMb(gib) {
    var DMb;
    var match = gib;
    var cUb = LIb(gib, true, null);
    while (cUb != null) {
        DMb = false;
        if (cUb.nodeType == 1) {
            if (ZFb(cUb)) {
                if (cUb.getAttribute("ignore") != null) {
                    DMb = true;
                }
            } else {
                DMb = true;
            }
        } else if (cUb.nodeType == 3) {
            if (cUb.nodeValue.trimTH().length == 0) {
                DMb = true;
            }
        }
        if (!DMb) {
            match = cUb;
        }
        cUb = LIb(cUb, true, null);
    }
    return match;
}

function KMb(gib, Kmb) {
    if (gib == null || gib.nodeType != 3 || gib.parentNode == null) {
        return gib;
    }
    var HMb = 0;
    var Sjb = gib.parentNode;
    var JMb = Sjb.parentNode;
    if (JMb != null && Sjb.tagName.toLowerCase() == "span" && JMb.tagName.toLowerCase() == "span" && Sjb.getAttribute(daa) != null && (JMb.getAttribute(daa) != null || JMb.getAttribute(eaa) != null)) {
        HMb = 2;
        if (gib.nextSibling != null || gib.previousSibling != null) {
            HMb = 1;
        }
    } else if (Sjb.tagName.toLowerCase() == "span" && (Sjb.getAttribute(daa) != null || Sjb.getAttribute(eaa) != null)) {
        HMb = 1;
    }
    if (gib.nodeValue.length == 0 || Kmb <= 0 || Kmb >= gib.nodeValue.length) {
        if (HMb == 0) {
            var span = document.createElement("span");
            span.setAttribute(daa, "1");
            var TMb = document.createElement("span");
            TMb.setAttribute(daa, "1");
            Sjb.insertBefore(span, gib);
            span.appendChild(TMb);
            TMb.appendChild(gib);
        } else if (HMb == 1) {
            var span = document.createElement("span");
            span.setAttribute(daa, "1");
            Sjb.insertBefore(span, gib);
            span.appendChild(gib);
        }
        return gib;
    }
    var Uib = gib.nodeValue;
    var elb = Uib.substring(0, Kmb);
    var SMb = Uib.substring(Kmb);
    var TMb = document.createElement("span");
    var UMb = document.createElement("span");
    var VMb = document.createTextNode(elb);
    var WMb = document.createTextNode(SMb);
    TMb.appendChild(VMb);
    UMb.appendChild(WMb);
    TMb.setAttribute(daa, "1");
    UMb.setAttribute(daa, "1");
    if (HMb == 2) {
        JMb.insertBefore(UMb, Sjb);
        JMb.insertBefore(TMb, UMb);
        JMb.removeChild(Sjb);
    } else if (HMb == 1) {
        Sjb.insertBefore(TMb, gib);
        Sjb.insertBefore(UMb, gib);
        Sjb.removeChild(gib);
    } else {
        var span = document.createElement("span");
        span.setAttribute(daa, "1");
        span.appendChild(TMb);
        span.appendChild(UMb);
        Sjb.insertBefore(span, gib);
        Sjb.removeChild(gib);
    }
    return WMb;
}

function ZMb(gib) {
    if (gib.nodeType != 1) {
        return gib.nodeType == 3;
    }
    var hib = gib.tagName.toLowerCase().trimTH();
    if (hib == "font") {
        var Yjb = gib.getAttribute("started");
        if (Yjb != null && Yjb == "1") {
            return false;
        }
    }
    if (hib == "span" && gib.getAttribute("texthelpSkip") != null) {
        return false;
    }
    return (vfa.indexOf("~" + hib + "~") > -1);
}

function cMb(gib) {
    if (gib == null) {
        return true;
    }
    if (gib.nodeType != 1) {
        return gib.nodeType != 3;
    }
    var attr;
    attr = gib.getAttribute("ignore");
    if (attr != null) {
        return true;
    }
    attr = gib.getAttribute(aba);
    if (attr != null && Ica) {
        return true;
    }
    if (Vga) {
        var eMb = lPb(gib);
        if (eMb != null) {
            if (eMb.visibility == "hidden" || eMb.display == "none") {
                return true;
            }
        }
    }
    var hib = gib.tagName.toLowerCase();
    return hib == "link" || hib == "area" || hib == "script" || hib == "noscript" || hib == "annotation" || hib == "style" || hib == "!--" || hib == "title" || hib == "html:script";
}

function kMb(gib) {
    if (gib == null) {
        return true;
    }
    var kib = gib.ownerDocument.body;
    var bfb = gib;
    while (bfb != null) {
        if (cMb(bfb)) {
            return true;
        }
        if (bfb == kib) {
            break;
        }
        bfb = bfb.parentNode;
    }
    return false;
}

function mMb(gib) {
    if (gib != null && gib.nodeType == 3) {
        gib = gib.parentNode;
    }
    if (gib == null) {
        return true;
    }
    var kib = gib.ownerDocument.body;
    var bfb = gib;
    while (bfb != null && bfb.nodeType == 1) {
        if (bfb.getAttribute("ignore") != null) {
            return true;
        }
        if (bfb == kib) {
            break;
        }
        bfb = bfb.parentNode;
    }
    return false;
}

function pMb(aUb) {
    if (aUb.nodeType != 1) {
        return false;
    }
    var hib = aUb.tagName.toLowerCase().trimTH();
    return (tfa.indexOf("~" + hib + "~") > -1);
}

function rMb(gib) {
    var Uib = "";
    if (gib.nodeType == 3) {
        if (cMb(gib.parentNode) == false && gib.parentNode.tagName.toLowerCase() != "textarea") {
            Uib = gib.nodeValue;
        }
    } else if (gib.nodeType == 1) {
        if (gib.getAttribute("ignore") != null) {
            Uib = "";
            PUb = true;
        } else {
            var gNb = gib.tagName.toLowerCase();
            var PUb = false;
            if (gNb == "img") {
                var FNb = gib.getAttribute("msg");
                if (FNb != null && FNb.trimTH().length > 0) {
                    Uib = " " + FNb.trimTH() + " ";
                }
                PUb = true;
            } else if (gNb == "span") {
                var FNb = gib.getAttribute("pron");
                if (FNb != null && FNb.trimTH().length > 0) {
                    Uib = FNb.trimTH();
                    PUb = true;
                }
            } else if (gNb == "acronym" || gNb == "abbr") {
                var FNb = gib.getAttribute("pron");
                if (FNb != null && FNb.trimTH().length > 0) {
                    Uib = FNb.trimTH();
                } else {
                    FNb = gib.getAttribute("title");
                    if (FNb != null && FNb.trimTH().length > 0) {
                        Uib = FNb.trimTH();
                        PUb = true;
                    }
                }
            } else if (gNb == "math") {
                Uib = DQb(gib);
            }
        } if (!PUb) {
            var yMb = gib.firstChild;
            while (yMb != null) {
                Uib += rMb(yMb);
                yMb = yMb.nextSibling;
            }
        }
    }
    return Uib;
}

function ANb(gib) {
    var Uib = "";
    if (gib.nodeType == 3) {
        if (!cMb(gib.parentNode) && gib.parentNode.tagName.toLowerCase() != "textarea") {
            Uib = gib.nodeValue;
        }
    } else if (gib.nodeType == 1) {
        if (gib.getAttribute("ignore") != null) {
            Uib = "";
        } else {
            var gNb = gib.tagName.toLowerCase();
            if (gNb == "img") {
                var FNb = gib.getAttribute("msg");
                if (FNb != null && FNb.trimTH().length > 0) {
                    Uib = " " + FNb.trimTH() + " ";
                }
            } else if (gNb == "span") {
                var FNb = gib.getAttribute("pron");
                if (FNb != null && FNb.trimTH().length > 0) {
                    Uib = FNb.trimTH();
                }
                FNb = gib.getAttribute("chunk");
                if (FNb != null && FNb == "1") {
                    Uib = gib.innerHTML;
                }
            } else if (gNb == "acronym" || gNb == "abbr") {
                var FNb = gib.getAttribute("pron");
                if (FNb != null && FNb.trimTH().length > 0) {
                    Uib = FNb.trimTH();
                } else {
                    FNb = gib.getAttribute("title");
                    if (FNb != null && FNb.trimTH().length > 0) {
                        Uib = FNb.trimTH();
                    }
                }
            } else if (gNb == "math") {
                Uib = DQb(gib);
            }
        }
    }
    return Uib;
}

function rw_getTextOverRange(PVb, INb, JNb) {
    try {
        if (INb == null || JNb == null) {
            return "";
        }
        var Qgb = xOb(PVb, INb.path, INb.offset, JNb.path, JNb.offset);
        return rw_getTextOverCaretRange(Qgb);
    } catch (err) {
        bra("Error rw_getTextOverRange: " + err.message);
        return "";
    }
}

function rw_getTextOverCaretRange(WNb) {
    try {
        if (WNb == null || WNb.Zfb == null || WNb.afb == null) {
            return "";
        }
        var Zfb = WNb.Zfb;
        var afb = WNb.afb;
        var lSb = Zfb.node;
        var aNb = afb.node;
        var RNb = true;
        var cNb = lSb;
        var Uib = "";
        while (cNb != null) {
            var fgb = ANb(cNb);
            if (fgb != null && fgb != "") {
                if (cNb == aNb && afb.offset > -1) {
                    fgb = fgb.substring(0, afb.offset);
                }
                if (cNb == lSb && Zfb.offset > -1) {
                    fgb = fgb.substring(Zfb.offset);
                }
                Uib += fgb;
            }
            if (RNb) {
                cNb = YIb(cNb, false, aNb);
            } else {
                cNb = OKb(cNb, false, aNb);
            }
            RNb = false;
        }
        return Uib.trimTH();
    } catch (err) {
        bra("Error rw_getTextOverCaretRange: " + err.message);
        return "";
    }
}

function VNb(WNb) {
    try {
        if (WNb == null || WNb.Zfb == null || WNb.afb == null) {
            return "";
        }
        var Zfb = WNb.Zfb;
        var afb = WNb.afb;
        var lSb = Zfb.node;
        var aNb = afb.node;
        var bNb = false;
        var cNb = lSb;
        var Uib = "";
        while (cNb != null) {
            bNb = ZFb(cNb);
            if (bNb || cNb.nodeType == 3) {
                var fgb = ANb(cNb);
                if (fgb != null && fgb != "") {
                    if (cNb == aNb && afb.offset > -1) {
                        fgb = fgb.substring(0, afb.offset);
                    }
                    if (cNb == lSb && Zfb.offset > -1) {
                        fgb = fgb.substring(Zfb.offset);
                    }
                    Uib += fgb;
                }
            }
            if (bNb) {
                cNb = mIb(cNb, false, aNb);
            } else {
                cNb = LIb(cNb, false, aNb);
            }
        }
        return Uib.trimTH();
    } catch (err) {
        bra("Error rw_getTextOverCaretRange: " + err.message);
        return "";
    }
}

function iNb(aUb) {
    var mgb = null;
    var gNb = aUb.tagName.toLowerCase();
    var jjb = AOb(aUb);
    if (gNb == "input") {
        var UZb = aUb.getAttribute("type");
        if (UZb != null) {
            UZb = UZb.toLowerCase();
        }
        var CXb = "";
        if (UZb == null || UZb.equalsTH("") || UZb.equalsTH("text")) {
            CXb = aUb.value;
        } else if (UZb.equalsTH("password")) {
            CXb = "Masked password field";
        } else if (UZb.equalsTH("image")) {
            CXb = "";
        } else if (UZb.equalsTH("button") || UZb.equalsTH("submit") || UZb.equalsTH("reset")) {
            CXb = aUb.getAttribute("value");
        }
        if (CXb.equalsTH("") == false) {
            mgb = "form:" + jjb + ";" + CXb;
        }
    } else if (gNb == "select") {
        var CXb = "";
        var ATb = aUb.selectedIndex;
        var BTb = "";
        for (var Ieb = 0; Ieb < aUb.options.length; Ieb++) {
            BTb += aUb.options[Ieb].text + " ";
        }
        if (BTb.equalsTH("") == false) {
            if (ATb > -1) {
                CXb = aUb.options[ATb].text;
                CXb += " selected from the list " + BTb;
            } else {
                CXb = "No selection from the list " + BTb;
            }
            mgb = "form" + jjb + ";" + CXb;
        }
    } else if (gNb == "textarea") {
        var CXb = aUb.value;
        mgb = "form" + jjb + ";" + CXb;
    } else if (gNb == "option") {
        var CXb = aUb.value;
        mgb = "form" + jjb + ";" + CXb;
    }
    return mgb;
}

function sNb(evt) {
    var uNb;
    if (Cfa) {
        uNb = evt.srcElement;
    } else if (Pfa) {
        uNb = evt.target;
    } else {
        uNb = evt.target;
    }
    return uNb;
}

function vNb(evt) {
    var Tkb = null;
    var uNb;
    if (Cfa) {
        uNb = evt.srcElement;
        if (uNb.nodeType == 1 && uNb.tagName.toLowerCase() == "textarea") {} else {
            Tkb = rw_getTargetNodeAsCaretIE(evt, true);
            if (Tkb != null) {
                if (Tkb.node == null || Tkb.node.parentNode == null || Tkb.node.parentNode != uNb) {
                    Tkb = null;
                    return null;
                } else {
                    if (Tkb.node.nodeType == 3) {
                        Tkb.node = lqa(Tkb.node);
                    }
                }
            }
        }
    } else if (Pfa) {
        uNb = evt.target;
        if (uNb != null) {
            if (PDb) {
                if (uNb.firstChild != null && uNb.firstChild.nodeType == 3 && uNb.tagName.toLowerCase() != "textarea") {
                    var VUb = uNb.firstChild.nodeValue;
                    if (VUb.trimTH().length > 0) {
                        uNb = uNb.firstChild;
                    }
                }
            } else if (ODb) {
                if (evt.fromElement != null && uNb.nodeType == 1 && uNb.tagName.toLowerCase() != "textarea") {
                    if (evt.fromElement.nodeType == 3) {
                        uNb = evt.fromElement;
                    }
                } else {
                    if (uNb.nodeType == 1 && uNb.firstChild != null && uNb.firstChild.nodeType == 3 && uNb.tagName.toLowerCase() != "textarea") {
                        var VUb = uNb.firstChild.nodeValue;
                        if (VUb.trimTH().length > 0) {
                            uNb = uNb.firstChild;
                        }
                    }
                }
            }
        }
    } else {
        if (evt.explicitOriginalTarget.nodeValue != null) {
            if (evt.target.tagName.toLowerCase() == "textarea") {
                uNb = evt.target;
            } else {
                uNb = evt.explicitOriginalTarget;
                var LRb = window.getSelection();
                if (LRb.anchorNode == null || LRb.anchorNode != uNb) {
                    return null;
                } else {
                    Tkb = new THCaret(LRb.anchorNode, LRb.anchorOffset, true);
                }
            }
        } else {
            uNb = evt.target;
        }
    } if (Tkb == null && uNb != null) {
        Tkb = new THCaret(uNb, 0, true);
    }
    return Tkb;
}

function AOb(BOb) {
    var jjb = "";
    var COb = 0;
    var DOb = "";
    if (BOb != null && BOb.ownerDocument != null) {
        var TOb = false;
        var SOb = false;
        var kib = BOb.ownerDocument.body;
        while (BOb != null && BOb != kib) {
            if (ZFb(BOb)) {
                jjb = "";
            }
            TOb = (BOb.nodeType == 3) || (BOb.nodeType == 1 && BOb.tagName == "FONT" && BOb.getAttribute("rwstate") != null);
            var aUb = BOb.previousSibling;
            while (aUb != null) {
                SOb = (aUb.nodeType == 3) || (aUb.nodeType == 1 && aUb.tagName == "FONT" && aUb.getAttribute("rwstate") != null);
                if (TOb && SOb) {} else {
                    ++COb;
                }
                aUb = aUb.previousSibling;
                TOb = SOb;
            }
            jjb = jjb + COb + "~";
            COb = 0;
            BOb = BOb.parentNode;
            if (BOb != null && BOb.getAttribute != null && BOb.tagName != null) {
                var IOb = BOb.getAttribute("chunk");
                if (BOb.tagName.toLowerCase() == "span" && IOb == "1") {
                    var JOb = AOb(BOb);
                    DOb = "#^th*" + JOb + "#^th*";
                }
            }
        }
    }
    return DOb + jjb;
};

function LOb(yOb, iOb) {
    var Tib = yOb;
    if (iOb.lastIndexOf("*") > -1) {
        var bmb = iOb.lastIndexOf("*");
        iOb = iOb.substring(bmb + 1);
    }
    var POb = iOb.split("~");
    var Xmb = POb.length;
    var i;
    for (i = Xmb - 2; i > -1; i--) {
        Tib = Tib.firstChild;
        if (Tib == null) {
            return null;
        }
        var ROb;
        if (POb[i].length == 0) {
            ROb = 0;
        } else {
            ROb = parseInt(POb[i], 10);
        }
        var SOb = false;
        var TOb = (Tib.nodeType == 3) || (Tib.nodeType == 1 && Tib.tagName == "FONT" && Tib.getAttribute("rwstate") != null);
        while (ROb > 0) {
            Tib = Tib.nextSibling;
            if (Tib == null) {
                return null;
            }
            SOb = (Tib.nodeType == 3) || (Tib.nodeType == 1 && Tib.tagName == "FONT" && Tib.getAttribute("rwstate") != null);
            if (SOb && TOb) {} else {
                --ROb;
                TOb = SOb;
            }
        }
    }
    return Tib;
}

function dOb(yOb, iOb, Kmb, uOb) {
    try {
        if (yOb == null) {
            return null;
        }
        var Tib = LOb(yOb, iOb);
        if (ZFb(Tib)) {
            if (cFb(Tib)) {
                if (uOb) {
                    var Ufb = sIb(Tib, false);
                    if (Ufb != null) {
                        return new THCaret(Ufb, 0, uOb);
                    } else {
                        return new THCaret(Tib, 0, uOb);
                    }
                } else {
                    var Vfb = wIb(Tib, false);
                    if (Vfb != null) {
                        if (Vfb.nodeType == 3) {
                            return new THCaret(Vfb, Vfb.length, uOb);
                        } else {
                            return new THCaret(Vfb, 0, uOb);
                        }
                    } else {
                        return new THCaret(Tib, 0, uOb);
                    }
                }
            } else {
                return new THCaret(Tib, 0, uOb);
            }
        }
        var Skb = 0;
        if (uOb == false) {
            ++Skb;
        }
        if (Kmb > -1) {
            if (Tib == null) {
                return null;
            }
            var YTb = false;
            var Vfb = Tib.parentNode;
            var aOb = Tib;
            var ofb;
            while (YTb == false) {
                if (Tib.nodeType == 3) {
                    ofb = Tib.nodeValue;
                    if (Kmb < (Skb + ofb.length)) {
                        YTb = true;
                        break;
                    }
                    aOb = Tib;
                    Skb += Tib.nodeValue.length;
                    Tib = LIb(Tib, false, Vfb);
                } else if (Tib.nodeType == 1) {
                    if (ZFb(Tib)) {
                        var cOb = Kmb - Skb;
                        if (cOb > 0) {
                            Skb += 1;
                        } else {
                            YTb = true;
                            break;
                        }
                        Tib = mIb(Tib, false, Vfb);
                    } else {
                        Tib = LIb(Tib, false, Vfb);
                    }
                }
                if (Tib == null || Tib == Vfb) {
                    if (aOb != null) {
                        Tib = aOb;
                        if (Tib.nodeType == 3) {
                            Skb = Kmb - Tib.nodeValue.length;
                        } else {
                            Skb = 0;
                        } if (!uOb) {
                            ++Skb;
                        }
                        break;
                    } else {
                        return null;
                    }
                }
            }
            if (uOb) {
                return new THCaret(Tib, Kmb - Skb, uOb);
            } else {
                return new THCaret(Tib, Kmb - (Skb - 1), uOb);
            }
        } else {
            return new THCaret(Tib, Kmb, uOb);
        }
    } catch (err) {
        bra("getCaretFromDomPosition error: " + err);
        return null;
    }
}

function xOb(yOb, CPb, DPb, EPb, FPb) {
    var Zfb = dOb(yOb, CPb, DPb, true);
    var afb;
    if (CPb == EPb && DPb >= FPb) {
        afb = Zfb;
    } else {
        afb = dOb(yOb, EPb, FPb, false);
    }
    return new Kka(Zfb, afb);
}

function GPb(gib) {
    if (gib == null) {
        return "";
    }
    if (gib.className) {
        return gib.className;
    } else {
        return gib.getAttribute("class");
    }
}

function IPb(YPb, TPb, EUb, bPb, NPb) {
    if (Lfa) {
        return RPb("<" + YPb + " name='" + NPb + "'>", TPb, EUb, bPb);
    } else {
        var eRb = RPb(YPb, TPb, EUb, bPb);
        eRb.setAttribute("name", NPb);
        eRb.name = NPb;
        return eRb;
    }
}

function RPb(YPb, TPb, EUb, bPb) {
    var WPb = document.createElement(YPb);
    if (EUb != null) {
        WPb.id = EUb;
    }
    if (bPb != null) {
        WPb.className = bPb;
    }
    if (TPb != null) {
        var Xmb = TPb.length;
        if (Lfa) {
            for (var i = 0; i < Xmb; i += 2) {
                if (TPb[i] == "style") {
                    dPb(WPb, TPb[i + 1]);
                } else {
                    WPb.setAttribute(TPb[i], TPb[i + 1]);
                }
            }
        } else {
            for (var i = 0; i < Xmb; i += 2) {
                WPb.setAttribute(TPb[i], TPb[i + 1]);
            }
        }
    }
    return WPb;
}

function XPb(YPb, ZPb, EUb, bPb) {
    var WPb = document.createElement(YPb);
    if (EUb != null) {
        WPb.id = EUb;
    }
    if (bPb != null) {
        WPb.className = bPb;
    }
    if (ZPb != null) {
        if (Lfa) {
            for (var i in ZPb) {
                if (i == "style") {
                    dPb(WPb, ZPb[i]);
                } else {
                    WPb.setAttribute(i, ZPb[i]);
                }
            }
        } else {
            for (var i in ZPb) {
                WPb.setAttribute(i, ZPb[i]);
            }
        }
    }
    return WPb;
}

function dPb(p_theObj, fPb) {
    var cPb = fPb.indexOf(":");
    var gPb = fPb.indexOf(";", cPb);
    var hPb;
    var CXb;
    var mgb = fPb;
    while (cPb > -1) {
        hPb = mgb.substring(0, cPb);
        if (gPb > -1) {
            CXb = mgb.substring(cPb + 1, gPb);
            mgb = mgb.substr(gPb + 1);
            cPb = mgb.indexOf(":");
            gPb = mgb.indexOf(";", cPb);
        } else {
            CXb = mgb.substr(cPb + 1);
            cPb = -1;
        } if (Cfa) {
            if (hPb == " background-position") {
                hPb = " backgroundPosition";
            }
        }
        eval("p_theObj.style." + hPb + "=\"" + CXb + "\";");
    }
}

function lPb(pab) {
    if (Lfa) {
        return pab.currentStyle;
    } else {
        return window.getComputedStyle(pab, null);
    }
}

function rPb(yPb, zPb) {
    var element = document.createElement(zPb);
    element.innerHTML = yPb;
    document.body.appendChild(element);
}

function xPb(yPb, zPb, BQb) {
    var element = document.createElement(zPb);
    var Xmb = BQb.length;
    for (i = 0; i < Xmb; i += 2) {
        element.setAttribute(BQb[i], BQb[i + 1]);
    }
    element.innerHTML = yPb;
    document.body.appendChild(element);
}

function DQb(gib) {
    if (gib.previousSibling != null || gib.nextSibling != null) {
        var CQb = document.createElement("span");
        gib.parentNode.replaceChild(CQb, gib);
        CQb.appendChild(gib);
    }
    if (Cfa) {
        var HTb = gib.outerHTML;
        if (HTb == null) {
            return "";
        } else {
            if (HTb.indexOf("<?import namespace") > -1) {
                var n = HTb.indexOf("/>");
                if (n > -1) {
                    HTb = HTb.substring(n + 2);
                    HTb = HTb.replace(/m:/gi, "");
                }
            }
            return HTb;
        }
    } else {
        var HTb = gib.parentNode.innerHTML;
        if (HTb != null && HTb.length > 0) {
            return HTb;
        } else {
            return "";
        }
    }
}

function HQb(o, p, q) {
    function r(a) {
        var b;
        if (typeof DOMParser != "undefined") {
            b = (new DOMParser()).parseFromString(a, "application/xml");
        } else {
            var c = ["MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"];
            for (var i = 0; i < c.length && !b; i++) {
                try {
                    b = new ActiveXObject(c[i]);
                    b.loadXML(a);
                } catch (e) {}
            }
        }
        return b;
    }

    function s(a, b, c) {
        a[b] = function () {
            return eval(c);
        };
    }

    function t(b, c, d) {
        if (typeof d == "undefined") {
            d = 1;
        }
        if (d > 1) {
            if (c.nodeType == 1) {
                var e = document.createElement(c.nodeName);
                var f = {};
                for (var a = 0, g = c.attributes.length; a < g; a++) {
                    var h = c.attributes[a].name,
                        k = c.attributes[a].value,
                        l = (h.substr(0, 2) == "on");
                    if (l) {
                        f[h] = k;
                    } else {
                        switch (h) {
                        case "class":
                            e.className = k;
                            break;
                        case "for":
                            e.htmlFor = k;
                            break;
                        default:
                            e.setAttribute(h, k);
                        }
                    }
                }
                b = b.appendChild(e);
                for (l in f) {
                    s(b, l, f[l]);
                }
            } else if (c.nodeType == 3) {
                var m = (c.nodeValue ? c.nodeValue : "");
                var n = m.replace(/^\s*|\s*$/g, "");
                if (n.length < 7 || (n.indexOf("<!--") != 0 && n.indexOf("-->") != (n.length - 3))) {
                    b.appendChild(document.createTextNode(m));
                }
            }
        }
        for (var i = 0, j = c.childNodes.length; i < j; i++) {
            t(b, c.childNodes[i], d + 1);
        }
    }
    p = "<root>" + p + "</root>";
    var u = r(p);
    if (o && u) {
        if (q != false) {
            while (o.lastChild) {
                o.removeChild(o.lastChild);
            }
        }
        t(o, u.documentElement);
    }
}

function $rw_logMe(pdb) {
    bra(pdb);
}

function $rw_alertMe(pdb) {
    alert(pdb);
}

function RQb(WQb) {
    if (!hda && WQb.frames && WQb.length > 0) {
        var i;
        var Xmb = WQb.length;
        for (i = 0; i < Xmb; i++) {
            try {
                var nab = WQb[i].getSelection();
                if (nab != null && !nab.isCollapsed) {
                    return WQb[i];
                } else {
                    if (WQb[i].length > 0) {
                        var QQb = RQb(WQb[i]);
                        if (QQb) {
                            return QQb;
                        }
                    }
                }
            } catch (e) {}
        }
    }
    return null;
}

function TQb(WQb) {
    var NRb = {};
    var fgb = RQb(WQb);
    if (fgb != null) {
        NRb.NUb = fgb;
        NRb.MRb = fgb.getSelection();
    }
    return NRb;
}

function VQb(WQb) {
    var NRb = {};
    var range;
    if (!hda && WQb.frames && WQb.length > 0) {
        var i;
        var Xmb = WQb.length;
        for (i = 0; i < Xmb; i++) {
            try {
                var Ndb = WQb[i];
                range = Ndb.document.selection.createRange();
                if (range != null && range.text != null && range.text.length > 0) {
                    NRb.NUb = Ndb;
                    NRb.GRb = range;
                    break;
                } else {
                    if (Ndb.length > 0) {
                        var QQb = VQb(Ndb);
                        if (QQb.GRb) {
                            NRb = QQb;
                            break;
                        }
                    }
                }
            } catch (e) {}
        }
    }
    return NRb;
}

function XQb(pdb) {
    if (oca == 200) {
        pdb = pdb.replace(/\s+/g, " ");
    } else {
        pdb = pdb.replace(/(\x3cbookmark\x20mark\x3d\x22(\d)+\x22\x2f\x3e)/g, "");
        pdb = pdb.replace(/[\s\xA0]+/g, " ");
    }
    return lGb(pdb);
}

function $rw_scholasticHashShort(p_asset) {
    var Uib = p_asset.replace(/^0+|[^0-9]/g, "");
    return "0001".substring(0, 4 - Uib.length) + Uib.substring(0, 4);
}

function $rw_scholasticHash(p_asset) {
    var Uib = p_asset.replace(/^0+|[^0-9]/g, "");
    if (Uib.length < 4) {
        Uib = "0001".substring(0, 4 - Uib.length) + Uib;
    } else {
        Uib = Uib.substring(0, 4);
    }
    return Uib;
}

function rw_getDisplayWidth(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    return (IUb.innerWidth) ? (IUb.innerWidth) : IUb.document.documentElement.offsetWidth;
}

function rw_getDisplayWidthAdjusted(IUb) {
    return rw_getDisplayWidth(IUb) - rw_getScrollBarWidth(IUb);
}

function fQb(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    var nW = (IUb.innerWidth) ? IUb.innerWidth : IUb.document.documentElement.offsetWidth;
    return nW;
}

function hQb(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    var nW = ((IUb.innerWidth) ? IUb.innerWidth : IUb.document.documentElement.offsetWidth) - rw_getScrollBarWidth(IUb);
    return nW;
}

function rw_getDisplayHeight(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    if (Afa) {
        return rw_getDocumentDisplayHeight(IUb);
    } else {
        var nH = (IUb.innerHeight) ? IUb.innerHeight : IUb.document.body.offsetHeight;
        return nH;
    }
}

function rw_getDisplayHeightAdjusted(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    if (Afa) {
        return rw_getDocumentDisplayHeightAdjusted(IUb);
    } else {
        var nH = ((IUb.innerHeight) ? IUb.innerHeight : IUb.document.body.offsetHeight) - rw_getScrollBarHeight(IUb);
        return nH;
    }
}

function rw_getDocumentDisplayHeight(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    var nH = (IUb.innerHeight) ? IUb.innerHeight : IUb.document.documentElement.offsetHeight;
    return nH;
}

function rw_getDocumentDisplayHeightAdjusted(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    var nH = ((IUb.innerHeight) ? IUb.innerHeight : IUb.document.documentElement.offsetHeight) - rw_getScrollBarHeight(IUb);
    return nH;
}

function rQb(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    if (IUb.document.compatMode == "CSS1Compat" && IUb.document.body.parentNode && IUb.document.body.parentNode.scrollLeft) {
        return IUb.document.body.parentNode.scrollLeft;
    }
    var n = (IUb.pageXOffset) ? IUb.pageXOffset : (IUb.scrollX) ? IUb.scrollX : (IUb.document.body.scrollLeft) ? IUb.document.body.scrollLeft : (IUb.document.documentElement.scrollLeft) ? IUb.document.documentElement.scrollLeft : 0;
    return n;
}

function rw_getScreenOffsetLeft(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    if (IUb.pageXOffset && IUb.pageXOffset > 0) {
        return IUb.pageXOffset;
    } else if (IUb.document.body.scrollLeft && IUb.document.body.scrollLeft > 0) {
        return IUb.document.body.scrollLeft;
    } else if (IUb.document.documentElement.scrollLeft && IUb.document.documentElement.scrollLeft > 0) {
        return IUb.document.documentElement.scrollLeft;
    }
    return 0;
}

function rw_getScreenOffsetTop(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    if (IUb.pageYOffset && IUb.pageYOffset > 0) {
        return IUb.pageYOffset;
    } else if (IUb.document.body.scrollTop && IUb.document.body.scrollTop > 0) {
        return IUb.document.body.scrollTop;
    } else if (IUb.document.documentElement.scrollTop && IUb.document.documentElement.scrollTop > 0) {
        return IUb.document.documentElement.scrollTop;
    }
    return 0;
}

function xQb(uab) {
    if (uab.scrollLeft && uab.scrollLeft > 0) {
        return uab.scrollLeft;
    }
    if (uab.tagName.toLowerCase() == "body" && uab.ownerDocument && uab.ownerDocument.documentElement && uab.ownerDocument.documentElement.scrollLeft) {
        return uab.ownerDocument.documentElement.scrollLeft;
    }
    return 0;
}

function zQb(uab) {
    if (uab.scrollTop && uab.scrollTop > 0) {
        return uab.scrollTop;
    }
    if (uab.tagName.toLowerCase() == "body" && uab.ownerDocument && uab.ownerDocument.documentElement && uab.ownerDocument.documentElement.scrollTop) {
        return uab.ownerDocument.documentElement.scrollTop;
    }
    return 0;
}

function rw_getScrollBarWidth(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    if (Cfa) {
        if (Afa) {
            return 20;
        } else {
            if (IUb.document.compatMode.equalsTH("CSS1Compat")) {
                return (IUb.document.documentElement.offsetWidth - IUb.document.documentElement.clientWidth);
            } else {
                return (IUb.document.body.offsetWidth - IUb.document.body.clientWidth);
            }
        }
    } else {
        return IUb.innerWidth - IUb.document.documentElement.clientWidth;
    }
}

function rw_getScrollBarHeight(IUb) {
    if (typeof (IUb) == "undefined") {
        IUb = window;
    }
    if (Cfa) {
        if (Afa) {
            return 20;
        } else {
            if (IUb.document.compatMode.equalsTH("CSS1Compat")) {
                return (IUb.document.documentElement.offsetHeight - IUb.document.documentElement.clientHeight);
            } else {
                return (IUb.document.body.offsetHeight - IUb.document.body.clientHeight);
            }
        }
    } else {
        if (IUb.scrollMaxX > 0) {
            return 18;
        } else {
            return 4;
        }
    }
}

function HRb() {
    var NUb = null;
    var GRb = null;
    if (Lfa) {
        var range = document.selection.createRange();
        if (range == null || range.text == null || range.text.length == 0) {
            var NRb = VQb(window);
            if (NRb.GRb) {
                NUb = NRb.NUb;
                GRb = NRb.GRb;
            }
        } else {
            NUb = window;
            GRb = range;
        } if (GRb != null) {
            var Ydb = GRb.duplicate();
            Ydb.collapse();
            var pjb = Ydb.parentElement();
            if (mMb(pjb)) {
                GRb = null;
            }
        }
        if (GRb != null && GRb.parentElement() != null && GRb.parentElement().tagName.toLowerCase() == "input") {
            GRb = new String(GRb.text);
        }
    } else {
        if (fia != null) {
            gia.getSelection().addRange(fia);
        }
        var LRb = window.getSelection();
        var MRb = null;
        if (!LRb.isCollapsed) {
            NUb = window;
            MRb = LRb;
        } else {
            if (Yxa && Yxa.selectionStart != Yxa.selectionEnd) {
                return {
                    frame: window,
                    range: new String(Yxa.value.substring(Yxa.selectionStart, Yxa.selectionEnd))
                };
            }
            var NRb = TQb(window);
            if (NRb.MRb) {
                NUb = NRb.NUb;
                MRb = NRb.MRb;
            }
        } if (MRb == null) {
            return null;
        }
        if (MRb.anchorNode) {
            if (mMb(MRb.anchorNode)) {
                return null;
            }
        }
        if (MRb.focusNode && MRb.focusNode.id) {
            if (MRb.focusNode.id == "flashcontent") {
                return null;
            }
        }
        if (MRb.anchorNode != null && MRb.anchorNode == MRb.focusNode && MRb.anchorOffset == MRb.focusOffset) {
            return null;
        }
        var ORb = null;
        if (MRb.getRangeAt) {
            ORb = MRb.getRangeAt(0);
        } else {
            var range = Qra();
            if (range != null) {
                if (MRb.anchorNode == MRb.focusNode && MRb.anchorOffset == MRb.focusOffset) {
                    range = qqa(MRb);
                } else {
                    range.setStart(MRb.anchorNode, MRb.anchorOffset);
                    range.setEnd(MRb.focusNode, MRb.focusOffset);
                    if (range.toString().length == 0) {
                        range.setStart(MRb.focusNode, MRb.focusOffset);
                        range.setEnd(MRb.anchorNode, MRb.anchorOffset);
                    }
                }
                ORb = range;
            }
        } if (ORb != null) {
            var PRb = ORb.startContainer;
            var QRb = ORb.startOffset;
            var RRb = ORb.endContainer;
            var SRb = ORb.endOffset;
            if (PRb.nodeType != 3) {
                if (PRb.nodeType != 1) {
                    return null;
                } else {
                    if (QRb > 0) {
                        if (PRb.hasChildNodes() && PRb.childNodes.length > QRb) {
                            PRb = PRb.childNodes[QRb];
                            if (PRb.nodeType == 3) {
                                QRb = 0;
                            } else {
                                QRb = 0;
                                if (PRb.toString() == "[object HTMLEmbedElement]") {
                                    return null;
                                }
                            }
                        }
                    }
                }
            }
            if (RRb.nodeType != 3) {
                if (RRb.nodeType != 1) {
                    return null;
                } else {
                    if (RRb.hasChildNodes()) {
                        if (RRb.childNodes.length > SRb) {
                            RRb = RRb.childNodes[SRb];
                        } else {
                            RRb = RRb.childNodes[SRb - 1];
                            if (RRb.nodeType != 3) {
                                var bfb = wIb(RRb, true);
                                if (bfb != null) {
                                    RRb = bfb;
                                }
                            }
                        }
                    }
                    if (RRb.nodeType != 3) {
                        var URb = EIb(PRb, true, null);
                        var bfb = nJb(RRb, true, URb);
                        if (bfb != null) {
                            RRb = bfb;
                        }
                    }
                    if (RRb.nodeType == 3) {
                        SRb = RRb.nodeValue.length;
                    } else {
                        SRb = 0;
                    }
                }
            }
            GRb = new Pla(PRb, QRb, RRb, SRb);
        } else {
            return null;
        }
    } if (NUb != null && GRb != null) {
        return {
            frame: NUb,
            range: GRb
        };
    } else {
        return null;
    }
}

function XRb() {
    var ZRb = HRb();
    if (ZRb != null && ZRb.range != null && !(ZRb.range instanceof String)) {
        if (Lfa) {
            ZRb.range = DVb(ZRb.frame.document.body, ZRb.range);
        } else if (ZRb.range instanceof Pla) {
            ZRb.range = vHb(ZRb.range);
        }
    }
    return ZRb;
}

function aRb() {
    var eRb = HRb();
    if (eRb != null) {
        var ZRb = eRb.range;
        if (ZRb instanceof String) {
            return ZRb;
        } else if (ZRb instanceof Pla) {
            return ZRb.toString();
        } else {
            return eRb.range.text;
        }
    }
    return "";
}

function bRb(gib) {
    if (typeof (eba_no_scroll) == "boolean" && eba_no_scroll) {
        return;
    }
    try {
        var NUb = rw_getWindow(gib);
        if (NUb == null || gib == null || gib.parentNode == null) {
            return;
        }
        var x = 0;
        var y = 0;
        var eRb = gib;
        if (eRb.nodeType == 3) {
            eRb = eRb.parentNode;
        }
        var fRb = null;
        var gRb = eRb;
        var fab = eRb.ownerDocument.body;
        var iRb = false;
        var gab = null;
        while (gRb != null && gRb != fab) {
            if (gRb.tagName.toLowerCase() == "div" || gRb.tagName.toLowerCase() == "form") {
                if (uRb(gRb)) {
                    iRb = true;
                    fRb = HSb(eRb, gRb, fRb);
                    gab = gRb;
                    eRb = gRb;
                }
            }
            gRb = gRb.parentNode;
        }
        if (gab != null) {
            eRb = gab;
        }
        while (eRb != null) {
            x += eRb.offsetLeft;
            y += eRb.offsetTop;
            eRb = eRb.offsetParent;
        }
        if (fRb != null) {
            y += fRb.y;
            x += fRb.x;
        }
        var kRb;
        var lRb;
        var mRb;
        var nRb;
        var oRb = 30;
        if (gib.nodeType == 3) {
            oRb = 10 + 5 * gib.nodeValue.length;
            if (oRb > 60) {
                oRb = 60;
            }
        }
        kRb = rw_getScreenOffsetLeft(NUb);
        lRb = rw_getScreenOffsetTop(NUb);
        if (typeof (NUb.innerWidth) == 'number') {
            mRb = NUb.innerWidth;
            nRb = NUb.innerHeight;
        } else if (NUb.document.documentElement.clientHeight > 0 && NUb.document.documentElement.clientWidth > 0) {
            mRb = NUb.document.documentElement.clientWidth;
            nRb = NUb.document.documentElement.clientHeight;
        } else {
            mRb = NUb.document.body.clientWidth;
            nRb = NUb.document.body.clientHeight;
        }
        mRb = mRb - oRb;
        nRb = nRb - 20;
        var pRb;
        var qRb;
        if (iRb) {}
        pRb = (x < kRb || x > (kRb + mRb));
        qRb = (y < lRb || y > (lRb + nRb));
        if (pRb || qRb && (x != 0 || y != 0)) {
            if (x > (kRb + mRb)) {
                x = (x + kRb) / 2;
            }
            if (y > (lRb + nRb)) {
                y = (y + lRb) / 2;
            }
            var rRb = $g_bMouseSpeech;
            if ($g_bMouseSpeech) {
                $g_bMouseSpeech = false;
            }
            NUb.scrollTo((pRb ? x : kRb), (qRb ? y : lRb));
            if (Sfa) {
                FCb();
                HCb();
            }
            if (rRb) {
                var sRb = function () {
                    $g_bMouseSpeech = true;
                };
                var tRb = setTimeout(sRb, 500);
            }
        }
    } catch (ignore) {
        thLogE(ignore);
    }
    g_bDidScroll = false;
}

function uRb(uab) {
    var jab = uab.clientHeight;
    var kab = uab.clientWidth;
    var lab = lPb(uab);
    var mab = false;
    if (lab != null && lab.overflow != "visible" && lab.display != "inline") {
        if (uab.scrollHeight > jab && lab.overflowY != "visible") {
            mab = true;
        }
        if (uab.scrollWidth > kab && lab.overflowX != "visible") {
            mab = true;
        }
    }
    return mab;
}

function HSb(gib, uab, KSb) {
    var Eab = 0;
    var Fab = 0;
    var jab = uab.clientHeight;
    var kab = uab.clientWidth;
    var ESb = 0;
    var FSb = 0;
    var nab = gib;
    while (nab != uab && nab != null) {
        ESb += nab.offsetTop;
        FSb += nab.offsetLeft;
        nab = OSb(nab, uab);
    }
    if (nab == null) {
        FSb -= uab.offsetLeft;
        ESb -= uab.offsetTop;
    }
    if (KSb != null) {
        ESb += KSb.y;
        FSb += KSb.x;
    }
    if (uab.scrollTop > ESb || (uab.scrollTop + jab) < (ESb + gib.offsetHeight)) {
        if (jab > (gib.offsetHeight * 6)) {
            uab.scrollTop = ESb - gib.offsetHeight;
        } else {
            uab.scrollTop = ESb;
        }
    }
    if (uab.scrollLeft > FSb || (uab.scrollLeft + kab) < (FSb + gib.offsetWidth)) {
        uab.scrollLeft = FSb;
    }
    Eab = FSb - uab.scrollLeft;
    Fab = ESb - uab.scrollTop;
    return {
        x: Eab,
        y: Fab
    };
}

function OSb(rib, QSb) {
    var MSb = rib;
    var NSb = MSb.offsetParent;
    if (NSb == null) {
        return null;
    }
    if (QSb == null) {
        return NSb;
    }
    while (MSb != null && MSb != NSb) {
        if (MSb == QSb) {
            return null;
        }
        MSb = MSb.parentNode;
    }
    return NSb;
}

function SSb() {
    var wcb = "" + "rw_getDisplayWidth=" + rw_getDisplayWidth() + "  rw_getDisplayWidthAdjusted=" + rw_getDisplayWidthAdjusted() + "  rw_getDisplayHeight=" + rw_getDisplayHeight() + "  rw_getDisplayHeightAdjusted=" + rw_getDisplayHeightAdjusted() + "  rw_getDocumentDisplayHeight=" + rw_getDocumentDisplayHeight() + "  rw_getDocumentDisplayHeightAdjusted=" + rw_getDocumentDisplayHeightAdjusted() + "  rw_getScreenOffsetLeft=" + rw_getScreenOffsetLeft() + "  rw_getScreenOffsetTop=" + rw_getScreenOffsetTop() + "  rw_getScrollBarWidth=" + rw_getScrollBarWidth() + "  rw_getScrollBarHeight=" + rw_getScrollBarHeight();
    ssa(wcb);
}

function WSb() {
    var TSb = HRb();
    var USb = XRb();
    var VSb = aRb();
}

function YSb(EUb) {
    bRb(document.getElementById(EUb));
}

function dSb(gib, ulb) {
    try {
        if (gib == null) {
            return null;
        }
        if (gib.nodeType == 1 || gib.nodeType == 3) {
            var pjb = hFb(gib);
            if (pjb != null) {
                return new THDomRefPt(AOb(pjb), ulb);
            }
            var Skb;
            var Sjb;
            if (gib.nodeType == 1) {
                Skb = 0;
                Sjb = gib;
            } else {
                if (gib.nodeValue.trimTH().length == 0) {
                    ulb = 0;
                }
                Skb = nSb(gib);
                Sjb = gib.parentNode;
            }
            var attr = Sjb.getAttribute("rwstate");
            var hSb = Sjb.getAttribute(daa);
            while (Sjb.tagName.toLowerCase() == "font" || (attr != null && attr.length > 0) || hSb != null) {
                Skb += nSb(Sjb);
                Sjb = Sjb.parentNode;
                attr = Sjb.getAttribute("rwstate");
                hSb = Sjb.getAttribute(daa);
            }
            if (ulb == -1) {
                Skb = -1;
            }
            return new THDomRefPt(AOb(Sjb), Skb + ulb);
        } else {
            return null;
        }
    } catch (ignore) {
        return null;
    }
}

function nSb(gib) {
    if (gib == null) {
        return 0;
    }
    var Skb = 0;
    var lSb = gib.previousSibling;
    if (lSb != null) {
        Skb = pSb(lSb);
    }
    return Skb;
}

function pSb(gib) {
    var Skb = 0;
    var lSb = gib;
    var ofb;
    while (lSb != null) {
        if (lSb.nodeType == 3) {
            ofb = lSb.nodeValue;
            Skb += ofb.length;
        } else if (lSb.nodeType == 1) {
            if (!cMb(lSb)) {
                if (ZFb(lSb)) {
                    Skb += 1;
                } else if (lSb.tagName.toLowerCase() != "textarea") {
                    Skb += pSb(lSb.lastChild);
                } else {
                    Skb += 1;
                }
            }
        }
        lSb = lSb.previousSibling;
    }
    return Skb;
}

function uSb(gib) {
    if (Ada || zca) {
        var kib = Xra(gib);
        var bfb = gib;
        if (bfb.nodeType == 3) {
            bfb = bfb.parentNode;
        }
        while (bfb != null && bfb != kib) {
            if (bfb.getAttribute(caa) != null) {
                return true;
            }
            bfb = bfb.parentNode;
        }
    }
    return false;
}

function wSb(gib) {
    var Uib = "";
    try {
        if (gib.nodeType == 1) {
            if (gib.getAttribute("ignore") == null) {
                var tagName = gib.tagName.toLowerCase();
                if (tagName == "input") {
                    var UZb = gib.getAttribute("type");
                    if (UZb != null) {
                        UZb = UZb.toLowerCase();
                        if (UZb.length == 0 || UZb == "text") {
                            Uib = gib.value;
                        } else if (UZb == "password") {
                            Uib = "";
                        } else if (UZb == "image") {
                            var zZb = gib.getAttribute("alt");
                            if (zZb != null && zZb.length > 0) {
                                Uib = zZb;
                            } else {
                                Uib = "";
                            }
                        } else if (UZb == "button" || UZb == "submit" || UZb == "reset") {
                            if (gib.className == "rwcalbutton" || gib.className == "rwcalEqbutton") {
                                Uib = gib.getAttribute("name");
                            } else {
                                Uib = gib.getAttribute("value");
                            }
                        }
                    } else {
                        Uib = gib.value;
                    }
                } else if (tagName == "select") {
                    var ATb = gib.selectedIndex;
                    var BTb = "";
                    var Xmb = gib.options.length;
                    for (var Ieb = 0; Ieb < Xmb; Ieb++) {
                        BTb += gib.options[Ieb].text + " ";
                    }
                    if (Xmb > 0) {
                        if (ATb > -1) {
                            Uib = gib.options[ATb].text + " selected from the list " + BTb;
                        } else {
                            Uib = "No selection from list " + BTb;
                        }
                    }
                } else if (tagName == "textarea" || tagName == "option") {
                    Uib = gib.value;
                } else if (tagName == "img") {
                    var yZb = gib.getAttribute("title");
                    if (yZb != null && yZb.length > 0) {
                        Uib = yZb;
                    } else {
                        var zZb = gib.getAttribute("alt");
                        if (zZb != null && zZb.length > 0) {
                            Uib = zZb;
                        } else {
                            var Aab = gib.getAttribute("msg");
                            if (Aab != null && Aab.length > 0) {
                                Uib = Aab;
                            }
                        }
                    }
                } else if (tagName == "math") {
                    var HTb = DQb(gib);
                    if (HTb.length > 0) {
                        Uib = zZb;
                    }
                } else {
                    var zZb = gib.getAttribute("alt");
                    if (zZb != null && zZb.length > 0) {
                        Uib = zZb;
                    } else {
                        var Aab = gib.getAttribute("msg");
                        if (Aab != null && Aab.length > 0) {
                            Uib = Aab;
                        }
                    }
                }
            }
        }
    } catch (ignore) {
        Uib = "";
    }
    if (Uib == null) {
        Uib = "";
    }
    return Uib;
}

function QTb(RTb) {
    var KTb;
    var Okb;
    var dlb;
    var Kgb;
    var Nlb;
    var CXb;
    Okb = 0;
    dlb = RTb.indexOf(":");
    Kgb = RTb.indexOf(";", dlb);
    while (Okb > -1 && dlb > -1) {
        Nlb = RTb.substring(Okb, dlb);
        if (Kgb > -1) {
            CXb = RTb.substring(dlb + 1, Kgb);
        } else {
            CXb = RTb.substring(dlb + 1);
        } if (CXb.length == 0) {
            KTb = hfa.indexOf(Nlb);
            if (KTb > -1) {
                hfa.splice(KTb, 1);
                delete ifa[Nlb];
            }
        } else {
            KTb = hfa.indexOf(Nlb);
            if (!(KTb > -1)) {
                hfa.push(Nlb);
            }
            ifa[Nlb] = CXb;
        } if (Kgb > -1) {
            Okb = Kgb + 1;
            dlb = RTb.indexOf(":", Okb);
            Kgb = RTb.indexOf(";", dlb);
        } else {
            break;
        }
    }
}

function WTb(amb) {
    var Xmb = amb.length;
    var hlb = amb;
    var UTb = bTb(amb);
    if (UTb == null) {
        return amb;
    }
    var i;
    var j;
    var c;
    for (i = Xmb - 1; i >= 0; i--) {
        c = UTb.charCodeAt(i);
        if (c != 32) {
            j = i;
            while (c != 32 && i >= 0) {
                --i;
                c = UTb.charCodeAt(i);
            }
            var VTb = UTb.substring(i + 1, j + 1);
            if (ifa[VTb] != null) {
                hlb = hlb.substring(0, i + 1) + ' ' + ifa[VTb] + ' ' + hlb.substr(j + 1);
            }
        }
    }
    return hlb;
}

function bTb(amb) {
    var YTb = false;
    var Xmb = amb.length;
    var lTb = "";
    var i;
    var c;
    for (i = 0; i < Xmb; i++) {
        c = amb.charCodeAt(i);
        if (c == 32 || wra(c)) {
            lTb += ' ';
        } else {
            lTb += amb.charAt(i);
            YTb = true;
        }
    }
    if (YTb) {
        return lTb;
    } else {
        return null;
    }
}

function dTb(amb) {
    return (hfa.indexOf(amb.trimTH()) > -1);
}

function iTb(jTb) {
    var Bkb;
    var fbb = false;
    var hTb = jTb.split(" ");
    var Xmb = hTb.length;
    var i;
    for (i = 0; i < Xmb; i++) {
        Bkb = WTb(hTb[i]);
        if (Bkb != hTb[i]) {
            hTb[i] = Bkb;
            fbb = true;
        }
    }
    if (fbb) {
        var lTb = "";
        for (i = 0; i < Xmb - 1; i++) {
            lTb += hTb[i];
            lTb += " ";
        }
        lTb += hTb[Xmb - 1];
        return lTb;
    }
    return jTb;
}

function qTb(IWb) {
    var fbb = false;
    if (gfa && IWb != null) {
        var Xmb = IWb.length;
        var i = 0;
        for (i = 0; i < Xmb; i++) {
            var Bkb = WTb(IWb[i]);
            if (Bkb != IWb[i]) {
                IWb[i] = Bkb;
                fbb = true;
            }
        }
    }
    return fbb;
}

function vTb(pdb, xTb, zTb) {
    var n = pdb.indexOf(xTb);
    while (n > -1) {
        pdb = pdb.replace(xTb, zTb);
        n = pdb.indexOf(xTb, n + 1);
    }
    return pdb;
}

function AUb(amb) {
    var pTb = amb.replace(/\x26/g, '&amp;');
    pTb = pTb.replace(/\x3c/g, '&lt;');
    pTb = pTb.replace(/\x3e/g, '&gt;');
    return pTb;
}

function DUb(EUb) {
    var Xmb = EUb.length;
    if (Xmb > 100) {
        return lGb(EUb);
    } else {
        var i;
        var c;
        var s;
        for (i = 0; i < Xmb; i++) {
            c = EUb.charCodeAt(i);
            if ((c > 47 && c < 58) || (c > 63 && c < 92) || (c > 94 && c < 124)) {
                continue;
            }
            if (c > 126 || c == 92 || c == 47 || c == 58 || c == 59 || c == 42 || c == 63 || c == 34 || c == 60 || c == 62 || c == 124 || c == 35 || c == 37 || c == 43 || c == 38 || c == 94) {
                s = "^" + qsa(c);
                EUb = EUb.substr(0, i) + s + EUb.substr(i + 1);
                Xmb = EUb.length;
                i += s.length - 1;
            }
        }
    }
    return EUb;
}
var FUb = null;

function HUb(IUb) {
    var wcb = "th_tmp$";
    var Ieb = 1;
    var phb;
    var aeb = true;
    while (aeb) {
        phb = wcb + Ieb;
        if (IUb.document.getElementById(phb)) {
            ++Ieb;
        } else {
            aeb = false;
        }
    }
    return phb;
}

function rw_getTargetNodeAsCaretIE(evt, SUb) {
    try {
        if ((Ffa || Gfa || Hfa) && SUb && !Zya(evt)) {
            var MUb = evt.srcElement;
            var NUb = rw_getWindow(MUb);
            var OUb = MUb.childNodes.length;
            var i;
            var PUb = false;
            for (i = 0; i < OUb; i++) {
                if (MUb.childNodes[i].nodeType == 3) {
                    PUb = true;
                    break;
                }
            }
            if (PUb) {
                if (FUb == null) {
                    FUb = HUb(NUb);
                }
                var QUb = NUb.document.getElementById(FUb);
                if (QUb != null) {
                    QUb.parentNode.removeChild(QUb);
                }
                var range = NUb.document.selection.createRange();
                range.collapse();
                range.pasteHTML("<span id='" + FUb + "'></span>");
                var Elb = NUb.document.getElementById(FUb);
                var UUb = null;
                if (Elb != null) {
                    if (Elb.previousSibling != null && Elb.previousSibling.nodeType == 3) {
                        lqa(Elb.previousSibling);
                        UUb = new THCaret(Elb.previousSibling, Elb.previousSibling.length, true);
                    }
                    if (Elb.nextSibling != null && Elb.nextSibling.nodeType == 3) {
                        lqa(Elb.nextSibling);
                        if (UUb == null) {
                            UUb = new THCaret(Elb.nextSibling, 0, true);
                        }
                    }
                    if (UUb == null && Elb.nextSibling != null && Elb.nextSibling.nodeType == 1) {
                        UUb = new THCaret(Elb.nextSibling, 0, true);
                    } else if (UUb == null && Elb.previousSibling != null && Elb.previousSibling.nodeType == 1) {
                        UUb = new THCaret(Elb.previousSibling, 0, true);
                    }
                }
                if (UUb == null) {
                    UUb = new THCaret(Elb.parentNode, 0, true);
                }
                if (Elb != null) {
                    Elb.parentNode.removeChild(Elb);
                }
                return UUb;
            } else {
                return new THCaret(MUb, 0, true);
            }
        }
        if (Mfa) {
            uNb = evt.target;
            if (uNb != null) {
                if (uNb.firstChild != null && uNb.firstChild.nodeType == 3 && uNb.tagName.toLowerCase() != "textarea") {
                    var VUb = uNb.firstChild.nodeValue;
                    if (VUb.trimTH().length > 0) {
                        uNb = uNb.firstChild;
                    }
                }
                return new THCaret(uNb, 0, true);
            }
        } else {
            var WUb = cxa(evt);
            var XUb = Qra(evt.srcElement.ownerDocument.body);
            try {
                XUb.moveToPoint(WUb.x, WUb.y);
            } catch (skip) {
                return null;
            }
            var eUb = Qra(evt.srcElement.ownerDocument.body);
            var ZUb = Qra(evt.srcElement.ownerDocument.body);
            var aUb = evt.srcElement.firstChild;
            while ((aUb != null)) {
                if (aUb.nodeType == 3 && aUb.nodeValue.trimTH().length > 0) {
                    lqa(aUb);
                    var eib = aUb.previousSibling;
                    while (eib != null && eib.nodeType != 1) {
                        eib = eib.previousSibling;
                    }
                    if (eib != null) {
                        eUb.moveToElementText(eib);
                        eUb.collapse(false);
                    } else {
                        eUb.moveToElementText(aUb.parentNode);
                    }
                    var cUb = aUb.nextSibling;
                    while (cUb != null && cUb.nodeType != 1) {
                        cUb = cUb.nextSibling;
                    }
                    if (cUb != null) {
                        ZUb.moveToElementText(cUb);
                        eUb.setEndPoint("EndToStart", ZUb);
                    } else {
                        ZUb.moveToElementText(aUb.parentNode);
                        eUb.setEndPoint("EndToEnd", ZUb);
                    } if (eUb.inRange(XUb)) {
                        var Skb = mUb(aUb, eUb, XUb);
                        return new THCaret(aUb, Skb, true);
                    }
                }
                aUb = aUb.nextSibling;
            }
        }
    } catch (exc) {
        bra("rw_getTargetNodeAsCaretIE error:" + exc.message);
    }
    return null;
}

function rw_getTextRangeAsRefPtIE(PVb, FVb) {
    try {
        var eUb = Qra(PVb);
        var parentNode = FVb.parentElement();
        eUb.moveToElementText(parentNode);
        var Skb = mUb(parentNode, eUb, FVb);
        var kfb = dSb(parentNode, Skb);
        return kfb;
    } catch (exc) {
        bra("rw_getTextRangeAsRefPtIE error:" + exc.message);
    }
    return null;
}

function mUb(nUb, ddb, pUb) {
    try {
        var Skb = 0;
        var range = ddb.duplicate();
        range.collapse();
        range.move("character", 1);
        range.move("character", -1);
        var qUb = 0;
        var rUb = 0;
        while (range.compareEndPoints("EndToEnd", pUb) == -1) {
            range.moveEnd("character", 1);
            qUb = range.text.length;
            if (qUb > rUb) {
                ++Skb;
                rUb = qUb;
            }
        }
        return Skb;
    } catch (err) {
        return 0;
    }
}

function DVb(PVb, FVb) {
    var Ydb = FVb.duplicate();
    Ydb.collapse(true);
    var tUb = rw_getTextRangeAsRefPtIE(PVb, Ydb);
    Ydb = FVb.duplicate();
    Ydb.collapse(false);
    var uUb = rw_getTextRangeAsRefPtIE(PVb, Ydb);
    return new THRange(PVb, tUb, uUb);
}

function rw_getAsTextRange(PVb, UVb, WVb, VVb, XVb) {
    var range = Qra(PVb);
    var Qgb = xOb(PVb, UVb, -1, VVb, -1);
    var Zfb = Qgb.Zfb;
    var afb = Qgb.afb;
    if (Zfb != null && Zfb.node != null && afb != null && afb.node != null) {
        var yUb = Zfb.node;
        if (yUb.nodeType == 3) {
            var Skb = nSb(yUb);
            yUb = yUb.parentNode;
            WVb += Skb;
        }
        var AVb = afb.node;
        if (AVb.nodeType == 3) {
            var Skb = nSb(AVb);
            AVb = AVb.parentNode;
            XVb += Skb;
        }
        range.moveToElementText(yUb);
        range.collapse();
        bVb(range, WVb);
        range.collapse(false);
        range.select();
        var CVb = Qra(PVb);
        CVb.moveToElementText(AVb);
        CVb.collapse();
        bVb(CVb, XVb);
        CVb.collapse(false);
        range.setEndPoint("EndToEnd", CVb);
    } else {
        range = null;
        bra("Error with rw_getAsTextRange.");
    }
    return range;
}

function bVb(ddb, fjb) {
    var Xmb;
    var ZVb;
    var aVb;
    Xmb = ddb.text.length;
    while (fjb > 0) {
        aVb = ddb.moveEnd("character", fjb);
        if (aVb == 0) {
            return;
        }
        ZVb = ddb.text.length;
        fjb -= (ZVb - Xmb);
        Xmb = ZVb;
    }
}
var eVb = new SpeechStream.Dictionary();

function hVb(pdb) {
    var hlb;
    var Xmb;
    var i;
    var c;
    if (SpeechStream.pronunciation.encodeData()) {
        hlb = "";
        Xmb = pdb.length;
        for (i = 0; i < Xmb; i++) {
            c = pdb.charCodeAt(i);
            if ((c < 40 && c != 33) || c == 43 || c == 47 || c == 60 || c == 62 || c == 92 || c == 96 || c > 126) {
                var wjb = qsa(c);
                switch (wjb.length) {
                case 1:
                    wjb = "0" + wjb;
                case 2:
                    hlb += "/x" + wjb;
                    break;
                case 3:
                    wjb = "0" + wjb;
                case 4:
                    hlb += "/u" + wjb;
                    break;
                default:
                }
            } else {
                hlb += pdb.charAt(i);
            }
        }
    } else {
        hlb = "";
        Xmb = pdb.length;
        for (i = 0; i < Xmb; i++) {
            c = pdb.charCodeAt(i);
            if (c == 34) {
                hlb += "%22";
            } else if (c == 39) {
                hlb += "%27";
            } else {
                hlb += pdb.charAt(i);
            }
        }
    }
    return hlb;
}

function mVb(pdb) {
    var Bkb = decodeURIComponent(pdb);
    var hlb = "";
    var Xmb = Bkb.length;
    var i;
    var fgb;
    var qVb;
    for (i = 0; i < Xmb; i++) {
        var c = Bkb.charAt(i);
        if (c == '/') {
            if (i < Xmb - 1) {
                var Hmb = Bkb.charAt(i + 1);
                switch (Hmb) {
                case '/':
                    hlb += '/';
                    i++;
                    break;
                case 'x':
                    if (i < Xmb - 3) {
                        fgb = Bkb.substr(i + 2, 2);
                        qVb = rsa(fgb);
                        hlb += String.fromCharCode(qVb);
                        i += 3;
                    }
                    break;
                case 'u':
                    if (i < Xmb - 5) {
                        fgb = Bkb.substr(i + 2, 4);
                        qVb = rsa(fgb);
                        hlb += String.fromCharCode(qVb);
                        i += 5;
                    }
                    break;
                default:
                }
            } else {}
        } else if (c == '+') {
            hlb += ' ';
        } else if (c == 10 || c == 13) {} else if (c == '%') {
            if (i < Xmb - 2) {
                fgb = Bkb.substr(i, 3);
                if (fgb == "%2f") {
                    hlb += '/';
                    i += 2;
                } else if (fgb == "%2a") {
                    hlb += ':';
                    i -= 2;
                } else if (fgb == "%60") {
                    hlb += '`';
                    i -= 2;
                } else {
                    if (i < Xmb - 9) {
                        fgb = Bkb.substr(i, 10);
                        if (fgb == "%26quot%3b") {
                            hlb += '"';
                            i += 9;
                        } else {
                            if (i < Xmb - 6) {
                                fgb = Bkb.substr(i, 7);
                                if (fgb == "%26quot") {
                                    hlb += '"';
                                    i += 6;
                                } else {
                                    hlb += c;
                                }
                            } else {
                                hlb += c;
                            }
                        }
                    } else {
                        hlb += c;
                    }
                }
            } else {
                hlb += c;
            }
        } else if (c == '&') {
            if (i < Xmb - 5) {
                fgb = Bkb.substr(i, 6);
                if (fgb == "&#x27") {
                    hlb += '\'';
                } else if (fgb == "&quot;") {
                    hlb += '"';
                }
                hlb += String.fromCharCode(qVb);
                i += 5;
            }
        } else {
            hlb += Bkb.charAt(i);
        }
    }
    return hlb;
}

function tVb(pdb) {
    var hlb = "";
    var Xmb = pdb.length;
    var i;
    for (i = 0; i < Xmb; i++) {
        var c = pdb.charCodeAt(i);
        if ((c < 40 && c != 33) || c == 43 || c == 47 || c == 60 || c == 62 || c == 92 || c == 96 || c > 126) {
            hlb += "&#" + c + ";";
        } else {
            hlb += pdb.charAt(i);
        }
    }
    return hlb;
}

function xVb(pdb) {
    var hlb = "";
    var Xmb = pdb.length;
    var i;
    for (i = 0; i < Xmb; i++) {
        var c = pdb.charCodeAt(i);
        if ((c < 40 && c != 33) || c == 43 || c == 47 || c == 60 || c == 62 || c == 92 || c == 96 || c > 126) {
            if (c == 34 || c == 39) {
                hlb += "\\&#" + c + ";";
            } else {
                hlb += "&#" + c + ";";
            }
        } else {
            hlb += pdb.charAt(i);
        }
    }
    return hlb;
}
var AWb = "\\x82\\x91\\x92";
var BWb = "\\x93\\x94";
var CWb = /^[,.?!;:\x27\x22£$€]+|[,.?!;:\x27\x22£$€]+$/g;

function HWb(IWb) {
    if (!ffa) {
        return false;
    }
    var fbb = false;
    var Bkb;
    var hlb;
    var Xmb = IWb.length;
    var i;
    for (i = 0; i < Xmb; i++) {
        hlb = IWb[i].trimTH();
        if (hlb.indexOf(" ") > -1) {
            var phb = TWb(hlb);
            if (phb != hlb) {
                IWb[i] = phb;
                fbb = true;
            }
            continue;
        }
        var value;
        if (eVb.MultiwordStart$__.indexOf(hlb) > -1) {
            if (i < Xmb - 1) {
                Bkb = hlb + " " + IWb[i + 1].trimTH();
                if ((value = eVb.get$__(Bkb)) != null) {
                    var OWb = value.split(" ");
                    var PWb = OWb[0] + " ";
                    var Mmb = OWb[1] + " ";
                    IWb[i] = PWb;
                    IWb[i + 1] = Mmb;
                    fbb = true;
                    continue;
                }
            }
            if (i < Xmb - 2) {
                Bkb = hlb + " " + IWb[i + 1].trimTH() + " " + IWb[i + 2].trimTH();
                if ((value = eVb.get$__(Bkb)) != null) {
                    var OWb = value.split(" ");
                    var PWb = OWb[0] + " ";
                    var Mmb = OWb[1] + " ";
                    var Nmb = OWb[2] + " ";
                    IWb[i] = PWb;
                    IWb[i + 1] = Mmb;
                    IWb[i + 2] = Nmb;
                    fbb = true;
                    continue;
                }
            }
        }
        if ((value = eVb.get$__(hlb)) != null || (value = eVb.get$__(hlb.toLowerCase())) != null) {
            IWb[i] = value + " ";
            fbb = true;
            continue;
        } else {
            Bkb = hlb.replace(AWb, '\'');
            Bkb = Bkb.replace(BWb, '"');
            if (hlb != Bkb) {
                if ((value = eVb.get$__(Bkb)) != null || (value = eVb.get$__(Bkb.toLowerCase())) != null) {
                    IWb[i] = value + " ";
                    fbb = true;
                    continue;
                } else {
                    hlb = Bkb;
                    Bkb = hlb.replace(CWb, '');
                    if (hlb != Bkb) {
                        if ((value = eVb.get$__(Bkb)) != null || (value = eVb.get$__(Bkb.toLowerCase())) != null) {
                            IWb[i] = value + " ";
                            fbb = true;
                            continue;
                        }
                    }
                }
            } else {
                Bkb = hlb.replace(CWb, '');
                if (hlb != Bkb) {
                    if ((value = eVb.get$__(Bkb)) != null || (value = eVb.get$__(Bkb.toLowerCase())) != null) {
                        IWb[i] = value + " ";
                        fbb = true;
                        continue;
                    }
                }
            }
        }
    }
    return fbb;
}

function TWb(amb) {
    if (!ffa) {
        return amb;
    }
    var hlb = "";
    var wordList = amb.split(" ");
    if (HWb(wordList)) {
        var Xmb = wordList.length;
        for (i = 0; i < Xmb; i++) {
            hlb += wordList[i];
            if (i < Xmb - 1) {
                hlb += " ";
            }
        }
        return hlb;
    } else {
        return amb;
    }
}

function bWb(amb) {
    var n1;
    var n2;
    var XWb;
    var Slb;
    var Tlb;
    var aWb = amb.split("\r\n");
    var i;
    for (i = 0; i < aWb.length; i++) {
        XWb = aWb[i];
        var dWb = XWb.indexOf("&p_pageID=*&") > -1;
        n1 = XWb.indexOf("&sayThis=");
        n2 = XWb.indexOf("&likeThis=");
        Slb = XWb.substring(n1 + 9, n2);
        Tlb = XWb.substring(n2 + 10);
        Slb = mVb(Slb);
        Tlb = mVb(Tlb);
        eVb.add$__(Slb, Tlb, dWb);
    }
    if (typeof (Klb) == "function") {
        Klb();
    }
}

function gWb() {}

function hWb() {
    if (lca != null && lca.length > 0 && mca != null && mca.length > 0 && nca != null && nca.length > 0) {
        var EXb;
        if (SpeechStream.cacheMode.getLiveServer() == null) {
            return;
        }
        EXb = usa(true) + SpeechStream.cacheMode.getLiveServer();
        var mgb = "&custID=" + lca + "&bookID=" + mca + "&pageID=" + nca + "&combined=Y";
        var flash = NZb.getConnector();
        if (flash == null) {
            ssa("Connection to the server is not available.");
        } else {
            flash.getPronunciationDataAll(EXb, mgb);
        }
    }
}
var jWb = 2;

function $rw_loadPronCallback(yfb) {
    if (yfb == null) {
        if (jWb > 0) {
            --jWb;
            hWb();
        } else {
            ssa("Failed to load pronunciation data, this may affect the text to speech function.");
        }
    } else {
        yfb = yfb.trimTH();
        if (yfb == "") {
            if (SpeechStream.pronunciation.mode != SpeechStream.pronunciation.SERVER_PRONUNCIATION) {
                efa = true;
            }
            if (typeof (Klb) == "function") {
                Klb();
            }
        } else if (yfb == "-1") {
            if (jWb > 0) {
                --jWb;
                hWb();
            } else {
                ssa("Failed to load pronunciation data, this may affect the text to speech function.");
            }
        } else {
            if (SpeechStream.pronunciation.mode != SpeechStream.pronunciation.SERVER_PRONUNCIATION) {
                efa = true;
            }
            bWb(yfb);
        }
    }
}

function mWb(HXb, yWb, IXb) {
    if (lca != null && lca.length > 0 && mca != null && mca.length > 0 && nca != null && nca.length > 0) {
        var EXb;
        if (SpeechStream.cacheMode.getLiveServer() == null) {
            return;
        }
        EXb = usa(true) + SpeechStream.cacheMode.getLiveServer();
        var mgb = "&custID=" + lca + "&bookID=" + mca + "&pageID=" + (IXb ? "*" : nca) + "&sayThis=" + hVb(HXb) + "&likeThis=" + hVb(yWb);
        var flash = NZb.getConnector();
        if (flash == null) {
            alert("Connection to the server is not available.");
        } else {
            flash.addPronunciationData(EXb, mgb);
        }
    }
}

function $rw_addPronCallback(yfb) {
    if (yfb == null) {
        document.getElementById("confirmPageMsg").innerHTML = "Failed to insert.";
    } else if (yfb == "-1") {
        document.getElementById("confirmPageMsg").innerHTML = "Failed to insert.";
    } else {
        var Nlb = document.getElementById('createSayThis').value.trimTH();
        var CXb = document.getElementById('createLikeThis').value.trimTH();
        var Rlb = document.getElementById('createAllPages').checked;
        eVb.add$__(Nlb, CXb, Rlb);
        document.getElementById('createSayThis').value = '';
        document.getElementById('createLikeThis').value = '';
        document.getElementById("confirmPageMsg").innerHTML = "Pronunciation inserted.";
        Klb();
    }
}

function wWb(HXb, yWb, IXb) {
    if (lca != null && lca.length > 0 && mca != null && mca.length > 0 && nca != null && nca.length > 0) {
        var EXb;
        if (SpeechStream.cacheMode.getLiveServer() == null) {
            return;
        }
        EXb = usa(true) + SpeechStream.cacheMode.getLiveServer();
        var mgb = "&custID=" + lca + "&bookID=" + mca + "&pageID=" + (IXb ? "*" : nca) + "&sayThis=" + hVb(HXb) + "&likeThis=" + hVb(yWb);
        var flash = NZb.getConnector();
        if (flash == null) {
            alert("Connection to the server is not available.");
        } else {
            flash.updatePronunciationData(EXb, mgb);
        }
    }
}

function $rw_updatePronCallback(yfb) {
    if (yfb == null) {
        document.getElementById("editPageMsg").innerHTML = "Failed to updated.";
    } else if (yfb == "-1") {
        document.getElementById("editPageMsg").innerHTML = "Failed to updated.";
    } else {
        var Nlb = document.getElementById('editSayThis').value.trimTH();
        var CXb = document.getElementById('editLikeThis').value.trimTH();
        var Rlb = document.getElementById('editAllPages').checked;
        eVb.add$__(Nlb, CXb, Rlb);
        document.getElementById('editSayThis').value = '';
        document.getElementById('editLikeThis').value = '';
        document.getElementById("editPageMsg").innerHTML = "Pronunciation updated.";
        Wlb();
        Klb();
    }
}

function GXb(HXb, IXb) {
    if (lca != null && lca.length > 0 && mca != null && mca.length > 0 && nca != null && nca.length > 0) {
        var EXb;
        if (SpeechStream.cacheMode.getLiveServer() == null) {
            return;
        }
        EXb = usa(true) + SpeechStream.cacheMode.getLiveServer();
        var mgb = "&custID=" + lca + "&bookID=" + mca + "&pageID=" + (IXb ? "*" : nca) + "&sayThis=" + hVb(HXb);
        var flash = NZb.getConnector();
        if (flash == null) {
            alert("Connection to the server is not available.");
        } else {
            flash.removePronunciationData(EXb, mgb, HXb);
        }
    }
}

function $rw_removePronCallback(yfb, p_strKey) {
    if (yfb == null) {
        document.getElementById("editPageMsg").innerHTML = "Failed to delete item.";
    } else if (yfb == "-1") {
        document.getElementById("editPageMsg").innerHTML = "Failed to delete item.";
    } else {
        eVb.remove$__(p_strKey);
        document.getElementById('editSayThis').value = '';
        document.getElementById('editLikeThis').value = '';
        document.getElementById("editPageMsg").innerHTML = "Pronunciation deleted.";
        Klb();
    }
}
var KXb = null;

function MXb() {
    if (KXb != null) {
        return KXb;
    } else {
        if (kfa) {
            var Llb = document.getElementById("rwDrag");
            if (Llb != null) {
                Llb.style.position = "relative";
                kfa = false;
            }
        }
        var flash = null;
        try {
            if (Pfa) {
                flash = window.document.WebToSpeech;
            } else {
                if (window.document.WebToSpeech) {
                    flash = window.document.WebToSpeech;
                } else {
                    flash = window.WebToSpeech;
                }
            } if (flash != null) {
                flash.getVersion();
                KXb = flash;
            }
        } catch (err) {
            flash = null;
            KXb = null;
        }
        if (flash == null) {
            var OXb = document.getElementById("WebToSpeech");
            if (OXb != null) {
                flash = OXb;
                try {
                    flash.getVersion();
                    KXb = flash;
                } catch (e) {
                    flash = null;
                    KXb = null;
                }
                if (flash == null && !Cfa && OXb.childNodes && typeof (OXb.childNodes.length) == "number") {
                    var Xmb = OXb.childNodes.length;
                    var i;
                    for (i = 0; i < Xmb; i++) {
                        var bfb = OXb.childNodes[i];
                        if (bfb.tagName.toLowerCase() == "embed") {
                            flash = bfb;
                            try {
                                flash.getVersion();
                                KXb = flash;
                            } catch (e) {
                                flash = null;
                                KXb = null;
                            }
                        }
                    }
                }
            }
        }
        return flash;
    }
}
var RXb = 0;
SpeechStream.AjaxRequest = function () {
    var SXb = null;
    var TXb = null;
    var UXb = null;
    var VXb = false;
    var WXb = null;
    this.setErrorCallBack = function (p_func) {
        WXb = p_func;
    };
    this.callBack = function () {
        with(this) {
            if (readyState < 4) {
                return;
            }
            if (status != 200) {
                if (WXb) {
                    WXb(status);
                    return;
                }
            }
            if (VXb) {
                if (UXb == null) {
                    TXb(responseXML);
                } else {
                    TXb[UXb](responseXML);
                }
            } else {
                if (UXb == null) {
                    TXb(responseText);
                } else {
                    TXb[UXb](responseText);
                }
            }
        }
    };
    this.doPost = function (Tua, p_parameters, p_responseObject, p_responseCallback, p_bXml) {
        with(this) {
            TXb = p_responseObject;
            UXb = p_responseCallback;
            SXb = new XMLHttpRequest();
            VXb = p_bXml;
            SXb.open("POST", Tua, true);
            SXb.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            SXb.onreadystatechange = callBack;
            SXb.send(p_parameters);
        }
    };
    this.doGet = function (Tua, p_parameters, p_responseObject, p_responseCallback, p_bXml) {
        with(this) {
            TXb = p_responseObject;
            UXb = p_responseCallback;
            SXb = new XMLHttpRequest();
            VXb = p_bXml;
            SXb.open("GET", Tua, true);
            SXb.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            SXb.onreadystatechange = callBack;
            SXb.send(p_parameters);
        }
    };
};
SpeechStream.HTML5Controller = function () {
    var XXb = Wca;
    var YXb = false;
    var ZXb = 0;
    var aXb = false;
    var bXb = 0;
    var cXb = null;
    var dXb;
    var eXb;
    var fXb;
    var gXb;
    var hXb;
    var iXb;
    var jXb = kca;
    var SZb = new Audio();
    SZb.type = "audio/mpeg";
    SZb.src = "";
    if (typeof (vca) == "number" && vca > -1) {
        SZb.volume = (parseInt(vca, 10) / 100.0);
    }
    var BZb = null;
    var mXb = 0;
    var nXb = null;
    var IZb = true;
    var pXb = false;
    var qXb = false;
    this.initialise = function (p_flashVars, dva, eva, fva) {
        dXb = dva;
        eXb = eva;
        fXb = fva;
        if (gca != null) {
            gXb = gca;
        } else {
            gXb = nva(Yca, false);
        } if (fca != null) {
            hXb = fca;
        } else {
            hXb = nva(Yca, false);
        } if (hca != null) {
            iXb = hca;
        } else {
            iXb = nva(Yca, false);
        } if (p_flashVars.cacheMode == "true") {
            pXb = true;
        }
        if (p_flashVars.cacheLiveFallover == "true") {
            qXb = true;
        }
        if (p_flashVars.volumeValue > -1) {
            SZb.volume = (p_flashVars.volumeValue / 100.0);
        }
    };
    this.setToClipboard = function (pdb) {};
    this.setCacheBuster = function (p_bCacheBuster) {
        YXb = p_bCacheBuster;
    };
    this.setCacheMode = function () {};
    this.resetCacheTimer = function () {
        ZXb = 0;
        setTimeout(this.resetCacheTimer, Jda * 1000 * 60);
    };
    setTimeout(this.resetCacheTimer, Jda * 1000 * 60);
    this.canPause = function () {
        return SZb && !SZb.ended && !isNaN(SZb.duration) && SZb.duration > 0;
    };
    this.isPaused = function () {
        return aXb;
    };
    this.pause = function () {
        if (SZb != null) {
            SZb.pause();
            aXb = true;
            return true;
        }
        return false;
    };
    this.resume = function () {
        if (SZb != null && aXb) {
            if (Ofa && SZb.currentTime > 0.05 && !SZb.ended) {
                SZb.currentTime -= 0.05;
            }
            SZb.play();
            aXb = false;
            return true;
        }
        return false;
    };
    this.setCustomerId = function () {};
    this.setBookId = function () {};
    this.setPageId = function () {};
    this.setSpeedValue = function () {};
    this.setVoiceName = function (uBb) {
        jXb = uBb;
    };
    this.getVoiceName = function () {
        return jXb;
    };
    this.setVolumeValue = function (p_strVal) {
        if (SZb != null) {
            try {
                SZb.volume = (parseInt(p_strVal, 10) / 100.0);
            } catch (e) {}
        }
    };
    this.checkPath = function (iOb) {
        if (Zda != null && ada != null) {
            var Bkb;
            Bkb = iOb;
            if (Bkb.indexOf(Zda) > -1) {
                Bkb = Bkb.substr(0, Bkb.indexOf(Zda)) + ada + Bkb.substr(Bkb.indexOf(Zda) + Zda.length);
            }
            return Bkb;
        } else {
            return iOb;
        }
    };
    this.getPronunciationDataAll = function (p_strBase, p_strDetails) {
        var mfb = p_strBase + "/SpeechNAServer/pronounce.html?type=get&pronounceClient=" + pca + p_strDetails;
        var caller = new SpeechStream.AjaxRequest();
        caller.doGet(mfb, null, this, "requestPGetAllLoad", false);
    };
    this.requestPGetAllLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_loadPronCallback("-1");
        } else if (amb == "get=false" || amb == "") {
            $rw_loadPronCallback("-1");
        } else if (amb == "empty") {
            $rw_loadPronCallback("");
        } else {
            $rw_loadPronCallback(amb);
        }
    };
    this.addPronunciationData = function (p_strBase, p_strDetails) {
        var mfb = p_strBase + "/SpeechNAServer/pronounce.html?type=add&pronounceClient=" + pca + p_strDetails;
        var caller = new SpeechStream.AjaxRequest();
        caller.doGet(mfb, null, this, "requestPAddLoad", false);
    };
    this.requestPAddLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_addPronCallback("-1");
        } else if (amb == "add=false") {
            $rw_addPronCallback("-1");
        } else if (amb == "add=true") {
            $rw_addPronCallback("1");
        } else {
            $rw_addPronCallback("-1");
        }
    };
    this.updatePronunciationData = function (p_strBase, p_strDetails) {
        var mfb = p_strBase + "/SpeechNAServer/pronounce.html?type=update&pronounceClient=" + pca + p_strDetails;
        var caller = new SpeechStream.AjaxRequest();
        caller.doGet(mfb, null, this, "requestPUpdateLoad", false);
    };
    this.requestPUpdateLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_updatePronCallback("-1");
        } else if (amb == "update=false") {
            $rw_updatePronCallback("-1");
        } else if (amb == "update=true") {
            $rw_updatePronCallback("1");
        } else {
            $rw_updatePronCallback("-1");
        }
    };
    this.removePronunciationData = function (p_strBase, p_strDetails, p_strKey) {
        var mfb = p_strBase + "/SpeechNAServer/pronounce.html?type=delete&pronounceClient=" + pca + p_strDetails;
        var caller = new SpeechStream.AjaxRequest();
        var AYb = function (amb) {
            if (amb == null || amb.length == 0) {
                $rw_removePronCallback("-1");
            } else if (amb == "delete=false") {
                $rw_removePronCallback("-1");
            } else if (amb == "delete=true") {
                $rw_removePronCallback("1", p_strKey);
            } else {
                $rw_removePronCallback("-1");
            }
        };
        caller.doGet(mfb, null, AYb, null, false);
    };
    var BYb = "";
    this.getLastError = function () {
        return BYb;
    };
    this.getVersion = function () {
        return XXb;
    };
    this.getRevisionNumber = function () {
        return "0";
    };

    function DYb() {
        var aYb = (++bXb);
        if (cXb != null) {
            HYb(0);
            delete cXb;
            cXb = null;
        }
        aXb = false;
        if (IZb) {
            SZb.pause();
            SZb.autoplay = true;
            SZb.play();
            IZb = false;
        }
        return aYb;
    }
    this.checkRequestStillValid = function (EYb) {
        return EYb == bXb;
    };
    this.setAudio = function (p_strMp3Url) {
        SZb.src = p_strMp3Url;
    };
    this.setTimer = function (p_timerArray) {
        BZb = p_timerArray;
    };
    this.requestCompleteStartPlayback = function () {
        $rw_renderingSpeechCallback();
        audioPlaybackTimer();
        SZb.autoplay = true;
        SZb.play();
    };
    this.stopSpeech = function () {
        if (SZb != null) {
            SZb.pause();
            SZb.currentTime = 0;
            SZb.src = '';
            this.onSpeechStop(-1);
        }
        cXb = null;
        ++bXb;
    };
    this.stopSpeechAlt = function () {
        if (SZb != null) {
            SZb.pause();
            try {
                SZb.currentTime = 0;
            } catch (err) {}
            SZb.src = '';
            this.onSpeechStop(-2);
        }
        cXb = null;
        ++bXb;
    };
    this.onSpeechStop = function (Umb) {
        HYb(Umb);
    };

    function HYb(Umb) {
        if (Umb < 0) {
            $rw_doSelection(Umb);
        }
        BZb = null;
        mXb = 0;
        nXb = null;
    };
    this.startSpeech = function (amb, OYb) {
        var aYb = DYb();
        cXb = new SpeechStream.Html5Speech();
        cXb.setParameters(this, aYb, amb, OYb);
        if (ZXb <= Ida || fXb == null) {
            cXb.makeSpeechRequest(eXb, false);
        } else {
            cXb.makeSpeechRequest(fXb, true);
        }
    };
    this.startSpeechFromBackup = function (amb, OYb) {
        var aYb = DYb();
        cXb = new SpeechStream.Html5Speech();
        cXb.setParameters(this, aYb, amb, OYb);
        cXb.makeSpeechRequest(fXb, true);
    };
    this.startSpeechBackup = function (p_params) {
        if (fXb == null) {
            this.onSpeechStop(-3);
            return false;
        } else {
            var aYb = DYb();
            cXb = new SpeechStream.Html5Speech();
            cXb.copyParameters(this, aYb, p_params);
            cXb.makeSpeechRequest(fXb, true);
            return true;
        }
    };
    this.startSpeechFromCacheWithGen = function (p_strFilePath, jTb, p_destFolder, p_destFilename, p_bPron) {
        var aYb = DYb();
        if (ZXb <= Ida || !qXb || fXb == null) {
            var VYb;
            var WYb;
            if (YXb) {
                VYb = eXb + "SpeechCache/" + p_strFilePath + ".xml" + "?cachebuster=" + new Date().getTime() + Math.random();
                WYb = eXb + "SpeechCache/" + p_strFilePath + ".mp3" + "?cachebuster=" + new Date().getTime() + Math.random();
            } else {
                VYb = eXb + "SpeechCache/" + p_strFilePath + ".xml";
                WYb = eXb + "SpeechCache/" + p_strFilePath + ".mp3";
            }
            cXb = new SpeechStream.Html5Speech();
            cXb.setParameters(this, aYb, jTb, p_bPron);
            cXb.setStaticParameters(p_destFolder, p_destFilename);
            cXb.loadFiles(VYb, WYb);
        } else {
            cXb = new SpeechStream.Html5Speech();
            cXb.setParameters(this, aYb, jTb, p_bPron);
            cXb.setStaticParameters(p_destFolder, p_destFilename);
            cXb.makeSpeechRequest(fXb, true);
        }
    };
    this.startSpeechGenerateCache = function (p_strFilePath, jTb, p_destFolder, p_destFilename, p_bPron, p_strServerName) {
        var aYb = DYb();
        cXb = new SpeechStream.Html5Speech();
        cXb.setParameters(this, aYb, jTb, p_bPron);
        cXb.setStaticParameters(p_destFolder, p_destFilename);
        cXb.makeSpeechRequest(p_strServerName, true);
    };
    this.startSpeechFromCache = function (p_strFilePath, jTb, p_bPron) {
        var aYb = DYb();
        if (ZXb <= Ida || !qXb || fXb == null) {
            var VYb;
            var WYb;
            if (YXb) {
                VYb = eXb + "SpeechCache/" + p_strFilePath + ".xml" + "?cachebuster=" + new Date().getTime() + Math.random();
                WYb = eXb + "SpeechCache/" + p_strFilePath + ".mp3" + "?cachebuster=" + new Date().getTime() + Math.random();
            } else {
                VYb = eXb + p_strFilePath + ".xml";
                WYb = eXb + p_strFilePath + ".mp3";
            }
            cXb = new SpeechStream.Html5Speech();
            cXb.setParameters(this, aYb, jTb, p_bPron);
            cXb.loadFiles(VYb, WYb);
        } else {
            cXb = new SpeechStream.Html5Speech();
            cXb.setParameters(this, aYb, jTb, p_bPron);
            cXb.makeSpeechRequest(fXb, true);
        }
    };
    this.startSpeechFromFile = function (amb, Tua, p_bPron) {};
    this.startHighlighting = function (amb) {};
    this.simpleSpeech = function (amb, OYb) {
        var aYb = DYb();
        cXb = new SpeechStream.Html5Speech();
        cXb.setParameters(this, aYb, amb, OYb);
        cXb.setHighlightable(false);
        if (ZXb <= Ida || fXb == null) {
            cXb.makeSpeechRequest(eXb, false);
        } else {
            cXb.makeSpeechRequest(fXb, true);
        }
    };
    this.simpleSpeechFromBackup = function (amb, OYb) {
        var aYb = DYb();
        cXb = new SpeechStream.Html5Speech();
        cXb.setParameters(this, aYb, amb, OYb);
        cXb.setHighlightable(false);
        cXb.makeSpeechRequest(fXb, true);
    };
    this.simpleSpeechBackup = function (p_params) {
        var aYb = DYb();
        cXb = new SpeechStream.Html5Speech();
        cXb.copyParameters(this, aYb, p_params);
        cXb.setHighlightable(false);
        cXb.makeSpeechRequest(fXb, true);
    };
    this.autogenSpeechFiles = function (jTb, p_destFolder, p_destFilename, p_bPron, p_strServerName) {
        var aYb = DYb();
        this.onSpeechStop(-2);
        cXb = new SpeechStream.Html5Speech();
        cXb.setParameters(this, aYb, jTb, p_bPron);
        cXb.setStaticParameters(p_destFolder, p_destFilename);
        cXb.makeSpeechRequest(p_strServerName, true);
    };
    this.checkAutogenCachedFiles = function (p_strFilePath) {};
    this.autoGenComplete = function (p_strServerName) {};
    this.getMP3File = function (Jmb, p_bPron) {};
    this.getPictureDictionaryPage = function (amb) {
        var bYb = "&userName=" + pca + "&swf=" + XXb;
        var lYb = iXb + "ImageServices/imagedict.html?word=" + amb + bYb;
        if (lca != null) {
            lYb += "&custID=" + lca;
        }
        var caller = new SpeechStream.AjaxRequest();
        caller.doPost(lYb, null, this, "imagedictionaryLoad", false);
    };
    this.imagedictionaryLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_picturedictionaryReply("No Image.");
        } else {
            $rw_picturedictionaryReply(amb);
        }
    };
    this.getCustomDictionaryPage = function (jTb, Tua) {
        var caller = new SpeechStream.AjaxRequest();
        caller.doPost(Tua + jTb, null, this, "dictionaryLoad", false);
    };
    this.getDictionaryPage = function (amb) {
        var lYb = gXb + "rwserver/?query=dictionaryHtml" + "&text=" + amb + "&locale=" + tca + "&userName=" + pca + "&swf=" + XXb;
        if (lca != null) {
            lYb += "&custID=" + lca;
        }
        var caller = new SpeechStream.AjaxRequest();
        caller.doPost(lYb, null, this, "dictionaryLoad", false);
    };
    this.dictionaryLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_dictionaryReply("Error loading content.");
        } else {
            $rw_dictionaryReply(amb);
        }
    };
    this.getDictionaryPageFl = function (amb) {
        var lYb = gXb + "rwserver/?query=dictionary&type=result&wordType=15&" + "&text=" + amb + "&locale=" + tca + "&userName=" + pca + "&swf=" + XXb + "&dictionaryType=SIMPLE";
        if (lca != null) {
            lYb += "&custID=" + lca;
        }
        var caller = new SpeechStream.AjaxRequest();
        caller.doPost(lYb, null, this, "dictionaryFlLoad", false);
    };
    this.getDictionaryPageFlHTML = function (amb) {
        var lYb = gXb + "rwserver/?query=dictionaryHtml" + "&text=" + amb + "&locale=" + tca + "&userName=" + pca + "&swf=" + XXb + "&dictionaryType=SIMPLE";
        if (lca != null) {
            lYb += "&custID=" + lca;
        }
        var caller = new SpeechStream.AjaxRequest();
        caller.doPost(lYb, null, this, "dictionaryFlLoad", false);
    };
    this.dictionaryFlLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_dictionaryFlReply("Error loading content.");
        } else {
            $rw_dictionaryFlReply(amb);
        }
    };
    this.getTranslationPage = function (amb) {
        this.getTranslationGenericPage(amb, "English", "Spanish");
    };
    this.getTranslationGenericPage = function (amb, oYb, pYb) {
        mYb(amb, oYb, pYb, false, this);
    };
    this.getTranslationFlGenericPage = function (amb, oYb, pYb) {
        mYb(amb, oYb, pYb, true, this);
    };

    function mYb(amb, oYb, pYb, qYb, rYb) {
        var lYb = hXb + "rwtranslateserver/onlinetranslator?type=ultrahtml5&mode=content" + "&value=" + encodeURIComponent(amb) + "&value2=" + amb + "&caller=" + location.protocol + "//" + location.host + location.pathname + "&key=" + lGb(amb + pca) + "&username=" + pca + "&source=" + oYb + "&dest=" + pYb;
        if (lca != null) {
            lYb += "&custID=" + lca;
        }
        var caller = new SpeechStream.AjaxRequest();
        if (qYb) {
            caller.doPost(lYb, null, rYb, "translationFlLoad", false);
        } else {
            caller.doPost(lYb, null, rYb, "translationLoad", false);
        }
    }
    this.translationLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_transReply("Error loading content.");
        } else {
            amb = "<style type=\"text/css\">div.rwTranWordHeader{font-weight: bold;padding-bottom: 3px;" + "border-bottom:1px solid #666666;margin-bottom: 10px;}" + "span.rwMeaningNum{pading-left: 10px;padding-right: 10px;font-weight:bold;}" + "span.rwMeaning{padding-right:1-px;}</style>" + amb;
            $rw_transReply(amb);
        }
    };
    this.translationFlLoad = function (amb) {
        if (amb == null || amb.length == 0) {
            $rw_transFlReply("Error loading content.");
        } else {
            amb = "<style type=\"text/css\">div.rwTranWordHeader{font-weight: bold;padding-bottom: 3px;" + "border-bottom:1px solid #666666;margin-bottom: 10px;}" + "span.rwMeaningNum{pading-left: 10px;padding-right: 10px;font-weight:bold;}" + "span.rwMeaning{padding-right:1-px;}</style>" + amb;
            $rw_transFlReply(amb);
        }
    };
    this.getSoundFileLength = function (mfb) {};
    audioPlaybackTimer = function () {
        if (BZb == null) {
            return;
        }
        if (SZb.ended) {
            $rw_speechCompleteCallback();
            HYb(-1);
            try {
                SZb.pause();
                SZb.currentTime = 0;
                SZb.src = '';
            } catch (err) {}
            return;
        }
        if (BZb.length > 0) {
            if (BZb[mXb] < SZb.currentTime) {
                $rw_doSelection(mXb);
                mXb++;
            }
        }
        nXb = setTimeout(audioPlaybackTimer, 10);
    };
    this.strStoredVoice = null;
    this.setAltSettings = function (uBb, zBb, ACb, BCb, CCb) {
        if (this.strStoredVoice == null) {
            this.strStoredVoice = jXb;
        }
        if (typeof (uBb) == "string") {
            jXb = uBb;
        }
    };
    this.restoreSettings = function () {
        if (this.strStoredVoice != null) {
            jXb = this.strStoredVoice;
            this.strStoredVoice = null;
        }
    };
};
SpeechStream.Html5Speech = function () {
    this.m_nRequestNumber = -1;
    this.m_params = null;
    this.m_bBackup = false;
    this.m_bHighlightable = true;
    this.m_controller = null;
    this.makeSpeechRequest = function (p_strSpeechServer, p_bBackup) {
        var server = p_strSpeechServer + "SpeechServices/index.html";
        this.m_bBackup = p_bBackup;
        var uYb = new SpeechStream.AjaxRequest();
        uYb.doPost(server, this.m_params, this, "onSpeechRequestResponse", false);
    };
    this.onSpeechRequestResponse = function (p_strResponse) {
        if (!this.m_controller.checkRequestStillValid(this.m_nRequestNumber)) {
            return;
        }
        var vYb = p_strResponse.indexOf("xml=");
        var wYb = p_strResponse.indexOf("&mp3");
        var xYb = p_strResponse.substring(vYb + 4, wYb);
        var yYb = p_strResponse.substring(wYb + 5, p_strResponse.length);
        if (xYb == "error" || yYb == "error") {
            if (!this.m_bBackup) {
                if (!this.m_controller.startSpeechBackup(this.m_params)) {
                    BYb = "Error response from server";
                    return;
                }
            } else {
                BYb = "Error response from server";
                this.m_controller.onSpeechStop(-3);
                return;
            }
        }
        if (xYb == "busy" || yYb == "busy") {
            if (!this.m_bBackup) {
                if (!this.m_controller.startSpeechBackup(this.m_params)) {
                    BYb = "Busy response from server";
                    return;
                }
            } else {
                BYb = "Busy response from server";
                this.m_controller.onSpeechStop(-3);
                return;
            }
        }
        this.loadFiles(xYb, yYb);
    };
    this.loadFiles = function (p_strXmlUrl, p_strMp3Url) {
        p_strXmlUrl = this.m_controller.checkPath(p_strXmlUrl);
        p_strMp3Url = this.m_controller.checkPath(p_strMp3Url);
        this.m_controller.setAudio(p_strMp3Url);
        if (this.m_bHighlightable) {
            var zYb = new SpeechStream.AjaxRequest;
            zYb.doGet(p_strXmlUrl, null, this, "onTimingFileResponse", true);
        } else {
            var BZb = new Array();
            this.m_controller.setTimer(BZb);
            this.m_controller.requestCompleteStartPlayback();
        }
    };
    this.onTimingFileResponse = function (p_xmlResponse) {
        if (!this.m_controller.checkRequestStillValid(this.m_nRequestNumber)) {
            return;
        }
        var BZb = new Array();
        if (p_xmlResponse && p_xmlResponse.documentElement && p_xmlResponse.documentElement.childNodes) {
            var CZb = p_xmlResponse.documentElement.childNodes;
            var DZb = 0;
            for (i = 0; i < CZb.length; i++) {
                if (CZb[i].nodeType == 1) {
                    BZb[DZb] = parseFloat(CZb[i].getAttribute("time") / 1000);
                    if (DZb > 0 && BZb[DZb] <= BZb[DZb - 1]) {
                        BZb[DZb] = BZb[DZb - 1] + 0.010;
                    }
                    DZb = DZb + 1;
                }
            }
            this.m_controller.setTimer(BZb);
            this.m_controller.requestCompleteStartPlayback();
        } else {
            if (!this.m_bBackup) {
                if (!this.m_controller.startSpeechBackup(this.m_params)) {
                    BYb = "Failed to get timing response from server";
                }
            } else {
                BYb = "Failed to get timing response from server";
                this.m_controller.onSpeechStop(-3);
            }
        }
    };
};
SpeechStream.Html5Speech.prototype.setParameters = function (p_controller, EYb, amb, OYb) {
    if (amb == null) {
        amb = "";
    }
    this.m_controller = p_controller;
    this.m_nRequestNumber = EYb;
    var keb = "text=" + encodeURIComponent(amb) + "&userName=" + encodeURIComponent(pca) + "&voiceName=" + encodeURIComponent(p_controller.getVoiceName()) + "&speedValue=" + encodeURIComponent(uca);
    if (lca != null) {
        keb += "&custID=" + encodeURIComponent(lca);
    }
    if (mca != null) {
        keb += "&bookID=" + encodeURIComponent(mca);
    }
    if (nca != null) {
        keb += "&pageID=" + encodeURIComponent(nca);
    }
    if (OYb) {
        keb += "&usePron=Y";
    }
    this.m_params = keb;
};
SpeechStream.Html5Speech.prototype.copyParameters = function (p_controller, EYb, p_params) {
    this.m_controller = p_controller;
    this.m_nRequestNumber = EYb;
    this.m_params = p_params;
};
SpeechStream.Html5Speech.prototype.setStaticParameters = function (p_strDestFolder, p_strDestFilename) {
    var keb = "&destFolder=" + p_strDestFolder + "&destFilename=" + p_strDestFilename;
    this.m_params = this.m_params + keb;
};
SpeechStream.Html5Speech.prototype.setHighlightable = function (p_bHighlightable) {
    this.m_bHighlightable = p_bHighlightable;
};
SpeechStream.Html5Speech.prototype.getHighlightable = function () {
    return this.m_bHighlightable;
};
SpeechStream.TouchScreenManager = function () {
    var GZb = false;
    var HZb = false;
    var IZb = true;
    var JZb = null;
    this.initialise = function () {
        axa(document, "touchstart", onTouchStart);
        axa(document, "touchmove", onTouchMove);
        axa(document, "touchend", onTouchEnd);
        if (!hda && window.frames.length > 0) {
            var i;
            for (i = 0; i < window.frames.length; i++) {
                try {
                    this.initialiseToFrame(window.frames[i]);
                } catch (e) {}
            }
        }
    };
    this.initialiseToFrame = function (IUb) {
        if (IUb.document) {
            axa(IUb.document, "touchstart", onTouchStart);
            axa(IUb.document, "touchmove", onTouchMove);
            axa(IUb.document, "touchend", onTouchEnd);
        }
    };
    this.clickAndSpeak = function (enable) {
        GZb = enable;
    };
    var KZb = "onTouchStart onTouchMove onTouchEnd changedTouches";
    onTouchStart = function (event) {
        if (!Sfa) {
            Sfa = true;
        }
        HZb = false;
        if (GZb || dfa) {
            if (IZb) {
                var changedTouches = event.changedTouches;
                if (changedTouches != null && changedTouches.length > 0) {
                    var tZb = dDb(changedTouches[0], true);
                    JZb = tDb(tZb);
                }
            }
        }
    };
    onTouchMove = function () {
        if (!Sfa) {
            Sfa = true;
        }
        HZb = true;
    };
    onTouchEnd = function (event) {
        if (GZb || dfa) {
            if (HZb) {
                JZb = null;
                return;
            }
            if (IZb && !dfa) {
                if (JZb == null) {
                    return;
                }
                var target = new THHoverTarget(null, null, JZb.range);
                if (target == null) {
                    return;
                }
                IZb = false;
                rw_speakHoverTarget(target);
            } else {
                Gya(event);
            }
        }
    };
};
var NZb = null;
SpeechStream.setUpControllerFactory = function () {
    if (NZb == null) {
        NZb = (function () {
            var OZb = null;
            var PZb = false;
            var QZb = false;
            var RZb = new SpeechStream.TouchScreenManager();
            RZb.initialise();
            if (cea) {
                OZb = null;
                PZb = false;
            } else {
                TZb();
            }

            function TZb() {
                var SZb;
                try {
                    if ((Cfa && !Hfa) || (Cfa && !Ifa) || (Cfa && (Hfa || Ifa) && aZb()) || Vca == "hmh") {
                        SZb = null;
                        PZb = false;
                    } else {
                        SZb = new Audio();
                        var UZb;
                        if (ofa == "mp3") {
                            UZb = "audio/mpeg";
                        } else {
                            UZb = "audio/" + ofa;
                        }
                        SZb.type = UZb;
                        SZb.src = "";
                        if (SZb.canPlayType) {
                            PZb = ("no" != SZb.canPlayType(UZb)) && ("" != SZb.canPlayType(UZb));
                        }
                    }
                } catch (err) {
                    SZb = null;
                    PZb = false;
                }
            }
            var VZb = {
                enableTouchEvents: function (enable) {
                    RZb.clickAndSpeak(enable);
                },
                getConnector: function () {
                    if (OZb != null) {
                        return OZb;
                    }
                    if (PZb) {
                        OZb = new SpeechStream.HTML5Controller();
                    } else {
                        QZb = VZb.hasFlashSupport();
                        if (QZb) {
                            OZb = MXb();
                        }
                    }
                    return OZb;
                },
                hasFlashSupport: function () {
                    if (typeof (eba_no_flash) == "boolean" && eba_no_flash == true) {
                        QZb = true;
                    } else {
                        var flash = MXb();
                        if (flash != null) {
                            var XZb = flash.getVersion();
                            var YZb = parseFloat(XZb);
                            if (YZb < 1.05 || YZb == NaN) {
                                QZb = false;
                            } else {
                                QZb = true;
                            }
                        }
                    }
                    return QZb;
                },
                doesSupportSpeech: function () {
                    if (PZb) {
                        return true;
                    } else {
                        return VZb.hasFlashSupport();
                    }
                },
                doesSupportHtml5: function () {
                    return PZb;
                }
            };
            return VZb;
        })();
    }
};

function aZb() {
    var ZZb = null;
    try {
        ZZb = !!new ActiveXObject("htmlfile");
    } catch (e) {
        ZZb = false;
    }
    return ZZb;
}
var bZb = "startbubble";
var cZb = "stopbubble";
var eba_bubble_adjust_x;
var eba_bubble_adjust_y;
var dZb = null;
var eZb;
var fZb;
var gZb;
var hZb;
var iZb = null;

function kZb() {
    var jZb = document.createElement("\x64i\x76");
    jZb.id = bZb;
    jZb.style.zIndex = "998";
    jZb.style.position = "\x61bsol\x75t\x65";
    jZb.style.display = "n\x6fne";
    if (Lfa) {
        jZb.style.cursor = "hand";
    } else {
        jZb.style.cursor = "pointer";
    }
    bxa(jZb, 'click', Pab);
    var lZb = document.createElement("img");
    lZb.setAttribute("src", $g_strFileLoc + "rwimgs/start_speak_popup.gif");
    jZb.appendChild(lZb);
    Yea.appendChild(jZb);
    var mZb = document.createElement("\x64iv");
    mZb.id = cZb;
    mZb.style.zIndex = "999";
    mZb.style.position = "\x61\x62so\x6cute";
    mZb.style.display = "n\x6fne";
    if (Lfa) {
        mZb.style.cursor = "hand";
    } else {
        mZb.style.cursor = "pointer";
    }
    bxa(mZb, 'click', Qab);
    var nZb = document.createElement("img");
    nZb.setAttribute("src", $g_strFileLoc + "rwimgs/stop_speak_popup.gif");
    mZb.appendChild(nZb);
    Yea.appendChild(mZb);
}

function rZb() {
    var Elb = document.getElementById(bZb);
    if (Elb != null) {
        var pZb = Elb.style.visibility;
        var qZb = Elb.style.display;
        Elb.style.visibility = "hidden";
        Elb.style.display = "inline";
        iZb = Elb.offsetParent;
        if (iZb == document.body) {
            iZb = null;
        }
        Elb.style.visibility = pZb;
        Elb.style.display = qZb;
        gZb = 0;
        hZb = 0;
        if (typeof (eba_bubble_adjust_x) == "number") {
            gZb -= eba_bubble_adjust_x;
        }
        if (typeof (eba_bubble_adjust_y) == "number") {
            hZb -= eba_bubble_adjust_y;
        }
    }
}

function wZb(evt) {
    if (vda && evt.shiftKey || !Hca) {
        return;
    }
    var sZb = false;
    var tZb = dDb(evt, false);
    if (tZb != null && tZb.node != document.body) {
        if (tZb.node.nodeType == 1) {
            var Tib = tZb.node;
            var hib = Tib.tagName.toLowerCase();
            if (hib == "img") {
                var xZb = Tib.parentNode;
                if (xZb.tagName.toLowerCase() == "div") {
                    if (Tib.id == bZb || Tib.id == cZb) {
                        return;
                    }
                }
                var yZb = Tib.getAttribute("title");
                if (yZb == null || yZb.length == 0) {
                    var zZb = Tib.getAttribute("alt");
                    if (zZb == null || zZb.length == 0) {
                        var Aab = Tib.getAttribute("msg");
                        if (Aab == null || Aab.length == 0) {
                            return;
                        }
                    }
                }
                sZb = true;
            } else {
                return;
            }
        }
        var Bab = tDb(tZb);
        if (Bab != null) {
            if (typeof (gZb) == "undefined") {
                rZb();
            }
            if (iZb != null) {
                if (!bab(iZb, tZb.node)) {
                    return;
                }
            }
            if (sZb) {
                var Lab = exa(tZb.node);
                var Dab = hab(tZb.node);
                var Eab = 0;
                var Fab = 0;
                while (Dab != null) {
                    if (Dab != iZb) {
                        Eab += Dab.scrollLeft;
                        Fab += Dab.scrollTop;
                        Dab = hab(Dab);
                    } else {
                        Dab = null;
                    }
                }
                Lab.x -= Eab;
                Lab.y -= Fab;
                Mab(Lab.x - gZb, Lab.y - hZb, Bab);
            } else {
                var Gab = Bab.getCaretRange();
                if (nsa(Gab)) {
                    var start = Gab.Zfb.node;
                    if (Bab.isRange()) {
                        var end = Gab.afb.node;
                        start = BMb(start);
                        end = FMb(end);
                        var Qfb = dSb(start, 0);
                        var Rfb;
                        if (end.nodeType == 1) {
                            Rfb = dSb(end, 0);
                        } else {
                            Rfb = dSb(end, end.nodeValue.length);
                        }
                        Bab.range = new THRange(document.body, Qfb, Rfb);
                    }
                    var Lab = Xab(start);
                    Mab(Lab.x - gZb, Lab.y - hZb, Bab);
                } else {}
            }
        }
    }
}

function Mab(x, y, Nab) {
    if (uda && Hca) {
        x = x - 32;
        if (x < 0) {
            x = 0;
        }
        y = y - 18;
        if (y < 0) {
            y = 0;
        }
        var scrollLeft;
        var scrollTop;
        if (iZb != null) {
            scrollLeft = 0;
            scrollTop = 0;
        } else {
            scrollLeft = rw_getScreenOffsetLeft();
            scrollTop = rw_getScreenOffsetTop();
        }
        eZb = x + scrollLeft;
        fZb = y + scrollTop;
        document.getElementById(bZb).style.display = "inline";
        document.getElementById(bZb).style.left = eZb + 'px';
        document.getElementById(bZb).style.top = fZb + 'px';
        dZb = Nab;
    }
}

function Pab() {
    if (dZb != null) {
        $rw_event_stop();
        Rab(eZb, fZb);
        if (!dZb.isRange()) {
            var Oab = rda;
            rda = false;
            rw_speakHoverTarget(dZb);
            rda = Oab;
        } else {
            rw_speakHoverTarget(dZb);
        }
    }
}

function Qab() {
    $rw_event_stop();
}

function Rab(x, y) {
    if (uda && Hca) {
        document.getElementById(cZb).style.display = "inline";
        document.getElementById(cZb).style.left = x + 'px';
        document.getElementById(cZb).style.top = y + 'px';
    }
}

function Sab() {
    if (document.getElementById(bZb)) {
        document.getElementById(bZb).style.display = "none";
    }
}

function Tab() {
    if (document.getElementById(cZb)) {
        try {
            document.getElementById(cZb).style.display = "none";
        } catch (e) {
            thLogE(e);
        }
    }
}

function Xab(gib) {
    var x = 0;
    var y = 0;
    var Uab = hab(gib);
    if (iZb != null && !bab(iZb, Uab)) {
        Uab = iZb;
    }
    var bfb = gib;
    var Wab;
    while (Uab != null) {
        Wab = sab(oab(bfb, Uab), Uab);
        x += Wab.x;
        y += Wab.y;
        bfb = Uab;
        if (Uab == iZb) {
            break;
        }
        Uab = hab(Uab);
        if (iZb != null && !bab(iZb, Uab)) {
            Uab = iZb;
        }
    }
    if (iZb == null) {
        Wab = sab(oab(bfb, bfb.ownerDocument.body), bfb.ownerDocument.body);
        x += Wab.x;
        y += Wab.y;
    } else {
        x += xQb(iZb);
        y += zQb(iZb);
    }
    return {
        x: x,
        y: y
    };
}

function bab(cab, dab) {
    if (cab == null || dab == null) {
        return false;
    }
    var kib = dab.ownerDocument.body;
    var Llb = dab;
    while (Llb != null && Llb != kib) {
        if (cab == Llb) {
            return true;
        }
        Llb = Llb.parentNode;
    }
    return false;
}

function hab(gib) {
    var eab = gib.parentNode;
    var fab = gib.ownerDocument.body;
    var gab = null;
    while (eab != null && eab != fab) {
        if (eab.tagName.toLowerCase() == "div" || eab.tagName.toLowerCase() == "form") {
            var jab = eab.clientHeight;
            var kab = eab.clientWidth;
            var lab = lPb(eab);
            var mab = false;
            if (lab != null && lab.overflow != "visible") {
                if (eab.scrollHeight > jab && lab.overflowY != "visible") {
                    mab = true;
                }
                if (eab.scrollWidth > kab && lab.overflowX != "visible") {
                    mab = true;
                }
            }
            if (mab) {
                gab = eab;
                break;
            }
        }
        eab = eab.parentNode;
    }
    return gab;
}

function oab(pab, uab) {
    if (pab.nodeType == 3) {
        pab = pab.parentNode;
    }
    var x = 0;
    var y = 0;
    var nab = pab;
    while (nab != uab && nab != null) {
        x += nab.offsetLeft;
        y += nab.offsetTop;
        nab = OSb(nab, uab);
    }
    return {
        x: x,
        y: y
    };
}

function sab(tab, uab) {
    tab.x -= xQb(uab);
    tab.y -= zQb(uab);
    if (lPb(uab).position == "static") {
        tab.x -= uab.offsetLeft;
        tab.y -= uab.offsetTop;
    }
    if (tab.x < 0) {
        tab.x = 0;
    }
    if (tab.y < 0) {
        tab.y = 0;
    }
    if (tab.x > uab.clientWidth) {
        tab.x = uab.clientWidth;
    }
    if (tab.y > uab.clientHeight) {
        tab.y = uab.clientHeight;
    }
    return {
        x: tab.x,
        y: tab.y
    };
}

function $rw_barCacheInit() {
    if (Cfa) {
        HQb(Yea, "<link href=\"" + $g_strFileLoc + "rwcache.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
    } else {
        HQb(Yea, "<link href=\"" + $g_strFileLoc + "rwcacheSFF.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
    }
    var rkb = "";
    rkb += '<div id="rwGenerateCache" rwTHcomp="1" texthelpStopContinuous="1">';
    rkb += '<div class="rwGenerateCachePopupOutline">';
    rkb += '<div id="rwDragMeGenerateCache" class="rwToolbarCaptionGenerateCache" ignore="1">';
    rkb += 'Loading, please wait...';
    rkb += '<img name="displayImg" align="right" src="' + $g_strFileLoc + 'rwimgs/thex.bmp" onMouseOver="$rw_divOver(9)" onMouseOut="$rw_divOut(9)" ' + 'onMouseUp="$rw_divPress(9)" />';
    rkb += '</div>';
    rkb += '<div class="rwGenerateCachePopupContent">';
    rkb += '<span id="rwGenerateCachedisplay" ignore="1">';
    rkb += '';
    rkb += '</span>';
    rkb += '</div>';
    rkb += '</div>';
    rkb += '</div>';
    HQb(Yea, rkb, false);
}

function $rw_barCalInit() {
    if (Cfa) {
        HQb(Yea, "<link href=\"" + $g_strFileLoc + "rwcalculator.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
    } else {
        HQb(Yea, "<link href=\"" + $g_strFileLoc + "rwcalculatorSFF.css\" type=\"text/css\" rel=\"stylesheet\" />", false);
    }
    var rkb = "";
    rkb += '<div id="rwCal" rwTHcomp="1" style="visibility:hidden" texthelpStopContinuous="1">';
    rkb += ' <div class="rwCalPopupOutline">';
    if (rca == ENG_UK || rca == ENG_US) {
        rkb += '  <div id="rwDragMeCal" class="rwToolbarCaptionCal" >';
    } else {
        rkb += '  <div id="rwDragMeCal" class="rwToolbarSpanCaptionCal" >';
    }
    rkb += '    <img name="calImg" align="right" src="' + $g_strFileLoc + 'rwimgs/thex.bmp" onmouseover="$rw_divOver(8);" onmouseout="$rw_divOut(8);" ' + 'onmouseup="$rw_divPress(8);" /></div>';
    rkb += '<div class="rwCalPopupContent">';
    rkb += '<form name="rw_calForm" class="rw_calForm" id="rw_calForm">';
    rkb += '<table class="rw_calTable">';
    rkb += "<tbody>";
    rkb += '<tr>';
    rkb += '<td colSpan="2">';
    rkb += '<input type="text" class="rwcaldisplay" id="rw_calDis" maxlength="40" name="rw_calDis" readonly="readonly" />';
    rkb += '</td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td colSpan="2" class="rwcalspeechbutton">';
    if (Sfa) {
        rkb += '<br/>';
    } else {
        rkb += '<input type="checkbox" id="rw_calspeechbutton" name="rw_calspeechbutton" /><span>Speech on</span>';
    }
    rkb += '</td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td> ';
    rkb += '<table>';
    rkb += "<tbody>";
    rkb += '<tr>';
    rkb += '<td><input type="button" class="rwcalbutton" value="7" name="seven" onclick="rw_calAddDigit(\'7\');"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="8" name="eight" onclick="rw_calAddDigit(\'8\');"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="9" name="nine" onclick="rw_calAddDigit(\'9\');"/></td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td><input type="button" class="rwcalbutton" value="4" name="four" onclick="rw_calAddDigit(\'4\');"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="5" name="five" onclick="rw_calAddDigit(\'5\');"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="6" name="six" onclick="rw_calAddDigit(\'6\');"/></td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td><input type="button" class="rwcalbutton" value="1" name="one" onclick="rw_calAddDigit(\'1\');"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="2" name="two" onclick="rw_calAddDigit(\'2\');"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="3" name="three" onclick="rw_calAddDigit(\'3\');"/></td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td><input type="button" class="rwcalbutton" value="+/-" name="toggle the sign of the number" onclick="rw_calPlusMinus();"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="0" name="zero" onclick="rw_calAddDigit(\'0\');"/></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="." name="decimal point" onclick="rw_calDec();"/></td>';
    rkb += '</tr>';
    rkb += "</tbody>";
    rkb += '</table>';
    rkb += '</td>';
    rkb += '<td>';
    rkb += '<table>';
    rkb += "<tbody>";
    rkb += '<tr>';
    rkb += '<td><input type="button" class="rwcalbutton" value="C" name="clear" onclick="rw_calClearNum();" /></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="AC" name="clear memory" onclick="rw_calClearMem();" /></td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td><input type="button" class="rwcalbutton" value="*" name="multiply" onclick="rw_calFunc(\'*\');" /></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="/" name="divide" onclick="rw_calFunc(\'/\');" /></td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td><input type="button" class="rwcalbutton" value="+" name="plus" onclick="rw_calFunc(\'+\');" /></td>';
    rkb += '<td><input type="button" class="rwcalbutton" value="-" name="minus" onclick="rw_calFunc(\'-\');" /></td>';
    rkb += '</tr>';
    rkb += '<tr>';
    rkb += '<td colSpan="2"><input type="button" class="rwcalEqbutton" value="=" name="equals" onclick="rw_calEquals();" /></td>';
    rkb += '</tr>';
    rkb += "</tbody>";
    rkb += '</table>';
    rkb += '</td>';
    rkb += '</tr>';
    rkb += "</tbody>";
    rkb += '</table>';
    rkb += '</form>';
    rkb += '</div></div></div>';
    HQb(Yea, rkb, false);
}
var xab = 0;
var yab = 16;
var zab = 0;
var Abb = "0";
var Bbb = 0;

function rw_calFunc(Dbb) {
    if (xab != 0) {
        rw_calEquals();
    }
    if (Dbb.indexOf("*") > -1) {
        xab = 1;
    }
    if (Dbb.indexOf("/") > -1) {
        xab = 2;
    }
    if (Dbb.indexOf("+") > -1) {
        xab = 3;
    }
    if (Dbb.indexOf("-") > -1) {
        xab = 4;
    }
    zab = Bbb;
    Abb = "";
}

function rw_calDec() {
    if (Abb.length == 0) {
        Abb = "0.";
    } else {
        if ((Abb.indexOf(".") == -1) && (Abb.indexOf("e") == -1)) {
            Abb = Abb + ".";
        }
    }
    Bbb = parseFloat(Abb);
    Obb(Abb);
}

function rw_calPlusMinus() {
    if (Abb.indexOf("!") == -1) {
        Bbb = Bbb * -1;
        Abb = "" + Bbb;
    } else {
        Abb = "Press 'AC'!";
    }
    Obb(Abb);
}

function rw_calEquals() {
    if (Abb != "") {
        if ((Abb.indexOf("!") == -1)) {
            if (xab == 1) {
                Bbb = zab * Bbb;
            }
            if (xab == 2) {
                if (Bbb != 0) {
                    Bbb = zab / Bbb;
                } else {
                    Abb = "Cannot divide by zero!";
                }
            }
            if (xab == 3) {
                Bbb = zab + Bbb;
            }
            if (xab == 4) {
                Bbb = zab - Bbb;
            }
            if (xab == 2 && Bbb == 0) {} else {
                Abb = Bbb + "";
            }
            xab = 0;
            zab = 0;
            if (Abb.indexOf("Infinity") != -1) {
                Abb = "Value too long!";
            }
            if (Abb.indexOf("NaN") != -1) {
                Abb = "N/A!";
            }
        } else {
            Abb = "Press 'AC'!";
        }
        Obb(Abb);
        if (Mbb()) {
            $rw_speakText(Abb);
        }
        Abb = "0";
    }
}

function rw_calAddDigit(Ibb) {
    if (Abb.length < yab) {
        if (Abb.indexOf("!") == -1) {
            if ((parseFloat(Abb) == 0) && (Abb.indexOf(".") == -1)) {
                Abb = Ibb;
            } else {
                Abb = Abb + Ibb;
            }
            Bbb = parseFloat(Abb);
        } else {
            Abb = "Press 'AC'!";
        }
    }
    Obb(Abb);
}

function rw_calClearNum() {
    Bbb = 0;
    Abb = "" + Bbb;
    Obb(Abb);
}

function rw_calClearMem() {
    Bbb = 0;
    xab = 0;
    zab = 0;
    Abb = "" + Bbb;
    Obb(Abb);
}

function Mbb() {
    var Elb = document.getElementById("rw_calspeechbutton");
    if (Elb != null) {
        return Elb.checked;
    } else {
        return false;
    }
}

function Nbb() {
    return document.getElementById("rw_calForm");
}

function Obb(Pbb) {
    document.getElementById("rw_calDis").value = Pbb;
}
if (typeof ($rw_userParameters) == "function") {
    Zea = true;
    $rw_userParameters();
    $rw_barInit();
    tya();
}