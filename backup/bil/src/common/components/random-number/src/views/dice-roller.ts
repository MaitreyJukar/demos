const fceSmt = [
    [0, 2, 6, 3],
    [0, 3, 5, 1],
    [0, 1, 4, 2],
    [7, 5, 3, 6],
    [7, 6, 2, 4],
    [7, 4, 1, 5]
];
const smtFce = [
    [0, 1, 2],
    [5, 2, 1],
    [0, 2, 4],
    [0, 3, 1],
    [5, 4, 2],
    [5, 1, 3],
    [0, 4, 3],
    [5, 3, 4]
];
const smtDge = [
    [1, 2, 3],
    [0, 5, 4],
    [0, 4, 6],
    [0, 6, 5],
    [7, 2, 1],
    [7, 1, 3],
    [7, 3, 2],
    [6, 4, 5]
];
const ROTATION_HELPER = {
    1: [[-2, -10.7], [-0.2, -11], [0.6, -11], [-0.6, -11]],
    2: [[10.7, 1.8], [-13.5, 4.1], [10.7, -1.8], [-13.5, -4.1]],
    3: [[11, 11], [-15, -5], [-11, -11], [15, 5]],
    4: [[12.2, 3], [15, 20.3], [-12.2, -3], [-15, -20.3]],
    5: [[-10.7, -1.8], [13.5, -4.1], [-10.7, 1.8], [13.5, 4.1]],
    6: [[2, 10.7], [0.2, 11], [-0.6, 11], [0.6, 11]]
};

const EDGE_COLOR = "#66bcf4";
const FACE_COLOR = "#3795d3";
const DOT_COLOR = "#000";

const PHI = Math.PI * 42 / 180;
const HALF_TURN_NUM = 30;
const DLT_NGL = Math.PI / HALF_TURN_NUM;
const ROTATION_TOLERANCE = 0.05;

export class Vector {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public clean(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    public multiply(factor: number): Vector {
        return new Vector(factor * this.x, factor * this.y, factor * this.z);
    }

    public add(...args: Vector[]): Vector {
        let x = this.x;
        let y = this.y;
        let z = this.z;

        for (const v of args) {
            x += v.x;
            y += v.y;
            z += v.z;
        }
        return new Vector(x, y, z);
    }

    public scale(v: Vector): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    public product(v: Vector): Vector {
        return new Vector(this.y * v.z - v.y * this.z, this.z * v.x - v.z * this.x, this.x * v.y - v.x * this.y);
    }

    public normalize(): Vector {
        const t = Math.sqrt(this.scale(this));
        return new Vector(this.x / t, this.y / t, this.z / t);
    }

    public toString(): string {
        return JSON.stringify(this);
    }
}

export class Point {
    public x: number;
    public y: number;
    public z: number;
    public face: any;
    public nos: any;

    constructor(nos: any, xyz: any, okNrm: boolean) {
        this.x = xyz.x;
        this.y = xyz.y;
        this.z = xyz.z;
        if (okNrm) {
            this.face = nos;
        } else {
            this.nos = nos;
        }
    }
}

export class DiceProps {
    public faceRadius: number;
    public faceDistance: number;
    public diceRadius: number;
    public crdSmt: any;
    public nrmFce: Vector[];
    public ctx: CanvasRenderingContext2D;
}

export class FaceProps extends DiceProps {
    public dce: any;
    public fce: any;
    public sms: any;
}

export class Face {
    public nrm: Point;
    public pnt: any;
    public ox: number;
    public oy: number;
    public ngl: any;
    public lph: any;
    public bta: any;
    public gmm: any;
    public dlt: any;

    public dce: any;
    public fce: any;
    public sms: any;
    public nrmFce: any;
    public faceRadius: number;
    public faceDistance: number;
    public diceRadius: number;
    public ctx: CanvasRenderingContext2D;

    constructor(props: FaceProps) {
        Object.assign(this, props);

        const nrm: Vector = this.nrmFce[this.fce];
        this.nrm = new Point(this.fce, nrm, true);
        let x = 0;
        let y = 0;
        let z = 0;
        this.pnt = []; // vertices
        for (const i in this.sms) {
            if (i) {
                const j = this.dce.smt[this.sms[i]];
                this.pnt.push(j);
                x += j.x;
                y += j.y;
                z += j.z;
            }
        }
        x /= 4;
        y /= 4;
        z /= 4;
        this.ox = x;
        this.oy = y; // center

        // Ellipse major axis angle
        this.ngl = Math.atan2(nrm.x, -nrm.y);

        // Dice contour is made of Ellipses and circles arcs.
        // Where are the points of tangency on the face ? On the the canvas ?
        this.lph = -1;
        this.bta = -1;
        this.gmm = null;
        this.dlt = null;
        if (Math.abs(nrm.z) < Math.cos(PHI)) { // Contact
            // A coordinate cartesian systeme with the normal and the major axis of the ellipse
            // which is in vertical plane
            let i;
            let j;
            const nrx = new Vector(-nrm.y, nrm.x, 0).normalize().multiply(this.faceRadius);
            const nry = nrm.product(nrx);
            const nrz = nrm.multiply(this.faceDistance);
            // Search of contact points (lph, bta - in dltNgl - for the face and gmm, dlt - in radians - for the canvas)
            let lph = null;
            let bta = null;
            let sns;
            let ro;
            let rn;
            let rdo;
            let rdn;
            let eps;

            eps = nrm.z <= 0 ? 1 : -1;
            sns = eps; // Turn counter clockwise to draw the contour

            // A first test near the major axis end.
            ro = nrx.multiply(Math.cos(-sns * DLT_NGL)).add(nry.multiply(Math.sin(-sns * DLT_NGL)), nrz);
            rdo = ro.x * ro.x + ro.y * ro.y;
            rn = nrx.add(nrz);
            rdn = rn.x * rn.x + rn.y * rn.y;
            i = rdo <= rdn ? 0 : HALF_TURN_NUM; // to guide the search
            j = i;
            lph = i; // The distance is maximum at the contact (Dice radius)
            // tslint:disable-next-line:no-conditional-assignment ban-comma-operator max-line-length
            while ((rn = nrx.multiply(Math.cos(i * DLT_NGL)).add(nry.multiply(Math.sin(i * DLT_NGL)), nrz)), rdo <= (rdn = rn.x * rn.x + rn.y * rn.y)) {
                lph = i;
                i += sns;
                ro = rn;
                rdo = rdn;
            }
            lph = ((HALF_TURN_NUM << 1) - eps * lph) % (HALF_TURN_NUM << 1);
            this.gmm = Math.atan2(ro.y, ro.x);
            if (this.gmm < 0) {
                this.gmm += Math.PI * 2;
            }
            if (Math.PI * 2 <= this.gmm) {
                this.gmm -= Math.PI * 2;
            }

            i = HALF_TURN_NUM - j;
            bta = i;
            sns = -sns;
            // Same search on the other end
            ro = nrx.multiply(Math.cos((i - sns) * DLT_NGL)).add(nry.multiply(Math.sin((i - sns) * DLT_NGL)), nrz);
            rdo = ro.x * ro.x + ro.y * ro.y;
            rn = nrx.multiply(Math.cos(i * DLT_NGL)).add(nry.multiply(Math.sin(i * DLT_NGL)), nrz);
            rdn = rn.x * rn.x + rn.y * rn.y;

            // tslint:disable-next-line:no-conditional-assignment ban-comma-operator max-line-length
            while ((rn = nrx.multiply(Math.cos(i * DLT_NGL)).add(nry.multiply(Math.sin(i * DLT_NGL)), nrz)), rdo <= (rdn = rn.x * rn.x + rn.y * rn.y)) {
                bta = i;
                i += sns;
                ro = rn;
                rdo = rdn;
            }
            bta = ((HALF_TURN_NUM << 1) - eps * bta) % (HALF_TURN_NUM << 1);
            this.dlt = Math.atan2(ro.y, ro.x);
            if (this.dlt < 0) {
                this.dlt += Math.PI * 2;
            }
            if (Math.PI * 2 <= this.dlt) {
                this.dlt -= Math.PI * 2;
            }

            this.lph = lph;
            this.bta = bta;

            /* Nota : gmm and dlt are given by psi+tta
                with psi=Math.atan2(nrm.y,nrm.x) and tta=Math.acos(Math.cos(phi)/Math.sqrt(1-nrm.z*nrm.z)
                A simular formula could be etablish for lph and bta...
            */
        }
        return this;
    }

    public draw() {
        let clrNgl: any;
        const dmc = this.diceRadius >> 3;
        // angle of the normal and the look direction to adjust color and Ellipse ratio rh/rw
        clrNgl = Math.abs(this.nrm.z);
        drawEllipse(this.ctx, this.ox, this.oy, this.faceRadius, this.faceRadius * clrNgl, this.ngl, FACE_COLOR); // The face
        // The dots (fce+1)
        if (this.nrm.face == 0 || this.nrm.face == 2 || this.nrm.face == 4) {
            drawEllipse(this.ctx, this.ox, this.oy, dmc, dmc * clrNgl, this.ngl, DOT_COLOR);
        }
        if (this.nrm.face == 1 || this.nrm.face == 2 || this.nrm.face == 3 || this.nrm.face == 4 || this.nrm.face == 5) {
            drawEllipse(this.ctx,
                (this.ox * 3 + this.pnt[1].x * 2) / 5,
                (this.oy * 3 + this.pnt[1].y * 2) / 5,
                dmc, dmc * clrNgl, this.ngl, DOT_COLOR);
            drawEllipse(this.ctx,
                (this.ox * 3 + this.pnt[3].x * 2) / 5,
                (this.oy * 3 + this.pnt[3].y * 2) / 5,
                dmc, dmc * clrNgl, this.ngl, DOT_COLOR);
        }
        if (this.nrm.face == 3 || this.nrm.face == 4 || this.nrm.face == 5) {
            drawEllipse(this.ctx,
                (this.ox * 3 + this.pnt[0].x * 2) / 5,
                (this.oy * 3 + this.pnt[0].y * 2) / 5,
                dmc, dmc * clrNgl, this.ngl, DOT_COLOR);
            drawEllipse(this.ctx,
                (this.ox * 3 + this.pnt[2].x * 2) / 5,
                (this.oy * 3 + this.pnt[2].y * 2) / 5,
                dmc, dmc * clrNgl, this.ngl, DOT_COLOR);
        }
        if (this.nrm.face == 5) {
            drawEllipse(this.ctx,
                (this.ox * 3 + this.pnt[0].x + this.pnt[3].x) / 5,
                (this.oy * 3 + this.pnt[0].y + this.pnt[3].y) / 5,
                dmc, dmc * clrNgl, this.ngl, DOT_COLOR);
            drawEllipse(this.ctx,
                (this.ox * 3 + this.pnt[2].x + this.pnt[1].x) / 5,
                (this.oy * 3 + this.pnt[2].y + this.pnt[1].y) / 5,
                dmc, dmc * clrNgl, this.ngl, DOT_COLOR);
        }
    }
}

export class Dice {
    public smt: any[];
    public faces: Face[];
    public crdSmt: any;
    public nrmFce: Vector[];

    constructor(props: DiceProps) {
        Object.assign(this, props);
        // Building vertices (sommets smt) and faces
        this.smt = [];
        this.faces = [];
        for (let i = 0; i < 8; i++) {
            this.smt.push(new Point(i, this.crdSmt[i], false));
        }
        for (let i = 0; i < 6; i++) {
            const faceProps = {
                dce: this,
                fce: i,
                sms: fceSmt[i]
            };
            Object.assign(faceProps, props);
            this.faces.push(new Face(faceProps as FaceProps));
        }
    }
}
/* auxiliary functions */
function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, rw: number, rh: number, ngl: number, clr: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ngl);
    ctx.scale(1, rh / rw);
    ctx.beginPath();
    ctx.arc(0, 0, rw, 0, Math.PI * 2);
    ctx.restore();
    ctx.fillStyle = clr;
    ctx.fill();
}

// tslint:disable-next-line:max-line-length
function drawEllipseFrmTo(ctx: CanvasRenderingContext2D, x: number, y: number, a: number, b: number, rw: number, rh: number, ngl: number, clr: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ngl);
    ctx.scale(1, rh / rw);
    ctx.beginPath();
    ctx.arc(0, 0, rw, a * DLT_NGL, b * DLT_NGL, true);
    ctx.restore();
    ctx.fillStyle = clr;
    ctx.fill();
}

export class DiceRollProps {
    public el: HTMLCanvasElement;
    public width: number;
    public height: number;
    public diceRadius: number;
    public completeCallback: () => void;
}

export class DiceRoller {

    public el: HTMLCanvasElement;
    public width: number;
    public height: number;
    public diceRadius: number;
    public faceRadius: number;
    public faceDistance: number;
    public dstObs: any;
    public alpha = 0;
    public beta = 0;
    public ctx: CanvasRenderingContext2D;
    public dice: Dice;
    public okDrw: boolean;
    public currentVal: number;
    public completeCallback: () => void;
    public animationComplete = false;
    public expectCallback = true;

    public nrsFce: any;
    public nrmFce: Vector[];
    public crdSmt: Vector[];

    constructor(props: DiceRollProps) {
        this.initialize(props);
        this.render();
    }

    public initialize(props: DiceRollProps) {
        Object.assign(this, props);
    }

    public render() {
        this.setContextValues();
        this.createInitialState();
        this.setRandomPositions();
        this.okDrw = true;
        this.draw();
    }

    public setContextValues() {
        this.el.width = this.width;
        this.el.height = this.height;
        this.faceRadius = this.diceRadius * Math.sin(PHI);
        this.faceDistance = this.diceRadius * Math.cos(PHI);
        this.dstObs = this.diceRadius * 10;
        this.ctx = this.el.getContext("2d");
        this.ctx.translate(this.width >> 1, this.height >> 1);
    }

    public createInitialState() {
        const d = 0;
        this.nrmFce = [
            new Vector(1, 0, 0),
            new Vector(0, 1, 0),
            new Vector(0, 0, 1),
            new Vector(0, 0, -1),
            new Vector(0, -1, 0),
            new Vector(-1, 0, 0)
        ];
        this.crdSmt = [
            new Vector(d, d, d),
            new Vector(-d, d, d),
            new Vector(d, -d, d),
            new Vector(d, d, -d)
        ];
        for (let i = 0; i < 4; i++) {
            this.crdSmt[7 - i] = this.crdSmt[i].multiply(-1);
        }
    }

    public setRandomPositions() {
        this.rollTo(this.getRandomNumberBetween(1, 6), false, false);
    }

    public draw() {
        let face: Face;
        // Drag and Drop moves
        const dA = this.alpha * 0.05;
        const dB = this.beta * 0.05;

        this.alpha -= dA;
        this.beta -= dB;
        if (ROTATION_TOLERANCE < Math.abs(this.alpha) || ROTATION_TOLERANCE < Math.abs(this.beta)) {
            this.roll(dA, dB);
        } else {
            if (!this.animationComplete && this.expectCallback) {
                this.completeCallback();
                this.animationComplete = true;
            }
        }
        // Dice building
        this.dice = new Dice({
            crdSmt: this.crdSmt,
            ctx: this.ctx,
            diceRadius: this.diceRadius,
            faceDistance: this.faceDistance,
            faceRadius: this.faceRadius,
            nrmFce: this.nrmFce
        });

        // Clear canvas for new draw
        this.ctx.clearRect(-(this.width >> 1), -(this.height >> 1), this.width, this.height);

        // Dice background (contour)
        const llpArc = [];

        let j = 0;
        // tslint:disable-next-line:no-conditional-assignment
        while (face = this.dice.faces[j++]) {
            const clr = Math.abs(face.nrm.z);
            if (face.lph > -1) {
                llpArc.push({
                    bt: face.bta,
                    cl: clr,
                    dl: face.dlt,
                    gm: face.gmm,
                    lp: face.lph,
                    ng: face.ngl,
                    rh: (this.faceRadius * clr),
                    rw: this.faceRadius,
                    x: face.ox,
                    y: face.oy
                });
            }
        }
        // Sort the faces to draw the contour counter close wise
        llpArc.sort((a, b) => b.dl - a.dl);

        let crr;
        let lng;
        const ply = [];
        // A circle without elliptic Arc
        lng = llpArc.length;
        if (lng == 0) {
            this.ctx.arc(0, 0, this.diceRadius, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = EDGE_COLOR;
            this.ctx.fillStyle = EDGE_COLOR;
            this.ctx.lineWidth = 1;
            this.ctx.lineJoin = "miter";
            this.ctx.miterLimit = 1;
            this.ctx.beginPath();
            for (let i = 0; i < lng; i++) {
                crr = llpArc[i];
                drawEllipseFrmTo(this.ctx, crr.x, crr.y, crr.lp, crr.bt, crr.rw, crr.rh, crr.ng, EDGE_COLOR);
                this.ctx.arc(0, 0, this.diceRadius, crr.dl, llpArc[(i + 1) % lng].gm, true);
                this.ctx.stroke();
                this.ctx.fill();
                ply.push(this.diceRadius * Math.cos(llpArc[(i + 1) % lng].gm), this.diceRadius * Math.sin(llpArc[(i + 1) % lng].gm));
            }
            this.ctx.beginPath();
            this.ctx.moveTo(ply[ply.length - 2], ply[ply.length - 1]);
            for (let i = 0; i < ply.length; i += 2) {
                this.ctx.lineTo(ply[i], ply[i + 1]);
            }
            this.ctx.stroke();
            this.ctx.fill();
        }
        // Draw visibles faces
        j = 0;
        this.nrsFce = -1;
        // tslint:disable-next-line:no-conditional-assignment
        while (face = this.dice.faces[j++]) {
            if (face.nrm.z < 0) {
                face.draw();
            }
            this.nrsFce = face.nrm.face;
        }

        // and refresh
        if (this.okDrw) {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    public roll(a: number, b: number) {
        let v: Vector;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const cosB = Math.cos(b);
        const sinB = Math.sin(b);
        const d = this.faceDistance;

        for (let i = 0; i < 3; i++) {
            v = this.nrmFce[i];
            const t = v.y * sinA + v.z * cosA;
            this.nrmFce[i] = new Vector(t * sinB + v.x * cosB, v.y * cosA - v.z * sinA, t * cosB - v.x * sinB);
            this.nrmFce[5 - i] = this.nrmFce[i].multiply(-1);
        }

        this.crdSmt[0] = this.nrmFce[0].add(this.nrmFce[1], this.nrmFce[2]).multiply(d);
        this.crdSmt[1] = this.nrmFce[0].multiply(-1).add(this.nrmFce[1], this.nrmFce[2]).multiply(d);
        this.crdSmt[2] = this.nrmFce[1].multiply(-1).add(this.nrmFce[0], this.nrmFce[2]).multiply(d);
        this.crdSmt[3] = this.nrmFce[2].multiply(-1).add(this.nrmFce[0], this.nrmFce[1]).multiply(d);

        for (let i = 0; i < 4; i++) {
            this.crdSmt[7 - i] = this.crdSmt[i].multiply(-1);
        }
    }

    public rollTo(diceVal: number, expectCallback = false, animate = true) {
        this.animationComplete = false;
        this.expectCallback = expectCallback;
        const { a, b } = this.getRotationFromDiceVal(diceVal);
        this.createInitialState();
        if (animate) {
            this.rollDice(a, b);
        } else {
            this.roll(a, b);
        }
        this.currentVal = diceVal;
    }

    public rollDice(a: number, b: number) {
        this.alpha = a;
        this.beta = b;
    }

    public getRotationFromDiceVal(diceVal: number): any {
        const ROTATION_VALUES = ROTATION_HELPER[diceVal][this.getRandomNumberBetween(0, 3)];
        return {
            a: ROTATION_VALUES[0],
            b: ROTATION_VALUES[1]
        };
    }

    public getRandomNumberBetween(min: number, max: number) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }
}
