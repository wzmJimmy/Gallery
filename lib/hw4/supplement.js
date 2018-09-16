var lock =1;
var canvas = $('myCanvas');

function ChangeTitle(num) {
    var titles = ["Simple Terra System","Starcraft：Simple Protoss Homeland",];
    $("main-title").innerText = titles[num-1];
}

function mod_2Pi( num) {
    var pi2 = Math.PI*2;
    return num-Math.ceil(num/pi2)*pi2;
}

function ortho(left, right, bottom, top, near, far, dst) {
    dst = dst || [];

    dst[0]  = 2 / (right - left);
    dst[1]  = 0;
    dst[2]  = 0;
    dst[3]  = 0;

    dst[4]  = 0;
    dst[5]  = 2 / (top - bottom);
    dst[6]  = 0;
    dst[7]  = 0;

    dst[8]  = 0;
    dst[9]  = 0;
    dst[10] = 2 / (near - far);
    dst[11] = 0;

    dst[12] = (right + left) / (left - right);
    dst[13] = (top + bottom) / (bottom - top);
    dst[14] = (far + near) / (near - far);
    dst[15] = 1;

    return dst;
}


function MyGradient(c1,c2,ind,_boundNum) {
    var col=[0,0,0,1];
    for(var i=0;i<3;i++){col[i]=Math.round(c1[i]+(c2[i]-c1[i])*ind/(_boundNum))}
    return col;
}

function DeepCopy(obj){
    if(typeof obj !== 'object') return obj;
    var newobj = [];
    for(var i in obj){newobj[i] = DeepCopy(obj[i]);}
    return newobj;
};
