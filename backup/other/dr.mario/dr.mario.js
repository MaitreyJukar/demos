function leftClick(n) {
    return window.focus(), n || (n = event), typeof n.which == "undefined" ? n.button == 1 : n.which == 1 || n.button == 0
}

function nrc(n) {
    if (leftClick(n) == !1) return ce(n)
}

function cp(n) { n || (n = event), n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "undefined" && (n.cancelBubble = !0) }

function ce(n) {
    return n || (n = event), typeof n.preventDefault != "undefined" ? n.preventDefault() : typeof n.cancelBubble != "undefined" && (n.returnValue = 0, n.cancelBubble = !0), !1
}
var easyDrMario, opt;
typeof document.oncontextmenu != "undefined" ? document.oncontextmenu = ce : document.onclick = nrc, typeof document.onselectstart != "undefined" && (document.onselectstart = ce), typeof document.ondragstart != "undefined" && (document.ondragstart = ce), easyDrMario = {
    util: {
        o_virus_s: function() {
            this.scolor = this.className.replace(/^v_([^_]*).*$/i, "$1"), this.timer = null, this.stop = function() { window.clearTimeout(this.timer) }, this.active = function() {
                this.stop();
                var t = this,
                    n = 0,
                    i = this.scolor,
                    r = function() { n = n ? 0 : 1, t.className = n ? "v_" + i + "_act" : "v_" + i, t.timer = window.setTimeout(arguments.callee, 300) };
                r()
            }, this.die = function() {
                this.stop(), this.scolor = null, this.timer = null, this.stop = null, this.active = null, this.die = null
            }, this.active()
        },
        o_virus_b: function() {
            var r = this.className.replace(/^virus (.*)$/i, "$1"),
                t = 125,
                n = 25,
                i = 24;
            switch (r) {
                case "yellow":
                    t = 275, n = 175;
                    break;
                case "blue":
                    t = 425, n = 325;
                    break;
                default:
                    t = 125, n = 25
            }
            this.vlength = 1, this.timer = null, this.stop = function() { window.clearTimeout(this.timer) }, this.active = function() {
                this.stop();
                var r = this,
                    n = 0,
                    u = 3,
                    f = function() { n = n >= u ? 0 : n + 1, r.style.backgroundPosition = "-517px -" + (t - i * n - n) + "px", r.timer = window.setTimeout(arguments.callee, 300) };
                f()
            }, this.die = function() {
                this.stop();
                var r = this,
                    t = 0,
                    f = 1,
                    u = 0,
                    e = --this.vlength,
                    o = function() {
                        if (u >= 8) {
                            e <= 0 ? r.hide() : r.active();
                            return
                        }
                        t = t >= f ? 0 : t + 1, t || u++, r.style.backgroundPosition = "-517px -" + (n - i * t - t) + "px", r.timer = window.setTimeout(arguments.callee, 100)
                    };
                o()
            }, this.win = function() {
                this.stop();
                var r = this,
                    t = 0,
                    u = 1,
                    f = function() { t = t >= u ? 0 : t + 1, r.style.backgroundPosition = "-544px -" + (n - i * t - t) + "px", r.timer = window.setTimeout(arguments.callee, 100) };
                f()
            }, this.hide = function() { this.stop(), this.style.visibility = "hidden" }, this.show = function() { this.style.visibility = "visible", this.active() }, this.active()
        },
        o_next_medicine: function() {
            this.acolor = [], this.ondropdown = undefined, this.dropdown = function() {
                var n = this.style,
                    u = 30,
                    f = 7,
                    e = -90,
                    o = -80,
                    t = -141,
                    i = 55,
                    s = .3,
                    h = new Date;
                this.ondropdown && this.ondropdown.constructor == Function && this.ondropdown();
                var c = this.onafterdropdown && this.onafterdropdown.constructor == Function ? this.onafterdropdown : function() {},
                    r = function(n, t, i, r) {
                        return (1 - n) * (1 - n) * t + 2 * n * (1 - n) * i + n * n * r
                    },
                    l = function() {
                        var l = (new Date - h) / 1e3,
                            a = Math.ceil(r(l * 3, u, e, t)),
                            v = Math.ceil(r(l * 3, f, o, i));
                        if (l >= s && (a >= t || v >= i)) {
                            c();
                            return
                        }
                        n.left = a + "px", n.top = v + "px", window.setTimeout(arguments.callee, 0)
                    };
                l()
            }, this.next = function() {
                var n = ["red", "yellow", "blue"],
                    t = n.length - 1,
                    i = n[Math.round(Math.random() * t)],
                    r = n[Math.round(Math.random() * t)];
                this.style.left = "30px", this.style.top = "7px", this.acolor = [i, r], this.rows[0].cells[0].className = "m_" + i + "_left", this.rows[0].cells[1].className = "m_" + r + "_right", this.style.display = "block"
            }
        },
        o_box_play: function() {
            this.shape = [
                [0, 0, 1, 1],
                [1, 0, 1, 0],
                [0, 0, 1, 1],
                [1, 0, 1, 0]
            ], this.acolor = [], this.sindex = 0, this.startx = 4, this.starty = -2, this.x = 4, this.y = -2, this.steplength = 15, this.speed = 1e3, this.timer = null, this.pause = !1;
            var n = this.rows[0].cells[0],
                t = this.rows[1].cells[0],
                i = this.rows[1].cells[1];
            this.getshape = function(n) {
                return n = isNaN(n) ? this.sindex : n, this.shape[n].slice(0)
            }, this.grouplist = function() {
                var e = this.sindex,
                    n = this.acolor[e],
                    t = this.y,
                    i = this.x,
                    r, u, f = [];
                return e % 2 ? (r = "m_" + n[0] + "_up", u = "m_" + n[1] + "_down", f = [
                    [t, i, r],
                    [t + 1, i, u]
                ]) : (r = "m_" + n[0] + "_left", u = "m_" + n[1] + "_right", f = [
                    [t + 1, i, r],
                    [t + 1, i + 1, u]
                ]), f.slice(0)
            }, this.setpause = function() { this.pause = this.pause ? !1 : !0, this.pause ? window.clearTimeout(this.timer) : this.movedown() }, this.onbeforeroll = undefined, this.roll = function() {
                var r, f;
                if (!this.pause && (r = !0, this.onbeforeroll && this.onbeforeroll.constructor == Function && (r = this.onbeforeroll(this.x, this.y)), r)) {
                    f = this.shape.length - 1, this.sindex = this.sindex >= f ? 0 : this.sindex + 1;
                    var u = this.sindex,
                        e = this.acolor[u][0],
                        o = this.acolor[u][1];
                    u % 2 ? (n.className = "m_" + e + "_up", t.className = "m_" + o + "_down", i.className = "") : (t.className = "m_" + e + "_left", i.className = "m_" + o + "_right", n.className = "")
                }
            }, this.onbeforedown = undefined, this.onafterdown = undefined, this.movedown = function() {
                if (!this.pause) {
                    window.clearTimeout(this.timer);
                    var n = this,
                        t = this.onbeforedown,
                        i = this.onafterdown,
                        r = this.steplength,
                        u = this.speed,
                        f = function() {
                            var e = !0,
                                o = n.x,
                                f = n.y + 1;
                            if (t && t.constructor == Function && (e = n.onbeforedown(o, f)), !e) {
                                i && i.constructor == Function && n.onafterdown();
                                return
                            }
                            n.style.top = f * r + "px", n.y = f, n.timer = window.setTimeout(arguments.callee, u)
                        };
                    f()
                }
            }, this.onbeforemovex = undefined, this.movex = function(n) {
                if (!this.pause) {
                    var t = !0,
                        i = this.y;
                    (this.onbeforemovex && this.onbeforemovex.constructor == Function && (t = this.onbeforemovex(n, i)), t) && (this.style.left = n * this.steplength + "px", this.x = n)
                }
            }, this.hide = function() { this.pause || this.setpause(), window.clearTimeout(this.timer), this.style.display = "none" }, this.init = function(r) {
                if (r && r.length) {
                    var u = r[0],
                        f = r[1];
                    this.acolor = [
                        [u, f],
                        [f, u],
                        [f, u],
                        [u, f]
                    ], this.sindex = 0, n.className = "", t.className = "m_" + u + "_left", i.className = "m_" + f + "_right", this.x = this.startx, this.y = this.starty, this.style.left = this.startx * this.steplength + "px", this.style.top = this.starty * this.steplength + "px", this.movedown(), this.style.display = "block", this.pause && this.setpause()
                }
            }
        },
        o_box_container: function() {
            var t = this.rows.length,
                i = this.rows[0].cells.length,
                n;
            for (this.level = 1, this.tspeed = ["LOW", "LOW", "LOW", "LOW", "LOW", "LOW", "MED", "MED", "MED", "MED", "MED", "HIGH", "HIGH", "HIGH", "HIGH", "HIGH", "TOP", "TOP", "TOP", "TOP", "TOP"], this.speed = [1e3, 1e3, 1e3, 1e3, 1e3, 1e3, 800, 800, 800, 800, 800, 500, 500, 500, 500, 500, 200, 200, 200, 200, 200], this.avirus = [0, 4, 8, 10, 14, 18, 20, 24, 28, 30, 34, 38, 40, 44, 48, 50, 54, 58, 60, 64, 68], this.rvirus = 0, this.score = 0, this.topscore = 0, this.groups = [], this.alldown = 0, this.next = undefined, this.data = new Array(t), n = 0; n < t; n++) this.data[n] = new Array(i);
            this.setmap = function(n) {
                var u, f, t, e, o, r, i;
                if (n && n.length)
                    for (o = easyDrMario.util.o_virus_s, i = 0; i < n.length; i++) {
                        u = n[i][0], f = n[i][1], t = n[i][2] || "", r = this.rows[u].cells[f], e = t ? t.replace(/^(?:m|v)_([^_]*).*$/i, "$1") : "";
                        try { r.die && r.die() } catch (s) {}
                        r.className = t, r.stop = t ? !0 : !1, this.data[u][f] = e, t && /v/i.test(t) && o.call(this.rows[u].cells[f])
                    }
            }, this.clearmap = function() {
                for (var i = this.data.length, r = this.data[0].length, t, n = 0; n < i; n++)
                    for (t = 0; t < r; t++) this.setmap([
                        [n, t]
                    ])
            }, this.checkupgroup = function() {
                var e, u, i, t, r, f, n;
                for (this.groups.sort(function(n, t) {
                        return t[0][0] - n[0][0]
                    }), n = 0; n < this.groups.length; n++) {
                    if (n < this.groups.length - 1 && this.groups[n].join("") == this.groups[n + 1].join("")) {
                        this.groups.splice(n, 1), n--;
                        continue
                    }
                    if (e = this.groups[n], u = e[0], i = e[1], u && (t = this.rows[u[0]].cells[u[1]]), i && (r = this.rows[i[0]].cells[i[1]]), (!t || !r || !t.stop || !r.stop) && (i || !t || !t.stop)) {
                        if (t && r && !t.stop && !r.stop || !i && t && !t.stop) {
                            this.groups.splice(n, 1), n--;
                            continue
                        }
                        if (i && t && !t.stop) {
                            f = i[2].replace(/^m_([^_]*).*$/i, "$1"), i[2] = r.className = "m_" + f + "_single", this.groups[n].splice(0, 1);
                            continue
                        }
                        if (u && r && !r.stop) {
                            f = u[2].replace(/^m_([^_]*).*$/i, "$1"), u[2] = t.className = "m_" + f + "_single", this.groups[n].splice(1, 1);
                            continue
                        }
                    }
                }
            }, this.setgroup = function(n) { n && n.length && (this.groups.push(n), this.setmap(n), this.checkupgroup()) }, this.gmdown = function(n) {
                var l;
                if (!this.groups[n]) {
                    this.alldown--, this.alldown <= 0 && (this.actioning = !1, this.actiondown());
                    return
                }
                var t = this,
                    a = this.rows.length - 1,
                    v = this.groups.length - 1,
                    c = this.groups[n].sort(function(n, t) {
                        return t ? t[0] - n[0] : 0
                    }),
                    e = c[0],
                    i = c[1],
                    r = e[0],
                    f = e[1],
                    u = i && i[0],
                    o = i && i[1],
                    s = this.rows[r].cells[f].className,
                    h = i && this.rows[u].cells[o].className;
                if (!s && !h) {
                    this.alldown--, this.alldown <= 0 && (this.actioning = !1, this.actiondown());
                    return
                }
                l = function() {
                    var n = !1;
                    if (r >= a ? n = !0 : (t.rows[r + 1].cells[f].stop && (n = !0), i && u == r && t.rows[u + 1].cells[o].stop && (n = !0)), n) {
                        t.alldown--, e && (s && (t.rows[r].cells[f].stop = !0), e[0] = r), i && (h && (t.rows[u].cells[o].stop = !0), i[0] = u), t.alldown <= 0 && (t.actioning = !1, t.actiondown());
                        return
                    }
                    i ? t.setmap([
                        [r, f],
                        [u, o]
                    ]) : t.setmap([
                        [r, f]
                    ]), r++, u++, e && (e[0] = r), i && (i[0] = u), i ? t.setmap([
                        [r, f, s],
                        [u, o, h]
                    ]) : t.setmap([
                        [r, f, s]
                    ]), window.setTimeout(arguments.callee, 200)
                }, l()
            }, this.groupdown = function() {
                var n = 0,
                    t = this.groups.length;
                if (this.alldown = t, !t) {
                    this.actioning = !1, this.next();
                    return
                }
                for (n = 0; n < t; n++) this.gmdown(n)
            }, this.getsamelistfrommartix = function(n, t) {
                for (var u = n.slice(0), h = u.length, o = u[0].length, e = new Array(o + 1).join(1).split(""), s = [], c = function(n, t, i) {
                        for (var u = [], r = t; r <= i; r++) u.push([n, r]);
                        s.push(u)
                    }, l = function(n, t, i) {
                        for (var u = [], r = t; r <= i; r++) u.push([r, n]);
                        s.push(u)
                    }, f, i, r = 0; r < h; r++)
                    for (f = 1, i = 0; i < o; i++) i < o - 1 && u[r][i] != "" && u[r][i] == u[r][i + 1] ? f++ : (f >= t && c(r, i - f + 1, i), f = 1), r < h - 1 && u[r][i] != "" && u[r][i] == u[r + 1][i] ? e[i]++ : (e[i] >= t && l(i, r - e[i] + 1, r), e[i] = 1);
                return s.slice(0)
            }, this.check = function(n, t, i) {
                var o, s;
                if (!i) return !0;
                var h = parseInt(i.join(""), 2),
                    r = this.data,
                    c = r.length,
                    l = r[0].length,
                    e = [],
                    u = null,
                    f = null;
                return u = !r[t] || r[t][n] || r[t][n] == undefined ? "1" : "0", f = !r[t] || r[t][n + 1] || r[t][n + 1] == undefined ? "1" : "0", e.push(u + "" + f), u = !r[t + 1] || r[t + 1][n] || r[t + 1][n] == undefined ? "1" : "0", f = !r[t + 1] || r[t + 1][n + 1] || r[t + 1][n + 1] == undefined ? "1" : "0", e.push(u + "" + f), o = parseInt(e.join(""), 2), s = !(h & o), s
            }, this.onboom = undefined, this.actioning = !1, this.actiondown = function() {
                var s, n, o, u, y;
                if (!this.actioning) {
                    if (this.actioning = !0, s = this.data, n = this.getsamelistfrommartix(s, 4), !n.length) {
                        this.actioning = !1, this.next();
                        return
                    }
                    var t = this,
                        a = this.onboom,
                        v = "",
                        f, h, c, i, l, r, p = this.level,
                        e = this.score,
                        w = this.topscore;
                    for (o = 0; o < n.length; o++) {
                        for (f = n[o], i = 0, u = 0; u < f.length; u++) h = f[u][0], c = f[u][1], l = s[h][c], r = this.rows[h].cells[c], /v/i.test(r.className) && (i++, r.die()), v = "m_" + l + "_boom", r.className = v, r.stop = !1;
                        if (i && (this.rvirus -= i, this.rvirus <= 0 && (this.level = ++p), e += i * 100, this.score = e, w < e && (this.topscore = e), a && a.constructor == Function)) this.onboom(l, i)
                    }
                    y = function() {
                        for (var i = 0; i < n.length; i++) t.setmap(n[i]);
                        t.checkupgroup(), t.rvirus <= 0 && (t.actioning = !1, t.nextstage()), t.groupdown();
                        return
                    }, window.setTimeout(y, 200)
                }
            }
        }
    },
    instance: {
        newgame: function() {
            var n = 0;
            return function(t, i) {
                var a;
                if (t) {
                    n++;
                    var v = t.className,
                        f = [],
                        g = new Array(11).join("<td><\/td>"),
                        nt = new Array(17).join("<tr>" + g + "<\/tr>");
                    f[0] = '<div class="game_cover"><a class="game_start">start game Dr.Mario<\/a><div class="game_info"><p class="title mariobutton" id="title">PLAY<\/p><\/div><div id="instructions">Match four of the same color vertically or horizontally so that they disappear, taking the viruses with them.<br><br>Use arrow keys or on-screen controls to move/rotate<\/div><\/div>', f[1] = '<div class="game_panel">', f[3] = '<div class="column cell1"><ul class="score_panel"><li><strong>TOP<\/strong><\/li><li class="top_score">0<\/li><li><strong>SCORE<\/strong><\/li><li class="score">0<\/li><\/ul><div class="microscope"><div class="virus red"><\/div><div class="virus yellow"><\/div><div class="virus blue"><\/div><\/div><\/div>', f[4] = '<div class="column cell2"><div class="playarea"><div class="table"><table cellspacing="2" cellpadding="0" border="0" class="medicine bottle">', f[5] = nt, f[6] = '<\/table><table cellspacing="2" cellpadding="0" border="0" class="medicine playbox"><tr><td><\/td><td><\/td><\/tr><tr><td><\/td><td><\/td><\/tr><\/table><\/div><div class="result next_stage"><p><strong>LOADING...<\/strong><strong><\/strong><\/p><\/div><div class="result game_over"><p><strong>GAME OVER<\/strong><div class="mariobutton">PLAY AGAIN<\/div><\/p><\/div><\/div><\/div>', f[7] = '<div class="column cell3"><div class="gamename">Dr.Mario<\/div><div class="mario"><table cellspacing="2" cellpadding="0" border="0" class="medicine nextbox"><tr><td><\/td><td><\/td><\/tr><\/table><\/div><ul class="msgbox"><li><strong>LEVEL<\/strong><\/li><li class="level">1<\/li><li><strong>SPEED<\/strong><\/li><li class="speed">LOW<\/li><li><strong>VIRUS<\/strong><\/li><li class="remain">0<\/li><\/ul><\/div><\/div>', f[2] = "", t.innerHTML = f.join(""), t.className = v ? v + " drmario" : "drmario";
                    var tt = easyUI.getElementsBy("class", "game_cover", "div", t)[0],
                        ut = easyUI.getElementsBy("class", "game_start", "a", t)[0],
                        it = document.getElementById("title"),
                        y = easyUI.getElementsBy("class", "game_panel", "div", t)[0],
                        rt = easyUI.getElementsBy("class", "top_score", "li", t)[0],
                        p = easyUI.getElementsBy("class", "score", "li", t)[0],
                        o = easyUI.getElementsBy("class", "virus red", "div", t)[0],
                        s = easyUI.getElementsBy("class", "virus yellow", "div", t)[0],
                        h = easyUI.getElementsBy("class", "virus blue", "div", t)[0],
                        r = easyUI.getElementsBy("class", "medicine bottle", "table", t)[0],
                        u = easyUI.getElementsBy("class", "medicine playbox", "table", t)[0],
                        c = easyUI.getElementsBy("class", "mario", "div", t)[0],
                        e = easyUI.getElementsBy("class", "medicine nextbox", "table", t)[0],
                        w = easyUI.getElementsBy("class", "level", "li", t)[0],
                        b = easyUI.getElementsBy("class", "speed", "li", t)[0],
                        k = easyUI.getElementsBy("class", "remain", "li", t)[0],
                        d = easyUI.getElementsBy("class", "result next_stage", "div", t)[0],
                        l = easyUI.getElementsBy("class", "result game_over", "div", t)[0];
                    easyDrMario.util.o_virus_b.call(o), o.hide(), easyDrMario.util.o_virus_b.call(s), s.hide(), easyDrMario.util.o_virus_b.call(h), h.hide(), easyDrMario.util.o_box_container.call(r), easyDrMario.util.o_box_play.call(u), easyDrMario.util.o_next_medicine.call(e), e.next(), e.ondropdown = function() { c.className = "mario mario_drop1", window.setTimeout(function() { c.className = "mario mario_drop2" }, 10) }, e.onafterdropdown = function() { e.style.display = "none", u.init(e.acolor), c.className = "mario", e.next() }, r.pause = !0, r.next = function() { r.pause || (r.checkupgroup(), e.dropdown()) }, r.nextstage = function() {
                        var i, u, f, g, w;
                        r.pause = !0;
                        var a = r.data.length - 1,
                            b = r.data[0].length - 1,
                            v = r.level,
                            e = r.avirus[v];
                        if (v >= r.avirus.length) {
                            alert('All levels complete!');
                            gameover();
                            return
                        }
                        r.groups = [];
                        var y = ["v_red", "v_yellow", "v_blue"],
                            n = { v_red: 0, v_yellow: 0, v_blue: 0 },
                            p = [],
                            c = 0,
                            l = [],
                            t = null;
                        for (i = 0; i < e; i++) {
                            if (u = a - Math.round(Math.random() * (a / 2)), f = Math.round(Math.random() * b), l["t" + u + "" + f]) {
                                i--;
                                continue
                            }
                            l["t" + u + "" + f] = 1, t = c < 3 ? y[c] : y[Math.round(Math.random() * 2)], p.push([u, f, t]), n[t]++, c++
                        }
                        l = null, d.style.display = "block", g = 0, w = function() { r.clearmap(), d.style.display = "none", r.setmap(p), o.vlength = n.v_red, o.show(), s.vlength = n.v_yellow, s.show(), h.vlength = n.v_blue, h.show(), r.rvirus = e, k.innerHTML = e, r.pause = !1, r.next() }, window.setTimeout(w, 1e3)
                    }, r.onboom = function(n, t) {
                        var i;
                        switch (n) {
                            case "red":
                                for (i = 0; i < t; i++) o.die();
                                break;
                            case "yellow":
                                for (i = 0; i < t; i++) s.die();
                                break;
                            case "blue":
                                for (i = 0; i < t; i++) h.die()
                        }
                        rt.innerHTML = r.topscore, p.innerHTML = r.score, w.innerHTML = r.level, b.innerHTML = r.tspeed[r.level], k.innerHTML = r.rvirus, u.speed = r.speed[r.level]
                    }, u.onbeforedown = function(n, t) {
                        var i = u.getshape();
                        return r.check(n, t, i)
                    }, u.onafterdown = function() { u.y < 0 ? gameover() : (r.setgroup(u.grouplist()), u.hide(), r.actiondown()) }, u.onbeforemovex = function(n, t) {
                        var i = u.getshape();
                        return r.check(n, t, i)
                    }, u.onbeforeroll = function(n, t) {
                        var i = u.sindex,
                            o = u.shape.length - 1,
                            f, e;
                        return i = i >= o ? 0 : i + 1, f = u.getshape(i), e = r.check(n, t, f), e
                    }, gameover = function() { u.pause || u.setpause(), u.hide(), e.style.display = "none", l.style.display = "block", c.className = "mario game_over", o.win(), s.win(), h.win() }, a = function() { l.style.display = "none", r.score = 0, r.level = 1, p.innerHTML = 0, w.innerHTML = 1, b.innerHTML = r.tspeed[1], u.speed = r.speed[1], r.nextstage() }, document.documentElement.onkeydown = function(n) {
                        var t = y.style.display == "block",
                            i;
                        n = n || window.event, i = n.which || n.keyCode;
                        switch (i) {
                            case 37:
                                t && (u.movex(u.x - 1), easyUI.stopEvent(n));
                                break;
                            case 39:
                                t && (u.movex(u.x + 1), easyUI.stopEvent(n));
                                break;
                            case 38:
                                t && (u.roll(), easyUI.stopEvent(n));
                                break;
                            case 40:
                                t && (u.movedown(), easyUI.stopEvent(n));
                                break;
                            case 80:
                                t && (u.setpause(), easyUI.stopEvent(n))
                        }
                    }, i && (i.dLeft && (i.dLeft.ontouchstart = function() { u.movex(u.x - 1) }), i.dRight && (i.dRight.ontouchstart = function() { u.movex(u.x + 1) }), i.dPause && (i.dPause.ontouchstart = function() { u.setpause(), this.className = u.pause ? "button toggle" : "button" }), i.dDown && (i.dDown.ontouchstart = function() { u.movedown() }), i.dTransform && (i.dTransform.ontouchstart = function() { u.roll() })), it.onclick = function(n) { tt.style.display = "none", document.getElementById("dpad").style.display = "block", y.style.display = "block", a(), easyUI.stopEvent(n) }, l.onclick = function(n) { a(), easyUI.stopEvent(n) }
                }
            }
        }()
    }
};
try { document.execCommand("BackgroundImageCache", !1, !0) } catch (e) {}
opt = { dLeft: document.getElementById("btn-left"), dRight: document.getElementById("btn-right"), dDown: document.getElementById("btn-down"), dTransform: document.getElementById("btn-transform") }, easyUI.doWhileExist("drmario", easyDrMario.instance.newgame, opt)
