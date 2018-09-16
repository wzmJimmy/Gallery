Phoenix
var Voidray;

(function() {
    "use strict";

    var v = new Float32Array();

    var vt = new Float32Array();

    var vn = new Float32Array();

    var ind = ;

    //see above comment on how this works.
    var image = [Images["Voidray"],Images["ATNS"]];
    var shaderProgram = shader["Text"];
    var buffers = undefined;
    var textures = undefined;


    Voidray = function Voidray (position, orientation, run, scale) {
        this.position0 = position || [0,3, 0];
        this.orientation = orientation || 0;
        this.run = run;
        this.scale = scale || 0.9;
        this.position = [this.position0[0],this.position0[1],this.position0[2]];

        this.speed = 1/1000;          // units per milli-second
        this.theta = 0;
        this.flag = true;
    }

    Voidray.prototype.init = function () {

        if (!buffers) {
            var arrays = {
                pos: {numComponents: 3, data: v},
                norm: {numComponents: 3, data: vn},
                Texc: {numComponents: 2, data: vt},
                indices: ind
            };
            buffers = twgl.createBufferInfoFromArrays(gl, arrays);
        }
        if(!textures){
            textures = [];
            for(var i = 0;i < image.length;i++){
                var text = {};
                text["ts"] = gl.getUniformLocation(shaderProgram.program, "texSampler"+i);
                text["s"] = createGLTexture(gl, image[i],true);
                textures.push(text);
            }
        }
        this.lastTime = drawingState.realtime;
    }

    Voidray.prototype.setflag = function (f) {
        this.flag = f;
    }

    Voidray.prototype.draw = function () {
        if(this.run) {
            advance_unif(this);
            var delta = drawingState.realtime - this.lastTime;
            this.lastTime = drawingState.realtime;
            this.theta = frac(this.theta+delta*Math.PI/1000,Math.PI*2);
        }

        var trans = new Transform();
        if(this.flag) trans.trans(m4.translation(this.position),true);
        trans.trans(m4.rotationY(this.orientation));
        trans.trans(m4.rotationZ(this.theta));
        trans.trans(m4.scaling([this.scale,this.scale, this.scale]));

        gl.useProgram(shaderProgram.program);
        gl.disable(gl.CULL_FACE);
        twgl.setUniforms(shaderProgram, {
            tview: drawingState.view, tproj: drawingState.proj, dlight: drawingState.sunDirection,
            tmodel: trans.get_Trans() ,tnorm: trans.get_Tnorm(),lview: drawingState.lview, lproj: drawingState.lproj
            ,flag: 0.0
        });
        twgl.setBuffersAndAttributes(gl, shaderProgram, buffers);

        for(var i = 0;i < image.length;i++){
            gl.activeTexture(gl["TEXTURE"+i]);
            gl.bindTexture(gl.TEXTURE_2D, textures[i].s);
            gl.uniform1i(textures[i].ts, i);
        }

        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    }
}());